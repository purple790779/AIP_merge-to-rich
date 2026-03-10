import { calculateIncomePerTick } from '../game/coins';
import { getMissionById } from '../game/missions';
import { getKstDayKey } from '../utils/dailyReward';
import type { GameStore, GameStoreState } from './types';

export function partializeGameStore(state: GameStore) {
    return {
        coins: state.coins,
        totalMoney: state.totalMoney,
        spawnLevel: state.spawnLevel,
        spawnCooldown: state.spawnCooldown,
        incomeInterval: state.incomeInterval,
        mergeBonusLevel: state.mergeBonusLevel,
        gemSystemUnlocked: state.gemSystemUnlocked,
        bitcoinDiscovered: state.bitcoinDiscovered,
        activeBoosts: state.activeBoosts,
        unlockedAchievements: state.unlockedAchievements,
        totalMergeCount: state.totalMergeCount,
        totalEarnedMoney: state.totalEarnedMoney,
        discoveredLevels: state.discoveredLevels,
        incomeMultiplierLevel: state.incomeMultiplierLevel,
        autoMergeInterval: state.autoMergeInterval,
        unlockedRegionIds: state.unlockedRegionIds,
        currentRegionId: state.currentRegionId,
        claimedRegionGoalIds: state.claimedRegionGoalIds,
        dailyRewardLastClaimAt: state.dailyRewardLastClaimAt,
        dailyRewardLastClaimDayKey: state.dailyRewardLastClaimDayKey,
        dailyRewardStreak: state.dailyRewardStreak,
        dailyRewardTotalClaimed: state.dailyRewardTotalClaimed,
        dailyRewardLastAmount: state.dailyRewardLastAmount,
        boardRescueUsedDayKey: state.boardRescueUsedDayKey,
        boardRescueUsedCount: state.boardRescueUsedCount,
        boardRescueTotalUsed: state.boardRescueTotalUsed,
        lastSeenAt: state.lastSeenAt,
        lastSeenDayKey: state.lastSeenDayKey,
        returnRewardLastEligibleAt: state.returnRewardLastEligibleAt,
        returnRewardLastClaimAt: state.returnRewardLastClaimAt,
        returnRewardTotalClaimed: state.returnRewardTotalClaimed,
        pendingReturnReward: state.pendingReturnReward,
        offlineRewardLastClaimAt: state.offlineRewardLastClaimAt,
        offlineRewardTotalClaimed: state.offlineRewardTotalClaimed,
        pendingOfflineReward: state.pendingOfflineReward,
        dailyMissionClaimedIds: state.dailyMissionClaimedIds,
        dailyMissionClaimedDayKey: state.dailyMissionClaimedDayKey,
        weeklyMissionClaimedIds: state.weeklyMissionClaimedIds,
        weeklyMissionClaimedWeekKey: state.weeklyMissionClaimedWeekKey,
        missionClaimedIds: state.missionClaimedIds,
        totalMissionRewardsClaimed: state.totalMissionRewardsClaimed,
    };
}

export function hydrateGameStoreState(state: GameStoreState): void {
    const now = Date.now();

    state.incomePerTick = calculateIncomePerTick(state.coins);
    state.discoveredLevels = state.discoveredLevels?.length ? state.discoveredLevels : [1];
    state.lastDiscoveredLevel = null;
    state.incomeMultiplierLevel = state.incomeMultiplierLevel ?? 0;
    state.autoMergeInterval = state.autoMergeInterval ?? 5000;
    state.unlockedRegionIds = state.unlockedRegionIds?.length ? state.unlockedRegionIds : ['city_bank'];
    state.currentRegionId = state.currentRegionId ?? state.unlockedRegionIds[0] ?? 'city_bank';
    state.claimedRegionGoalIds = state.claimedRegionGoalIds ?? [];
    state.totalEarnedMoney = state.totalEarnedMoney ?? 0;
    state.dailyRewardLastClaimAt = state.dailyRewardLastClaimAt ?? null;
    state.dailyRewardLastClaimDayKey = state.dailyRewardLastClaimDayKey ?? null;
    state.dailyRewardStreak = state.dailyRewardStreak ?? 0;
    state.dailyRewardTotalClaimed = state.dailyRewardTotalClaimed ?? 0;
    state.dailyRewardLastAmount = state.dailyRewardLastAmount ?? 0;
    state.boardRescueUsedDayKey = state.boardRescueUsedDayKey ?? null;
    state.boardRescueUsedCount = state.boardRescueUsedCount ?? 0;
    state.boardRescueTotalUsed = state.boardRescueTotalUsed ?? 0;
    state.lastSeenAt = state.lastSeenAt ?? now;
    state.lastSeenDayKey = state.lastSeenDayKey ?? getKstDayKey(state.lastSeenAt);
    state.returnRewardLastEligibleAt = state.returnRewardLastEligibleAt ?? null;
    state.returnRewardLastClaimAt = state.returnRewardLastClaimAt ?? null;
    state.returnRewardTotalClaimed = state.returnRewardTotalClaimed ?? 0;
    state.pendingReturnReward =
        state.pendingReturnReward && state.pendingReturnReward.amount > 0 ? state.pendingReturnReward : null;
    state.offlineRewardLastClaimAt = state.offlineRewardLastClaimAt ?? null;
    state.offlineRewardTotalClaimed = state.offlineRewardTotalClaimed ?? 0;
    state.pendingOfflineReward =
        state.pendingOfflineReward && state.pendingOfflineReward.amount > 0 ? state.pendingOfflineReward : null;
    const legacyMissionClaimedIds = state.missionClaimedIds ?? [];
    const hasMissionCadenceBuckets =
        Array.isArray(state.dailyMissionClaimedIds) || Array.isArray(state.weeklyMissionClaimedIds);

    state.dailyMissionClaimedIds = state.dailyMissionClaimedIds ?? [];
    state.dailyMissionClaimedDayKey = state.dailyMissionClaimedDayKey ?? null;
    state.weeklyMissionClaimedIds = state.weeklyMissionClaimedIds ?? [];
    state.weeklyMissionClaimedWeekKey = state.weeklyMissionClaimedWeekKey ?? null;
    state.missionClaimedIds = state.missionClaimedIds ?? [];
    state.totalMissionRewardsClaimed = state.totalMissionRewardsClaimed ?? legacyMissionClaimedIds.length;

    if (!hasMissionCadenceBuckets && legacyMissionClaimedIds.length > 0) {
        state.missionClaimedIds = legacyMissionClaimedIds.filter(
            (missionId) => getMissionById(missionId)?.cadence === 'milestone'
        );
    }
}
