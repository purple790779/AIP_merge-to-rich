import { motion } from 'framer-motion';
import { FaGift } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { useGameStore } from '../store/useGameStore';
import {
    getDailyRewardAmount,
    getKstDayKey,
    getNextDailyRewardStreak,
} from '../utils/dailyReward';
import { formatMoney } from '../utils/formatMoney';

interface DailyRewardModalProps {
    onClose: () => void;
}

export function DailyRewardModal({ onClose }: DailyRewardModalProps) {
    const dailyRewardLastClaimDayKey = useGameStore((state) => state.dailyRewardLastClaimDayKey);
    const dailyRewardLastClaimAt = useGameStore((state) => state.dailyRewardLastClaimAt);
    const lastSeenAt = useGameStore((state) => state.lastSeenAt);
    const dailyRewardStreak = useGameStore((state) => state.dailyRewardStreak);
    const dailyRewardTotalClaimed = useGameStore((state) => state.dailyRewardTotalClaimed);
    const dailyRewardLastAmount = useGameStore((state) => state.dailyRewardLastAmount);
    const claimDailyReward = useGameStore((state) => state.claimDailyReward);
    const canClaimDailyReward = useGameStore((state) => state.canClaimDailyReward);

    const canClaim = canClaimDailyReward();
    const clockRollbackBlocked = dailyRewardLastClaimAt !== null && lastSeenAt < dailyRewardLastClaimAt;
    const nextStreak = getNextDailyRewardStreak(dailyRewardLastClaimDayKey, dailyRewardStreak);
    const todayReward = getDailyRewardAmount(nextStreak);
    const tomorrowReward = getDailyRewardAmount(dailyRewardStreak + 1);

    const handleClaim = () => {
        const claimed = claimDailyReward();
        if (claimed && navigator.vibrate) navigator.vibrate(80);
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
                        <h2>일일 보상</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <IoClose />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="daily-reward-card">
                        <div className="daily-reward-row">
                            <span className="daily-reward-label">오늘 상태</span>
                            <span className={`daily-reward-status ${canClaim ? 'ready' : 'claimed'}`}>
                                {canClaim ? '수령 가능' : '오늘 수령 완료'}
                            </span>
                        </div>
                        <div className="daily-reward-row">
                            <span className="daily-reward-label">연속 출석</span>
                            <span className="daily-reward-value">{dailyRewardStreak}일</span>
                        </div>
                        <div className="daily-reward-row">
                            <span className="daily-reward-label">누적 수령</span>
                            <span className="daily-reward-value">{dailyRewardTotalClaimed}회</span>
                        </div>
                        <div className="daily-reward-row highlight">
                            <span className="daily-reward-label">{canClaim ? '오늘 보상' : '내일 예상 보상'}</span>
                            <span className="daily-reward-value reward">+{formatMoney(canClaim ? todayReward : tomorrowReward)}원</span>
                        </div>
                        {!canClaim && dailyRewardLastAmount > 0 && (
                            <div className="daily-reward-last-claim">최근 수령: +{formatMoney(dailyRewardLastAmount)}원</div>
                        )}
                    </div>

                    <div className="daily-reward-note">
                        보상은 매일 한국 시간(KST) 자정에 초기화됩니다.
                        <br />
                        오늘 기준일: {getKstDayKey()}
                        {clockRollbackBlocked && (
                            <>
                                <br />
                                기기 시간이 최근 수령 시점보다 과거로 설정되어 오늘 보상이 잠겨 있습니다.
                            </>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className={`toss-button ${canClaim ? 'gold' : 'disabled'}`} disabled={!canClaim} onClick={handleClaim}>
                        {canClaim ? `지금 수령 (+${formatMoney(todayReward)}원)` : '오늘은 이미 수령했습니다'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
