import { motion } from 'framer-motion';
import { FaCoins, FaLifeRing } from 'react-icons/fa';
import { getBoardRescueStatus } from '../game/rescue';
import { useGameStore } from '../store/useGameStore';
import { COIN_LEVELS, TOTAL_CELLS } from '../types/game';
import { soundManager } from '../utils/soundManager';
import { formatMoney } from '../utils/formatMoney';

export function Controls() {
    const spawnCoin = useGameStore((state) => state.spawnCoin);
    const triggerBoardRescue = useGameStore((state) => state.useBoardRescue);
    const spawnLevel = useGameStore((state) => state.spawnLevel);
    const coins = useGameStore((state) => state.coins);
    const totalMoney = useGameStore((state) => state.totalMoney);
    const gemSystemUnlocked = useGameStore((state) => state.gemSystemUnlocked);
    const boardRescueUsedDayKey = useGameStore((state) => state.boardRescueUsedDayKey);
    const boardRescueUsedCount = useGameStore((state) => state.boardRescueUsedCount);

    const boardRescueStatus = getBoardRescueStatus({
        coins,
        gemSystemUnlocked,
        boardRescueUsedDayKey,
        boardRescueUsedCount,
        spawnLevel,
    });

    const coinsLength = coins.length;
    const boardFull = coinsLength >= TOTAL_CELLS;
    const coinInfo = COIN_LEVELS[spawnLevel] ?? { name: `Lv.${spawnLevel}`, emoji: '?', value: 10 };
    const spawnCost = coinInfo.value;
    const canAfford = totalMoney >= spawnCost;
    const rescueTargetInfo = boardRescueStatus.rescueTarget
        ? COIN_LEVELS[boardRescueStatus.rescueTarget.level] ?? {
            name: `Lv.${boardRescueStatus.rescueTarget.level}`,
            emoji: '?',
            value: 0,
        }
        : null;
    const rescueResetLabel = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(new Date(boardRescueStatus.nextResetAt));

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

    const handleBoardRescue = () => {
        const success = triggerBoardRescue();
        if (success) {
            soundManager.playSpawn();
            if (navigator.vibrate) navigator.vibrate(45);
            return;
        }

        soundManager.playError();
        if (navigator.vibrate) navigator.vibrate(100);
    };

    const getButtonTitle = () => {
        if (boardFull) return '보드가 가득 찼습니다';
        if (!canAfford) return '생산 비용이 부족합니다';
        return `${coinInfo.name} 생산하기`;
    };

    const getButtonDetail = () => {
        if (boardFull) return '같은 레벨을 합쳐 빈칸을 만드세요';
        if (!canAfford) return `${formatMoney(spawnCost)}이 필요합니다`;
        return `즉시 비용 -${formatMoney(spawnCost)}`;
    };

    return (
        <div className="controls-container">
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

            {boardRescueStatus.isDeadlocked && (
                <div className={`controls-rescue-card${boardRescueStatus.canUse ? ' is-ready' : ' is-locked'}`}>
                    <div className="controls-rescue-copy">
                        <span className="controls-rescue-eyebrow">
                            <FaLifeRing /> 긴급 정리
                        </span>
                        <strong>하루 1회 막힌 보드를 다시 정리할 수 있습니다.</strong>
                        <p>가장 낮은 레벨 코인 1개 제거 +{formatMoney(boardRescueStatus.emergencyCash)} 지급</p>
                        <span className="controls-rescue-meta">긴급 정리 지원금은 누적 수익에 포함되지 않습니다.</span>
                        {rescueTargetInfo && (
                            <span className="controls-rescue-meta">
                                정리 대상 {rescueTargetInfo.emoji} {rescueTargetInfo.name}
                            </span>
                        )}
                        <span className="controls-rescue-meta">
                            {boardRescueStatus.canUse
                                ? '지금 바로 빈칸 1개를 복구할 수 있습니다.'
                                : `오늘 사용 완료 · 다음 초기화 ${rescueResetLabel} KST`}
                        </span>
                    </div>

                    <button
                        type="button"
                        className="controls-rescue-button"
                        disabled={!boardRescueStatus.canUse}
                        onClick={handleBoardRescue}
                    >
                        {boardRescueStatus.canUse ? '정리하기' : '사용 완료'}
                    </button>
                </div>
            )}
        </div>
    );
}
