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
    },
];

export function getRegionById(regionId: WorldRegionId): WorldRegionDefinition {
    return WORLD_REGIONS.find((region) => region.id === regionId) ?? WORLD_REGIONS[0];
}

export function getNextLockedRegion(unlockedRegionIds: WorldRegionId[]): WorldRegionDefinition | null {
    return WORLD_REGIONS.find((region) => !unlockedRegionIds.includes(region.id)) ?? null;
}
