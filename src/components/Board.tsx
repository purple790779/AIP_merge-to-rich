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

    // 특정 좌표가 어떤 셀에 해당하는지 계산 (elementFromPoint 사용으로 정확도 향상)
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

    // 코인 드래그 종료 핸들러
    const handleDragEnd = useCallback((coinId: string, info: { point: { x: number; y: number } }) => {
        setDragOverCell(null);
        const targetIndex = getCellIndexFromPoint(info.point.x, info.point.y);

        if (targetIndex === null) {
            // 보드 밖으로 드래그 - 아무것도 안함 (원래 위치로 자동 복귀)
            return;
        }

        // 현재 코인 찾기
        const currentCoin = coins.find(c => c.id === coinId);
        if (!currentCoin) return;

        // 같은 위치면 무시
        if (currentCoin.gridIndex === targetIndex) return;

        // 머지 시도
        const merged = tryMerge(coinId, targetIndex);

        if (merged) {
            // 머지 성공 시 사운드
            soundManager.playMerge();
        } else {
            // 머지 실패 시 이동 시도
            moveCoin(coinId, targetIndex);
        }
    }, [getCellIndexFromPoint, tryMerge, moveCoin, coins]);

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
