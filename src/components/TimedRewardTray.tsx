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
            <div className="timed-reward-tray-header">
                <div>
                    <p className="timed-reward-tray-eyebrow">보류 중인 보상</p>
                    <h2 className="timed-reward-tray-title">나중에 받기로 닫은 보상을 여기서 다시 열 수 있습니다.</h2>
                </div>
                <span className="timed-reward-tray-count">{pendingCount}개</span>
            </div>

            <div className="timed-reward-tray-actions">
                {pendingReturnReward && (
                    <button className="timed-reward-pill" onClick={onOpenReturnReward}>
                        <span className="timed-reward-pill-icon return-reward">
                            <FaGift />
                        </span>
                        <span className="timed-reward-pill-content">
                            <span className="timed-reward-pill-title">복귀 보상 받기</span>
                            <span className="timed-reward-pill-value">+{formatMoney(pendingReturnReward.amount)}원</span>
                        </span>
                    </button>
                )}

                {pendingOfflineReward && (
                    <button className="timed-reward-pill" onClick={onOpenOfflineReward}>
                        <span className="timed-reward-pill-icon offline-reward">
                            <FaMoon />
                        </span>
                        <span className="timed-reward-pill-content">
                            <span className="timed-reward-pill-title">오프라인 보상 정산</span>
                            <span className="timed-reward-pill-value">+{formatMoney(pendingOfflineReward.amount)}원</span>
                        </span>
                    </button>
                )}
            </div>
        </section>
    );
}
