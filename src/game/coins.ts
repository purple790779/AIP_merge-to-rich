import type { Coin } from '../types/game';
import { COIN_BASE_INCOME, TOTAL_CELLS } from '../types/game';

export function generateCoinId(): string {
    return `coin_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function findRandomEmptyCell(coins: Coin[]): number | null {
    const occupied = new Set(coins.map((coin) => coin.gridIndex));
    const emptyCells: number[] = [];

    for (let index = 0; index < TOTAL_CELLS; index += 1) {
        if (!occupied.has(index)) emptyCells.push(index);
    }

    if (emptyCells.length === 0) return null;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

export function calculateIncomePerTick(coins: Coin[]): number {
    return coins.reduce((sum, coin) => sum + (COIN_BASE_INCOME[coin.level] ?? 0), 0);
}

export function findAutoMergePair(coins: Coin[]): { coinId: string; targetIndex: number } | null {
    const coinsByLevel: Record<number, Coin[]> = {};

    coins.forEach((coin) => {
        if (!coinsByLevel[coin.level]) coinsByLevel[coin.level] = [];
        coinsByLevel[coin.level].push(coin);
    });

    const levels = Object.keys(coinsByLevel)
        .map(Number)
        .sort((left, right) => left - right);

    for (const level of levels) {
        const group = coinsByLevel[level];
        if (group.length >= 2) {
            return { coinId: group[0].id, targetIndex: group[1].gridIndex };
        }
    }

    return null;
}
