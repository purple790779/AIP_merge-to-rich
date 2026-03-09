import type { GameState } from '../types/game';

export type MissionCadence = 'daily' | 'weekly' | 'milestone';

export type MissionConditionType =
    | 'total_merge_count'
    | 'total_earned_money'
    | 'highest_discovered_level'
    | 'discovered_level_count'
    | 'spawn_level'
    | 'daily_reward_total_claimed'
    | 'return_reward_total_claimed'
    | 'offline_reward_total_claimed';

export interface MissionDefinition {
    id: string;
    cadence: MissionCadence;
    title: string;
    description: string;
    icon: string;
    conditionType: MissionConditionType;
    target: number;
    reward: number;
}

export interface MissionMetrics {
    totalMergeCount: number;
    totalEarnedMoney: number;
    discoveredLevels: number[];
    spawnLevel: number;
    dailyRewardTotalClaimed: number;
    returnRewardTotalClaimed: number;
    offlineRewardTotalClaimed: number;
}

export const MISSIONS: MissionDefinition[] = [
    { id: 'daily_merge_15', cadence: 'daily', title: '가벼운 머지', description: '코인 머지 15회', icon: '🧩', conditionType: 'total_merge_count', target: 15, reward: 2_500 },
    { id: 'daily_reward_1', cadence: 'daily', title: '오늘 체크인', description: '일일 보상 1회 수령', icon: '🎁', conditionType: 'daily_reward_total_claimed', target: 1, reward: 5_000 },
    { id: 'daily_offline_1', cadence: 'daily', title: '짧은 정산', description: '오프라인 보상 1회 정산', icon: '🌙', conditionType: 'offline_reward_total_claimed', target: 1, reward: 7_500 },

    { id: 'weekly_merge_120', cadence: 'weekly', title: '한 주 머지 페이스', description: '코인 머지 120회', icon: '⚙️', conditionType: 'total_merge_count', target: 120, reward: 20_000 },
    { id: 'weekly_merge_280', cadence: 'weekly', title: '한 주 집중 러시', description: '코인 머지 280회', icon: '🔥', conditionType: 'total_merge_count', target: 280, reward: 65_000 },
    { id: 'weekly_earn_3m', cadence: 'weekly', title: '주간 수익 목표', description: '누적 수익 300만', icon: '💴', conditionType: 'total_earned_money', target: 3_000_000, reward: 180_000 },
    { id: 'weekly_return_3', cadence: 'weekly', title: '주간 복귀 루프', description: '복귀 보상 3회 수령', icon: '🎉', conditionType: 'return_reward_total_claimed', target: 3, reward: 95_000 },
    { id: 'weekly_offline_4', cadence: 'weekly', title: '주간 오프라인 루프', description: '오프라인 보상 4회 정산', icon: '🛌', conditionType: 'offline_reward_total_claimed', target: 4, reward: 120_000 },
    { id: 'weekly_spawn_7', cadence: 'weekly', title: '생산 라인 확장', description: '생성 레벨 7 달성', icon: '🚀', conditionType: 'spawn_level', target: 7, reward: 1_400_000 },

    { id: 'milestone_merge_700', cadence: 'milestone', title: '머지 베테랑', description: '코인 머지 700회', icon: '🏅', conditionType: 'total_merge_count', target: 700, reward: 300_000 },
    { id: 'milestone_merge_1400', cadence: 'milestone', title: '머지 레전드', description: '코인 머지 1,400회', icon: '👑', conditionType: 'total_merge_count', target: 1_400, reward: 1_200_000 },
    { id: 'milestone_wealth_15m', cadence: 'milestone', title: '중견 자산가', description: '누적 수익 1,500만', icon: '💶', conditionType: 'total_earned_money', target: 15_000_000, reward: 900_000 },
    { id: 'milestone_wealth_80m', cadence: 'milestone', title: '대형 자산가', description: '누적 수익 8,000만', icon: '💷', conditionType: 'total_earned_money', target: 80_000_000, reward: 5_500_000 },
    { id: 'milestone_level_12', cadence: 'milestone', title: '빌딩 개척', description: '최고 코인 레벨 12', icon: '🏢', conditionType: 'highest_discovered_level', target: 12, reward: 12_000_000 },
    { id: 'milestone_level_16', cadence: 'milestone', title: '초고가 자산', description: '최고 코인 레벨 16', icon: '💎', conditionType: 'highest_discovered_level', target: 16, reward: 90_000_000 },
    { id: 'milestone_collection_12', cadence: 'milestone', title: '도감 탐험가', description: '서로 다른 코인 12종 발견', icon: '📚', conditionType: 'discovered_level_count', target: 12, reward: 2_000_000 },
    { id: 'milestone_collection_16', cadence: 'milestone', title: '도감 마스터', description: '서로 다른 코인 16종 발견', icon: '🧠', conditionType: 'discovered_level_count', target: 16, reward: 12_000_000 },
    { id: 'milestone_daily_21', cadence: 'milestone', title: '느긋한 출석가', description: '일일 보상 21회 수령', icon: '🗓️', conditionType: 'daily_reward_total_claimed', target: 21, reward: 550_000 },
];

export function getMissionMetricValue(state: GameState, conditionType: MissionConditionType): number {
    return getMissionMetricValueFromMetrics(state, conditionType);
}

export function getMissionMetricValueFromMetrics(metrics: MissionMetrics, conditionType: MissionConditionType): number {
    switch (conditionType) {
        case 'total_merge_count':
            return metrics.totalMergeCount;
        case 'total_earned_money':
            return metrics.totalEarnedMoney;
        case 'highest_discovered_level':
            return Math.max(...metrics.discoveredLevels, 1);
        case 'discovered_level_count':
            return metrics.discoveredLevels.length;
        case 'spawn_level':
            return metrics.spawnLevel;
        case 'daily_reward_total_claimed':
            return metrics.dailyRewardTotalClaimed;
        case 'return_reward_total_claimed':
            return metrics.returnRewardTotalClaimed;
        case 'offline_reward_total_claimed':
            return metrics.offlineRewardTotalClaimed;
    }
}

export function getMissionProgress(state: GameState, mission: MissionDefinition): number {
    return Math.max(0, Math.min(getMissionMetricValue(state, mission.conditionType), mission.target));
}

export function isMissionCompleted(state: GameState, mission: MissionDefinition): boolean {
    return getMissionMetricValue(state, mission.conditionType) >= mission.target;
}

export function isMissionCompletedByMetrics(metrics: MissionMetrics, mission: MissionDefinition): boolean {
    return getMissionMetricValueFromMetrics(metrics, mission.conditionType) >= mission.target;
}

export function getClaimableMissionIds(state: GameState): string[] {
    return MISSIONS
        .filter((mission) => !state.missionClaimedIds.includes(mission.id))
        .filter((mission) => isMissionCompleted(state, mission))
        .map((mission) => mission.id);
}

export function getMissionById(missionId: string): MissionDefinition | undefined {
    return MISSIONS.find((mission) => mission.id === missionId);
}

export function getClaimableMissionCountByMetrics(metrics: MissionMetrics, missionClaimedIds: string[]): number {
    return MISSIONS.filter((mission) => !missionClaimedIds.includes(mission.id))
        .filter((mission) => isMissionCompletedByMetrics(metrics, mission)).length;
}
