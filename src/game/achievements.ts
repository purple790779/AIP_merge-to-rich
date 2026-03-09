import { MAX_MONEY, TOTAL_CELLS, type Achievement, type AchievementCategory, type AchievementMetricType, type AchievementTier, type GameState } from '../types/game';

const TIER_POINTS: Record<AchievementTier, number> = {
    1: 10,
    2: 18,
    3: 30,
    4: 46,
    5: 66,
};

const TIER_BONUS_REWARD: Record<AchievementTier, number> = {
    1: 0,
    2: 2_000,
    3: 20_000,
    4: 250_000,
    5: 2_500_000,
};

interface RankDefinition {
    id: string;
    name: string;
    minScore: number;
    badge: string;
}

interface AchievementCategoryMeta {
    title: string;
    subtitle: string;
    icon: string;
    flavor: string;
    accent: 'amber' | 'violet' | 'emerald' | 'cyan' | 'rose' | 'indigo' | 'gold';
}

export const ACHIEVEMENT_RANKS: RankDefinition[] = [
    { id: 'rookie', name: '신입 투자자', minScore: 0, badge: '🌱' },
    { id: 'planner', name: '성장 설계자', minScore: 220, badge: '📈' },
    { id: 'broker', name: '시세 브로커', minScore: 460, badge: '💼' },
    { id: 'magnate', name: '시장 거물', minScore: 760, badge: '🏙️' },
    { id: 'strategist', name: '합병 전략가', minScore: 1_120, badge: '♟️' },
    { id: 'architect', name: '자산 아키텍트', minScore: 1_560, badge: '🏛️' },
    { id: 'legend', name: '레거시 타이쿤', minScore: 2_080, badge: '👑' },
];

export const ACHIEVEMENT_CATEGORY_ORDER: AchievementCategory[] = [
    'discovery',
    'merge_mastery',
    'wealth_progression',
    'collection',
    'retention',
    'upgrade_mastery',
    'completionist',
];

export const ACHIEVEMENT_CATEGORY_META: Record<AchievementCategory, AchievementCategoryMeta> = {
    discovery: {
        title: '발견',
        subtitle: '새 코인 티어 개척',
        icon: '🧭',
        flavor: '새 구간을 열 때마다 경제 스케일이 재정의됩니다.',
        accent: 'amber',
    },
    merge_mastery: {
        title: '머지 숙련',
        subtitle: '합병 실행력 축적',
        icon: '⚔️',
        flavor: '정확하고 빠른 합병 루틴이 장기 성장 속도를 만듭니다.',
        accent: 'violet',
    },
    wealth_progression: {
        title: '부의 확장',
        subtitle: '보유/누적 수익 성장',
        icon: '🏦',
        flavor: '보유 자산과 누적 수익 축을 동시에 확장하세요.',
        accent: 'emerald',
    },
    collection: {
        title: '수집',
        subtitle: '도감과 보드 점유 확대',
        icon: '🗂️',
        flavor: '발견 폭과 보드 운용 밀도를 함께 완성하는 트랙입니다.',
        accent: 'cyan',
    },
    retention: {
        title: '복귀 루프',
        subtitle: '재방문/오프라인 정산',
        icon: '🔁',
        flavor: '숙제처럼 강제하지 않는 안정적인 루틴을 설계합니다.',
        accent: 'rose',
    },
    upgrade_mastery: {
        title: '업그레이드 숙련',
        subtitle: '생산 라인 최적화',
        icon: '🛠️',
        flavor: '라인별 최적화 진행률을 눈에 보이게 쌓아갑니다.',
        accent: 'indigo',
    },
    completionist: {
        title: '완성자',
        subtitle: '장기 완주/도전 체인',
        icon: '👑',
        flavor: '여러 시스템을 묶어 최종 완주 상태를 노립니다.',
        accent: 'gold',
    },
};

function getAchievementMetricValue(state: GameState, metricType: AchievementMetricType): number {
    switch (metricType) {
        case 'total_merge_count':
            return state.totalMergeCount;
        case 'total_money':
            return state.totalMoney;
        case 'total_earned_money':
            return state.totalEarnedMoney;
        case 'highest_discovered_level':
            return Math.max(...state.discoveredLevels, 1);
        case 'discovered_level_count':
            return state.discoveredLevels.length;
        case 'board_coin_count':
            return state.coins.length;
        case 'daily_reward_total_claimed':
            return state.dailyRewardTotalClaimed;
        case 'daily_reward_streak':
            return state.dailyRewardStreak;
        case 'return_reward_total_claimed':
            return state.returnRewardTotalClaimed;
        case 'offline_reward_total_claimed':
            return state.offlineRewardTotalClaimed;
        case 'spawn_level':
            return state.spawnLevel;
        case 'spawn_cooldown_maxed':
            return state.spawnCooldown <= 200 ? 1 : 0;
        case 'income_interval_maxed':
            return state.incomeInterval <= 1_000 ? 1 : 0;
        case 'merge_bonus_level':
            return state.mergeBonusLevel;
        case 'income_multiplier_level':
            return state.incomeMultiplierLevel;
        case 'auto_merge_interval_maxed':
            return state.autoMergeInterval <= 200 ? 1 : 0;
        case 'gem_system_unlocked':
            return state.gemSystemUnlocked ? 1 : 0;
        case 'mission_claimed_count':
            return state.missionClaimedIds.length;
        case 'all_upgrades_maxed':
            return (
                state.spawnLevel >= 11 &&
                state.spawnCooldown <= 200 &&
                state.incomeInterval <= 1_000 &&
                state.mergeBonusLevel >= 60 &&
                state.gemSystemUnlocked &&
                state.incomeMultiplierLevel >= 80 &&
                state.autoMergeInterval <= 200
            )
                ? 1
                : 0;
        case 'max_money_reached':
            return state.totalMoney >= MAX_MONEY ? 1 : 0;
    }
}

function createMetricAchievement(input: {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: AchievementCategory;
    tier: AchievementTier;
    metricType: AchievementMetricType;
    target: number;
    reward: number;
}): Achievement {
    return {
        ...input,
        points: TIER_POINTS[input.tier],
        reward: input.reward + TIER_BONUS_REWARD[input.tier],
        condition: (state) => getAchievementMetricValue(state, input.metricType) >= input.target,
    };
}

const DISCOVERY_ACHIEVEMENTS: Achievement[] = [
    createMetricAchievement({ id: 'discover_level_2', title: '첫 고급 주화', description: '최고 코인 레벨 2 도달', icon: '🪙', category: 'discovery', tier: 1, metricType: 'highest_discovered_level', target: 2, reward: 180 }),
    createMetricAchievement({ id: 'discover_level_3', title: '가치 상승 시작', description: '최고 코인 레벨 3 도달', icon: '📍', category: 'discovery', tier: 1, metricType: 'highest_discovered_level', target: 3, reward: 350 }),
    createMetricAchievement({ id: 'discover_level_5', title: '지폐 구간 진입', description: '최고 코인 레벨 5 도달', icon: '📈', category: 'discovery', tier: 1, metricType: 'highest_discovered_level', target: 5, reward: 900 }),
    createMetricAchievement({ id: 'discover_level_6', title: '고액권 시동', description: '최고 코인 레벨 6 도달', icon: '💴', category: 'discovery', tier: 2, metricType: 'highest_discovered_level', target: 6, reward: 3_800 }),
    createMetricAchievement({ id: 'discover_level_8', title: '고액권 시야', description: '최고 코인 레벨 8 도달', icon: '📊', category: 'discovery', tier: 2, metricType: 'highest_discovered_level', target: 8, reward: 10_000 }),
    createMetricAchievement({ id: 'discover_level_10', title: '금괴 탐사대', description: '최고 코인 레벨 10 도달', icon: '🥇', category: 'discovery', tier: 2, metricType: 'highest_discovered_level', target: 10, reward: 30_000 }),
    createMetricAchievement({ id: 'discover_level_11', title: '다이아 관측자', description: '최고 코인 레벨 11 도달', icon: '💎', category: 'discovery', tier: 3, metricType: 'highest_discovered_level', target: 11, reward: 95_000 }),
    createMetricAchievement({ id: 'discover_level_12', title: '빌딩 개척자', description: '최고 코인 레벨 12 도달', icon: '🏢', category: 'discovery', tier: 3, metricType: 'highest_discovered_level', target: 12, reward: 180_000 }),
    createMetricAchievement({ id: 'discover_level_13', title: '보석 회랑 진입', description: '최고 코인 레벨 13 도달', icon: '♦️', category: 'discovery', tier: 3, metricType: 'highest_discovered_level', target: 13, reward: 420_000 }),
    createMetricAchievement({ id: 'discover_level_14', title: '보석 상류층', description: '최고 코인 레벨 14 도달', icon: '🔷', category: 'discovery', tier: 3, metricType: 'highest_discovered_level', target: 14, reward: 760_000 }),
    createMetricAchievement({ id: 'discover_level_15', title: '에메랄드 항로', description: '최고 코인 레벨 15 도달', icon: '💚', category: 'discovery', tier: 4, metricType: 'highest_discovered_level', target: 15, reward: 2_400_000 }),
    createMetricAchievement({ id: 'discover_level_16', title: '초고가 희귀종', description: '최고 코인 레벨 16 도달', icon: '🖤', category: 'discovery', tier: 4, metricType: 'highest_discovered_level', target: 16, reward: 5_200_000 }),
    createMetricAchievement({ id: 'discover_level_17', title: '우주 등급 확보', description: '최고 코인 레벨 17 도달', icon: '🌙', category: 'discovery', tier: 4, metricType: 'highest_discovered_level', target: 17, reward: 11_000_000 }),
    createMetricAchievement({ id: 'discover_level_18', title: '비트코인 발견', description: '최고 코인 레벨 18 도달', icon: '₿', category: 'discovery', tier: 5, metricType: 'highest_discovered_level', target: 18, reward: 150_000_000 }),
];

const MERGE_MASTERY_ACHIEVEMENTS: Achievement[] = [
    createMetricAchievement({ id: 'merge_1', title: '첫 합병', description: '코인 머지 1회', icon: '✨', category: 'merge_mastery', tier: 1, metricType: 'total_merge_count', target: 1, reward: 100 }),
    createMetricAchievement({ id: 'merge_20', title: '머지 입문', description: '코인 머지 20회', icon: '🧩', category: 'merge_mastery', tier: 1, metricType: 'total_merge_count', target: 20, reward: 800 }),
    createMetricAchievement({ id: 'merge_50', title: '머지 워밍업', description: '코인 머지 50회', icon: '🥋', category: 'merge_mastery', tier: 1, metricType: 'total_merge_count', target: 50, reward: 1_800 }),
    createMetricAchievement({ id: 'merge_120', title: '머지 템포 확보', description: '코인 머지 120회', icon: '🎯', category: 'merge_mastery', tier: 2, metricType: 'total_merge_count', target: 120, reward: 7_200 }),
    createMetricAchievement({ id: 'merge_200', title: '머지 프로세스', description: '코인 머지 200회', icon: '🏅', category: 'merge_mastery', tier: 2, metricType: 'total_merge_count', target: 200, reward: 20_000 }),
    createMetricAchievement({ id: 'merge_350', title: '머지 운영반장', description: '코인 머지 350회', icon: '🧠', category: 'merge_mastery', tier: 2, metricType: 'total_merge_count', target: 350, reward: 45_000 }),
    createMetricAchievement({ id: 'merge_500', title: '머지 전문가', description: '코인 머지 500회', icon: '🛠️', category: 'merge_mastery', tier: 3, metricType: 'total_merge_count', target: 500, reward: 120_000 }),
    createMetricAchievement({ id: 'merge_750', title: '머지 연구원', description: '코인 머지 750회', icon: '🧪', category: 'merge_mastery', tier: 3, metricType: 'total_merge_count', target: 750, reward: 240_000 }),
    createMetricAchievement({ id: 'merge_1000', title: '머지 장인', description: '코인 머지 1,000회', icon: '🏆', category: 'merge_mastery', tier: 3, metricType: 'total_merge_count', target: 1_000, reward: 420_000 }),
    createMetricAchievement({ id: 'merge_1500', title: '머지 파이프라인', description: '코인 머지 1,500회', icon: '📦', category: 'merge_mastery', tier: 4, metricType: 'total_merge_count', target: 1_500, reward: 1_100_000 }),
    createMetricAchievement({ id: 'merge_2500', title: '머지 감독관', description: '코인 머지 2,500회', icon: '🛰️', category: 'merge_mastery', tier: 4, metricType: 'total_merge_count', target: 2_500, reward: 2_900_000 }),
    createMetricAchievement({ id: 'merge_3500', title: '머지 지휘자', description: '코인 머지 3,500회', icon: '👑', category: 'merge_mastery', tier: 4, metricType: 'total_merge_count', target: 3_500, reward: 6_500_000 }),
    createMetricAchievement({ id: 'merge_5000', title: '머지 신화', description: '코인 머지 5,000회', icon: '🔥', category: 'merge_mastery', tier: 5, metricType: 'total_merge_count', target: 5_000, reward: 32_000_000 }),
    createMetricAchievement({ id: 'merge_7000', title: '머지 전설 공정', description: '코인 머지 7,000회', icon: '⚡', category: 'merge_mastery', tier: 5, metricType: 'total_merge_count', target: 7_000, reward: 70_000_000 }),
    createMetricAchievement({ id: 'merge_9000', title: '머지 초월자', description: '코인 머지 9,000회', icon: '🌌', category: 'merge_mastery', tier: 5, metricType: 'total_merge_count', target: 9_000, reward: 125_000_000 }),
];

const WEALTH_PROGRESSION_ACHIEVEMENTS: Achievement[] = [
    createMetricAchievement({ id: 'wealth_onhand_10k', title: '자산 시동', description: '보유 자산 10,000원 달성', icon: '💵', category: 'wealth_progression', tier: 1, metricType: 'total_money', target: 10_000, reward: 1_000 }),
    createMetricAchievement({ id: 'wealth_onhand_50k', title: '현금 감각', description: '보유 자산 50,000원 달성', icon: '💴', category: 'wealth_progression', tier: 1, metricType: 'total_money', target: 50_000, reward: 3_000 }),
    createMetricAchievement({ id: 'wealth_onhand_100k', title: '현금 흐름 확보', description: '보유 자산 100,000원 달성', icon: '💴', category: 'wealth_progression', tier: 2, metricType: 'total_money', target: 100_000, reward: 9_000 }),
    createMetricAchievement({ id: 'wealth_onhand_500k', title: '유동성 궤도', description: '보유 자산 500,000원 달성', icon: '💶', category: 'wealth_progression', tier: 2, metricType: 'total_money', target: 500_000, reward: 24_000 }),
    createMetricAchievement({ id: 'wealth_onhand_1m', title: '백만 단위 진입', description: '보유 자산 1,000,000원 달성', icon: '💶', category: 'wealth_progression', tier: 2, metricType: 'total_money', target: 1_000_000, reward: 50_000 }),
    createMetricAchievement({ id: 'wealth_onhand_10m', title: '중형 유동성', description: '보유 자산 10,000,000원 달성', icon: '💷', category: 'wealth_progression', tier: 3, metricType: 'total_money', target: 10_000_000, reward: 260_000 }),
    createMetricAchievement({ id: 'wealth_onhand_100m', title: '억 단위 도달', description: '보유 자산 100,000,000원 달성', icon: '💰', category: 'wealth_progression', tier: 3, metricType: 'total_money', target: 100_000_000, reward: 1_500_000 }),
    createMetricAchievement({ id: 'wealth_onhand_1b', title: '현금 제국', description: '보유 자산 1,000,000,000원 달성', icon: '🤑', category: 'wealth_progression', tier: 4, metricType: 'total_money', target: 1_000_000_000, reward: 8_500_000 }),
    createMetricAchievement({ id: 'wealth_onhand_10b', title: '초대형 유동성', description: '보유 자산 10,000,000,000원 달성', icon: '🏛️', category: 'wealth_progression', tier: 5, metricType: 'total_money', target: 10_000_000_000, reward: 45_000_000 }),
    createMetricAchievement({ id: 'wealth_earned_1m', title: '수익 계기점', description: '누적 수익 1,000,000원 달성', icon: '📉', category: 'wealth_progression', tier: 1, metricType: 'total_earned_money', target: 1_000_000, reward: 7_000 }),
    createMetricAchievement({ id: 'wealth_earned_5m', title: '첫 수익 곡선', description: '누적 수익 5,000,000원 달성', icon: '📉', category: 'wealth_progression', tier: 2, metricType: 'total_earned_money', target: 5_000_000, reward: 80_000 }),
    createMetricAchievement({ id: 'wealth_earned_25m', title: '분기 실적 달성', description: '누적 수익 25,000,000원 달성', icon: '📈', category: 'wealth_progression', tier: 2, metricType: 'total_earned_money', target: 25_000_000, reward: 260_000 }),
    createMetricAchievement({ id: 'wealth_earned_50m', title: '안정적 수익 루프', description: '누적 수익 50,000,000원 달성', icon: '📈', category: 'wealth_progression', tier: 3, metricType: 'total_earned_money', target: 50_000_000, reward: 520_000 }),
    createMetricAchievement({ id: 'wealth_earned_250m', title: '중견 수익 엔진', description: '누적 수익 250,000,000원 달성', icon: '🏦', category: 'wealth_progression', tier: 3, metricType: 'total_earned_money', target: 250_000_000, reward: 1_800_000 }),
    createMetricAchievement({ id: 'wealth_earned_500m', title: '대형 수익 트랙', description: '누적 수익 500,000,000원 달성', icon: '🏦', category: 'wealth_progression', tier: 4, metricType: 'total_earned_money', target: 500_000_000, reward: 4_300_000 }),
    createMetricAchievement({ id: 'wealth_earned_2b', title: '연속 흑자 체인', description: '누적 수익 2,000,000,000원 달성', icon: '🌊', category: 'wealth_progression', tier: 4, metricType: 'total_earned_money', target: 2_000_000_000, reward: 12_000_000 }),
    createMetricAchievement({ id: 'wealth_earned_5b', title: '자본 흐름 엔진', description: '누적 수익 5,000,000,000원 달성', icon: '🌊', category: 'wealth_progression', tier: 5, metricType: 'total_earned_money', target: 5_000_000_000, reward: 36_000_000 }),
    createMetricAchievement({ id: 'wealth_earned_20b', title: '자산 초신성', description: '누적 수익 20,000,000,000원 달성', icon: '💫', category: 'wealth_progression', tier: 5, metricType: 'total_earned_money', target: 20_000_000_000, reward: 110_000_000 }),
];

const COLLECTION_ACHIEVEMENTS: Achievement[] = [
    createMetricAchievement({ id: 'collection_discovered_4', title: '도감 첫 장', description: '서로 다른 코인 4종 발견', icon: '📘', category: 'collection', tier: 1, metricType: 'discovered_level_count', target: 4, reward: 1_600 }),
    createMetricAchievement({ id: 'collection_discovered_6', title: '도감 초안', description: '서로 다른 코인 6종 발견', icon: '📚', category: 'collection', tier: 1, metricType: 'discovered_level_count', target: 6, reward: 3_200 }),
    createMetricAchievement({ id: 'collection_discovered_10', title: '도감 확장', description: '서로 다른 코인 10종 발견', icon: '📖', category: 'collection', tier: 2, metricType: 'discovered_level_count', target: 10, reward: 20_000 }),
    createMetricAchievement({ id: 'collection_discovered_12', title: '도감 중권', description: '서로 다른 코인 12종 발견', icon: '🧾', category: 'collection', tier: 2, metricType: 'discovered_level_count', target: 12, reward: 80_000 }),
    createMetricAchievement({ id: 'collection_discovered_14', title: '도감 전문가', description: '서로 다른 코인 14종 발견', icon: '🧾', category: 'collection', tier: 3, metricType: 'discovered_level_count', target: 14, reward: 240_000 }),
    createMetricAchievement({ id: 'collection_discovered_16', title: '도감 큐레이터', description: '서로 다른 코인 16종 발견', icon: '🏛️', category: 'collection', tier: 4, metricType: 'discovered_level_count', target: 16, reward: 1_800_000 }),
    createMetricAchievement({ id: 'collection_discovered_18', title: '완전 도감', description: '서로 다른 코인 18종 발견', icon: '🗂️', category: 'collection', tier: 5, metricType: 'discovered_level_count', target: 18, reward: 55_000_000 }),
    createMetricAchievement({ id: 'collection_board_8', title: '작은 포트폴리오', description: '보드에 코인 8개 배치', icon: '🧱', category: 'collection', tier: 1, metricType: 'board_coin_count', target: 8, reward: 1_200 }),
    createMetricAchievement({ id: 'collection_board_12', title: '포지션 확장', description: '보드에 코인 12개 배치', icon: '🏗️', category: 'collection', tier: 1, metricType: 'board_coin_count', target: 12, reward: 3_800 }),
    createMetricAchievement({ id: 'collection_board_18', title: '보드 밀도 강화', description: '보드에 코인 18개 배치', icon: '🧱', category: 'collection', tier: 2, metricType: 'board_coin_count', target: 18, reward: 9_000 }),
    createMetricAchievement({ id: 'collection_board_22', title: '보드 운영실', description: '보드에 코인 22개 배치', icon: '🏢', category: 'collection', tier: 3, metricType: 'board_coin_count', target: 22, reward: 90_000 }),
    createMetricAchievement({ id: 'collection_board_full', title: '보드 점령', description: `보드 ${TOTAL_CELLS}칸을 모두 채우기`, icon: '🏰', category: 'collection', tier: 4, metricType: 'board_coin_count', target: TOTAL_CELLS, reward: 220_000 }),
];

const RETENTION_ACHIEVEMENTS: Achievement[] = [
    createMetricAchievement({ id: 'retention_daily_3', title: '가벼운 출석', description: '일일 보상 3회 수령', icon: '📅', category: 'retention', tier: 1, metricType: 'daily_reward_total_claimed', target: 3, reward: 4_000 }),
    createMetricAchievement({ id: 'retention_daily_7', title: '주간 출석', description: '일일 보상 7회 수령', icon: '🗓️', category: 'retention', tier: 2, metricType: 'daily_reward_total_claimed', target: 7, reward: 15_000 }),
    createMetricAchievement({ id: 'retention_daily_14', title: '2주 루틴', description: '일일 보상 14회 수령', icon: '🧭', category: 'retention', tier: 2, metricType: 'daily_reward_total_claimed', target: 14, reward: 42_000 }),
    createMetricAchievement({ id: 'retention_daily_21', title: '루틴 정착', description: '일일 보상 21회 수령', icon: '🧭', category: 'retention', tier: 3, metricType: 'daily_reward_total_claimed', target: 21, reward: 180_000 }),
    createMetricAchievement({ id: 'retention_daily_45', title: '장기 출석가', description: '일일 보상 45회 수령', icon: '📆', category: 'retention', tier: 4, metricType: 'daily_reward_total_claimed', target: 45, reward: 1_200_000 }),
    createMetricAchievement({ id: 'retention_daily_75', title: '출석 운영자', description: '일일 보상 75회 수령', icon: '🧮', category: 'retention', tier: 5, metricType: 'daily_reward_total_claimed', target: 75, reward: 8_800_000 }),
    createMetricAchievement({ id: 'retention_streak_3', title: '연속 접속 3일', description: '일일 보상 연속 3일 streak 달성', icon: '☀️', category: 'retention', tier: 1, metricType: 'daily_reward_streak', target: 3, reward: 3_000 }),
    createMetricAchievement({ id: 'retention_streak_7', title: '연속 접속 7일', description: '일일 보상 연속 7일 streak 달성', icon: '🔥', category: 'retention', tier: 2, metricType: 'daily_reward_streak', target: 7, reward: 20_000 }),
    createMetricAchievement({ id: 'retention_streak_14', title: '연속 접속 14일', description: '일일 보상 연속 14일 streak 달성', icon: '🏕️', category: 'retention', tier: 3, metricType: 'daily_reward_streak', target: 14, reward: 250_000 }),
    createMetricAchievement({ id: 'retention_streak_21', title: '연속 접속 21일', description: '일일 보상 연속 21일 streak 달성', icon: '🏔️', category: 'retention', tier: 4, metricType: 'daily_reward_streak', target: 21, reward: 1_400_000 }),
    createMetricAchievement({ id: 'retention_return_4', title: '복귀 루프 시작', description: '복귀 보상 4회 수령', icon: '🎁', category: 'retention', tier: 2, metricType: 'return_reward_total_claimed', target: 4, reward: 35_000 }),
    createMetricAchievement({ id: 'retention_return_10', title: '복귀 루프 유지', description: '복귀 보상 10회 수령', icon: '🎉', category: 'retention', tier: 3, metricType: 'return_reward_total_claimed', target: 10, reward: 320_000 }),
    createMetricAchievement({ id: 'retention_return_20', title: '복귀 루프 완성', description: '복귀 보상 20회 수령', icon: '🎟️', category: 'retention', tier: 4, metricType: 'return_reward_total_claimed', target: 20, reward: 1_900_000 }),
    createMetricAchievement({ id: 'retention_offline_10', title: '오프라인 체크인', description: '오프라인 보상 10회 정산', icon: '🌙', category: 'retention', tier: 2, metricType: 'offline_reward_total_claimed', target: 10, reward: 55_000 }),
    createMetricAchievement({ id: 'retention_offline_25', title: '오프라인 매니저', description: '오프라인 보상 25회 정산', icon: '🌙', category: 'retention', tier: 3, metricType: 'offline_reward_total_claimed', target: 25, reward: 280_000 }),
    createMetricAchievement({ id: 'retention_offline_60', title: '오프라인 총괄', description: '오프라인 보상 60회 정산', icon: '🛌', category: 'retention', tier: 4, metricType: 'offline_reward_total_claimed', target: 60, reward: 1_900_000 }),
    createMetricAchievement({ id: 'retention_offline_120', title: '오프라인 디렉터', description: '오프라인 보상 120회 정산', icon: '🌌', category: 'retention', tier: 5, metricType: 'offline_reward_total_claimed', target: 120, reward: 14_000_000 }),
    createMetricAchievement({ id: 'retention_loop_trinity', title: '복귀 루프 레전드', description: '복귀 보상 30회 수령', icon: '♻️', category: 'retention', tier: 5, metricType: 'return_reward_total_claimed', target: 30, reward: 6_000_000 }),
];

const UPGRADE_MASTERY_ACHIEVEMENTS: Achievement[] = [
    createMetricAchievement({ id: 'upgrade_spawn_3', title: '생산 라인 3', description: '생성 레벨 3 달성', icon: '🚀', category: 'upgrade_mastery', tier: 1, metricType: 'spawn_level', target: 3, reward: 2_000 }),
    createMetricAchievement({ id: 'upgrade_spawn_5', title: '생산 라인 5', description: '생성 레벨 5 달성', icon: '🚀', category: 'upgrade_mastery', tier: 1, metricType: 'spawn_level', target: 5, reward: 7_000 }),
    createMetricAchievement({ id: 'upgrade_spawn_8', title: '생산 라인 8', description: '생성 레벨 8 달성', icon: '🛰️', category: 'upgrade_mastery', tier: 2, metricType: 'spawn_level', target: 8, reward: 45_000 }),
    createMetricAchievement({ id: 'upgrade_spawn_10', title: '생산 라인 10', description: '생성 레벨 10 달성', icon: '🌠', category: 'upgrade_mastery', tier: 3, metricType: 'spawn_level', target: 10, reward: 420_000 }),
    createMetricAchievement({ id: 'upgrade_spawn_11', title: '생산 라인 완성', description: '생성 레벨 11 달성', icon: '🌟', category: 'upgrade_mastery', tier: 4, metricType: 'spawn_level', target: 11, reward: 2_800_000 }),
    createMetricAchievement({ id: 'upgrade_merge_bonus_10', title: '합병 보너스 기초', description: '합병 보너스 레벨 10 달성', icon: '⚡', category: 'upgrade_mastery', tier: 1, metricType: 'merge_bonus_level', target: 10, reward: 10_000 }),
    createMetricAchievement({ id: 'upgrade_merge_bonus_20', title: '합병 보너스 강화', description: '합병 보너스 레벨 20 달성', icon: '⚡', category: 'upgrade_mastery', tier: 2, metricType: 'merge_bonus_level', target: 20, reward: 60_000 }),
    createMetricAchievement({ id: 'upgrade_merge_bonus_35', title: '합병 보너스 제어', description: '합병 보너스 레벨 35 달성', icon: '🧪', category: 'upgrade_mastery', tier: 3, metricType: 'merge_bonus_level', target: 35, reward: 260_000 }),
    createMetricAchievement({ id: 'upgrade_merge_bonus_45', title: '합병 보너스 최적화', description: '합병 보너스 레벨 45 달성', icon: '🧪', category: 'upgrade_mastery', tier: 3, metricType: 'merge_bonus_level', target: 45, reward: 420_000 }),
    createMetricAchievement({ id: 'upgrade_merge_bonus_60', title: '합병 보너스 맥스', description: '합병 보너스 레벨 60 달성', icon: '💥', category: 'upgrade_mastery', tier: 4, metricType: 'merge_bonus_level', target: 60, reward: 2_400_000 }),
    createMetricAchievement({ id: 'upgrade_income_mult_15', title: '수익 배율 15', description: '수익 배율 레벨 15 달성', icon: '📡', category: 'upgrade_mastery', tier: 1, metricType: 'income_multiplier_level', target: 15, reward: 32_000 }),
    createMetricAchievement({ id: 'upgrade_income_mult_30', title: '수익 배율 30', description: '수익 배율 레벨 30 달성', icon: '📡', category: 'upgrade_mastery', tier: 2, metricType: 'income_multiplier_level', target: 30, reward: 110_000 }),
    createMetricAchievement({ id: 'upgrade_income_mult_45', title: '수익 배율 45', description: '수익 배율 레벨 45 달성', icon: '🧲', category: 'upgrade_mastery', tier: 3, metricType: 'income_multiplier_level', target: 45, reward: 360_000 }),
    createMetricAchievement({ id: 'upgrade_income_mult_60', title: '수익 배율 60', description: '수익 배율 레벨 60 달성', icon: '🧲', category: 'upgrade_mastery', tier: 3, metricType: 'income_multiplier_level', target: 60, reward: 700_000 }),
    createMetricAchievement({ id: 'upgrade_income_mult_80', title: '수익 배율 맥스', description: '수익 배율 레벨 80 달성', icon: '💫', category: 'upgrade_mastery', tier: 4, metricType: 'income_multiplier_level', target: 80, reward: 3_300_000 }),
    createMetricAchievement({ id: 'upgrade_auto_merge_max', title: '자동 합병 초고속', description: '자동 합병 속도 최대 달성', icon: '🤖', category: 'upgrade_mastery', tier: 4, metricType: 'auto_merge_interval_maxed', target: 1, reward: 1_500_000 }),
    createMetricAchievement({ id: 'upgrade_income_speed_max', title: '수익 주기 최적화', description: '수익 주기 최대 단축 달성', icon: '⏱️', category: 'upgrade_mastery', tier: 4, metricType: 'income_interval_maxed', target: 1, reward: 1_500_000 }),
    createMetricAchievement({ id: 'upgrade_spawn_speed_max', title: '생성 주기 최적화', description: '생성 주기 최대 단축 달성', icon: '🌀', category: 'upgrade_mastery', tier: 4, metricType: 'spawn_cooldown_maxed', target: 1, reward: 1_500_000 }),
    createMetricAchievement({ id: 'upgrade_gem_unlock', title: '보석 시장 개방', description: '보석 시스템 해금', icon: '💠', category: 'upgrade_mastery', tier: 3, metricType: 'gem_system_unlocked', target: 1, reward: 500_000 }),
    createMetricAchievement({ id: 'upgrade_perfect_clock', title: '완벽한 템포', description: '수익 주기 최대 단축 달성', icon: '🕰️', category: 'upgrade_mastery', tier: 5, metricType: 'income_interval_maxed', target: 1, reward: 12_000_000 }),
];

const COMPLETIONIST_ACHIEVEMENTS: Achievement[] = [
    createMetricAchievement({ id: 'complete_mission_3', title: '로드맵 점화', description: '성장 로드맵 3개 보상 수령', icon: '🎯', category: 'completionist', tier: 1, metricType: 'mission_claimed_count', target: 3, reward: 12_000 }),
    createMetricAchievement({ id: 'complete_mission_6', title: '로드맵 입문자', description: '성장 로드맵 6개 보상 수령', icon: '🎯', category: 'completionist', tier: 2, metricType: 'mission_claimed_count', target: 6, reward: 60_000 }),
    createMetricAchievement({ id: 'complete_mission_9', title: '로드맵 가속자', description: '성장 로드맵 9개 보상 수령', icon: '🧭', category: 'completionist', tier: 2, metricType: 'mission_claimed_count', target: 9, reward: 180_000 }),
    createMetricAchievement({ id: 'complete_mission_12', title: '로드맵 항해자', description: '성장 로드맵 12개 보상 수령', icon: '🧭', category: 'completionist', tier: 3, metricType: 'mission_claimed_count', target: 12, reward: 550_000 }),
    createMetricAchievement({ id: 'complete_mission_15', title: '로드맵 관리자', description: '성장 로드맵 15개 보상 수령', icon: '🗺️', category: 'completionist', tier: 4, metricType: 'mission_claimed_count', target: 15, reward: 2_000_000 }),
    createMetricAchievement({ id: 'complete_mission_18', title: '로드맵 완주자', description: '성장 로드맵 18개 보상 수령', icon: '🏁', category: 'completionist', tier: 4, metricType: 'mission_claimed_count', target: 18, reward: 4_500_000 }),
    createMetricAchievement({ id: 'challenge_chain_alpha', title: '시련 체인 I', description: '코인 머지 2,500회 달성', icon: '⚔️', category: 'completionist', tier: 4, metricType: 'total_merge_count', target: 2_500, reward: 3_000_000 }),
    createMetricAchievement({ id: 'challenge_chain_beta', title: '시련 체인 II', description: '서로 다른 코인 16종 발견', icon: '🛡️', category: 'completionist', tier: 4, metricType: 'discovered_level_count', target: 16, reward: 3_600_000 }),
    createMetricAchievement({ id: 'challenge_chain_gamma', title: '시련 체인 III', description: '일일 보상 연속 21일 streak 달성', icon: '🏹', category: 'completionist', tier: 4, metricType: 'daily_reward_streak', target: 21, reward: 4_200_000 }),
    createMetricAchievement({ id: 'completionist_all_upgrades', title: '완벽주의자', description: '모든 업그레이드를 최대까지 달성', icon: '🛡️', category: 'completionist', tier: 5, metricType: 'all_upgrades_maxed', target: 1, reward: 220_000_000 }),
    createMetricAchievement({ id: 'completionist_max_money', title: '끝없는 부', description: '최대 자산 9,999조원 달성', icon: '🎉', category: 'completionist', tier: 5, metricType: 'max_money_reached', target: 1, reward: 0 }),
];

export const ACHIEVEMENTS: Achievement[] = [
    ...DISCOVERY_ACHIEVEMENTS,
    ...MERGE_MASTERY_ACHIEVEMENTS,
    ...WEALTH_PROGRESSION_ACHIEVEMENTS,
    ...COLLECTION_ACHIEVEMENTS,
    ...RETENTION_ACHIEVEMENTS,
    ...UPGRADE_MASTERY_ACHIEVEMENTS,
    ...COMPLETIONIST_ACHIEVEMENTS,
];

export function getNewlyUnlockedAchievementIds(state: GameState): string[] {
    return ACHIEVEMENTS
        .filter((achievement) => !state.unlockedAchievements.includes(achievement.id))
        .filter((achievement) => achievement.condition(state))
        .map((achievement) => achievement.id);
}

export function getAchievementRewardTotal(achievementIds: string[]): number {
    return achievementIds.reduce((sum, id) => {
        const achievement = ACHIEVEMENTS.find((item) => item.id === id);
        return sum + (achievement?.reward ?? 0);
    }, 0);
}

export function getAchievementProgress(state: GameState, achievement: Achievement): { current: number; target: number | null; percent: number } {
    if (!achievement.metricType || achievement.target === undefined) {
        return {
            current: achievement.condition(state) ? 1 : 0,
            target: 1,
            percent: achievement.condition(state) ? 100 : 0,
        };
    }

    const rawCurrent = getAchievementMetricValue(state, achievement.metricType);
    const target = achievement.target;
    const clampedCurrent = Math.min(rawCurrent, target);

    return {
        current: clampedCurrent,
        target,
        percent: target <= 0 ? 100 : Math.min(100, Math.floor((clampedCurrent / target) * 100)),
    };
}

export function getAchievementScore(unlockedAchievementIds: string[]): number {
    const unlockedSet = new Set(unlockedAchievementIds);

    return ACHIEVEMENTS.reduce((sum, achievement) => {
        if (!unlockedSet.has(achievement.id)) return sum;
        return sum + (achievement.points ?? 0);
    }, 0);
}

export function getAchievementRank(score: number): RankDefinition {
    const rank = ACHIEVEMENT_RANKS.slice().reverse().find((item) => score >= item.minScore);
    return rank ?? ACHIEVEMENT_RANKS[0];
}

export function getAchievementRankProgress(unlockedAchievementIds: string[]): {
    score: number;
    currentRank: RankDefinition;
    nextRank: RankDefinition | null;
    progressPercent: number;
} {
    const score = getAchievementScore(unlockedAchievementIds);
    const currentRank = getAchievementRank(score);
    const currentIndex = ACHIEVEMENT_RANKS.findIndex((item) => item.id === currentRank.id);
    const nextRank = ACHIEVEMENT_RANKS[currentIndex + 1] ?? null;

    if (!nextRank) {
        return {
            score,
            currentRank,
            nextRank: null,
            progressPercent: 100,
        };
    }

    const rankSpan = Math.max(1, nextRank.minScore - currentRank.minScore);
    const progressPercent = Math.min(100, Math.floor(((score - currentRank.minScore) / rankSpan) * 100));

    return {
        score,
        currentRank,
        nextRank,
        progressPercent,
    };
}

export function getAchievementCategorySummary(unlockedAchievementIds: string[]): Array<{
    category: AchievementCategory;
    unlockedCount: number;
    totalCount: number;
}> {
    const unlockedSet = new Set(unlockedAchievementIds);

    return ACHIEVEMENT_CATEGORY_ORDER.map((category) => {
        const items = ACHIEVEMENTS.filter((achievement) => achievement.category === category);
        const unlockedCount = items.filter((achievement) => unlockedSet.has(achievement.id)).length;

        return {
            category,
            unlockedCount,
            totalCount: items.length,
        };
    });
}
