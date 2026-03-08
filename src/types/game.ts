// 肄붿씤 ????뺤쓽
export interface Coin {
    id: string;
    level: number;
    gridIndex: number;
}

// 癒몄? ?④퀎??(?쒓뎅 ?뷀룓 ?⑥쐞 ??蹂댁꽍 ??鍮꾪듃肄붿씤)
export const COIN_LEVELS: Record<number, { name: string; value: number; emoji: string }> = {
    // ?뷀룓 ?④퀎 (1-12)
    1: { name: '10??, value: 10, emoji: '?첌' },
    2: { name: '50??, value: 50, emoji: '?첌' },
    3: { name: '100??, value: 100, emoji: '?뮸' },
    4: { name: '500??, value: 500, emoji: '?쪍' },
    5: { name: '1,000??, value: 1000, emoji: '?뮫' },
    6: { name: '5,000??, value: 5000, emoji: '?뮪' },
    7: { name: '10,000??, value: 10000, emoji: '?뮭' },
    8: { name: '50,000??, value: 50000, emoji: '?뮮' },
    9: { name: '?섑몴', value: 100000, emoji: '?뱞' },
    10: { name: '湲덇눼', value: 500000, emoji: '?쪍' },
    11: { name: '?ㅼ씠??, value: 1000000, emoji: '?뭿' },
    12: { name: '?좎뒪 鍮뚮뵫', value: 10000000, emoji: '?룫' },
    // 蹂댁꽍 ?④퀎 (13-17) - ?낃렇?덉씠?쒕줈 ?닿툑
    13: { name: '猷⑤퉬', value: 50000000, emoji: '?뵶' },
    14: { name: '?ы뙆?댁뼱', value: 100000000, emoji: '?뵷' },
    15: { name: '?먮찓?꾨뱶', value: 500000000, emoji: '?윟' },
    16: { name: '釉붾옓 ?ㅼ씠??, value: 1000000000, emoji: '?? },
    17: { name: '?곗＜??, value: 5000000000, emoji: '?뙆' },
    // 鍮꾪듃肄붿씤 (18) - ?덈뱺
    18: { name: '鍮꾪듃肄붿씤', value: 100000000000, emoji: '?? },
};

// ?덈꺼蹂?珥덈떦 ?섏씡 (PPS: Profit Per Second)
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
    // 蹂댁꽍 ?④퀎
    13: 1000000,
    14: 5000000,
    15: 20000000,
    16: 100000000,
    17: 500000000,
    // 鍮꾪듃肄붿씤
    18: 10000000000,
};

// 洹몃━???곸닔
export const GRID_SIZE = 5;
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

// ?낃렇?덉씠?????
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
    endTime: number; // ??꾩뒪?ы봽
}

// 寃뚯엫 ?곹깭 ???
export interface GameState {
    coins: Coin[];
    totalMoney: number;
    pps: number; // Profit Per Second (留?interval留덈떎 吏湲?
    spawnLevel: number; // ?앹꽦?섎뒗 肄붿씤??湲곕낯 ?덈꺼
    spawnCooldown: number; // ?앹꽦 荑⑤떎??(ms)
    incomeInterval: number; // ?섏씡 吏湲?媛꾧꺽 (ms), 湲곕낯 10000ms (10珥?
    mergeBonusLevel: number; // 癒몄? 蹂대꼫???덈꺼 (?덈꺼??0.5%)
    gemSystemUnlocked: boolean; // 蹂댁꽍 ?쒖뒪???닿툑 ?щ?
    bitcoinDiscovered: boolean; // 鍮꾪듃肄붿씤 諛쒓껄 ?щ?
    autoSpawnEnabled: boolean;
    lastMergedId: string | null; // 留덉?留됱쑝濡?癒몄???肄붿씤 ID (?좊땲硫붿씠?섏슜)
    activeBoosts: ActiveBoost[]; // ?쒖꽦?붾맂 遺?ㅽ듃 紐⑸줉
    // ?낆쟻 ?쒖뒪??
    unlockedAchievements: string[]; // ?닿툑???낆쟻 ID 紐⑸줉
    totalMergeCount: number; // 珥??⑹꽦 ?잛닔
    totalEarnedMoney: number; // 珥??띾뱷 湲덉븸 (?꾩쟻)
    discoveredLevels: number[]; // 泥?諛쒓껄??肄붿씤 ?덈꺼 紐⑸줉
    // ?좉퇋 ?낃렇?덉씠??
    incomeMultiplierLevel: number; // ?섏씡 諛곗쑉 ?덈꺼 (1.0 + level * 0.1)
    autoMergeInterval: number; // ?먮룞 蹂묓빀 媛꾧꺽 (ms), 湲곕낯 5000ms
}

// ?낆쟻 ????뺤쓽
export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: (state: GameState) => boolean;
    reward?: number; // 蹂댁긽 湲덉븸 (?듭뀡)
}

// ?낆쟻 紐⑸줉
export const ACHIEVEMENTS: Achievement[] = [
    // ?⑹꽦 愿??
    { id: 'first_merge', title: '泥??⑹꽦!', description: '泥섏쓬?쇰줈 肄붿씤???⑹꽦?섏꽭??, icon: '?럦', condition: (s) => s.totalMergeCount >= 1, reward: 100 },
    { id: 'merge_10', title: '?⑹꽦 珥덈낫', description: '肄붿씤??10踰??⑹꽦?섏꽭??, icon: '?뵕', condition: (s) => s.totalMergeCount >= 10, reward: 500 },
    { id: 'merge_50', title: '?⑹꽦 以묒닔', description: '肄붿씤??50踰??⑹꽦?섏꽭??, icon: '?볩툘', condition: (s) => s.totalMergeCount >= 50, reward: 2000 },
    { id: 'merge_100', title: '?⑹꽦 怨좎닔', description: '肄붿씤??100踰??⑹꽦?섏꽭??, icon: '?룆', condition: (s) => s.totalMergeCount >= 100, reward: 5000 },
    { id: 'merge_500', title: '?⑹꽦 留덉뒪??, description: '肄붿씤??500踰??⑹꽦?섏꽭??, icon: '?몣', condition: (s) => s.totalMergeCount >= 500, reward: 50000 },

    // ?먯궛 愿??
    { id: 'money_1k', title: '泥?泥쒖썝', description: '珥??먯궛 1,000???ъ꽦', icon: '?뮫', condition: (s) => s.totalMoney >= 1000, reward: 100 },
    { id: 'money_10k', title: '留뚯썝???됰났', description: '珥??먯궛 10,000???ъ꽦', icon: '?뮪', condition: (s) => s.totalMoney >= 10000, reward: 1000 },
    { id: 'money_100k', title: '??쭔?μ옄', description: '珥??먯궛 100,000???ъ꽦', icon: '?뮭', condition: (s) => s.totalMoney >= 100000, reward: 5000 },
    { id: 'money_1m', title: '諛깅쭔?μ옄', description: '珥??먯궛 1,000,000???ъ꽦', icon: '?뭿', condition: (s) => s.totalMoney >= 1000000, reward: 50000 },
    { id: 'money_10m', title: '泥쒕쭔?μ옄', description: '珥??먯궛 10,000,000???ъ꽦', icon: '?룱', condition: (s) => s.totalMoney >= 10000000, reward: 500000 },
    { id: 'money_100m', title: '?듬쭔?μ옄', description: '珥??먯궛 100,000,000???ъ꽦', icon: '?룿', condition: (s) => s.totalMoney >= 100000000, reward: 5000000 },
    { id: 'money_1b', title: '遺?먯쓽 ?꾨떦', description: '珥??먯궛 1,000,000,000???ъ꽦', icon: '?뙚', condition: (s) => s.totalMoney >= 1000000000, reward: 50000000 },

    // ?덈꺼 愿??
    { id: 'level_5', title: '5?④퀎 ?ъ꽦', description: '?덈꺼 5 肄붿씤 ?띾뱷', icon: '?뱢', condition: (s) => s.coins.some(c => c.level >= 5), reward: 500 },
    { id: 'level_8', title: '8?④퀎 ?ъ꽦', description: '?덈꺼 8 肄붿씤 ?띾뱷', icon: '?뱤', condition: (s) => s.coins.some(c => c.level >= 8), reward: 5000 },
    { id: 'level_10', title: '湲덇눼 ?띾뱷', description: '湲덇눼(?덈꺼 10) ?ъ꽦', icon: '?쪍', condition: (s) => s.coins.some(c => c.level >= 10), reward: 50000 },
    { id: 'level_12', title: '?좎뒪 鍮뚮뵫 嫄댁꽕', description: '?좎뒪 鍮뚮뵫(?덈꺼 12) ?ъ꽦', icon: '?룫', condition: (s) => s.coins.some(c => c.level >= 12), reward: 1000000 },

    // ?밸퀎 ?낆쟻
    { id: 'gem_unlock', title: '蹂댁꽍 ?щ깷袁?, description: '蹂댁꽍 ?쒖뒪???닿툑', icon: '?뮔', condition: (s) => s.gemSystemUnlocked, reward: 10000000 },
    { id: 'bitcoin', title: '?꾩꽕??鍮꾪듃肄붿씤', description: '鍮꾪듃肄붿씤 諛쒓껄', icon: '??, condition: (s) => s.bitcoinDiscovered, reward: 1000000000 },
    { id: 'full_board', title: '蹂대뱶 ?뺣났??, description: '蹂대뱶瑜?肄붿씤?쇰줈 媛??梨꾩슦湲?, icon: '?렞', condition: (s) => s.coins.length >= 25, reward: 1000 },
    { id: 'spawn_level_5', title: '怨좉툒 ?앹궛??, description: '?쒖옉 ?덈꺼 5 ?ъ꽦', icon: '燧놅툘', condition: (s) => s.spawnLevel >= 5, reward: 10000 },
    { id: 'spawn_level_10', title: '理쒓퀬湲??앹궛??, description: '?쒖옉 ?덈꺼 10 ?ъ꽦', icon: '??', condition: (s) => s.spawnLevel >= 10, reward: 500000 },
    {
        id: 'all_upgrades_max', title: '?룆 ?꾨꼍二쇱쓽??, description: '紐⑤뱺 ?낃렇?덉씠??理쒕? ?ъ꽦', icon: '?룆', condition: (s) =>
            s.spawnLevel >= 11 &&
            s.spawnCooldown <= 200 &&
            s.incomeInterval <= 1000 &&
            s.mergeBonusLevel >= 60 &&
            s.gemSystemUnlocked &&
            s.incomeMultiplierLevel >= 80 &&
            s.autoMergeInterval <= 200,
        reward: 1000000000
    },

    // 理쒖쥌 ?낆쟻 (?붾뵫)
    { id: 'max_money', title: '?룇 ?꾩꽕??遺??, description: '理쒕? ?먯궛 9999議곗썝 ?ъ꽦! 寃뚯엫 ?대━??', icon: '?룇', condition: (s) => s.totalMoney >= 9999 * 1000000000000, reward: 0 },
];

// 理쒕? ?먯궛 媛?(9999議?
export const MAX_MONEY = 9999 * 1000000000000;
