import { calculateIncomePerTick } from '../game/coins';
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
        dailyRewardLastClaimAt: state.dailyRewardLastClaimAt,
        dailyRewardLastClaimDayKey: state.dailyRewardLastClaimDayKey,
        dailyRewardStreak: state.dailyRewardStreak,
        dailyRewardTotalClaimed: state.dailyRewardTotalClaimed,
        dailyRewardLastAmount: state.dailyRewardLastAmount,
        lastSeenAt: state.lastSeenAt,
        lastSeenDayKey: state.lastSeenDayKey,
        returnRewardLastEligibleAt: state.returnRewardLastEligibleAt,
        returnRewardLastClaimAt: state.returnRewardLastClaimAt,
        returnRewardTotalClaimed: state.returnRewardTotalClaimed,
        pendingReturnReward: state.pendingReturnReward,
        offlineRewardLastClaimAt: state.offlineRewardLastClaimAt,
        offlineRewardTotalClaimed: state.offlineRewardTotalClaimed,
        pendingOfflineReward: state.pendingOfflineReward,
        missionClaimedIds: state.missionClaimedIds,
    };
}

export function hydrateGameStoreState(state: GameStoreState): void {
    const now = Date.now();

    state.incomePerTick = calculateIncomePerTick(state.coins);
    state.discoveredLevels = state.discoveredLevels?.length ? state.discoveredLevels : [1];
    state.lastDiscoveredLevel = null;
    state.incomeMultiplierLevel = state.incomeMultiplierLevel ?? 0;
    state.autoMergeInterval = state.autoMergeInterval ?? 5000;
    state.totalEarnedMoney = state.totalEarnedMoney ?? 0;
    state.dailyRewardLastClaimAt = state.dailyRewardLastClaimAt ?? null;
    state.dailyRewardLastClaimDayKey = state.dailyRewardLastClaimDayKey ?? null;
    state.dailyRewardStreak = state.dailyRewardStreak ?? 0;
    state.dailyRewardTotalClaimed = state.dailyRewardTotalClaimed ?? 0;
    state.dailyRewardLastAmount = state.dailyRewardLastAmount ?? 0;
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
    state.missionClaimedIds = state.missionClaimedIds ?? [];
}
