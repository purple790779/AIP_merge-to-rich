import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Coin, GameState, BoostType } from '../types/game';
import { TOTAL_CELLS, COIN_PPS, COIN_LEVELS, ACHIEVEMENTS } from '../types/game';

// 유틸리티: 고유 ID 생성
const generateId = () => `coin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 유틸리티: 랜덤 빈 셀 찾기
const findRandomEmptyCell = (coins: Coin[]): number | null => {
    const occupiedIndices = new Set(coins.map(c => c.gridIndex));
    const emptyCells: number[] = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
        if (!occupiedIndices.has(i)) emptyCells.push(i);
    }
    if (emptyCells.length === 0) return null;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

// 유틸리티: 총 PPS 계산
const calculateTotalPPS = (coins: Coin[]): number => {
    return coins.reduce((sum, coin) => sum + (COIN_PPS[coin.level] || 0), 0);
};

interface GameStore extends GameState {
    // 코인 생성
    spawnCoin: () => boolean;

    // 코인 이동 (성공 여부 반환)
    moveCoin: (coinId: string, targetIndex: number) => boolean;

    // 머지 시도
    tryMerge: (coinId: string, targetIndex: number) => boolean;

    // 자동 머지 트리거 (1쌍)
    triggerAutoMerge: () => boolean;

    // 부스트 활성화
    activateBoost: (type: BoostType, durationSec: number) => void;

    // 부스트 확인
    isBoostActive: (type: BoostType) => boolean;

    // 돈 추가 (PPS에 의한 수익)
    addMoney: (amount: number) => void;

    // 업그레이드 functions...
    upgradeSpawnLevel: () => boolean;
    upgradeSpeed: () => boolean;
    upgradeIncomeSpeed: () => boolean;
    upgradeMergeBonus: () => boolean;
    unlockGemSystem: () => boolean;

    // 기타
    resetGame: () => void;
    clearLastMergedId: () => void;
    clearLastDiscoveredLevel: () => void;
    isBoardFull: () => boolean;

    // 업적
    checkAchievements: () => string[]; // 새로 해금된 업적 ID 반환

    // 새 레벨 발견 상태
    lastDiscoveredLevel: number | null;
}

const initialState: GameState & { lastDiscoveredLevel: number | null } = {
    coins: [],
    totalMoney: 50,
    pps: 0,
    spawnLevel: 1,
    spawnCooldown: 5000,
    incomeInterval: 10000,
    mergeBonusLevel: 0,
    gemSystemUnlocked: false,
    bitcoinDiscovered: false,
    autoSpawnEnabled: false,
    lastMergedId: null,
    activeBoosts: [],
    // 업적 시스템
    unlockedAchievements: [],
    totalMergeCount: 0,
    totalEarnedMoney: 0,
    discoveredLevels: [1], // 레벨 1은 기본으로 발견
    lastDiscoveredLevel: null,
};

export const useGameStore = create<GameStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            spawnCoin: () => {
                const { coins, spawnLevel, totalMoney } = get();

                const spawnCost = COIN_LEVELS[spawnLevel]?.value || 10;

                if (totalMoney < spawnCost) {
                    return false;
                }

                const emptyCell = findRandomEmptyCell(coins);
                if (emptyCell === null) {
                    return false;
                }

                const newCoin: Coin = {
                    id: generateId(),
                    level: spawnLevel,
                    gridIndex: emptyCell,
                };

                set(state => ({
                    coins: [...state.coins, newCoin],
                    totalMoney: state.totalMoney - spawnCost,
                    pps: calculateTotalPPS([...state.coins, newCoin]),
                }));

                return true;
            },

            moveCoin: (coinId: string, targetIndex: number) => {
                const { coins } = get();
                if (targetIndex < 0 || targetIndex >= TOTAL_CELLS) return false;

                const targetCoin = coins.find(c => c.gridIndex === targetIndex && c.id !== coinId);
                if (targetCoin) return false;

                set(state => ({
                    coins: state.coins.map(coin =>
                        coin.id === coinId ? { ...coin, gridIndex: targetIndex } : coin
                    ),
                }));
                return true;
            },

            tryMerge: (coinId: string, targetIndex: number) => {
                const state = get();
                const { coins, mergeBonusLevel, gemSystemUnlocked } = state;
                // 방어 코드: 기존 저장 데이터에 discoveredLevels가 없을 수 있음
                const discoveredLevels = state.discoveredLevels || [1];

                const movingCoin = coins.find(c => c.id === coinId);
                if (!movingCoin) return false;

                const targetCoin = coins.find(
                    c => c.gridIndex === targetIndex && c.id !== coinId
                );

                if (targetCoin && targetCoin.level === movingCoin.level) {
                    const newLevel = movingCoin.level + 1;

                    if (!gemSystemUnlocked && newLevel > 12) return false;
                    if (newLevel > 18) return false;

                    const mergedCoin: Coin = {
                        id: generateId(),
                        level: newLevel,
                        gridIndex: targetIndex,
                    };

                    const newCoinValue = COIN_LEVELS[newLevel]?.value || 0;
                    // 머지 보너스: 10% 확률로 발동, 0.5% 단위 (mergeBonusLevel * 0.5%)
                    const bonusChance = Math.random() < 0.1; // 10% 확률
                    const bonusPercent = (mergeBonusLevel * 0.5) / 100;
                    const mergeBonus = bonusChance ? Math.floor(newCoinValue * bonusPercent) : 0;

                    const newCoins = coins
                        .filter(c => c.id !== coinId && c.id !== targetCoin.id)
                        .concat(mergedCoin);

                    const bitcoinFound = newLevel === 18;

                    // 첫 발견 체크 (레벨 2 이상만)
                    const isFirstDiscovery = newLevel >= 2 && !discoveredLevels.includes(newLevel);
                    const updatedDiscoveredLevels = isFirstDiscovery
                        ? [...discoveredLevels, newLevel]
                        : discoveredLevels;

                    set(state => ({
                        coins: newCoins,
                        totalMoney: state.totalMoney + mergeBonus,
                        pps: calculateTotalPPS(newCoins),
                        lastMergedId: mergedCoin.id,
                        bitcoinDiscovered: state.bitcoinDiscovered || bitcoinFound,
                        totalMergeCount: state.totalMergeCount + 1,
                        discoveredLevels: updatedDiscoveredLevels,
                        lastDiscoveredLevel: isFirstDiscovery ? newLevel : state.lastDiscoveredLevel,
                    }));

                    if (navigator.vibrate) navigator.vibrate(50);
                    return true;
                }
                return false;
            },

            triggerAutoMerge: () => {
                const { coins, tryMerge } = get();
                // 레벨별로 코인 분류
                const coinsByLevel: Record<number, Coin[]> = {};

                // 정렬된 상태로 순회하지 않아도 됨
                coins.forEach(c => {
                    if (!coinsByLevel[c.level]) coinsByLevel[c.level] = [];
                    coinsByLevel[c.level].push(c);
                });

                // 낮은 레벨부터 머지 시도
                const levels = Object.keys(coinsByLevel).map(Number).sort((a, b) => a - b);

                for (const level of levels) {
                    const group = coinsByLevel[level];
                    if (group.length >= 2) {
                        // 2개를 찾아서 머지 시도
                        const coinA = group[0];
                        const coinB = group[1];

                        // tryMerge 호출 (coinA를 coinB 위치로 이동)
                        return tryMerge(coinA.id, coinB.gridIndex);
                    }
                }
                return false;
            },

            activateBoost: (type: BoostType, durationSec: number) => {
                const { activeBoosts } = get();
                const now = Date.now();
                const existing = activeBoosts.find(b => b.type === type);

                let newBoosts = [...activeBoosts];
                const endTime = now + (durationSec * 1000);

                if (existing) {
                    // 시간 연장 (현재 남은 시간 + 추가 시간)
                    // 혹은 그냥 종료 시간을 덮어쓰기? -> 보통은 기존 시간에 누적
                    // 여기서는 심플하게 현재 시간 기준 + duration으로 갱신 (리필 개념)
                    // 아니면 기존 시간 + duration (누적)
                    // 사용자 경험상 누적이 좋음
                    const baseTime = existing.endTime > now ? existing.endTime : now;
                    newBoosts = activeBoosts.map(b =>
                        b.type === type ? { ...b, endTime: baseTime + (durationSec * 1000) } : b
                    );
                } else {
                    newBoosts.push({ type, endTime });
                }

                set({ activeBoosts: newBoosts });
            },

            isBoostActive: (type: BoostType) => {
                const check = get().activeBoosts.find(b => b.type === type && b.endTime > Date.now());
                return !!check;
            },

            addMoney: (amount: number) => {
                const { activeBoosts } = get();
                const isDoubleIncome = activeBoosts.some(b => b.type === 'DOUBLE_INCOME' && b.endTime > Date.now());
                const finalAmount = isDoubleIncome ? amount * 2 : amount;

                set(state => ({
                    totalMoney: state.totalMoney + finalAmount,
                }));
            },

            upgradeSpawnLevel: () => {
                const { spawnLevel, totalMoney, coins } = get();
                const cost = 1000 * Math.pow(spawnLevel, 2);

                if (totalMoney >= cost && spawnLevel < 11) {
                    const newSpawnLevel = spawnLevel + 1;
                    const removedCoins = coins.filter(c => c.level < newSpawnLevel);
                    const refund = removedCoins.reduce((sum, coin) => sum + (COIN_LEVELS[coin.level]?.value || 0), 0);
                    const remainingCoins = coins.filter(c => c.level >= newSpawnLevel);

                    set(state => ({
                        spawnLevel: newSpawnLevel,
                        coins: remainingCoins,
                        totalMoney: state.totalMoney - cost + refund,
                        pps: calculateTotalPPS(remainingCoins),
                    }));
                    return true;
                }
                return false;
            },

            upgradeSpeed: () => {
                const { spawnCooldown, totalMoney } = get();
                if (spawnCooldown <= 200) return false;

                const level = Math.floor((5000 - spawnCooldown) / 500) + 1;
                // 비용 증가: 1000 * level^1.8
                const cost = 1000 * Math.pow(level, 1.8);

                if (totalMoney >= cost) {
                    set(state => ({
                        spawnCooldown: Math.max(200, state.spawnCooldown - 500),
                        totalMoney: state.totalMoney - cost
                    }));
                    return true;
                }
                return false;
            },

            upgradeIncomeSpeed: () => {
                const { incomeInterval, totalMoney } = get();
                if (incomeInterval <= 1000) return false;

                const level = Math.floor((10000 - incomeInterval) / 100) + 1;
                // 비용 대폭 증가: 1000 * level^2.0 (기존 300 * level^1.3)
                const cost = 1000 * Math.pow(level, 2.0);

                if (totalMoney >= cost) {
                    set(state => ({
                        incomeInterval: Math.max(1000, state.incomeInterval - 100),
                        totalMoney: state.totalMoney - cost
                    }));
                    return true;
                }
                return false;
            },

            upgradeMergeBonus: () => {
                const { mergeBonusLevel, totalMoney } = get();
                // 최대 60레벨 = 30% (0.5% * 60)
                if (mergeBonusLevel >= 60) return false;

                const cost = 200 * Math.pow(mergeBonusLevel + 1, 1.4);

                if (totalMoney >= cost) {
                    set(state => ({
                        mergeBonusLevel: state.mergeBonusLevel + 1,
                        totalMoney: state.totalMoney - cost
                    }));
                    return true;
                }
                return false;
            },

            unlockGemSystem: () => {
                const { gemSystemUnlocked, totalMoney } = get();
                if (gemSystemUnlocked) return false;
                const cost = 100000000;
                if (totalMoney >= cost) {
                    set(state => ({
                        gemSystemUnlocked: true,
                        totalMoney: state.totalMoney - cost
                    }));
                    return true;
                }
                return false;
            },

            checkAchievements: () => {
                const state = get();
                const newlyUnlocked: string[] = [];

                ACHIEVEMENTS.forEach(achievement => {
                    // 이미 해금된 업적은 스킵
                    if (state.unlockedAchievements.includes(achievement.id)) return;

                    // 조건 체크
                    if (achievement.condition(state)) {
                        newlyUnlocked.push(achievement.id);
                    }
                });

                if (newlyUnlocked.length > 0) {
                    // 보상 계산
                    const totalReward = newlyUnlocked.reduce((sum, id) => {
                        const achievement = ACHIEVEMENTS.find(a => a.id === id);
                        return sum + (achievement?.reward || 0);
                    }, 0);

                    set(state => ({
                        unlockedAchievements: [...state.unlockedAchievements, ...newlyUnlocked],
                        totalMoney: state.totalMoney + totalReward,
                    }));
                }

                return newlyUnlocked;
            },

            resetGame: () => {
                set(initialState);
            },

            clearLastMergedId: () => {
                set({ lastMergedId: null });
            },

            clearLastDiscoveredLevel: () => {
                set({ lastDiscoveredLevel: null });
            },

            isBoardFull: () => {
                const { coins } = get();
                return coins.length >= TOTAL_CELLS;
            },
        }),
        {
            name: 'merge-money-tycoon-v4', // 버전 업데이트
            partialize: (state) => ({
                coins: state.coins,
                totalMoney: state.totalMoney,
                spawnLevel: state.spawnLevel,
                spawnCooldown: state.spawnCooldown,
                incomeInterval: state.incomeInterval,
                mergeBonusLevel: state.mergeBonusLevel,
                gemSystemUnlocked: state.gemSystemUnlocked,
                bitcoinDiscovered: state.bitcoinDiscovered,
                activeBoosts: state.activeBoosts,
                // 업적 관련 추가
                unlockedAchievements: state.unlockedAchievements,
                totalMergeCount: state.totalMergeCount,
                totalEarnedMoney: state.totalEarnedMoney,
                discoveredLevels: state.discoveredLevels,
            }),
            onRehydrateStorage: () => (state) => {
                if (!state) return;
                set({
                    pps: calculateTotalPPS(state.coins),
                    // 기존 저장 데이터 마이그레이션
                    discoveredLevels: state.discoveredLevels || [1],
                    lastDiscoveredLevel: null,
                });
            },
        }
    )
);
