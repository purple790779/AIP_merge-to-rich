import { useCallback, useRef } from 'react';
import type { CSSProperties, RefObject } from 'react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { BsCash, BsCashStack } from 'react-icons/bs';
import { FaBuilding, FaCoins, FaQuestion } from 'react-icons/fa';
import { GiCrystalGrowth, GiCutDiamond, GiDiamondHard, GiGoldBar, GiMoonOrbit } from 'react-icons/gi';
import { COIN_LEVELS, GRID_SIZE } from '../types/game';
import { useGameStore } from '../store/useGameStore';

interface CoinProps {
    id: string;
    level: number;
    gridIndex: number;
    boardRef: RefObject<HTMLDivElement | null>;
    onDrag: (x: number, y: number) => void;
    onDragEnd: (coinId: string, info: { point: { x: number; y: number } }) => void;
}

const getLevelIcon = (level: number) => {
    if (level <= 4) return <FaCoins className="text-2xl" />;
    if (level <= 6) return <BsCash className="text-2xl" />;
    if (level <= 9) return <BsCashStack className="text-2xl" />;
    if (level === 10) return <GiGoldBar className="text-2xl" />;
    if (level === 11) return <GiDiamondHard className="text-2xl" />;
    if (level === 12) return <FaBuilding className="text-2xl" />;
    if (level === 13) return <GiCrystalGrowth className="text-2xl" />;
    if (level === 14) return <GiCrystalGrowth className="text-2xl" />;
    if (level === 15) return <GiCrystalGrowth className="text-2xl" />;
    if (level === 16) return <GiCutDiamond className="text-2xl" />;
    if (level === 17) return <GiMoonOrbit className="text-2xl" />;
    if (level === 18) return <span className="text-2xl font-bold">₿</span>;
    return <FaQuestion className="text-2xl" />;
};

const getLevelGradient = (level: number): string => {
    const gradients: Record<number, string> = {
        1: 'from-amber-700 to-amber-900',
        2: 'from-zinc-400 to-zinc-600',
        3: 'from-slate-100 to-slate-300',
        4: 'from-yellow-400 to-amber-500',
        5: 'from-blue-400 to-blue-600',
        6: 'from-rose-400 to-rose-600',
        7: 'from-emerald-400 to-emerald-600',
        8: 'from-orange-400 to-orange-600',
        9: 'from-violet-400 to-violet-600',
        10: 'from-yellow-300 via-yellow-400 to-amber-500',
        11: 'from-cyan-300 via-blue-400 to-indigo-500',
        12: 'from-blue-500 via-indigo-500 to-purple-600',
        13: 'from-red-500 to-red-700',
        14: 'from-blue-500 to-blue-700',
        15: 'from-green-500 to-green-700',
        16: 'from-gray-800 to-black',
        17: 'from-indigo-900 via-purple-900 to-pink-900',
        18: 'from-yellow-500 via-orange-500 to-yellow-500',
    };

    return gradients[level] ?? gradients[1];
};

export function Coin({ id, level, gridIndex, boardRef, onDrag, onDragEnd }: CoinProps) {
    const lastMergedId = useGameStore((state) => state.lastMergedId);
    const clearLastMergedId = useGameStore((state) => state.clearLastMergedId);
    const constraintsRef = useRef<HTMLDivElement>(null);

    const coinInfo = COIN_LEVELS[level] ?? { name: `Lv.${level}`, emoji: '?', value: 0 };
    const isMerged = lastMergedId === id;
    const row = Math.floor(gridIndex / GRID_SIZE);
    const col = gridIndex % GRID_SIZE;

    const handleDrag = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        onDrag(info.point.x, info.point.y);
    }, [onDrag]);

    const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        onDragEnd(id, { point: info.point });
    }, [id, onDragEnd]);

    return (
        <motion.div
            ref={constraintsRef}
            layout="position"
            drag
            dragConstraints={boardRef}
            dragElastic={0.03}
            dragSnapToOrigin
            dragMomentum={false}
            dragTransition={{ bounceStiffness: 1100, bounceDamping: 44 }}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            initial={isMerged ? { scale: 0, rotate: -180 } : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            whileDrag={{ scale: 1.08, zIndex: 100, boxShadow: '0 16px 28px rgba(0,0,0,0.34)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 560, damping: 38, mass: 0.42, opacity: { duration: 0.18 } }}
            onAnimationComplete={() => {
                if (isMerged) clearLastMergedId();
            }}
            className={`coin-item bg-gradient-to-br ${getLevelGradient(level)} ${isMerged ? 'coin-merged' : ''} ${level >= 10 ? 'coin-legendary' : ''}`}
            style={{ '--row': row, '--col': col } as CSSProperties}
        >
            <div className="coin-content">
                <div className="coin-icon">{getLevelIcon(level)}</div>
                <span className="coin-label">{coinInfo.name}</span>
            </div>
            <div className="coin-shine" />
        </motion.div>
    );
}
