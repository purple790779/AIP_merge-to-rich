import type { ActiveBoost } from '../types/game';

export const ECONOMY_LIMITS = {
    maxSpawnLevel: 11,
    minSpawnCooldown: 200,
    minIncomeInterval: 1000,
    maxMergeBonusLevel: 60,
    gemUnlockCost: 1_000_000_000,
    maxIncomeMultiplierLevel: 80,
    minAutoMergeInterval: 200,
    spawnCooldownStep: 500,
    incomeIntervalStep: 250,
    autoMergeIntervalStep: 200,
    mergeBonusChance: 0.2,
    mergeBonusPercentPerLevel: 0.8,
    incomeMultiplierStep: 0.1,
    missionRewardSmallAmountCap: 250_000,
    missionRewardMediumAmountCap: 5_000_000,
    missionRewardSmallMultiplier: 0.72,
    missionRewardMediumMultiplier: 0.65,
    missionRewardLargeMultiplier: 0.58,
    achievementRewardCashMultiplier: 0.5,
} as const;

export function getSpawnLevelUpgradeCost(level: number): number {
    return 5000 * Math.pow(level, 3.5);
}

export function getSpawnSpeedUpgradeLevel(cooldown: number): number {
    return Math.floor((5000 - cooldown) / ECONOMY_LIMITS.spawnCooldownStep) + 1;
}

export function getSpawnSpeedUpgradeCost(cooldown: number): number {
    return Math.floor(2500 * Math.pow(getSpawnSpeedUpgradeLevel(cooldown), 2.45));
}

export function getIncomeSpeedUpgradeLevel(interval: number): number {
    return Math.floor((10000 - interval) / ECONOMY_LIMITS.incomeIntervalStep) + 1;
}

export function getIncomeSpeedUpgradeCost(interval: number): number {
    return Math.floor(7000 * Math.pow(getIncomeSpeedUpgradeLevel(interval), 2.45));
}

export function getMergeBonusPercent(level: number): number {
    return level * ECONOMY_LIMITS.mergeBonusPercentPerLevel;
}

export function getMergeBonusAveragePercent(level: number): number {
    return getMergeBonusPercent(level) * ECONOMY_LIMITS.mergeBonusChance;
}

export function getMergeBonusUpgradeCost(level: number): number {
    return Math.floor(1200 * Math.pow(level + 1, 2.2));
}

export function getIncomeMultiplier(level: number): number {
    return 1 + level * ECONOMY_LIMITS.incomeMultiplierStep;
}

export function getIncomeMultiplierUpgradeCost(level: number): number {
    return Math.floor(15000 * Math.pow(level + 1, 2.8));
}

export function getAutoMergeUpgradeLevel(interval: number): number {
    return Math.floor((5000 - interval) / ECONOMY_LIMITS.autoMergeIntervalStep) + 1;
}

export function getAutoMergeUpgradeCost(interval: number): number {
    return Math.floor(15000 * Math.pow(getAutoMergeUpgradeLevel(interval), 2.5));
}

function getNextStepGainPercent(currentMs: number, minMs: number, stepMs: number): number {
    const nextMs = Math.max(minMs, currentMs - stepMs);
    if (nextMs >= currentMs) return 0;
    return Number((((currentMs / nextMs) - 1) * 100).toFixed(1));
}

function roundProgressionReward(amount: number): number {
    if (amount < 10_000) return Math.max(100, Math.round(amount / 100) * 100);
    if (amount < 1_000_000) return Math.round(amount / 1_000) * 1_000;
    return Math.round(amount / 10_000) * 10_000;
}

export function getMissionRewardCashMultiplier(amount: number): number {
    if (amount <= ECONOMY_LIMITS.missionRewardSmallAmountCap) {
        return ECONOMY_LIMITS.missionRewardSmallMultiplier;
    }

    if (amount <= ECONOMY_LIMITS.missionRewardMediumAmountCap) {
        return ECONOMY_LIMITS.missionRewardMediumMultiplier;
    }

    return ECONOMY_LIMITS.missionRewardLargeMultiplier;
}

export function getNextSpawnSpeedGainPercent(cooldown: number): number {
    return getNextStepGainPercent(cooldown, ECONOMY_LIMITS.minSpawnCooldown, ECONOMY_LIMITS.spawnCooldownStep);
}

export function getNextIncomeSpeedGainPercent(interval: number): number {
    return getNextStepGainPercent(interval, ECONOMY_LIMITS.minIncomeInterval, ECONOMY_LIMITS.incomeIntervalStep);
}

export function getNextAutoMergeSpeedGainPercent(interval: number): number {
    return getNextStepGainPercent(interval, ECONOMY_LIMITS.minAutoMergeInterval, ECONOMY_LIMITS.autoMergeIntervalStep);
}

export function getNextMergeBonusAveragePercent(level: number): number {
    return getMergeBonusAveragePercent(Math.min(level + 1, ECONOMY_LIMITS.maxMergeBonusLevel));
}

export function getMergeBonusAverageStepPercent(level: number): number {
    return Number((getNextMergeBonusAveragePercent(level) - getMergeBonusAveragePercent(level)).toFixed(1));
}

export function scaleMissionReward(amount: number): number {
    return roundProgressionReward(amount * getMissionRewardCashMultiplier(amount));
}

export function scaleAchievementReward(amount: number): number {
    return roundProgressionReward(amount * ECONOMY_LIMITS.achievementRewardCashMultiplier);
}

export function getBoostMultiplier(activeBoosts: ActiveBoost[], now: number = Date.now()): number {
    return activeBoosts.some(boost => boost.type === 'DOUBLE_INCOME' && boost.endTime > now) ? 2 : 1;
}

export function applyIncomeMultipliers(
    amount: number,
    activeBoosts: ActiveBoost[],
    incomeMultiplierLevel: number,
    now: number = Date.now()
): number {
    if (amount <= 0) return 0;
    return Math.floor(amount * getIncomeMultiplier(incomeMultiplierLevel) * getBoostMultiplier(activeBoosts, now));
}
