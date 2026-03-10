import { formatMoney } from '../utils/formatMoney';

export type WorldRegionId =
    | 'city_bank'
    | 'gold_exchange'
    | 'gem_market'
    | 'space_vault';

export type WorldRegionTheme = 'cash' | 'gold' | 'gem' | 'cosmic';

export type WorldRegionGoalMetric =
    | 'total_money'
    | 'total_earned_money'
    | 'total_merge_count'
    | 'spawn_level'
    | 'merge_bonus_level'
    | 'income_multiplier_level'
    | 'highest_discovered_level'
    | 'discovered_level_count'
    | 'gem_system_unlocked'
    | 'bitcoin_discovered';

export type WorldRegionGoalTrackingMode = 'absolute' | 'delta';

export interface WorldRegionBoardProfile {
    hotspotLabel: string;
    hotspotSummary: string;
    hotspotCells: number[];
    mergeHotspotBonusPercent: number;
}

export interface WorldRegionGoalDefinition {
    id: string;
    title: string;
    description: string;
    metric: WorldRegionGoalMetric;
    trackingMode?: WorldRegionGoalTrackingMode;
    target: number;
    reward: number;
}

export interface WorldRegionProgressSnapshot {
    totalMoney: number;
    totalEarnedMoney: number;
    totalMergeCount: number;
    spawnLevel: number;
    mergeBonusLevel: number;
    incomeMultiplierLevel: number;
    discoveredLevels: number[];
    gemSystemUnlocked: boolean;
    bitcoinDiscovered: boolean;
}

export interface WorldRegionGoalStatus extends WorldRegionGoalDefinition {
    currentValue: number;
    progress: number;
    isComplete: boolean;
    isClaimed: boolean;
    progressLabel: string;
}

export interface WorldRegionGoalBaseline {
    totalMoney: number;
    totalEarnedMoney: number;
    totalMergeCount: number;
    spawnLevel: number;
    mergeBonusLevel: number;
    incomeMultiplierLevel: number;
    highestDiscoveredLevel: number;
    discoveredLevelCount: number;
    gemSystemUnlocked: boolean;
    bitcoinDiscovered: boolean;
    capturedAt: number;
}

export type WorldRegionGoalBaselineMap = Partial<Record<WorldRegionId, WorldRegionGoalBaseline>>;

export interface WorldRegionProgressSummary {
    totalGoals: number;
    completedGoals: number;
    claimedGoals: number;
    nextGoal: WorldRegionGoalStatus | null;
}

export interface WorldRegionDefinition {
    id: WorldRegionId;
    order: number;
    name: string;
    shortName: string;
    theme: WorldRegionTheme;
    unlockCost: number;
    unlockSummary: string;
    coreLoop: string;
    tagline: string;
    flavor: string;
    unlockHint: string;
    boardProfile: WorldRegionBoardProfile;
    progressionGoals: WorldRegionGoalDefinition[];
}

export const STARTING_REGION_ID: WorldRegionId = 'city_bank';

export const WORLD_REGIONS: WorldRegionDefinition[] = [
    {
        id: 'city_bank',
        order: 1,
        name: '시티 뱅크',
        shortName: '현금',
        theme: 'cash',
        unlockCost: 0,
        unlockSummary: '기본 시작 지역',
        coreLoop: '동전과 지폐를 합치며 초반 경제를 만든다.',
        tagline: '현금 흐름의 출발점',
        flavor: '작은 동전이 지폐와 자산으로 커지기 시작하는 도심 금융 허브입니다.',
        unlockHint: '생산과 합병 업그레이드를 다져 골드 권역으로 넘어갈 종잣돈을 만드세요.',
        boardProfile: {
            hotspotLabel: '중앙 핫존',
            hotspotSummary: '보드 중앙 교차 구역에서 합병 보너스가 더 크게 적용됩니다.',
            hotspotCells: [7, 11, 12, 13, 17],
            mergeHotspotBonusPercent: 4,
        },
        progressionGoals: [
            {
                id: 'city_bank_merge_desk',
                title: '초기 창구 안정화',
                description: '기본 머지 루프를 돌려 창구 처리량을 안정화합니다.',
                metric: 'total_merge_count',
                target: 20,
                reward: 25_000,
            },
            {
                id: 'city_bank_cashflow',
                title: '현금 흐름 확보',
                description: '누적 수익을 끌어올려 다음 권역을 준비할 운영 자금을 만듭니다.',
                metric: 'total_earned_money',
                target: 1_500_000,
                reward: 60_000,
            },
            {
                id: 'city_bank_spawn_lane',
                title: '입고 라인 업그레이드',
                description: '시작 레벨을 올려 초반 생산 라인의 밀도를 높입니다.',
                metric: 'spawn_level',
                target: 4,
                reward: 120_000,
            },
        ],
    },
    {
        id: 'gold_exchange',
        order: 2,
        name: '골드 익스체인지',
        shortName: '금',
        theme: 'gold',
        unlockCost: 25_000_000,
        unlockSummary: '중반 확장 지역, 현금 루프 다음 단계',
        coreLoop: '고가 자산 라인을 열고 업그레이드 선택 폭을 넓힌다.',
        tagline: '실물 자산으로 확장되는 첫 전환점',
        flavor: '현금 자산을 금고와 시세 흐름으로 바꾸며 중반부 성장 속도를 끌어올리는 거래소입니다.',
        unlockHint: '자동 수익 주기와 머지 보너스를 챙겨 대형 자산 축적 속도를 올리세요.',
        boardProfile: {
            hotspotLabel: '시세 레일',
            hotspotSummary: '중앙 가로 레일에서 거래가 몰리며 합병 효율이 강화됩니다.',
            hotspotCells: [10, 11, 12, 13, 14, 2, 22],
            mergeHotspotBonusPercent: 6,
        },
        progressionGoals: [
            {
                id: 'gold_exchange_capital_buffer',
                title: '거래소 예치금',
                description: '골드 권역에서 굴릴 최소 운용 현금을 확보합니다.',
                metric: 'total_money',
                target: 60_000_000,
                reward: 500_000,
            },
            {
                id: 'gold_exchange_bonus_ops',
                title: '시세 차익 세팅',
                description: '머지 보너스 라인을 강화해 고가 자산 합병 효율을 끌어올립니다.',
                metric: 'merge_bonus_level',
                target: 10,
                reward: 750_000,
            },
            {
                id: 'gold_exchange_gold_bar',
                title: '금괴 라인 진입',
                description: '고가 자산 단계까지 안정적으로 도달합니다.',
                metric: 'highest_discovered_level',
                target: 10,
                reward: 1_250_000,
            },
        ],
    },
    {
        id: 'gem_market',
        order: 3,
        name: '젬 마켓',
        shortName: '보석',
        theme: 'gem',
        unlockCost: 1_000_000_000,
        unlockSummary: '보석 시스템과 연결되는 고가치 지역',
        coreLoop: '기존 해금 시스템을 지역 구조로 흡수할 수 있는 축이다.',
        tagline: '희소 자산 메타가 열리는 고가치 구간',
        flavor: '고밀도 자산과 수집 동기가 겹치며 장기 세션의 보상 감각이 커지는 프리미엄 시장입니다.',
        unlockHint: '상점 성장 루프를 충분히 키워 보석 권역에 필요한 고액 목표를 안정적으로 넘기세요.',
        boardProfile: {
            hotspotLabel: '컷팅 라인',
            hotspotSummary: '다이아 형태의 정제 라인에서 합병 보상이 집중됩니다.',
            hotspotCells: [2, 6, 8, 10, 12, 14, 16, 18, 22],
            mergeHotspotBonusPercent: 8,
        },
        progressionGoals: [
            {
                id: 'gem_market_system_unlock',
                title: '보석 감정소 가동',
                description: '보석 시스템을 열어 희소 자산 운영 라인을 공식적으로 시작합니다.',
                metric: 'gem_system_unlocked',
                target: 1,
                reward: 12_000_000,
            },
            {
                id: 'gem_market_showcase',
                title: '전시 등급 확보',
                description: '사파이어 등급까지 도달해 고급 상품 라인을 확보합니다.',
                metric: 'highest_discovered_level',
                target: 14,
                reward: 25_000_000,
            },
            {
                id: 'gem_market_scaling',
                title: '프리미엄 수익선',
                description: '영구 수익 배율을 끌어올려 장기 세션용 생산성을 확보합니다.',
                metric: 'income_multiplier_level',
                target: 12,
                reward: 30_000_000,
            },
        ],
    },
    {
        id: 'space_vault',
        order: 4,
        name: '스페이스 볼트',
        shortName: '우주',
        theme: 'cosmic',
        unlockCost: 50_000_000_000,
        unlockSummary: '엔드게임 확장 지역',
        coreLoop: '우주 / 디지털 자산 계열의 장기 콘텐츠 종착점이다.',
        tagline: '장기 플레이를 위한 엔드게임 금고',
        flavor: '현금과 실물, 희소 자산을 모두 넘어서 최종 규모의 경제를 체감하게 하는 종착 권역입니다.',
        unlockHint: '자동화와 고레벨 생산 라인을 끝까지 밀어 엔드게임 자산 곡선을 완성하세요.',
        boardProfile: {
            hotspotLabel: '볼트 코어',
            hotspotSummary: '내부 코어 구역이 열리면 최종 합병 효율이 최고조로 올라갑니다.',
            hotspotCells: [6, 7, 8, 11, 12, 13, 16, 17, 18],
            mergeHotspotBonusPercent: 10,
        },
        progressionGoals: [
            {
                id: 'space_vault_terminal_scale',
                title: '우주권 자본 곡선',
                description: '엔드게임 구간에서도 성장 곡선이 꺾이지 않도록 누적 수익을 확보합니다.',
                metric: 'total_earned_money',
                target: 75_000_000_000,
                reward: 400_000_000,
            },
            {
                id: 'space_vault_core_stones',
                title: '코어 광물 확보',
                description: '우주석 단계에 도달해 최종 구간 라인을 안정화합니다.',
                metric: 'highest_discovered_level',
                target: 17,
                reward: 650_000_000,
            },
            {
                id: 'space_vault_bitcoin',
                title: '비트코인 봉인 해제',
                description: '최종 자산 발견으로 월드 종착권역의 운영 목표를 마무리합니다.',
                metric: 'bitcoin_discovered',
                target: 1,
                reward: 1_200_000_000,
            },
        ],
    },
];

export function getRegionById(regionId: WorldRegionId): WorldRegionDefinition {
    return WORLD_REGIONS.find((region) => region.id === regionId) ?? WORLD_REGIONS[0];
}

export function getNextLockedRegion(unlockedRegionIds: WorldRegionId[]): WorldRegionDefinition | null {
    return WORLD_REGIONS.find((region) => !unlockedRegionIds.includes(region.id)) ?? null;
}

export function getRegionGoalById(goalId: string): { region: WorldRegionDefinition; goal: WorldRegionGoalDefinition } | null {
    for (const region of WORLD_REGIONS) {
        const goal = region.progressionGoals.find((item) => item.id === goalId);
        if (goal) {
            return { region, goal };
        }
    }

    return null;
}

export function getRegionBoardProfile(regionId: WorldRegionId): WorldRegionBoardProfile {
    return getRegionById(regionId).boardProfile;
}

export function isRegionHotspotCell(regionId: WorldRegionId, cellIndex: number): boolean {
    return getRegionBoardProfile(regionId).hotspotCells.includes(cellIndex);
}

function getHighestDiscoveredLevel(discoveredLevels: number[]): number {
    return discoveredLevels.length > 0 ? Math.max(...discoveredLevels) : 1;
}

function getRegionGoalTrackingMode(goal: WorldRegionGoalDefinition): WorldRegionGoalTrackingMode {
    if (goal.trackingMode) return goal.trackingMode;
    if (goal.metric === 'gem_system_unlocked' || goal.metric === 'bitcoin_discovered') {
        return 'absolute';
    }

    return 'delta';
}

export function createRegionGoalBaseline(
    snapshot: WorldRegionProgressSnapshot,
    capturedAt: number = Date.now()
): WorldRegionGoalBaseline {
    return {
        totalMoney: snapshot.totalMoney,
        totalEarnedMoney: snapshot.totalEarnedMoney,
        totalMergeCount: snapshot.totalMergeCount,
        spawnLevel: snapshot.spawnLevel,
        mergeBonusLevel: snapshot.mergeBonusLevel,
        incomeMultiplierLevel: snapshot.incomeMultiplierLevel,
        highestDiscoveredLevel: getHighestDiscoveredLevel(snapshot.discoveredLevels),
        discoveredLevelCount: snapshot.discoveredLevels.length,
        gemSystemUnlocked: snapshot.gemSystemUnlocked,
        bitcoinDiscovered: snapshot.bitcoinDiscovered,
        capturedAt,
    };
}

function getRegionGoalRawCurrentValue(metric: WorldRegionGoalMetric, snapshot: WorldRegionProgressSnapshot): number {
    switch (metric) {
        case 'total_money':
            return snapshot.totalMoney;
        case 'total_earned_money':
            return snapshot.totalEarnedMoney;
        case 'total_merge_count':
            return snapshot.totalMergeCount;
        case 'spawn_level':
            return snapshot.spawnLevel;
        case 'merge_bonus_level':
            return snapshot.mergeBonusLevel;
        case 'income_multiplier_level':
            return snapshot.incomeMultiplierLevel;
        case 'highest_discovered_level':
            return getHighestDiscoveredLevel(snapshot.discoveredLevels);
        case 'discovered_level_count':
            return snapshot.discoveredLevels.length;
        case 'gem_system_unlocked':
            return snapshot.gemSystemUnlocked ? 1 : 0;
        case 'bitcoin_discovered':
            return snapshot.bitcoinDiscovered ? 1 : 0;
        default:
            return 0;
    }
}

function getRegionGoalBaselineValue(metric: WorldRegionGoalMetric, baseline?: WorldRegionGoalBaseline): number {
    if (!baseline) return 0;

    switch (metric) {
        case 'total_money':
            return baseline.totalMoney;
        case 'total_earned_money':
            return baseline.totalEarnedMoney;
        case 'total_merge_count':
            return baseline.totalMergeCount;
        case 'spawn_level':
            return baseline.spawnLevel;
        case 'merge_bonus_level':
            return baseline.mergeBonusLevel;
        case 'income_multiplier_level':
            return baseline.incomeMultiplierLevel;
        case 'highest_discovered_level':
            return baseline.highestDiscoveredLevel;
        case 'discovered_level_count':
            return baseline.discoveredLevelCount;
        case 'gem_system_unlocked':
            return baseline.gemSystemUnlocked ? 1 : 0;
        case 'bitcoin_discovered':
            return baseline.bitcoinDiscovered ? 1 : 0;
        default:
            return 0;
    }
}

export function formatRegionGoalProgress(
    metric: WorldRegionGoalMetric,
    currentValue: number,
    target: number,
    trackingMode: WorldRegionGoalTrackingMode = 'absolute'
): string {
    const prefix = trackingMode === 'delta' ? '+' : '';

    switch (metric) {
        case 'total_money':
        case 'total_earned_money':
            return `${prefix}${formatMoney(Math.min(currentValue, target))} / ${prefix}${formatMoney(target)}원`;
        case 'total_merge_count':
            return `${prefix}${Math.min(currentValue, target)} / ${prefix}${target}회`;
        case 'spawn_level':
        case 'merge_bonus_level':
        case 'income_multiplier_level':
        case 'highest_discovered_level':
        case 'discovered_level_count':
            return `${prefix}${Math.min(currentValue, target)} / ${prefix}${target}`;
        case 'gem_system_unlocked':
            return currentValue >= target ? '해금 완료' : '잠금 상태';
        case 'bitcoin_discovered':
            return currentValue >= target ? '발견 완료' : '미발견';
        default:
            return `${Math.min(currentValue, target)} / ${target}`;
    }
}

export function getRegionGoalStatuses(
    regionId: WorldRegionId,
    snapshot: WorldRegionProgressSnapshot,
    claimedGoalIds: string[] = [],
    baseline?: WorldRegionGoalBaseline
): WorldRegionGoalStatus[] {
    const region = getRegionById(regionId);

    return region.progressionGoals.map((goal) => {
        const trackingMode = getRegionGoalTrackingMode(goal);
        const rawCurrentValue = getRegionGoalRawCurrentValue(goal.metric, snapshot);
        const baselineValue = trackingMode === 'delta' ? getRegionGoalBaselineValue(goal.metric, baseline) : 0;
        const currentValue = Math.max(0, rawCurrentValue - baselineValue);
        const normalizedTarget = Math.max(1, goal.target);
        const progress = Math.max(0, Math.min(1, currentValue / normalizedTarget));
        const isComplete = currentValue >= goal.target;
        const isClaimed = claimedGoalIds.includes(goal.id);

        return {
            ...goal,
            currentValue,
            progress,
            isComplete,
            isClaimed,
            progressLabel: formatRegionGoalProgress(goal.metric, currentValue, goal.target, trackingMode),
        };
    });
}

export function getRegionProgressSummary(
    regionId: WorldRegionId,
    snapshot: WorldRegionProgressSnapshot,
    claimedGoalIds: string[] = [],
    baseline?: WorldRegionGoalBaseline
): WorldRegionProgressSummary {
    const goalStatuses = getRegionGoalStatuses(regionId, snapshot, claimedGoalIds, baseline);
    const totalGoals = goalStatuses.length;
    const completedGoals = goalStatuses.filter((goal) => goal.isComplete).length;
    const claimedGoals = goalStatuses.filter((goal) => goal.isClaimed).length;
    const nextGoal = goalStatuses.find((goal) => !goal.isClaimed) ?? null;

    return {
        totalGoals,
        completedGoals,
        claimedGoals,
        nextGoal,
    };
}

export function getRegionGoalRewardTotal(regionId: WorldRegionId): number {
    return getRegionById(regionId).progressionGoals.reduce((total, goal) => total + goal.reward, 0);
}
