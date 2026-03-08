import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Coin, GameState, BoostType } from '../types/game';
import { TOTAL_CELLS, COIN_PPS, COIN_LEVELS, ACHIEVEMENTS } from '../types/game';

// ?좏떥由ы떚: 怨좎쑀 ID ?앹꽦
const generateId = () => `coin_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

// ?좏떥由ы떚: ?쒕뜡 鍮?? 李얘린
const findRandomEmptyCell = (coins: Coin[]): number | null => {
    const occupiedIndices = new Set(coins.map(c => c.gridIndex));
    const emptyCells: number[] = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
        if (!occupiedIndices.has(i)) emptyCells.push(i);
    }
    if (emptyCells.length === 0) return null;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

// ?좏떥由ы떚: 珥?PPS 怨꾩궛
const calculateTotalPPS = (coins: Coin[]): number => {
    return coins.reduce((sum, coin) => sum + (COIN_PPS[coin.level] || 0), 0);
};

// ?섏씡/蹂대꼫??怨듯넻 諛곗쑉 ?곸슜
const applyIncomeMultipliers = (
    amount: number,
    activeBoosts: GameState['activeBoosts'],
    incomeMultiplierLevel: number
): number => {
    if (amount <= 0) return 0;
    const incomeMultiplier = 1.0 + incomeMultiplierLevel * 0.1;
    const isDoubleIncome = activeBoosts.some(
        b => b.type === 'DOUBLE_INCOME' && b.endTime > Date.now()
    );
    const boostMultiplier = isDoubleIncome ? 2 : 1;
    return Math.floor(amount * incomeMultiplier * boostMultiplier);
};

interface GameStore extends GameState {
    // 肄붿씤 ?앹꽦
    spawnCoin: () => boolean;

    // 肄붿씤 ?대룞 (?깃났 ?щ? 諛섑솚)
    moveCoin: (coinId: string, targetIndex: number) => boolean;

    // 癒몄? ?쒕룄
    tryMerge: (coinId: string, targetIndex: number) => boolean;

    // ?먮룞 癒몄? ?몃━嫄?(1??
    triggerAutoMerge: () => boolean;

    // 遺?ㅽ듃 ?쒖꽦??
    activateBoost: (type: BoostType, durationSec: number) => void;

    // 遺?ㅽ듃 ?뺤씤
    isBoostActive: (type: BoostType) => boolean;

    // ??異붽? (PPS???섑븳 ?섏씡)
    addMoney: (amount: number) => void;

    // ?낃렇?덉씠??functions...
    upgradeSpawnLevel: () => boolean;
    upgradeSpeed: () => boolean;
    upgradeIncomeSpeed: () => boolean;
    upgradeMergeBonus: () => boolean;
    unlockGemSystem: () => boolean;

    // 湲고?
    resetGame: () => void;
    clearLastMergedId: () => void;
    clearLastDiscoveredLevel: () => void;

    // ?낆쟻
    checkAchievements: () => string[]; // ?덈줈 ?닿툑???낆쟻 ID 諛섑솚

    // ?좉퇋 ?낃렇?덉씠??
    upgradeIncomeMultiplier: () => boolean;
    upgradeAutoMergeSpeed: () => boolean;

    // ???덈꺼 諛쒓껄 ?곹깭
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
    lastMergedId: null,
    activeBoosts: [],
    // ?낆쟻 ?쒖뒪??
    unlockedAchievements: [],
    totalMergeCount: 0,
    totalEarnedMoney: 0,
    discoveredLevels: [1], // ?덈꺼 1? 湲곕낯?쇰줈 諛쒓껄
    lastDiscoveredLevel: null,
    // ?좉퇋 ?낃렇?덉씠??
    incomeMultiplierLevel: 0, // 1.0x遺???쒖옉 (0?덈꺼 = 1.0x)
    autoMergeInterval: 5000, // 5珥덈????쒖옉
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

                get().checkAchievements();

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
                // 諛⑹뼱 肄붾뱶: 湲곗〈 ????곗씠?곗뿉 discoveredLevels媛 ?놁쓣 ???덉쓬
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
                    // 癒몄? 蹂대꼫?? 10% ?뺣쪧濡?諛쒕룞, 0.5% ?⑥쐞 (mergeBonusLevel * 0.5%)
                    const bonusChance = Math.random() < 0.1; // 10% ?뺣쪧
                    const bonusPercent = (mergeBonusLevel * 0.5) / 100;
                    const mergeBonus = bonusChance ? Math.floor(newCoinValue * bonusPercent) : 0;

                    const newCoins = coins
                        .filter(c => c.id !== coinId && c.id !== targetCoin.id)
                        .concat(mergedCoin);

                    const bitcoinFound = newLevel === 18;

                    // 泥?諛쒓껄 泥댄겕 (?덈꺼 2 ?댁긽留?
                    const isFirstDiscovery = newLevel >= 2 && !discoveredLevels.includes(newLevel);
                    const updatedDiscoveredLevels = isFirstDiscovery
                        ? [...discoveredLevels, newLevel]
                        : discoveredLevels;

                    set(state => {
                        const finalMergeBonus = applyIncomeMultipliers(
                            mergeBonus,
                            state.activeBoosts,
                            state.incomeMultiplierLevel ?? 0
                        );

                        return {
                            coins: newCoins,
                            totalMoney: state.totalMoney + finalMergeBonus,
                            pps: calculateTotalPPS(newCoins),
                            lastMergedId: mergedCoin.id,
                            bitcoinDiscovered: state.bitcoinDiscovered || bitcoinFound,
                            totalMergeCount: state.totalMergeCount + 1,
                            totalEarnedMoney: state.totalEarnedMoney + finalMergeBonus,
                            discoveredLevels: updatedDiscoveredLevels,
                            lastDiscoveredLevel: isFirstDiscovery ? newLevel : state.lastDiscoveredLevel,
                        };
                    });

                    get().checkAchievements();

                    if (navigator.vibrate) navigator.vibrate(50);
                    return true;
                }
                return false;
            },

            triggerAutoMerge: () => {
                const { coins, tryMerge } = get();
                // ?덈꺼蹂꾨줈 肄붿씤 遺꾨쪟
                const coinsByLevel: Record<number, Coin[]> = {};

                // ?뺣젹???곹깭濡??쒗쉶?섏? ?딆븘????
                coins.forEach(c => {
                    if (!coinsByLevel[c.level]) coinsByLevel[c.level] = [];
                    coinsByLevel[c.level].push(c);
                });

                // ??? ?덈꺼遺??癒몄? ?쒕룄
                const levels = Object.keys(coinsByLevel).map(Number).sort((a, b) => a - b);

                for (const level of levels) {
                    const group = coinsByLevel[level];
                    if (group.length >= 2) {
                        // 2媛쒕? 李얠븘??癒몄? ?쒕룄
                        const coinA = group[0];
                        const coinB = group[1];

                        // tryMerge ?몄텧 (coinA瑜?coinB ?꾩튂濡??대룞)
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
                    // ?쒓컙 ?곗옣 (?꾩옱 ?⑥? ?쒓컙 + 異붽? ?쒓컙)
                    // ?뱀? 洹몃깷 醫낅즺 ?쒓컙????뼱?곌린? -> 蹂댄넻? 湲곗〈 ?쒓컙???꾩쟻
                    // ?ш린?쒕뒗 ?ы뵆?섍쾶 ?꾩옱 ?쒓컙 湲곗? + duration?쇰줈 媛깆떊 (由ы븘 媛쒕뀗)
                    // ?꾨땲硫?湲곗〈 ?쒓컙 + duration (?꾩쟻)
                    // ?ъ슜??寃쏀뿕???꾩쟻??醫뗭쓬
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
                const baseAmount = Math.max(0, Math.floor(amount));
                if (baseAmount <= 0) return;

                set(state => {
                    const finalAmount = applyIncomeMultipliers(
                        baseAmount,
                        state.activeBoosts,
                        state.incomeMultiplierLevel ?? 0
                    );

                    return {
                        totalMoney: state.totalMoney + finalAmount,
                        totalEarnedMoney: state.totalEarnedMoney + finalAmount,
                    };
                });

                get().checkAchievements();
            },

            upgradeSpawnLevel: () => {
                const { spawnLevel, totalMoney, coins } = get();
                // 諛몃윴??v1.4: 鍮꾩슜 怨≪꽑 媛뺥솕 (湲곗〈 1000 횞 Lv^2)
                const cost = 5000 * Math.pow(spawnLevel, 3.5);

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
                    get().checkAchievements();
                    return true;
                }
                return false;
            },

            upgradeSpeed: () => {
                const { spawnCooldown, totalMoney } = get();
                if (spawnCooldown <= 200) return false;

                const level = Math.floor((5000 - spawnCooldown) / 500) + 1;
                // 諛몃윴??v1.4: 鍮꾩슜 怨≪꽑 媛뺥솕 (湲곗〈 1000 횞 Lv^1.8)
                const cost = 3000 * Math.pow(level, 2.8);

                if (totalMoney >= cost) {
                    set(state => ({
                        spawnCooldown: Math.max(200, state.spawnCooldown - 500),
                        totalMoney: state.totalMoney - cost
                    }));
                    get().checkAchievements();
                    return true;
                }
                return false;
            },

            upgradeIncomeSpeed: () => {
                const { incomeInterval, totalMoney } = get();
                if (incomeInterval <= 1000) return false;

                const level = Math.floor((10000 - incomeInterval) / 100) + 1;
                // 諛몃윴??v1.4: 鍮꾩슜 怨≪꽑 媛뺥솕 (湲곗〈 1000 횞 Lv^2.0)
                const cost = 5000 * Math.pow(level, 3.0);

                if (totalMoney >= cost) {
                    set(state => ({
                        incomeInterval: Math.max(1000, state.incomeInterval - 100),
                        totalMoney: state.totalMoney - cost
                    }));
                    get().checkAchievements();
                    return true;
                }
                return false;
            },

            upgradeMergeBonus: () => {
                const { mergeBonusLevel, totalMoney } = get();
                // 理쒕? 60?덈꺼 = 30% (0.5% * 60)
                if (mergeBonusLevel >= 60) return false;

                // 諛몃윴??v1.4: 鍮꾩슜 怨≪꽑 媛뺥솕 (湲곗〈 200 횞 Lv^1.4)
                const cost = 1000 * Math.pow(mergeBonusLevel + 1, 2.5);

                if (totalMoney >= cost) {
                    set(state => ({
                        mergeBonusLevel: state.mergeBonusLevel + 1,
                        totalMoney: state.totalMoney - cost
                    }));
                    get().checkAchievements();
                    return true;
                }
                return false;
            },

            unlockGemSystem: () => {
                const { gemSystemUnlocked, totalMoney } = get();
                if (gemSystemUnlocked) return false;
                // 諛몃윴??v1.4: 蹂댁꽍 ?쒖뒪???닿툑 鍮꾩슜 ?곹뼢 (湲곗〈 1????10??
                const cost = 1000000000;
                if (totalMoney >= cost) {
                    set(state => ({
                        gemSystemUnlocked: true,
                        totalMoney: state.totalMoney - cost
                    }));
                    get().checkAchievements();
                    return true;
                }
                return false;
            },

            checkAchievements: () => {
                const state = get();
                const newlyUnlocked: string[] = [];

                ACHIEVEMENTS.forEach(achievement => {
                    // ?대? ?닿툑???낆쟻? ?ㅽ궢
                    if (state.unlockedAchievements.includes(achievement.id)) return;

                    // 議곌굔 泥댄겕
                    if (achievement.condition(state)) {
                        newlyUnlocked.push(achievement.id);
                    }
                });

                if (newlyUnlocked.length > 0) {
                    // 蹂댁긽 怨꾩궛
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

            upgradeIncomeMultiplier: () => {
                const { incomeMultiplierLevel, totalMoney } = get();
                const currentLevel = incomeMultiplierLevel ?? 0;
                // 諛몃윴??v1.4: 鍮꾩슜 怨≪꽑 媛뺥솕 (湲곗〈 5000 횞 Lv^1.6)
                const cost = Math.floor(15000 * Math.pow(currentLevel + 1, 2.8));
                const maxLevel = 80;

                if (totalMoney >= cost && currentLevel < maxLevel) {
                    set(state => ({
                        totalMoney: state.totalMoney - cost,
                        incomeMultiplierLevel: currentLevel + 1,
                    }));
                    get().checkAchievements();
                    return true;
                }
                return false;
            },

            upgradeAutoMergeSpeed: () => {
                const { autoMergeInterval, totalMoney } = get();
                const currentInterval = autoMergeInterval ?? 5000;
                const currentLevel = Math.floor((5000 - currentInterval) / 200) + 1;
                // 諛몃윴??v1.4: 鍮꾩슜 怨≪꽑 媛뺥솕 (湲곗〈 10000 횞 Lv^1.8)
                const cost = Math.floor(25000 * Math.pow(currentLevel, 3.0));
                const minInterval = 200; // 理쒖냼 0.2珥?

                if (totalMoney >= cost && currentInterval > minInterval) {
                    set(state => ({
                        totalMoney: state.totalMoney - cost,
                        autoMergeInterval: Math.max(minInterval, currentInterval - 200),
                    }));
                    get().checkAchievements();
                    return true;
                }
                return false;
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

        }),
        {
            name: 'merge-money-tycoon-v6', // 諛몃윴??v1.4 由ъ썙?щ줈 踰꾩쟾 ??
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
                // ?낆쟻 愿??異붽?
                unlockedAchievements: state.unlockedAchievements,
                totalMergeCount: state.totalMergeCount,
                totalEarnedMoney: state.totalEarnedMoney,
                discoveredLevels: state.discoveredLevels,
                // ?좉퇋 ?낃렇?덉씠??
                incomeMultiplierLevel: state.incomeMultiplierLevel,
                autoMergeInterval: state.autoMergeInterval,
            }),
            onRehydrateStorage: () => (state) => {
                if (!state) return;
                state.pps = calculateTotalPPS(state.coins);
                // 湲곗〈 ????곗씠??留덉씠洹몃젅?댁뀡
                state.discoveredLevels = state.discoveredLevels || [1];
                state.lastDiscoveredLevel = null;
                state.incomeMultiplierLevel = state.incomeMultiplierLevel ?? 0;
                state.autoMergeInterval = state.autoMergeInterval ?? 5000;
                state.totalEarnedMoney = state.totalEarnedMoney ?? 0;
            },
        }
    )
);
