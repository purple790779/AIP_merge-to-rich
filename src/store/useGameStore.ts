import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Coin } from '../types/game';
import { COIN_LEVELS, TOTAL_CELLS } from '../types/game';
import { getAchievementRewardTotal, getNewlyUnlockedAchievementIds } from '../game/achievements';
import { calculateIncomePerTick, findAutoMergePair, findRandomEmptyCell, generateCoinId } from '../game/coins';
import { getBoardRescueStatus } from '../game/rescue';
import {
    ECONOMY_LIMITS,
    getAutoMergeUpgradeCost,
    getIncomeMultiplierUpgradeCost,
    getIncomeSpeedUpgradeCost,
    getMergeBonusPercent,
    getMergeBonusUpgradeCost,
    getSpawnLevelUpgradeCost,
    getSpawnSpeedUpgradeCost,
} from '../game/economy';
import { getNextLockedRegion, getRegionById, getRegionGoalById, getRegionGoalStatuses, isRegionHotspotCell } from '../game/worlds';
import { finalizeRewardAmount, getOfflineRewardPreview, getReturnRewardPreview } from '../game/rewards';
import { createInitialGameState, STORE_KEY } from './gameState';
import { hydrateGameStoreState, partializeGameStore } from './persistence';
import type { GameStore } from './types';
import {
    getDailyRewardStatus,
    getKstDayKey,
    getKstWeekKey,
} from '../utils/dailyReward';
import { getMissionById, isMissionCompleted } from '../game/missions';

export const useGameStore = create<GameStore>()(
    persist(
        (set, get) => ({
            ...createInitialGameState(),

            spawnCoin: () => {
                const { coins, spawnLevel, totalMoney } = get();
                const spawnCost = COIN_LEVELS[spawnLevel]?.value ?? COIN_LEVELS[1].value;

                if (totalMoney < spawnCost || coins.length >= TOTAL_CELLS) {
                    return false;
                }

                const emptyCell = findRandomEmptyCell(coins);
                if (emptyCell === null) return false;

                const newCoin: Coin = {
                    id: generateCoinId(),
                    level: spawnLevel,
                    gridIndex: emptyCell,
                };

                set((state) => {
                    const nextCoins = [...state.coins, newCoin];
                    return {
                        coins: nextCoins,
                        totalMoney: state.totalMoney - spawnCost,
                        incomePerTick: calculateIncomePerTick(nextCoins),
                    };
                });

                get().checkAchievements();
                return true;
            },

            moveCoin: (coinId, targetIndex) => {
                const { coins } = get();
                if (targetIndex < 0 || targetIndex >= TOTAL_CELLS) return false;

                const targetCoin = coins.find((coin) => coin.gridIndex === targetIndex && coin.id !== coinId);
                if (targetCoin) return false;

                set((state) => ({
                    coins: state.coins.map((coin) =>
                        coin.id === coinId ? { ...coin, gridIndex: targetIndex } : coin
                    ),
                }));

                return true;
            },

            tryMerge: (coinId, targetIndex) => {
                const state = get();
                const movingCoin = state.coins.find((coin) => coin.id === coinId);
                if (!movingCoin) return false;

                const targetCoin = state.coins.find(
                    (coin) => coin.gridIndex === targetIndex && coin.id !== coinId
                );
                if (!targetCoin || targetCoin.level !== movingCoin.level) return false;

                const nextLevel = movingCoin.level + 1;
                if (!state.gemSystemUnlocked && nextLevel > 12) return false;
                if (nextLevel > 18) return false;

                const mergedCoin: Coin = {
                    id: generateCoinId(),
                    level: nextLevel,
                    gridIndex: targetIndex,
                };

                const mergeBonusChance = Math.random() < ECONOMY_LIMITS.mergeBonusChance;
                const mergeBonusBase = mergeBonusChance
                    ? Math.floor((COIN_LEVELS[nextLevel]?.value ?? 0) * (getMergeBonusPercent(state.mergeBonusLevel) / 100))
                    : 0;
                const regionHotspotBonusBase = isRegionHotspotCell(state.currentRegionId, targetIndex)
                    ? Math.floor((COIN_LEVELS[nextLevel]?.value ?? 0) * (getRegionById(state.currentRegionId).boardProfile.mergeHotspotBonusPercent / 100))
                    : 0;

                const nextCoins = state.coins
                    .filter((coin) => coin.id !== movingCoin.id && coin.id !== targetCoin.id)
                    .concat(mergedCoin);

                const discoveredLevels = state.discoveredLevels?.length ? state.discoveredLevels : [1];
                const isFirstDiscovery = nextLevel >= 2 && !discoveredLevels.includes(nextLevel);
                const finalMergeBonus = finalizeRewardAmount(
                    mergeBonusBase + regionHotspotBonusBase,
                    'merge_bonus',
                    state.activeBoosts,
                    state.incomeMultiplierLevel ?? 0
                );

                set((currentState) => ({
                    coins: nextCoins,
                    totalMoney: currentState.totalMoney + finalMergeBonus,
                    incomePerTick: calculateIncomePerTick(nextCoins),
                    lastMergedId: mergedCoin.id,
                    bitcoinDiscovered: currentState.bitcoinDiscovered || nextLevel === 18,
                    totalMergeCount: currentState.totalMergeCount + 1,
                    totalEarnedMoney: currentState.totalEarnedMoney + finalMergeBonus,
                    discoveredLevels: isFirstDiscovery
                        ? [...discoveredLevels, nextLevel]
                        : discoveredLevels,
                    lastDiscoveredLevel: isFirstDiscovery ? nextLevel : currentState.lastDiscoveredLevel,
                }));

                get().checkAchievements();
                if (navigator.vibrate) navigator.vibrate(50);
                return true;
            },

            triggerAutoMerge: () => {
                const { coins, gemSystemUnlocked } = get();
                const pair = findAutoMergePair(coins, gemSystemUnlocked);
                if (!pair) return false;
                return get().tryMerge(pair.coinId, pair.targetIndex);
            },

            activateBoost: (type, durationSec) => {
                const { activeBoosts } = get();
                const now = Date.now();
                const existingBoost = activeBoosts.find((boost) => boost.type === type);
                const endTime = now + (durationSec * 1000);

                if (!existingBoost) {
                    set({ activeBoosts: [...activeBoosts, { type, endTime }] });
                    return;
                }

                const baseTime = existingBoost.endTime > now ? existingBoost.endTime : now;
                set({
                    activeBoosts: activeBoosts.map((boost) =>
                        boost.type === type
                            ? { ...boost, endTime: baseTime + (durationSec * 1000) }
                            : boost
                    ),
                });
            },

            isBoostActive: (type) => {
                return get().activeBoosts.some((boost) => boost.type === type && boost.endTime > Date.now());
            },

            grantMoney: (amount, source = 'passive_income') => {
                const state = get();
                const finalAmount = finalizeRewardAmount(
                    amount,
                    source,
                    state.activeBoosts,
                    state.incomeMultiplierLevel ?? 0
                );
                if (finalAmount <= 0) return 0;

                set((currentState) => ({
                    totalMoney: currentState.totalMoney + finalAmount,
                    totalEarnedMoney: currentState.totalEarnedMoney + finalAmount,
                }));

                get().checkAchievements();
                return finalAmount;
            },

            upgradeSpawnLevel: () => {
                const { spawnLevel, totalMoney } = get();
                const cost = getSpawnLevelUpgradeCost(spawnLevel);
                if (totalMoney < cost || spawnLevel >= ECONOMY_LIMITS.maxSpawnLevel) return false;

                set((state) => ({
                    spawnLevel: state.spawnLevel + 1,
                    totalMoney: state.totalMoney - cost,
                }));

                get().checkAchievements();
                return true;
            },

            upgradeSpeed: () => {
                const { spawnCooldown, totalMoney } = get();
                if (spawnCooldown <= ECONOMY_LIMITS.minSpawnCooldown) return false;

                const cost = getSpawnSpeedUpgradeCost(spawnCooldown);
                if (totalMoney < cost) return false;

                set((state) => ({
                    spawnCooldown: Math.max(
                        ECONOMY_LIMITS.minSpawnCooldown,
                        state.spawnCooldown - ECONOMY_LIMITS.spawnCooldownStep
                    ),
                    totalMoney: state.totalMoney - cost,
                }));

                get().checkAchievements();
                return true;
            },

            upgradeIncomeSpeed: () => {
                const { incomeInterval, totalMoney } = get();
                if (incomeInterval <= ECONOMY_LIMITS.minIncomeInterval) return false;

                const cost = getIncomeSpeedUpgradeCost(incomeInterval);
                if (totalMoney < cost) return false;

                set((state) => ({
                    incomeInterval: Math.max(
                        ECONOMY_LIMITS.minIncomeInterval,
                        state.incomeInterval - ECONOMY_LIMITS.incomeIntervalStep
                    ),
                    totalMoney: state.totalMoney - cost,
                }));

                get().checkAchievements();
                return true;
            },

            upgradeMergeBonus: () => {
                const { mergeBonusLevel, totalMoney } = get();
                if (mergeBonusLevel >= ECONOMY_LIMITS.maxMergeBonusLevel) return false;

                const cost = getMergeBonusUpgradeCost(mergeBonusLevel);
                if (totalMoney < cost) return false;

                set((state) => ({
                    mergeBonusLevel: state.mergeBonusLevel + 1,
                    totalMoney: state.totalMoney - cost,
                }));

                get().checkAchievements();
                return true;
            },

            unlockGemSystem: () => {
                const { gemSystemUnlocked, totalMoney } = get();
                if (gemSystemUnlocked || totalMoney < ECONOMY_LIMITS.gemUnlockCost) return false;

                set((state) => ({
                    gemSystemUnlocked: true,
                    totalMoney: state.totalMoney - ECONOMY_LIMITS.gemUnlockCost,
                }));

                get().checkAchievements();
                return true;
            },

            upgradeIncomeMultiplier: () => {
                const { incomeMultiplierLevel, totalMoney } = get();
                const cost = getIncomeMultiplierUpgradeCost(incomeMultiplierLevel);
                if (incomeMultiplierLevel >= ECONOMY_LIMITS.maxIncomeMultiplierLevel || totalMoney < cost) {
                    return false;
                }

                set((state) => ({
                    incomeMultiplierLevel: state.incomeMultiplierLevel + 1,
                    totalMoney: state.totalMoney - cost,
                }));

                get().checkAchievements();
                return true;
            },

            upgradeAutoMergeSpeed: () => {
                const { autoMergeInterval, totalMoney } = get();
                const cost = getAutoMergeUpgradeCost(autoMergeInterval);
                if (autoMergeInterval <= ECONOMY_LIMITS.minAutoMergeInterval || totalMoney < cost) {
                    return false;
                }

                set((state) => ({
                    autoMergeInterval: Math.max(
                        ECONOMY_LIMITS.minAutoMergeInterval,
                        state.autoMergeInterval - ECONOMY_LIMITS.autoMergeIntervalStep
                    ),
                    totalMoney: state.totalMoney - cost,
                }));

                get().checkAchievements();
                return true;
            },

            unlockRegion: (regionId) => {
                const { unlockedRegionIds, totalMoney } = get();
                if (unlockedRegionIds.includes(regionId)) return false;

                const nextRegion = getNextLockedRegion(unlockedRegionIds);
                if (!nextRegion || nextRegion.id !== regionId) return false;
                if (totalMoney < nextRegion.unlockCost) return false;

                set((state) => ({
                    unlockedRegionIds: [...state.unlockedRegionIds, regionId],
                    currentRegionId: regionId,
                    totalMoney: state.totalMoney - nextRegion.unlockCost,
                }));

                get().checkAchievements();
                return true;
            },

            selectRegion: (regionId) => {
                const { unlockedRegionIds, currentRegionId } = get();
                if (!unlockedRegionIds.includes(regionId) || currentRegionId === regionId) return false;
                if (!getRegionById(regionId)) return false;

                set({ currentRegionId: regionId });
                return true;
            },

            claimRegionGoalReward: (goalId) => {
                const state = get();
                if (state.claimedRegionGoalIds.includes(goalId)) return false;

                const goalMeta = getRegionGoalById(goalId);
                if (!goalMeta) return false;
                if (!state.unlockedRegionIds.includes(goalMeta.region.id)) return false;

                const goalStatus = getRegionGoalStatuses(
                    goalMeta.region.id,
                    {
                        totalMoney: state.totalMoney,
                        totalEarnedMoney: state.totalEarnedMoney,
                        totalMergeCount: state.totalMergeCount,
                        spawnLevel: state.spawnLevel,
                        mergeBonusLevel: state.mergeBonusLevel,
                        incomeMultiplierLevel: state.incomeMultiplierLevel ?? 0,
                        discoveredLevels: state.discoveredLevels,
                        gemSystemUnlocked: state.gemSystemUnlocked,
                        bitcoinDiscovered: state.bitcoinDiscovered,
                    },
                    state.claimedRegionGoalIds
                ).find((goal) => goal.id === goalId);

                if (!goalStatus || !goalStatus.isComplete || goalStatus.isClaimed) return false;

                set((currentState) => ({
                    claimedRegionGoalIds: [...currentState.claimedRegionGoalIds, goalId],
                    totalMoney: currentState.totalMoney + goalStatus.reward,
                    totalEarnedMoney: currentState.totalEarnedMoney + goalStatus.reward,
                }));

                get().checkAchievements();
                return true;
            },

            checkAchievements: () => {
                const state = get();
                const newlyUnlocked = getNewlyUnlockedAchievementIds(state);
                if (newlyUnlocked.length === 0) return [];

                const rewardAmount = getAchievementRewardTotal(newlyUnlocked);
                set((currentState) => ({
                    unlockedAchievements: [...currentState.unlockedAchievements, ...newlyUnlocked],
                    totalMoney: currentState.totalMoney + rewardAmount,
                    totalEarnedMoney: currentState.totalEarnedMoney + rewardAmount,
                }));

                return newlyUnlocked;
            },

            claimDailyReward: () => {
                const { dailyRewardLastClaimDayKey, dailyRewardLastClaimAt, dailyRewardStreak } = get();
                const now = Date.now();
                const rewardStatus = getDailyRewardStatus(
                    dailyRewardLastClaimDayKey,
                    dailyRewardLastClaimAt,
                    dailyRewardStreak,
                    now
                );
                if (!rewardStatus.canClaim) return false;

                set((state) => ({
                    totalMoney: state.totalMoney + rewardStatus.claimRewardAmount,
                    totalEarnedMoney: state.totalEarnedMoney + rewardStatus.claimRewardAmount,
                    dailyRewardLastClaimAt: now,
                    dailyRewardLastClaimDayKey: rewardStatus.todayKey,
                    dailyRewardStreak: rewardStatus.nextClaimStreak,
                    dailyRewardTotalClaimed: state.dailyRewardTotalClaimed + 1,
                    dailyRewardLastAmount: rewardStatus.claimRewardAmount,
                }));

                get().checkAchievements();
                return true;
            },

            canClaimDailyReward: () => {
                const { dailyRewardLastClaimDayKey, dailyRewardLastClaimAt, dailyRewardStreak } = get();
                return getDailyRewardStatus(
                    dailyRewardLastClaimDayKey,
                    dailyRewardLastClaimAt,
                    dailyRewardStreak
                ).canClaim;
            },

            useBoardRescue: () => {
                const state = get();
                const rescueStatus = getBoardRescueStatus({
                    coins: state.coins,
                    gemSystemUnlocked: state.gemSystemUnlocked,
                    boardRescueUsedDayKey: state.boardRescueUsedDayKey,
                    boardRescueUsedCount: state.boardRescueUsedCount,
                    spawnLevel: state.spawnLevel,
                });

                if (!rescueStatus.canUse || !rescueStatus.rescueTarget) return false;

                const rescueTargetId = rescueStatus.rescueTarget.id;

                set((currentState) => {
                    const nextCoins = currentState.coins.filter((coin) => coin.id !== rescueTargetId);
                    const nextUsedCount = currentState.boardRescueUsedDayKey === rescueStatus.todayKey
                        ? currentState.boardRescueUsedCount + 1
                        : 1;

                    return {
                        coins: nextCoins,
                        incomePerTick: calculateIncomePerTick(nextCoins),
                        totalMoney: currentState.totalMoney + rescueStatus.emergencyCash,
                        totalEarnedMoney: currentState.totalEarnedMoney + rescueStatus.emergencyCash,
                        boardRescueUsedDayKey: rescueStatus.todayKey,
                        boardRescueUsedCount: nextUsedCount,
                        boardRescueTotalUsed: currentState.boardRescueTotalUsed + 1,
                    };
                });

                get().checkAchievements();
                return true;
            },

            claimMissionReward: (missionId) => {
                const state = get();
                const mission = getMissionById(missionId);
                if (!mission || !isMissionCompleted(state, mission)) return false;

                const now = Date.now();
                const currentDayKey = getKstDayKey(now);
                const currentWeekKey = getKstWeekKey(now);

                if (mission.cadence === 'daily') {
                    const claimedIds =
                        state.dailyMissionClaimedDayKey === currentDayKey ? state.dailyMissionClaimedIds : [];
                    if (claimedIds.includes(missionId)) return false;
                }

                if (mission.cadence === 'weekly') {
                    const claimedIds =
                        state.weeklyMissionClaimedWeekKey === currentWeekKey ? state.weeklyMissionClaimedIds : [];
                    if (claimedIds.includes(missionId)) return false;
                }

                if (mission.cadence === 'milestone' && state.missionClaimedIds.includes(missionId)) {
                    return false;
                }

                set((currentState) => ({
                    dailyMissionClaimedDayKey:
                        mission.cadence === 'daily' ? currentDayKey : currentState.dailyMissionClaimedDayKey,
                    dailyMissionClaimedIds:
                        mission.cadence === 'daily'
                            ? [
                                ...(currentState.dailyMissionClaimedDayKey === currentDayKey
                                    ? currentState.dailyMissionClaimedIds
                                    : []),
                                missionId,
                            ]
                            : currentState.dailyMissionClaimedIds,
                    weeklyMissionClaimedWeekKey:
                        mission.cadence === 'weekly' ? currentWeekKey : currentState.weeklyMissionClaimedWeekKey,
                    weeklyMissionClaimedIds:
                        mission.cadence === 'weekly'
                            ? [
                                ...(currentState.weeklyMissionClaimedWeekKey === currentWeekKey
                                    ? currentState.weeklyMissionClaimedIds
                                    : []),
                                missionId,
                            ]
                            : currentState.weeklyMissionClaimedIds,
                    missionClaimedIds:
                        mission.cadence === 'milestone'
                            ? [...currentState.missionClaimedIds, missionId]
                            : currentState.missionClaimedIds,
                    totalMissionRewardsClaimed: currentState.totalMissionRewardsClaimed + 1,
                    totalMoney: currentState.totalMoney + mission.reward,
                    totalEarnedMoney: currentState.totalEarnedMoney + mission.reward,
                }));

                get().checkAchievements();
                return true;
            },

            refreshTimedRewards: (now = Date.now()) => {
                const state = get();
                const safeNow = Math.max(now, state.lastSeenAt);
                const pendingReturnReward =
                    state.pendingReturnReward ?? getReturnRewardPreview(state.spawnLevel, state.lastSeenAt, safeNow);
                const pendingOfflineReward = pendingReturnReward
                    ? state.pendingOfflineReward
                    : (
                    state.pendingOfflineReward ??
                    getOfflineRewardPreview(state.incomePerTick, state.incomeInterval, state.lastSeenAt, safeNow)
                );

                set({
                    pendingReturnReward,
                    pendingOfflineReward,
                    lastSeenAt: safeNow,
                    lastSeenDayKey: getKstDayKey(safeNow),
                });
            },

            claimReturnReward: () => {
                const { pendingReturnReward } = get();
                if (!pendingReturnReward) return false;

                const now = Date.now();
                set((state) => ({
                    totalMoney: state.totalMoney + pendingReturnReward.amount,
                    totalEarnedMoney: state.totalEarnedMoney + pendingReturnReward.amount,
                    returnRewardLastEligibleAt: pendingReturnReward.eligibleAt,
                    returnRewardLastClaimAt: now,
                    returnRewardTotalClaimed: state.returnRewardTotalClaimed + 1,
                    pendingReturnReward: null,
                }));

                get().checkAchievements();
                return true;
            },

            claimOfflineReward: () => {
                const { pendingOfflineReward } = get();
                if (!pendingOfflineReward) return false;

                const now = Date.now();
                set((state) => ({
                    totalMoney: state.totalMoney + pendingOfflineReward.amount,
                    totalEarnedMoney: state.totalEarnedMoney + pendingOfflineReward.amount,
                    offlineRewardLastClaimAt: now,
                    offlineRewardTotalClaimed: state.offlineRewardTotalClaimed + 1,
                    pendingOfflineReward: null,
                }));

                get().checkAchievements();
                return true;
            },

            dismissTimedReward: (type) => {
                if (type === 'return_reward') {
                    set({ pendingReturnReward: null });
                    return;
                }

                set({ pendingOfflineReward: null });
            },

            syncSessionHeartbeat: (now = Date.now()) => {
                const safeNow = Math.max(now, get().lastSeenAt);
                set({
                    lastSeenAt: safeNow,
                    lastSeenDayKey: getKstDayKey(safeNow),
                });
            },

            resetGame: () => {
                set(createInitialGameState());
            },

            clearLastMergedId: () => {
                set({ lastMergedId: null });
            },

            clearLastDiscoveredLevel: () => {
                set({ lastDiscoveredLevel: null });
            },
        }),
        {
            name: STORE_KEY,
            partialize: partializeGameStore,
            onRehydrateStorage: () => (state) => {
                if (!state) return;
                hydrateGameStoreState(state);
            },
        }
    )
);
