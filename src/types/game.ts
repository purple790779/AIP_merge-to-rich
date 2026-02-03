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
    // 업적 시스템
    unlockedAchievements: string[]; // 해금된 업적 ID 목록
    totalMergeCount: number; // 총 합성 횟수
    totalEarnedMoney: number; // 총 획득 금액 (누적)
    discoveredLevels: number[]; // 첫 발견한 코인 레벨 목록
}

// 업적 타입 정의
export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: (state: GameState) => boolean;
    reward?: number; // 보상 금액 (옵션)
}

// 업적 목록
export const ACHIEVEMENTS: Achievement[] = [
    // 합성 관련
    { id: 'first_merge', title: '첫 합성!', description: '처음으로 코인을 합성하세요', icon: '🎉', condition: (s) => s.totalMergeCount >= 1, reward: 100 },
    { id: 'merge_10', title: '합성 초보', description: '코인을 10번 합성하세요', icon: '🔗', condition: (s) => s.totalMergeCount >= 10, reward: 500 },
    { id: 'merge_50', title: '합성 중수', description: '코인을 50번 합성하세요', icon: '⛓️', condition: (s) => s.totalMergeCount >= 50, reward: 2000 },
    { id: 'merge_100', title: '합성 고수', description: '코인을 100번 합성하세요', icon: '🏅', condition: (s) => s.totalMergeCount >= 100, reward: 5000 },
    { id: 'merge_500', title: '합성 마스터', description: '코인을 500번 합성하세요', icon: '👑', condition: (s) => s.totalMergeCount >= 500, reward: 50000 },

    // 자산 관련
    { id: 'money_1k', title: '첫 천원', description: '총 자산 1,000원 달성', icon: '💵', condition: (s) => s.totalMoney >= 1000, reward: 100 },
    { id: 'money_10k', title: '만원의 행복', description: '총 자산 10,000원 달성', icon: '💴', condition: (s) => s.totalMoney >= 10000, reward: 1000 },
    { id: 'money_100k', title: '십만장자', description: '총 자산 100,000원 달성', icon: '💶', condition: (s) => s.totalMoney >= 100000, reward: 5000 },
    { id: 'money_1m', title: '백만장자', description: '총 자산 1,000,000원 달성', icon: '💎', condition: (s) => s.totalMoney >= 1000000, reward: 50000 },
    { id: 'money_10m', title: '천만장자', description: '총 자산 10,000,000원 달성', icon: '🏦', condition: (s) => s.totalMoney >= 10000000, reward: 500000 },
    { id: 'money_100m', title: '억만장자', description: '총 자산 100,000,000원 달성', icon: '🏰', condition: (s) => s.totalMoney >= 100000000, reward: 5000000 },
    { id: 'money_1b', title: '부자의 전당', description: '총 자산 1,000,000,000원 달성', icon: '🌟', condition: (s) => s.totalMoney >= 1000000000, reward: 50000000 },

    // 레벨 관련
    { id: 'level_5', title: '5단계 달성', description: '레벨 5 코인 획득', icon: '📈', condition: (s) => s.coins.some(c => c.level >= 5), reward: 500 },
    { id: 'level_8', title: '8단계 달성', description: '레벨 8 코인 획득', icon: '📊', condition: (s) => s.coins.some(c => c.level >= 8), reward: 5000 },
    { id: 'level_10', title: '금괴 획득', description: '금괴(레벨 10) 달성', icon: '🥇', condition: (s) => s.coins.some(c => c.level >= 10), reward: 50000 },
    { id: 'level_12', title: '토스 빌딩 건설', description: '토스 빌딩(레벨 12) 달성', icon: '🏢', condition: (s) => s.coins.some(c => c.level >= 12), reward: 1000000 },

    // 특별 업적
    { id: 'gem_unlock', title: '보석 사냥꾼', description: '보석 시스템 해금', icon: '💠', condition: (s) => s.gemSystemUnlocked, reward: 10000000 },
    { id: 'bitcoin', title: '전설의 비트코인', description: '비트코인 발견', icon: '₿', condition: (s) => s.bitcoinDiscovered, reward: 1000000000 },
    { id: 'full_board', title: '보드 정복자', description: '보드를 코인으로 가득 채우기', icon: '🎯', condition: (s) => s.coins.length >= 25, reward: 1000 },
    { id: 'spawn_level_5', title: '고급 생산자', description: '시작 레벨 5 달성', icon: '⬆️', condition: (s) => s.spawnLevel >= 5, reward: 10000 },
    { id: 'spawn_level_10', title: '최고급 생산자', description: '시작 레벨 10 달성', icon: '🚀', condition: (s) => s.spawnLevel >= 10, reward: 500000 },

    // 최종 업적 (엔딩)
    { id: 'max_money', title: '🏆 전설의 부자', description: '최대 자산 9999조원 달성! 게임 클리어!', icon: '🏆', condition: (s) => s.totalMoney >= 9999 * 1000000000000, reward: 0 },
];

// 최대 자산 값 (9999조)
export const MAX_MONEY = 9999 * 1000000000000;
