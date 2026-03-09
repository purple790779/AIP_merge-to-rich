export const DAILY_REWARD_BASE = 5000;
export const DAILY_REWARD_STREAK_BONUS = 1000;
export const DAILY_REWARD_BONUS_CAP_DAYS = 7;

const KST_TIME_ZONE = 'Asia/Seoul';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function getKstDayKey(timeMs: number = Date.now()): string {
    return new Intl.DateTimeFormat('sv-SE', {
        timeZone: KST_TIME_ZONE,
    }).format(new Date(timeMs));
}

export function isDailyRewardClaimAvailable(
    lastClaimDayKey: string | null,
    lastClaimAt: number | null = null,
    timeMs: number = Date.now()
): boolean {
    if (lastClaimAt !== null && timeMs < lastClaimAt) {
        return false;
    }
    return lastClaimDayKey !== getKstDayKey(timeMs);
}

export function getNextDailyRewardStreak(
    lastClaimDayKey: string | null,
    currentStreak: number,
    timeMs: number = Date.now()
): number {
    const yesterdayKey = getKstDayKey(timeMs - ONE_DAY_MS);
    if (lastClaimDayKey === yesterdayKey) {
        return currentStreak + 1;
    }
    return 1;
}

export function getDailyRewardAmount(streak: number): number {
    const normalizedStreak = Math.max(1, streak);
    const bonusDays = Math.min(normalizedStreak, DAILY_REWARD_BONUS_CAP_DAYS) - 1;
    return DAILY_REWARD_BASE + bonusDays * DAILY_REWARD_STREAK_BONUS;
}
