import { motion } from 'framer-motion';
import { FaMoon } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import {
    OFFLINE_REWARD_EFFICIENCY,
    OFFLINE_REWARD_MAX_ELAPSED_MS,
    OFFLINE_REWARD_MIN_ELAPSED_MS,
} from '../game/rewards';
import { useGameStore } from '../store/useGameStore';
import { formatMoney } from '../utils/formatMoney';

interface OfflineRewardModalProps {
    onClose: () => void;
    onDismiss: () => void;
}

function formatElapsed(elapsedMs: number): string {
    const totalMinutes = Math.floor(elapsedMs / (60 * 1000));
    if (totalMinutes >= 60) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}시간 ${minutes}분`;
    }

    return `${totalMinutes}분`;
}

export function OfflineRewardModal({ onClose, onDismiss }: OfflineRewardModalProps) {
    const pendingReward = useGameStore((state) => state.pendingOfflineReward);
    const claimOfflineReward = useGameStore((state) => state.claimOfflineReward);

    if (!pendingReward) return null;

    const handleClaim = () => {
        const claimed = claimOfflineReward();
        if (claimed && navigator.vibrate) navigator.vibrate(60);
        onClose();
    };

    const handleDismiss = () => {
        if (!window.confirm('오프라인 보상을 버리면 복구할 수 없습니다. 계속하시겠습니까?')) return;
        onDismiss();
    };

    return (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div
                className="modal-container toss-modal"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-header">
                    <div className="modal-title-row">
                        <div className="modal-icon offline-reward">
                            <FaMoon />
                        </div>
                        <h2>오프라인 보상</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <IoClose />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="daily-reward-card timed-reward-card">
                        <div className="daily-reward-row">
                            <span className="daily-reward-label">오프라인 시간</span>
                            <span className="daily-reward-value">{formatElapsed(pendingReward.elapsedMs)}</span>
                        </div>
                        <div className="daily-reward-row">
                            <span className="daily-reward-label">정산 효율</span>
                            <span className="daily-reward-value">{Math.round(pendingReward.multiplier * 100)}%</span>
                        </div>
                        <div className="daily-reward-row highlight">
                            <span className="daily-reward-label">정산 금액</span>
                            <span className="daily-reward-value reward">+{formatMoney(pendingReward.amount)}원</span>
                        </div>
                    </div>

                    <div className="daily-reward-note">
                        {Math.floor(OFFLINE_REWARD_MIN_ELAPSED_MS / (60 * 1000))}분 이상 비우면 최근 접속 공백만 정산합니다.
                        효율은 {Math.round(OFFLINE_REWARD_EFFICIENCY * 100)}%, 최대 {Math.floor(OFFLINE_REWARD_MAX_ELAPSED_MS / (60 * 60 * 1000))}시간까지만 반영됩니다.
                    </div>
                </div>

                <div className="modal-footer reward-footer reward-footer-triple">
                    <button className="toss-button secondary" onClick={onClose}>
                        나중에 받기
                    </button>
                    <button className="toss-button danger" onClick={handleDismiss}>
                        버리기
                    </button>
                    <button className="toss-button gold" onClick={handleClaim}>
                        지금 정산하기
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
