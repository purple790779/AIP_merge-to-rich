export const DAILY_REWARD_BASE = 5000;
export const DAILY_REWARD_STREAK_BONUS = 1000;
export const DAILY_REWARD_BONUS_CAP_DAYS = 7;

const KST_TIME_ZONE = 'Asia/Seoul';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getKstDateParts(timeMs: number): { year: number; month: number; day: number } {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: KST_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const parts = formatter.formatToParts(new Date(timeMs));
    const year = Number(parts.find((part) => part.type === 'year')?.value ?? '1970');
    const month = Number(parts.find((part) => part.type === 'month')?.value ?? '01');
    const day = Number(parts.find((part) => part.type === 'day')?.value ?? '01');

    return { year, month, day };
}

export function getKstDayKey(timeMs: number = Date.now()): string {
    return new Intl.DateTimeFormat('sv-SE', {
        timeZone: KST_TIME_ZONE,
    }).format(new Date(timeMs));
}

export function getKstWeekKey(timeMs: number = Date.now()): string {
    const { year, month, day } = getKstDateParts(timeMs);
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = utcDate.getUTCDay() || 7;

    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayOfWeek);

    const weekYear = utcDate.getUTCFullYear();
    const yearStart = new Date(Date.UTC(weekYear, 0, 1));
    const weekNumber = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / ONE_DAY_MS) + 1) / 7);

    return `${weekYear}-W${String(weekNumber).padStart(2, '0')}`;
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
