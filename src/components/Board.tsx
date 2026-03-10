import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Coin } from './Coin';
import { TOTAL_CELLS } from '../types/game';
import { soundManager } from '../utils/soundManager';
import { getRegionBoardProfile, getRegionById } from '../game/worlds';
import { useGameStore } from '../store/useGameStore';

export function Board() {
    const boardRef = useRef<HTMLDivElement>(null);
    const [dragOverCell, setDragOverCell] = useState<number | null>(null);

    const coins = useGameStore((state) => state.coins);
    const activeBoosts = useGameStore((state) => state.activeBoosts);
    const autoMergeInterval = useGameStore((state) => state.autoMergeInterval) ?? 5000;
    const spawnCooldown = useGameStore((state) => state.spawnCooldown);
    const currentRegionId = useGameStore((state) => state.currentRegionId);
    const moveCoin = useGameStore((state) => state.moveCoin);
    const tryMerge = useGameStore((state) => state.tryMerge);

    const currentRegion = getRegionById(currentRegionId);
    const boardProfile = getRegionBoardProfile(currentRegionId);

    useEffect(() => {
        let isCancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        const runLoop = () => {
            if (isCancelled) return;

            const state = useGameStore.getState();
            const isAutoMergeActive = state.activeBoosts.some(
                (boost) => boost.type === 'AUTO_MERGE' && boost.endTime > Date.now()
            );

            if (!isAutoMergeActive) return;

            state.triggerAutoMerge();
            timeoutId = window.setTimeout(runLoop, Math.max(200, state.autoMergeInterval ?? 5000));
        };

        const hasActiveAutoMergeBoost = activeBoosts.some(
            (boost) => boost.type === 'AUTO_MERGE' && boost.endTime > Date.now()
        );

        if (hasActiveAutoMergeBoost) runLoop();

        return () => {
            isCancelled = true;
            if (timeoutId) window.clearTimeout(timeoutId);
        };
    }, [activeBoosts, autoMergeInterval]);

    useEffect(() => {
        let isCancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        const runLoop = () => {
            if (isCancelled) return;

            const state = useGameStore.getState();
            const isAutoSpawnActive = state.activeBoosts.some(
                (boost) => boost.type === 'AUTO_SPAWN' && boost.endTime > Date.now()
            );

            if (!isAutoSpawnActive) return;

            state.spawnCoin();
            timeoutId = window.setTimeout(runLoop, Math.max(200, state.spawnCooldown));
        };

        const hasActiveAutoSpawnBoost = activeBoosts.some(
            (boost) => boost.type === 'AUTO_SPAWN' && boost.endTime > Date.now()
        );

        if (hasActiveAutoSpawnBoost) runLoop();

        return () => {
            isCancelled = true;
            if (timeoutId) window.clearTimeout(timeoutId);
        };
    }, [activeBoosts, spawnCooldown]);

    const getCellIndexFromPoint = useCallback((x: number, y: number): number | null => {
        const elements = document.elementsFromPoint(x, y);
        const cellElement = elements.find((element) => element.classList.contains('board-cell'));

        if (!cellElement) return null;

        const index = cellElement.getAttribute('data-index');
        return index !== null ? Number.parseInt(index, 10) : null;
    }, []);

    const handleDrag = useCallback((x: number, y: number) => {
        setDragOverCell(getCellIndexFromPoint(x, y));
    }, [getCellIndexFromPoint]);

    const findMergeableCoinNearby = useCallback((coinId: string, x: number, y: number): number | null => {
        const currentCoin = coins.find((coin) => coin.id === coinId);
        if (!currentCoin) return null;

        const offsets = [
            { dx: 0, dy: 0 },
            { dx: -25, dy: 0 },
            { dx: 25, dy: 0 },
            { dx: 0, dy: -25 },
            { dx: 0, dy: 25 },
        ];

        for (const offset of offsets) {
            const cellIndex = getCellIndexFromPoint(x + offset.dx, y + offset.dy);
            if (cellIndex === null || cellIndex === currentCoin.gridIndex) continue;

            const targetCoin = coins.find((coin) => coin.gridIndex === cellIndex && coin.id !== coinId);
            if (targetCoin && targetCoin.level === currentCoin.level) {
                return cellIndex;
            }
        }

        return null;
    }, [coins, getCellIndexFromPoint]);

    const handleDragEnd = useCallback((coinId: string, info: { point: { x: number; y: number } }) => {
        setDragOverCell(null);

        const currentCoin = coins.find((coin) => coin.id === coinId);
        if (!currentCoin) return;

        const mergeableIndex = findMergeableCoinNearby(coinId, info.point.x, info.point.y);
        if (mergeableIndex !== null) {
            const merged = tryMerge(coinId, mergeableIndex);
            if (merged) {
                soundManager.playMerge();
                return;
            }
        }

        const targetIndex = getCellIndexFromPoint(info.point.x, info.point.y);
        if (targetIndex === null || currentCoin.gridIndex === targetIndex) return;

        const merged = tryMerge(coinId, targetIndex);
        if (merged) {
            soundManager.playMerge();
            return;
        }

        moveCoin(coinId, targetIndex);
    }, [coins, findMergeableCoinNearby, getCellIndexFromPoint, moveCoin, tryMerge]);

    const getCoinAtCell = (index: number) => coins.find((coin) => coin.gridIndex === index);

    return (
        <div ref={boardRef} className={`board-container theme-${currentRegion.theme}`}>
            <div className="board-region-overlay" aria-hidden="true">
                <span className="board-region-overlay-kicker">MERGE HOTSPOT</span>
                <strong>{boardProfile.hotspotLabel}</strong>
                <span>이 구역 합병 +{boardProfile.mergeHotspotBonusPercent}%</span>
            </div>

            <div className="board-grid">
                {Array.from({ length: TOTAL_CELLS }).map((_, index) => {
                    const isOccupied = coins.some((coin) => coin.gridIndex === index);
                    const isHovered = dragOverCell === index;
                    const coinAtCell = getCoinAtCell(index);
                    const canMerge = isHovered && coinAtCell;
                    const isHotspot = boardProfile.hotspotCells.includes(index);

                    return (
                        <div
                            key={index}
                            data-index={index}
                            className={`board-cell ${isOccupied ? 'occupied' : ''} ${isHovered ? 'hovered' : ''} ${canMerge ? 'can-merge' : ''} ${isHotspot ? 'hotspot' : ''}`}
                        />
                    );
                })}
            </div>

            <div className="coin-layer">
                <AnimatePresence mode="popLayout">
                    {coins.map((coin) => (
                        <Coin
                            key={coin.id}
                            id={coin.id}
                            level={coin.level}
                            gridIndex={coin.gridIndex}
                            boardRef={boardRef}
                            onDrag={handleDrag}
                            onDragEnd={handleDragEnd}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
