import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { COIN_LEVELS } from '../types/game';
import { FaCoins, FaShoppingBag, FaBook } from 'react-icons/fa';
import { soundManager } from '../utils/soundManager';

// 억 단위 포맷팅
function formatMoney(amount: number): string {
    const rounded = Math.floor(amount);
    if (rounded >= 100000000) {
        return `${Math.floor(rounded / 100000000).toLocaleString()}억`;
    }
    if (rounded >= 10000) {
        return `${(rounded / 10000).toFixed(1)}만`;
    }
    return rounded.toLocaleString();
}

interface ControlsProps {
    onOpenStore: () => void;
    onOpenCollection: () => void;
}

export function Controls({ onOpenStore, onOpenCollection }: ControlsProps) {
    const spawnCoin = useGameStore(state => state.spawnCoin);
    const spawnLevel = useGameStore(state => state.spawnLevel);
    const isBoardFull = useGameStore(state => state.isBoardFull);
    const totalMoney = useGameStore(state => state.totalMoney);

    const boardFull = isBoardFull();
    const coinInfo = COIN_LEVELS[spawnLevel] || { name: `Lv.${spawnLevel}`, emoji: '🪙', value: 10 };
    const spawnCost = coinInfo.value;
    const canAfford = totalMoney >= spawnCost;

    const handleSpawn = () => {
        const success = spawnCoin();
        if (success) {
            soundManager.playSpawn();
            if (navigator.vibrate) navigator.vibrate(30);
        } else {
            soundManager.playError();
            if (navigator.vibrate) navigator.vibrate(100);
        }
    };

    // 버튼 텍스트 결정
    const getButtonText = () => {
        if (boardFull) return '보드가 가득 찼어요!';
        if (!canAfford) return `자산이 부족해요! (${formatMoney(spawnCost)}원 필요)`;
        return `${coinInfo.name} 생산하기 (-${formatMoney(spawnCost)}원)`;
    };

    return (
        <div className="controls-container">
            {/* 생산 버튼 */}
            <motion.button
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
                onClick={handleSpawn}
                disabled={boardFull || !canAfford}
                className="spawn-button"
            >
                <FaCoins className="spawn-button-icon" />
                <span>{getButtonText()}</span>
            </motion.button>

            {/* 하단 메뉴 버튼들 */}
            <div className="menu-buttons">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenStore}
                    className="menu-button menu-button-store"
                >
                    <span className="menu-icon store">
                        <FaShoppingBag />
                    </span>
                    <span>상점</span>
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenCollection}
                    className="menu-button menu-button-collection"
                >
                    <span className="menu-icon collection">
                        <FaBook />
                    </span>
                    <span>도감</span>
                </motion.button>
            </div>
        </div>
    );
}
