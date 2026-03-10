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

    const getActionGuidance = () => {
        if (boardFull) return '같은 등급 코인을 먼저 합쳐 공간을 확보하면 생산 루프가 다시 살아납니다.';
        if (!canAfford) return '자동 수익과 보류 보상 정산으로 자산을 채운 뒤 다시 생산을 이어가세요.';
        if (emptyCells <= 2) return '빈 칸이 거의 없습니다. 다음 합병 자리를 미리 정리해 두면 흐름이 부드럽습니다.';
        return `${coinInfo.name} 라인을 밀어 다음 지역 목표 자산을 차근차근 쌓아가세요.`;
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

            <div className={`controls-guidance${boardFull || !canAfford ? ' is-warning' : ''}`}>{getActionGuidance()}</div>

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
