// 코인 타입 정의
export interface Coin {
    id: string;
    level: number;
    gridIndex: number;
}

// 머지 단계표 (한국 화폐 단위 → 보석 → 비트코인)
export const COIN_LEVELS: Record<number, { name: string; value: number; emoji: string }> = {
    // 화폐 단계 (1-12)
    1: { name: '10원', value: 10, emoji: '🪙' },
    2: { name: '50원', value: 50, emoji: '🪙' },
    3: { name: '100원', value: 100, emoji: '💿' },
    4: { name: '500원', value: 500, emoji: '🥇' },
    5: { name: '1,000원', value: 1000, emoji: '💵' },
    6: { name: '5,000원', value: 5000, emoji: '💴' },
    7: { name: '10,000원', value: 10000, emoji: '💶' },
    8: { name: '50,000원', value: 50000, emoji: '💷' },
    9: { name: '수표', value: 100000, emoji: '📄' },
    10: { name: '금괴', value: 500000, emoji: '🥇' },
    11: { name: '다이아', value: 1000000, emoji: '💎' },
    12: { name: '토스 빌딩', value: 10000000, emoji: '🏢' },
    // 보석 단계 (13-17) - 업그레이드로 해금
    13: { name: '루비', value: 50000000, emoji: '🔴' },
    14: { name: '사파이어', value: 100000000, emoji: '🔵' },
    15: { name: '에메랄드', value: 500000000, emoji: '🟢' },
    16: { name: '블랙 다이아', value: 1000000000, emoji: '⚫' },
    17: { name: '우주석', value: 5000000000, emoji: '🌌' },
    // 비트코인 (18) - 히든
    18: { name: '비트코인', value: 100000000000, emoji: '₿' },
};

// 레벨별 초당 수익 (PPS: Profit Per Second)
export const COIN_PPS: Record<number, number> = {
    1: 1,
    2: 3,
    3: 8,
    4: 20,
    5: 50,
    6: 150,
    7: 400,
    8: 1000,
    9: 3000,
    10: 10000,
    11: 50000,
    12: 200000,
    // 보석 단계
    13: 1000000,
    14: 5000000,
    15: 20000000,
    16: 100000000,
    17: 500000000,
    // 비트코인
    18: 10000000000,
};

// 그리드 상수
export const GRID_SIZE = 5;
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

// 업그레이드 타입
export interface Upgrade {
    id: string;
    name: string;
    description: string;
    cost: number;
    level: number;
    maxLevel: number;
}

export type BoostType = 'AUTO_MERGE' | 'DOUBLE_INCOME' | 'AUTO_SPAWN';

export interface ActiveBoost {
    type: BoostType;
    endTime: number; // 타임스탬프
}

// 게임 상태 타입
export interface GameState {
    coins: Coin[];
    totalMoney: number;
    pps: number; // Profit Per Second (매 interval마다 지급)
    spawnLevel: number; // 생성되는 코인의 기본 레벨
    spawnCooldown: number; // 생성 쿨다운 (ms)
    incomeInterval: number; // 수익 지급 간격 (ms), 기본 10000ms (10초)
    mergeBonusLevel: number; // 머지 보너스 레벨 (레벨당 1%)
    gemSystemUnlocked: boolean; // 보석 시스템 해금 여부
    bitcoinDiscovered: boolean; // 비트코인 발견 여부
    autoSpawnEnabled: boolean;
    lastMergedId: string | null; // 마지막으로 머지된 코인 ID (애니메이션용)
    activeBoosts: ActiveBoost[]; // 활성화된 부스트 목록
}
