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
    incomeIntervalStep: 100,
    autoMergeIntervalStep: 200,
    mergeBonusChance: 0.1,
    mergeBonusPercentPerLevel: 0.5,
    incomeMultiplierStep: 0.1,
} as const;

export function getSpawnLevelUpgradeCost(level: number): number {
    return 5000 * Math.pow(level, 3.5);
}

export function getSpawnSpeedUpgradeLevel(cooldown: number): number {
    return Math.floor((5000 - cooldown) / ECONOMY_LIMITS.spawnCooldownStep) + 1;
}

export function getSpawnSpeedUpgradeCost(cooldown: number): number {
    return 3000 * Math.pow(getSpawnSpeedUpgradeLevel(cooldown), 2.8);
}

export function getIncomeSpeedUpgradeLevel(interval: number): number {
    return Math.floor((10000 - interval) / ECONOMY_LIMITS.incomeIntervalStep) + 1;
}

export function getIncomeSpeedUpgradeCost(interval: number): number {
    return 5000 * Math.pow(getIncomeSpeedUpgradeLevel(interval), 3.0);
}

export function getMergeBonusPercent(level: number): number {
    return level * ECONOMY_LIMITS.mergeBonusPercentPerLevel;
}

export function getMergeBonusAveragePercent(level: number): number {
    return getMergeBonusPercent(level) * ECONOMY_LIMITS.mergeBonusChance;
}

export function getMergeBonusUpgradeCost(level: number): number {
    return 1000 * Math.pow(level + 1, 2.5);
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
    return Math.floor(25000 * Math.pow(getAutoMergeUpgradeLevel(interval), 3.0));
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
