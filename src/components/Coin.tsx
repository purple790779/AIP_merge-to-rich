import { useCallback, useRef } from 'react';
import type { RefObject, CSSProperties } from 'react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { COIN_LEVELS, GRID_SIZE } from '../types/game';
import { useGameStore } from '../store/useGameStore';
import { FaCoins, FaBuilding, FaQuestion } from 'react-icons/fa';
import { GiGoldBar, GiDiamondHard, GiCrystalGrowth, GiCutDiamond, GiMoonOrbit } from 'react-icons/gi';
import { BsCash, BsCashStack } from 'react-icons/bs';

interface CoinProps {
    id: string;
    level: number;
    gridIndex: number;
    boardRef: RefObject<HTMLDivElement | null>;
    onDrag: (x: number, y: number) => void;
    onDragEnd: (coinId: string, info: { point: { x: number; y: number } }) => void;
}

// 레벨별 아이콘
const getLevelIcon = (level: number) => {
    if (level <= 1) return <FaCoins className="text-2xl" />; // 10원
    if (level <= 2) return <FaCoins className="text-2xl" />; // 50원
    if (level <= 4) return <FaCoins className="text-2xl" />; // 100, 500원
    if (level <= 6) return <BsCash className="text-2xl" />;
    if (level <= 8) return <BsCashStack className="text-2xl" />;
    if (level === 9) return <BsCashStack className="text-2xl" />;
    if (level === 10) return <GiGoldBar className="text-2xl" />;
    if (level === 11) return <GiDiamondHard className="text-2xl" />;
    if (level === 12) return <FaBuilding className="text-2xl" />;
    // 보석
    if (level === 13) return <GiCrystalGrowth className="text-2xl" />; // 루비
    if (level === 14) return <GiCrystalGrowth className="text-2xl" />; // 사파이어
    if (level === 15) return <GiCrystalGrowth className="text-2xl" />; // 에메랄드
    if (level === 16) return <GiCutDiamond className="text-2xl" />; // 블랙 다이아
    if (level === 17) return <GiMoonOrbit className="text-2xl" />; // 우주석
    if (level === 18) return <span className="text-2xl font-bold">₿</span>; // 비트코인
    return <FaQuestion className="text-2xl" />;
};

// 레벨별 그라데이션 색상
const getLevelGradient = (level: number): string => {
    const gradients: Record<number, string> = {
        1: 'from-amber-700 to-amber-900', // 10원 (구리색)
        2: 'from-zinc-400 to-zinc-600', // 50원 (은색) - 500원과 구분
        3: 'from-slate-100 to-slate-300', // 100원 (백동색)
        4: 'from-yellow-400 to-amber-500', // 500원 (금색 느낌)
        5: 'from-blue-400 to-blue-600', // 1000원
        6: 'from-rose-400 to-rose-600', // 5000원
        7: 'from-emerald-400 to-emerald-600', // 10000원
        8: 'from-orange-400 to-orange-600', // 50000원
        9: 'from-violet-400 to-violet-600', // 수표
        10: 'from-yellow-300 via-yellow-400 to-amber-500', // 금괴
        11: 'from-cyan-300 via-blue-400 to-indigo-500', // 다이아
        12: 'from-blue-500 via-indigo-500 to-purple-600', // 토스
        // 보석
        13: 'from-red-500 to-red-700', // 루비
        14: 'from-blue-500 to-blue-700', // 사파이어
        15: 'from-green-500 to-green-700', // 에메랄드
        16: 'from-gray-800 to-black', // 블랙 다이아
        17: 'from-indigo-900 via-purple-900 to-pink-900', // 우주석
        18: 'from-yellow-500 via-orange-500 to-yellow-500', // 비트코인
    };
    return gradients[level] || gradients[1];
};

export function Coin({ id, level, gridIndex, boardRef, onDrag, onDragEnd }: CoinProps) {
    const lastMergedId = useGameStore(state => state.lastMergedId);
    const clearLastMergedId = useGameStore(state => state.clearLastMergedId);
    const constraintsRef = useRef<HTMLDivElement>(null);

    const coinInfo = COIN_LEVELS[level] || { name: `Lv.${level}`, emoji: '❓' };
    const isMerged = lastMergedId === id;

    // 그리드 위치 계산
    const row = Math.floor(gridIndex / GRID_SIZE);
    const col = gridIndex % GRID_SIZE;

    // 드래그 핸들러
    const handleDrag = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        onDrag(info.point.x, info.point.y);
    }, [onDrag]);

    const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        onDragEnd(id, { point: info.point });
    }, [id, onDragEnd]);

    return (
        <motion.div
            ref={constraintsRef}
            layoutId={id}
            drag
            dragConstraints={boardRef}
            dragElastic={0.1} // 탄성 약간 증가 (0.05 -> 0.1)
            dragSnapToOrigin
            dragMomentum={false}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            initial={isMerged ? { scale: 0, rotate: -180 } : { scale: 0, opacity: 0 }}
            animate={{
                scale: 1,
                opacity: 1,
                rotate: 0,
                x: 0,
                y: 0,
            }}
            exit={{ scale: 0, opacity: 0 }}
            whileDrag={{
                scale: 1.15,
                zIndex: 100,
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
                type: 'spring',
                stiffness: 300, // 400 -> 300 (덜 뻣뻣하게)
                damping: 25, // 25 유지 (적당한 감쇠)
                mass: 0.8, // 질량을 줄여서 가볍게
                opacity: { duration: 0.2 }
            }}
            onAnimationComplete={() => {
                if (isMerged) clearLastMergedId();
            }}
            className={`
        coin-item
        bg-gradient-to-br ${getLevelGradient(level)}
        ${isMerged ? 'coin-merged' : ''}
        ${level >= 10 ? 'coin-legendary' : ''}
      `}
            style={{
                '--row': row,
                '--col': col,
            } as CSSProperties}
        >
            <div className="coin-content">
                <div className="coin-icon">
                    {getLevelIcon(level)}
                </div>
                <span className="coin-label">
                    {coinInfo.name}
                </span>
            </div>

            {/* 광택 효과 */}
            <div className="coin-shine" />
        </motion.div>
    );
}
