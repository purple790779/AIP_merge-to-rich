import type { GameStoreState } from './types';
import { getKstDayKey } from '../utils/dailyReward';
import { createRegionGoalBaseline, STARTING_REGION_ID } from '../game/worlds';

export const STORE_KEY = 'merge-money-tycoon-v6';

export function createInitialGameState(now: number = Date.now()): GameStoreState {
    const startingRegionBaseline = createRegionGoalBaseline(
        {
            totalMoney: 50,
            totalEarnedMoney: 0,
            totalMergeCount: 0,
            spawnLevel: 1,
            mergeBonusLevel: 0,
            incomeMultiplierLevel: 0,
            discoveredLevels: [1],
            gemSystemUnlocked: false,
            bitcoinDiscovered: false,
        },
        now
    );

    return {
        coins: [],
        totalMoney: 50,
        incomePerTick: 0,
        spawnLevel: 1,
        spawnCooldown: 5000,
        incomeInterval: 10000,
        mergeBonusLevel: 0,
        gemSystemUnlocked: false,
        bitcoinDiscovered: false,
        lastMergedId: null,
        activeBoosts: [],
        unlockedAchievements: [],
        totalMergeCount: 0,
        totalEarnedMoney: 0,
        discoveredLevels: [1],
        incomeMultiplierLevel: 0,
        autoMergeInterval: 5000,
        unlockedRegionIds: [STARTING_REGION_ID],
        currentRegionId: STARTING_REGION_ID,
        claimedRegionGoalIds: [],
        regionGoalBaselines: {
            [STARTING_REGION_ID]: startingRegionBaseline,
        },
        dailyRewardLastClaimAt: null,
        dailyRewardLastClaimDayKey: null,
        dailyRewardStreak: 0,
        dailyRewardTotalClaimed: 0,
        dailyRewardLastAmount: 0,
        boardRescueUsedDayKey: null,
        boardRescueUsedCount: 0,
        boardRescueTotalUsed: 0,
        lastSeenAt: now,
        lastSeenDayKey: getKstDayKey(now),
        returnRewardLastEligibleAt: null,
        returnRewardLastClaimAt: null,
        returnRewardTotalClaimed: 0,
        pendingReturnReward: null,
        offlineRewardLastClaimAt: null,
        offlineRewardTotalClaimed: 0,
        pendingOfflineReward: null,
        dailyMissionClaimedIds: [],
        dailyMissionClaimedDayKey: null,
        weeklyMissionClaimedIds: [],
        weeklyMissionClaimedWeekKey: null,
        missionClaimedIds: [],
        totalMissionRewardsClaimed: 0,
        lastDiscoveredLevel: null,
    };
}
