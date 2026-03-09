import type { ActiveBoost, RewardSource, TimedRewardPreview } from '../types/game';
import { COIN_LEVELS } from '../types/game';
import { applyIncomeMultipliers } from './economy';

export const RETURN_REWARD_MIN_ELAPSED_MS = 48 * 60 * 60 * 1000;
export const RETURN_REWARD_MID_ELAPSED_MS = 72 * 60 * 60 * 1000;
export const RETURN_REWARD_MAX_ELAPSED_MS = 168 * 60 * 60 * 1000;
export const RETURN_REWARD_HARD_CAP = 5_000_000;
export const RETURN_REWARD_MID_MULTIPLIER = 24;
export const RETURN_REWARD_HIGH_MULTIPLIER = 48;
export const RETURN_REWARD_MAX_MULTIPLIER = 90;

export const OFFLINE_REWARD_MIN_ELAPSED_MS = 15 * 60 * 1000;
export const OFFLINE_REWARD_MAX_ELAPSED_MS = 4 * 60 * 60 * 1000;
export const OFFLINE_REWARD_EFFICIENCY = 0.45;

function isMultiplierReward(source: RewardSource): boolean {
    return source === 'passive_income' || source === 'merge_bonus';
}

function isValidElapsed(lastSeenAt: number, now: number): boolean {
    return lastSeenAt > 0 && now >= lastSeenAt;
}

export function finalizeRewardAmount(
    amount: number,
    source: RewardSource,
    activeBoosts: ActiveBoost[],
    incomeMultiplierLevel: number,
    now: number = Date.now()
): number {
    const normalizedAmount = Math.max(0, Math.floor(amount));
    if (normalizedAmount <= 0) return 0;

    if (isMultiplierReward(source)) {
        return applyIncomeMultipliers(normalizedAmount, activeBoosts, incomeMultiplierLevel, now);
    }

    return normalizedAmount;
}

export function getReturnRewardMultiplier(elapsedMs: number): number | null {
    if (elapsedMs < RETURN_REWARD_MIN_ELAPSED_MS) return null;
    if (elapsedMs < RETURN_REWARD_MID_ELAPSED_MS) return RETURN_REWARD_MID_MULTIPLIER;
    if (elapsedMs < RETURN_REWARD_MAX_ELAPSED_MS) return RETURN_REWARD_HIGH_MULTIPLIER;
    return RETURN_REWARD_MAX_MULTIPLIER;
}

export function getReturnRewardPreview(
    spawnLevel: number,
    lastSeenAt: number,
    now: number = Date.now()
): TimedRewardPreview | null {
    if (!isValidElapsed(lastSeenAt, now)) return null;

    const elapsedMs = now - lastSeenAt;
    const multiplier = getReturnRewardMultiplier(elapsedMs);
    if (!multiplier) return null;

    const baseValue = COIN_LEVELS[spawnLevel]?.value ?? COIN_LEVELS[1].value;
    const cap = Math.min(baseValue * 300, RETURN_REWARD_HARD_CAP);
    const amount = Math.min(baseValue * multiplier, cap);

    return {
        source: 'return_reward',
        amount,
        elapsedMs,
        eligibleAt: lastSeenAt,
        multiplier,
    };
}

export function getOfflineRewardPreview(
    incomePerTick: number,
    incomeInterval: number,
    lastSeenAt: number,
    now: number = Date.now()
): TimedRewardPreview | null {
    if (!isValidElapsed(lastSeenAt, now) || incomePerTick <= 0) return null;

    const elapsedMs = now - lastSeenAt;
    if (elapsedMs < OFFLINE_REWARD_MIN_ELAPSED_MS) return null;

    const cappedElapsedMs = Math.min(elapsedMs, OFFLINE_REWARD_MAX_ELAPSED_MS);
    const amount = Math.floor((incomePerTick * cappedElapsedMs / Math.max(incomeInterval, 1)) * OFFLINE_REWARD_EFFICIENCY);
    if (amount <= 0) return null;

    return {
        source: 'offline_reward',
        amount,
        elapsedMs,
        eligibleAt: lastSeenAt,
        multiplier: OFFLINE_REWARD_EFFICIENCY,
    };
}
