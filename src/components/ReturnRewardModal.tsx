import { motion } from 'framer-motion';
import { FaGift } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import {
    RETURN_REWARD_HARD_CAP,
    RETURN_REWARD_HIGH_MULTIPLIER,
    RETURN_REWARD_MAX_MULTIPLIER,
    RETURN_REWARD_MID_MULTIPLIER,
} from '../game/rewards';
import { useGameStore } from '../store/useGameStore';
import { formatMoney } from '../utils/formatMoney';

interface ReturnRewardModalProps {
    onClose: () => void;
    onDismiss: () => void;
}

function formatElapsed(elapsedMs: number): string {
    const totalHours = Math.floor(elapsedMs / (60 * 60 * 1000));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    if (days > 0) return `${days}일 ${hours}시간`;
    return `${totalHours}시간`;
}

export function ReturnRewardModal({ onClose, onDismiss }: ReturnRewardModalProps) {
    const pendingReward = useGameStore((state) => state.pendingReturnReward);
    const claimReturnReward = useGameStore((state) => state.claimReturnReward);

    if (!pendingReward) return null;

    const handleClaim = () => {
        const claimed = claimReturnReward();
        if (claimed && navigator.vibrate) navigator.vibrate([80, 40, 80]);
        onClose();
    };

    const handleDismiss = () => {
        if (!window.confirm('복귀 보상을 버리면 복구할 수 없습니다. 계속하시겠습니까?')) return;
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
                        <div className="modal-icon daily-reward">
                            <FaGift />
                        </div>
                        <h2>복귀 보상</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <IoClose />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="daily-reward-card timed-reward-card">
                        <div className="daily-reward-row">
                            <span className="daily-reward-label">비운 시간</span>
                            <span className="daily-reward-value">{formatElapsed(pendingReward.elapsedMs)}</span>
                        </div>
                        <div className="daily-reward-row">
                            <span className="daily-reward-label">적용 배수</span>
                            <span className="daily-reward-value">x{pendingReward.multiplier}</span>
                        </div>
                        <div className="daily-reward-row highlight">
                            <span className="daily-reward-label">지금 받을 수 있는 보상</span>
                            <span className="daily-reward-value reward">+{formatMoney(pendingReward.amount)}원</span>
                        </div>
                    </div>

                    <div className="daily-reward-note">
                        48시간 이상 미접속 시 지급됩니다. 48~72시간은 x{RETURN_REWARD_MID_MULTIPLIER}, 72~168시간은 x{RETURN_REWARD_HIGH_MULTIPLIER},
                        168시간 이상은 x{RETURN_REWARD_MAX_MULTIPLIER}이며 최대 {formatMoney(RETURN_REWARD_HARD_CAP)}원까지 받을 수 있습니다.
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
                        보상 받기
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
