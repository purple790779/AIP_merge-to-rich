import { useRef, useCallback, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { Coin } from './Coin';
import { TOTAL_CELLS } from '../types/game';
import { soundManager } from '../utils/soundManager';

export function Board() {
    const boardRef = useRef<HTMLDivElement>(null);
    const [dragOverCell, setDragOverCell] = useState<number | null>(null);

    const coins = useGameStore(state => state.coins);
    const moveCoin = useGameStore(state => state.moveCoin);
    const tryMerge = useGameStore(state => state.tryMerge);

    // 자동 병합 (부스트)
    useEffect(() => {
        const interval = setInterval(() => {
            const state = useGameStore.getState();
            const activeBoosts = state.activeBoosts || [];
            const isAutoMergeActive = activeBoosts.some(b => b.type === 'AUTO_MERGE' && b.endTime > Date.now());

            if (isAutoMergeActive) {
                state.triggerAutoMerge();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // 자동 생산 (부스트)
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        const loop = () => {
            const state = useGameStore.getState();
            const activeBoosts = state.activeBoosts || [];
            const isAutoSpawnActive = activeBoosts.some(b => b.type === 'AUTO_SPAWN' && b.endTime > Date.now());

            if (isAutoSpawnActive) {
                state.spawnCoin();
                // 업그레이드된 쿨타임 적용 (최소 200ms)
                const cooldown = Math.max(200, state.spawnCooldown);
                timeoutId = setTimeout(loop, cooldown);
            } else {
                // 부스트가 꺼져있을 때는 체크 주기만 유지
                timeoutId = setTimeout(loop, 1000);
            }
        };
        loop();
        return () => clearTimeout(timeoutId);
    }, []);

    // 특정 좌표가 어떤 셀에 해당하는지 계산 (중심점 + 주변 포인트 확인)
    const getCellIndexFromPoint = useCallback((x: number, y: number): number | null => {
        // 해당 좌표에 있는 모든 요소를 가져옴
        const elements = document.elementsFromPoint(x, y);

        // board-cell 클래스를 가진 요소 찾기
        const cellElement = elements.find(el => el.classList.contains('board-cell'));

        if (cellElement) {
            const index = cellElement.getAttribute('data-index');
            return index !== null ? parseInt(index, 10) : null;
        }

        return null;
    }, []);

    // 드래그 중 호버 셀 업데이트
    const handleDrag = useCallback((x: number, y: number) => {
        const cellIndex = getCellIndexFromPoint(x, y);
        setDragOverCell(cellIndex);
    }, [getCellIndexFromPoint]);

    // 주변 셀들 중 병합 가능한 코인 찾기 (50% 겹침 허용)
    const findMergeableCoinNearby = useCallback((coinId: string, x: number, y: number): number | null => {
        const currentCoin = coins.find(c => c.id === coinId);
        if (!currentCoin) return null;

        // 중심점과 25px 거리의 4방향 포인트 확인 (코인 크기의 약 50%)
        const offsets = [
            { dx: 0, dy: 0 },      // 중심
            { dx: -25, dy: 0 },    // 왼쪽
            { dx: 25, dy: 0 },     // 오른쪽
            { dx: 0, dy: -25 },    // 위
            { dx: 0, dy: 25 },     // 아래
        ];

        for (const offset of offsets) {
            const checkX = x + offset.dx;
            const checkY = y + offset.dy;
            const cellIndex = getCellIndexFromPoint(checkX, checkY);

            if (cellIndex !== null && cellIndex !== currentCoin.gridIndex) {
                // 해당 셀에 같은 레벨의 코인이 있는지 확인
                const targetCoin = coins.find(c => c.gridIndex === cellIndex && c.id !== coinId);
                if (targetCoin && targetCoin.level === currentCoin.level) {
                    return cellIndex;
                }
            }
        }

        return null;
    }, [coins, getCellIndexFromPoint]);

    // 코인 드래그 종료 핸들러
    const handleDragEnd = useCallback((coinId: string, info: { point: { x: number; y: number } }) => {
        setDragOverCell(null);

        // 현재 코인 찾기
        const currentCoin = coins.find(c => c.id === coinId);
        if (!currentCoin) return;

        // 먼저 주변에서 병합 가능한 코인 찾기 (50% 겹침 허용)
        const mergeableIndex = findMergeableCoinNearby(coinId, info.point.x, info.point.y);

        if (mergeableIndex !== null) {
            const merged = tryMerge(coinId, mergeableIndex);
            if (merged) {
                soundManager.playMerge();
                return;
            }
        }

        // 병합 대상이 없으면 정확한 드롭 위치로 이동 시도
        const targetIndex = getCellIndexFromPoint(info.point.x, info.point.y);

        if (targetIndex === null) {
            // 보드 밖으로 드래그 - 아무것도 안함 (원래 위치로 자동 복귀)
            return;
        }

        // 같은 위치면 무시
        if (currentCoin.gridIndex === targetIndex) return;

        // 해당 위치에 코인이 있으면 머지 시도 (같은 레벨)
        const merged = tryMerge(coinId, targetIndex);

        if (merged) {
            soundManager.playMerge();
        } else {
            // 머지 실패 시 이동 시도
            moveCoin(coinId, targetIndex);
        }
    }, [getCellIndexFromPoint, tryMerge, moveCoin, coins, findMergeableCoinNearby]);

    // 셀에 코인이 있는지 확인
    const getCoinAtCell = (index: number) => {
        return coins.find(c => c.gridIndex === index);
    };

    return (
        <div
            ref={boardRef}
            className="board-container"
        >
            {/* 그리드 백그라운드 */}
            <div className="board-grid">
                {Array.from({ length: TOTAL_CELLS }).map((_, index) => {
                    const isOccupied = coins.some(c => c.gridIndex === index);
                    const isHovered = dragOverCell === index;
                    const coinAtCell = getCoinAtCell(index);
                    const canMerge = isHovered && coinAtCell;

                    return (
                        <div
                            key={index}
                            data-index={index}
                            className={`board-cell ${isOccupied ? 'occupied' : ''} ${isHovered ? 'hovered' : ''} ${canMerge ? 'can-merge' : ''}`}
                        />
                    );
                })}
            </div>

            {/* 코인 레이어 - board-grid와 동일한 영역 */}
            <div className="coin-layer">
                <AnimatePresence mode="popLayout">
                    {coins.map(coin => (
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
