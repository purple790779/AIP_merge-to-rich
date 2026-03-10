import { motion } from 'framer-motion';
import { FaBook, FaCoins, FaShoppingBag } from 'react-icons/fa';
import { useGameStore } from '../store/useGameStore';
import { COIN_LEVELS, TOTAL_CELLS } from '../types/game';
import { soundManager } from '../utils/soundManager';
import { formatMoney } from '../utils/formatMoney';

interface ControlsProps {
    onOpenStore: () => void;
    onOpenCollection: () => void;
}

export function Controls({ onOpenStore, onOpenCollection }: ControlsProps) {
    const spawnCoin = useGameStore((state) => state.spawnCoin);
    const spawnLevel = useGameStore((state) => state.spawnLevel);
    const coinsLength = useGameStore((state) => state.coins.length);
    const totalMoney = useGameStore((state) => state.totalMoney);

    const boardFull = coinsLength >= TOTAL_CELLS;
    const emptyCells = Math.max(0, TOTAL_CELLS - coinsLength);
    const coinInfo = COIN_LEVELS[spawnLevel] ?? { name: `Lv.${spawnLevel}`, emoji: '🪙', value: 10 };
    const spawnCost = coinInfo.value;
    const canAfford = totalMoney >= spawnCost;

    const handleSpawn = () => {
        const success = spawnCoin();
        if (success) {
            soundManager.playSpawn();
            if (navigator.vibrate) navigator.vibrate(30);
            return;
        }

        soundManager.playError();
        if (navigator.vibrate) navigator.vibrate(100);
    };

    const getButtonTitle = () => {
        if (boardFull) return '보드가 가득 찼어요';
        if (!canAfford) return '자산이 부족해요';
        return `${coinInfo.name} 생산하기`;
    };

    const getButtonDetail = () => {
        if (boardFull) return '코인을 합쳐 빈 칸을 먼저 만들어 주세요';
        if (!canAfford) return `${formatMoney(spawnCost)}원이 필요합니다`;
        return `즉시 비용 -${formatMoney(spawnCost)}원`;
    };

    return (
        <div className="controls-container">
            <div className="controls-meta">
                <span className="controls-meta-pill">
                    {coinInfo.emoji} {coinInfo.name} 생산
                </span>
                <span className="controls-meta-pill">빈 칸 {emptyCells}/{TOTAL_CELLS}</span>
            </div>

            <motion.button
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
                onClick={handleSpawn}
                disabled={boardFull || !canAfford}
                className="spawn-button"
            >
                <span className="spawn-button-icon-wrap">
                    <FaCoins className="spawn-button-icon" />
                </span>
                <span className="spawn-button-copy">
                    <span className="spawn-button-title">{getButtonTitle()}</span>
                    <span className="spawn-button-subtitle">{getButtonDetail()}</span>
                </span>
            </motion.button>

            <div className="menu-buttons">
                <motion.button whileTap={{ scale: 0.98 }} onClick={onOpenStore} className="menu-button menu-button-store">
                    <span className="menu-icon store">
                        <FaShoppingBag />
                    </span>
                    <span className="menu-button-copy">
                        <span className="menu-button-title">상점</span>
                        <span className="menu-button-meta">성장 업그레이드</span>
                    </span>
                </motion.button>
                <motion.button whileTap={{ scale: 0.98 }} onClick={onOpenCollection} className="menu-button menu-button-collection">
                    <span className="menu-icon collection">
                        <FaBook />
                    </span>
                    <span className="menu-button-copy">
                        <span className="menu-button-title">도감</span>
                        <span className="menu-button-meta">발견 기록 확인</span>
                    </span>
                </motion.button>
            </div>
        </div>
    );
}
