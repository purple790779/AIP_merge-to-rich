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

    if (pendingCount === 0) return null;

    return (
        <section className="timed-reward-tray" aria-label="보류 중인 보상">
            <div className="timed-reward-tray-summary">
                <div className="timed-reward-tray-summary-copy">
                    <p className="timed-reward-tray-eyebrow">보류 보상</p>
                    <p className="timed-reward-tray-title">{pendingCount}개의 정산이 대기 중입니다.</p>
                </div>
                <span className="timed-reward-tray-count">{pendingCount}개</span>
            </div>

            <div className={`timed-reward-tray-actions${pendingCount > 1 ? ' has-multiple' : ''}`}>
                {pendingReturnReward && (
                    <button type="button" className="timed-reward-pill" onClick={onOpenReturnReward}>
                        <span className="timed-reward-pill-icon return-reward">
                            <FaGift />
                        </span>
                        <span className="timed-reward-pill-content">
                            <span className="timed-reward-pill-title">복귀 보상</span>
                            <span className="timed-reward-pill-value">+{formatMoney(pendingReturnReward.amount)}원</span>
                        </span>
                    </button>
                )}

                {pendingOfflineReward && (
                    <button type="button" className="timed-reward-pill" onClick={onOpenOfflineReward}>
                        <span className="timed-reward-pill-icon offline-reward">
                            <FaMoon />
                        </span>
                        <span className="timed-reward-pill-content">
                            <span className="timed-reward-pill-title">오프라인 정산</span>
                            <span className="timed-reward-pill-value">+{formatMoney(pendingOfflineReward.amount)}원</span>
                        </span>
                    </button>
                )}
            </div>
        </section>
    );
}
