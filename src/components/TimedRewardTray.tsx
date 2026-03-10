import { FaGift, FaMoon } from 'react-icons/fa';
import type { TimedRewardPreview } from '../types/game';
import { formatMoney } from '../utils/formatMoney';

interface TimedRewardTrayProps {
    pendingReturnReward: TimedRewardPreview | null;
    pendingOfflineReward: TimedRewardPreview | null;
    onOpenReturnReward: () => void;
    onOpenOfflineReward: () => void;
}

export function TimedRewardTray({
    pendingReturnReward,
    pendingOfflineReward,
    onOpenReturnReward,
    onOpenOfflineReward,
}: TimedRewardTrayProps) {
    const pendingCount = Number(Boolean(pendingReturnReward)) + Number(Boolean(pendingOfflineReward));
    const totalPendingAmount = (pendingReturnReward?.amount ?? 0) + (pendingOfflineReward?.amount ?? 0);

    if (pendingCount === 0) return null;

    return (
        <section className="timed-reward-tray" aria-label="보류 중인 보상">
            <div className={`timed-reward-tray-actions${pendingCount > 1 ? ' has-multiple' : ''}`}>
                <span
                    className="timed-reward-tray-count"
                    title={`보류 보상 합계 +${formatMoney(totalPendingAmount)}`}
                    aria-label={`보류 보상 합계 +${formatMoney(totalPendingAmount)}`}
                >
                    +{formatMoney(totalPendingAmount)}
                </span>

                {pendingReturnReward && (
                    <button
                        type="button"
                        className="timed-reward-pill"
                        onClick={onOpenReturnReward}
                        title={`복귀 보상 +${formatMoney(pendingReturnReward.amount)}`}
                    >
                        <span className="timed-reward-pill-icon return-reward">
                            <FaGift />
                        </span>
                        <span className="timed-reward-pill-content">
                            <span className="timed-reward-pill-value">+{formatMoney(pendingReturnReward.amount)}</span>
                        </span>
                    </button>
                )}

                {pendingOfflineReward && (
                    <button
                        type="button"
                        className="timed-reward-pill"
                        onClick={onOpenOfflineReward}
                        title={`오프라인 보상 +${formatMoney(pendingOfflineReward.amount)}`}
                    >
                        <span className="timed-reward-pill-icon offline-reward">
                            <FaMoon />
                        </span>
                        <span className="timed-reward-pill-content">
                            <span className="timed-reward-pill-value">+{formatMoney(pendingOfflineReward.amount)}</span>
                        </span>
                    </button>
                )}
            </div>
        </section>
    );
}
