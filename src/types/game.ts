import type { WorldRegionGoalBaselineMap, WorldRegionId } from '../game/worlds';

export interface Coin {
    id: string;
    level: number;
    gridIndex: number;
}

export interface CoinLevel {
    name: string;
    value: number;
    emoji: string;
}

export const COIN_LEVELS: Record<number, CoinLevel> = {
    1: { name: '10원', value: 10, emoji: '₩10' },
    2: { name: '50원', value: 50, emoji: '₩50' },
    3: { name: '100원', value: 100, emoji: '₩100' },
    4: { name: '500원', value: 500, emoji: '₩500' },
    5: { name: '1,000원', value: 1_000, emoji: '💵' },
    6: { name: '5,000원', value: 5_000, emoji: '💴' },
    7: { name: '10,000원', value: 10_000, emoji: '💶' },
    8: { name: '50,000원', value: 50_000, emoji: '💷' },
    9: { name: '수표', value: 100_000, emoji: '🧾' },
    10: { name: '금괴', value: 500_000, emoji: '🥇' },
    11: { name: '다이아', value: 1_000_000, emoji: '💎' },
    12: { name: '토스 빌딩', value: 10_000_000, emoji: '🏢' },
    13: { name: '루비', value: 50_000_000, emoji: '♦️' },
    14: { name: '사파이어', value: 100_000_000, emoji: '🔷' },
    15: { name: '에메랄드', value: 500_000_000, emoji: '💚' },
    16: { name: '블랙 다이아', value: 1_000_000_000, emoji: '🖤' },
    17: { name: '우주석', value: 5_000_000_000, emoji: '🌙' },
    18: { name: '비트코인', value: 100_000_000_000, emoji: '₿' },
};

export const COIN_BASE_INCOME: Record<number, number> = {
    1: 1,
    2: 3,
    3: 8,
    4: 20,
    5: 50,
    6: 150,
    7: 400,
    8: 1_000,
    9: 3_000,
    10: 10_000,
    11: 50_000,
    12: 200_000,
    13: 1_000_000,
    14: 5_000_000,
    15: 20_000_000,
    16: 100_000_000,
    17: 500_000_000,
    18: 10_000_000_000,
};

export const GRID_SIZE = 5;
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

export type BoostType = 'AUTO_MERGE' | 'DOUBLE_INCOME' | 'AUTO_SPAWN';

export interface ActiveBoost {
    type: BoostType;
    endTime: number;
}

export type RewardSource =
    | 'passive_income'
    | 'merge_bonus'
    | 'daily_reward'
    | 'return_reward'
    | 'offline_reward'
    | 'achievement_reward'
    | 'monetization_bonus';

export interface TimedRewardPreview {
    source: Extract<RewardSource, 'return_reward' | 'offline_reward'>;
    amount: number;
    elapsedMs: number;
    eligibleAt: number;
    multiplier: number;
}

export interface GameState {
    coins: Coin[];
    totalMoney: number;
    incomePerTick: number;
    spawnLevel: number;
    spawnCooldown: number;
    incomeInterval: number;
    mergeBonusLevel: number;
    gemSystemUnlocked: boolean;
    bitcoinDiscovered: boolean;
    lastMergedId: string | null;
    activeBoosts: ActiveBoost[];
    unlockedAchievements: string[];
    totalMergeCount: number;
    totalEarnedMoney: number;
    discoveredLevels: number[];
    incomeMultiplierLevel: number;
    autoMergeInterval: number;
    unlockedRegionIds: WorldRegionId[];
    currentRegionId: WorldRegionId;
    claimedRegionGoalIds: string[];
    regionGoalBaselines: WorldRegionGoalBaselineMap;
    dailyRewardLastClaimAt: number | null;
    dailyRewardLastClaimDayKey: string | null;
    dailyRewardStreak: number;
    dailyRewardTotalClaimed: number;
    dailyRewardLastAmount: number;
    boardRescueUsedDayKey: string | null;
    boardRescueUsedCount: number;
    boardRescueTotalUsed: number;
    lastSeenAt: number;
    lastSeenDayKey: string | null;
    returnRewardLastEligibleAt: number | null;
    returnRewardLastClaimAt: number | null;
    returnRewardTotalClaimed: number;
    pendingReturnReward: TimedRewardPreview | null;
    offlineRewardLastClaimAt: number | null;
    offlineRewardTotalClaimed: number;
    pendingOfflineReward: TimedRewardPreview | null;
    dailyMissionClaimedIds: string[];
    dailyMissionClaimedDayKey: string | null;
    weeklyMissionClaimedIds: string[];
    weeklyMissionClaimedWeekKey: string | null;
    missionClaimedIds: string[];
    totalMissionRewardsClaimed: number;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    category?: AchievementCategory;
    tier?: AchievementTier;
    points?: number;
    metricType?: AchievementMetricType;
    target?: number;
    condition: (state: GameState) => boolean;
    reward?: number;
}

export type AchievementCategory =
    | 'discovery'
    | 'merge_mastery'
    | 'wealth_progression'
    | 'collection'
    | 'retention'
    | 'upgrade_mastery'
    | 'completionist';

export type AchievementTier = 1 | 2 | 3 | 4 | 5;

export type AchievementMetricType =
    | 'total_merge_count'
    | 'total_money'
    | 'total_earned_money'
    | 'highest_discovered_level'
    | 'discovered_level_count'
    | 'board_coin_count'
    | 'daily_reward_total_claimed'
    | 'daily_reward_streak'
    | 'return_reward_total_claimed'
    | 'offline_reward_total_claimed'
    | 'spawn_level'
    | 'spawn_cooldown_maxed'
    | 'income_interval_maxed'
    | 'merge_bonus_level'
    | 'income_multiplier_level'
    | 'auto_merge_interval_maxed'
    | 'gem_system_unlocked'
    | 'mission_claimed_count'
    | 'all_upgrades_maxed'
    | 'max_money_reached';

export const MAX_MONEY = 9_999 * 1_000_000_000_000;
