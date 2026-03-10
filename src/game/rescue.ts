import type { Coin } from '../types/game';
import { COIN_LEVELS, TOTAL_CELLS } from '../types/game';
import { findAutoMergePair } from './coins';
import { getKstDayKey, getNextKstMidnightMs } from '../utils/dailyReward';

export const BOARD_RESCUE_DAILY_LIMIT = 1;

export interface BoardRescueStatus {
    todayKey: string;
    nextResetAt: number;
    isBoardFull: boolean;
    hasLegalMergePair: boolean;
    isDeadlocked: boolean;
    canUse: boolean;
    usedCount: number;
    remainingUses: number;
    emergencyCash: number;
    rescueTarget: Coin | null;
}

interface BoardRescueStatusParams {
    coins: Coin[];
    gemSystemUnlocked: boolean;
    boardRescueUsedDayKey: string | null;
    boardRescueUsedCount: number;
    spawnLevel: number;
    timeMs?: number;
}

export function getBoardRescueTarget(coins: Coin[]): Coin | null {
    if (coins.length === 0) return null;

    return [...coins].sort((left, right) => {
        if (left.level !== right.level) return left.level - right.level;
        return left.gridIndex - right.gridIndex;
    })[0] ?? null;
}

export function getBoardRescueStatus({
    coins,
    gemSystemUnlocked,
    boardRescueUsedDayKey,
    boardRescueUsedCount,
    spawnLevel,
    timeMs = Date.now(),
}: BoardRescueStatusParams): BoardRescueStatus {
    const todayKey = getKstDayKey(timeMs);
    const usedCount = boardRescueUsedDayKey === todayKey ? boardRescueUsedCount : 0;
    const remainingUses = Math.max(0, BOARD_RESCUE_DAILY_LIMIT - usedCount);
    const isBoardFull = coins.length >= TOTAL_CELLS;
    const hasLegalMergePair = findAutoMergePair(coins, gemSystemUnlocked) !== null;
    const rescueTarget = getBoardRescueTarget(coins);
    const isDeadlocked = isBoardFull && !hasLegalMergePair;
    const emergencyCash = COIN_LEVELS[spawnLevel]?.value ?? COIN_LEVELS[1].value;

    return {
        todayKey,
        nextResetAt: getNextKstMidnightMs(timeMs),
        isBoardFull,
        hasLegalMergePair,
        isDeadlocked,
        canUse: isDeadlocked && remainingUses > 0 && rescueTarget !== null,
        usedCount,
        remainingUses,
        emergencyCash,
        rescueTarget,
    };
}
