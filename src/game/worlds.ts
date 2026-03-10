export type WorldRegionId =
    | 'city_bank'
    | 'gold_exchange'
    | 'gem_market'
    | 'space_vault';

export type WorldRegionTheme = 'cash' | 'gold' | 'gem' | 'cosmic';

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
    },
];

export function getRegionById(regionId: WorldRegionId): WorldRegionDefinition {
    return WORLD_REGIONS.find((region) => region.id === regionId) ?? WORLD_REGIONS[0];
}

export function getNextLockedRegion(unlockedRegionIds: WorldRegionId[]): WorldRegionDefinition | null {
    return WORLD_REGIONS.find((region) => !unlockedRegionIds.includes(region.id)) ?? null;
}
