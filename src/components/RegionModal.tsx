import { motion } from 'framer-motion';
import { FaArrowRight, FaCheckCircle, FaGift, FaLock, FaMapMarkedAlt } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import {
    getNextLockedRegion,
    getRegionBoardProfile,
    getRegionById,
    getRegionGoalRewardTotal,
    getRegionGoalStatuses,
    getRegionProgressSummary,
    WORLD_REGIONS,
} from '../game/worlds';
import { useGameStore } from '../store/useGameStore';
import { formatMoney } from '../utils/formatMoney';

interface RegionModalProps {
    onClose: () => void;
}

export function RegionModal({ onClose }: RegionModalProps) {
    const totalMoney = useGameStore((state) => state.totalMoney);
    const totalEarnedMoney = useGameStore((state) => state.totalEarnedMoney);
    const totalMergeCount = useGameStore((state) => state.totalMergeCount);
    const spawnLevel = useGameStore((state) => state.spawnLevel);
    const mergeBonusLevel = useGameStore((state) => state.mergeBonusLevel);
    const incomeMultiplierLevel = useGameStore((state) => state.incomeMultiplierLevel) ?? 0;
    const discoveredLevels = useGameStore((state) => state.discoveredLevels);
    const gemSystemUnlocked = useGameStore((state) => state.gemSystemUnlocked);
    const bitcoinDiscovered = useGameStore((state) => state.bitcoinDiscovered);
    const unlockedRegionIds = useGameStore((state) => state.unlockedRegionIds);
    const currentRegionId = useGameStore((state) => state.currentRegionId);
    const claimedRegionGoalIds = useGameStore((state) => state.claimedRegionGoalIds);
    const unlockRegion = useGameStore((state) => state.unlockRegion);
    const selectRegion = useGameStore((state) => state.selectRegion);
    const claimRegionGoalReward = useGameStore((state) => state.claimRegionGoalReward);

    const progressSnapshot = {
        totalMoney,
        totalEarnedMoney,
        totalMergeCount,
        spawnLevel,
        mergeBonusLevel,
        incomeMultiplierLevel,
        discoveredLevels,
        gemSystemUnlocked,
        bitcoinDiscovered,
    };

    const currentRegion = getRegionById(currentRegionId);
    const currentBoardProfile = getRegionBoardProfile(currentRegionId);
    const currentRegionSummary = getRegionProgressSummary(currentRegionId, progressSnapshot, claimedRegionGoalIds);
    const nextLockedRegion = getNextLockedRegion(unlockedRegionIds);
    const nextRegionProgress = nextLockedRegion ? Math.min(1, totalMoney / nextLockedRegion.unlockCost) : 1;
    const nextRegionRemaining = nextLockedRegion ? Math.max(0, nextLockedRegion.unlockCost - totalMoney) : 0;

    return (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div
                className="modal-container toss-modal region-modal"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-header">
                    <div className="modal-title-row">
                        <div className="modal-icon region">
                            <FaMapMarkedAlt />
                        </div>
                        <h2>월드 운영</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <IoClose />
                    </button>
                </div>

                <div className="modal-content scrollable region-content">
                    <p className="region-note">
                        권역마다 해금 순서뿐 아니라 <strong>핫존 합병 보너스</strong>와 <strong>운영 목표 보상</strong>이
                        붙습니다. 다음 지역은 장기 목표이고, 현재 지역은 실제 운영 보드를 바꾸는 단계입니다.
                    </p>

                    <section className={`region-hero theme-${currentRegion.theme}`}>
                        <div className="region-hero-copy">
                            <span className="region-summary-label">현재 운영 중인 권역</span>
                            <strong>{currentRegion.name}</strong>
                            <p>{currentRegion.flavor}</p>
                        </div>
                        <div className="region-hero-metrics">
                            <span className="region-hero-chip">개방 {unlockedRegionIds.length}/{WORLD_REGIONS.length}</span>
                            <span className="region-hero-chip">
                                {currentBoardProfile.hotspotLabel} 합병 +{currentBoardProfile.mergeHotspotBonusPercent}%
                            </span>
                            <span className="region-hero-chip">
                                운영 목표 {currentRegionSummary.claimedGoals}/{currentRegionSummary.totalGoals}
                            </span>
                        </div>
                    </section>

                    <div className="region-summary-grid">
                        <div className="region-summary-card">
                            <div>
                                <span className="region-summary-label">다음 해금 목표</span>
                                <strong>{nextLockedRegion ? nextLockedRegion.name : '모든 지역 해금 완료'}</strong>
                                <p className="region-summary-note">
                                    {nextLockedRegion
                                        ? nextRegionProgress >= 1
                                            ? '자산 목표를 달성했습니다. 바로 해금하고 이동할 수 있습니다.'
                                            : `${formatMoney(nextRegionRemaining)}원만 더 모으면 새 권역이 열립니다.`
                                        : '원하는 권역으로 이동하며 운영 목표를 정리하세요.'}
                                </p>
                            </div>
                            <span className="region-summary-value">
                                {nextLockedRegion ? `${Math.round(nextRegionProgress * 100)}%` : '완료'}
                            </span>
                        </div>

                        <div className="region-summary-card secondary">
                            <div>
                                <span className="region-summary-label">현재 권역 운영 진행</span>
                                <strong>
                                    {currentRegionSummary.nextGoal
                                        ? currentRegionSummary.nextGoal.title
                                        : '현재 권역 운영 목표 완료'}
                                </strong>
                                <p className="region-summary-note">
                                    {currentRegionSummary.nextGoal
                                        ? `${currentRegionSummary.nextGoal.progressLabel} · 보상 ${formatMoney(currentRegionSummary.nextGoal.reward)}원`
                                        : `${currentRegion.name}의 운영 보상 ${formatMoney(getRegionGoalRewardTotal(currentRegionId))}원을 모두 확보했습니다.`}
                                </p>
                            </div>
                            <span className="region-summary-value accent">
                                {currentRegionSummary.claimedGoals}/{currentRegionSummary.totalGoals}
                            </span>
                        </div>
                    </div>

                    <div className="region-journey-track" aria-label="지역 진행도">
                        {WORLD_REGIONS.map((region) => {
                            const isUnlocked = unlockedRegionIds.includes(region.id);
                            const isCurrent = currentRegionId === region.id;
                            const isNextUnlock = nextLockedRegion?.id === region.id;
                            const summary = getRegionProgressSummary(region.id, progressSnapshot, claimedRegionGoalIds);

                            return (
                                <div
                                    key={region.id}
                                    className={`region-journey-stop ${
                                        isCurrent ? 'current' : isUnlocked ? 'unlocked' : isNextUnlock ? 'next' : 'locked'
                                    }`}
                                >
                                    <span className="region-journey-order">0{region.order}</span>
                                    <span className="region-journey-name">{region.shortName}</span>
                                    <span className="region-journey-meta">{summary.claimedGoals}/{summary.totalGoals}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="region-list">
                        {WORLD_REGIONS.map((region) => {
                            const boardProfile = getRegionBoardProfile(region.id);
                            const goalStatuses = getRegionGoalStatuses(region.id, progressSnapshot, claimedRegionGoalIds);
                            const progressSummary = getRegionProgressSummary(region.id, progressSnapshot, claimedRegionGoalIds);
                            const isUnlocked = unlockedRegionIds.includes(region.id);
                            const isCurrent = currentRegionId === region.id;
                            const isNextUnlock = nextLockedRegion?.id === region.id;
                            const canUnlock = isNextUnlock && totalMoney >= region.unlockCost;
                            const regionProgress = isNextUnlock && !isUnlocked ? nextRegionProgress : 1;
                            const regionRemaining = isNextUnlock && !isUnlocked ? nextRegionRemaining : 0;

                            const handleAction = () => {
                                if (isCurrent) return;

                                const success = isUnlocked ? selectRegion(region.id) : unlockRegion(region.id);
                                if (success && navigator.vibrate) navigator.vibrate([50, 30, 50]);
                            };

                            const handleClaim = (goalId: string) => {
                                const success = claimRegionGoalReward(goalId);
                                if (success && navigator.vibrate) navigator.vibrate([40, 20, 80]);
                            };

                            return (
                                <article
                                    key={region.id}
                                    className={`region-card ${isCurrent ? 'current' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`}
                                >
                                    <div className="region-card-top">
                                        <div className={`region-order theme-${region.theme}`}>0{region.order}</div>
                                        <div className="region-copy">
                                            <div className="region-title-row">
                                                <strong>{region.name}</strong>
                                                {isCurrent && <span className="region-chip current">현재 지역</span>}
                                                {!isCurrent && isUnlocked && <span className="region-chip unlocked">해금됨</span>}
                                                {isNextUnlock && !isUnlocked && <span className="region-chip next">다음 확장</span>}
                                                {!isUnlocked && !isNextUnlock && <span className="region-chip locked">잠김</span>}
                                            </div>
                                            <p>{region.tagline}</p>
                                        </div>
                                    </div>

                                    <div className="region-highlight-grid two-columns">
                                        <div className="region-loop">
                                            <span>핵심 루프</span>
                                            <strong>{region.coreLoop}</strong>
                                        </div>
                                        <div className="region-loop">
                                            <span>핫존 규칙</span>
                                            <strong>
                                                {boardProfile.hotspotLabel} · 합병 +{boardProfile.mergeHotspotBonusPercent}%
                                            </strong>
                                        </div>
                                        <div className="region-loop full-span">
                                            <span>권역 분위기</span>
                                            <strong>{region.flavor}</strong>
                                        </div>
                                    </div>

                                    <div className="region-unlock-hint emphasis">
                                        <span>보드 지시</span>
                                        <strong>{boardProfile.hotspotSummary}</strong>
                                    </div>

                                    <div className="region-goals-card">
                                        <div className="region-goals-card-top">
                                            <div>
                                                <span className="region-summary-label">운영 목표</span>
                                                <strong>
                                                    {progressSummary.claimedGoals === progressSummary.totalGoals
                                                        ? '권역 운영 완료'
                                                        : `${progressSummary.claimedGoals}/${progressSummary.totalGoals} 보상 확보`}
                                                </strong>
                                            </div>
                                            <span className="region-goals-total-reward">
                                                총 {formatMoney(getRegionGoalRewardTotal(region.id))}원
                                            </span>
                                        </div>

                                        <div className="region-goal-list">
                                            {goalStatuses.map((goal) => {
                                                const isReadyToClaim = isUnlocked && goal.isComplete && !goal.isClaimed;

                                                return (
                                                    <div
                                                        key={goal.id}
                                                        className={`region-goal-item ${goal.isClaimed ? 'claimed' : goal.isComplete ? 'ready' : 'pending'} ${
                                                            !isUnlocked ? 'preview' : ''
                                                        }`}
                                                    >
                                                        <div className="region-goal-top">
                                                            <div className="region-goal-copy">
                                                                <strong>{goal.title}</strong>
                                                                <p>{goal.description}</p>
                                                            </div>
                                                            <span
                                                                className={`region-goal-chip ${
                                                                    goal.isClaimed ? 'claimed' : goal.isComplete ? 'ready' : 'pending'
                                                                }`}
                                                            >
                                                                {goal.isClaimed ? '확보' : goal.isComplete ? '수령 가능' : '진행 중'}
                                                            </span>
                                                        </div>

                                                        <div className="region-goal-meta-row">
                                                            <span>{goal.progressLabel}</span>
                                                            <strong>보상 {formatMoney(goal.reward)}원</strong>
                                                        </div>
                                                        <div className="progress-bar">
                                                            <div className="progress-fill" style={{ width: `${goal.progress * 100}%` }} />
                                                        </div>

                                                        {isReadyToClaim && (
                                                            <button
                                                                type="button"
                                                                className="toss-button secondary region-goal-claim-btn"
                                                                onClick={() => handleClaim(goal.id)}
                                                            >
                                                                <FaGift />
                                                                운영 보상 수령
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="region-unlock-hint">
                                        <span>확장 포인트</span>
                                        <strong>{region.unlockHint}</strong>
                                    </div>

                                    {isNextUnlock && !isUnlocked && (
                                        <div className="region-unlock-progress">
                                            <div className="region-unlock-progress-top">
                                                <span>해금 진행도</span>
                                                <strong>{canUnlock ? '준비 완료' : `${Math.round(regionProgress * 100)}%`}</strong>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${regionProgress * 100}%` }} />
                                            </div>
                                            <p>
                                                {canUnlock
                                                    ? '목표 자산을 달성했습니다. 해금 후 바로 이 권역으로 이동할 수 있습니다.'
                                                    : `${formatMoney(regionRemaining)}원 부족합니다. 현재 루프를 조금만 더 밀어 올리세요.`}
                                            </p>
                                        </div>
                                    )}

                                    <div className="region-footer">
                                        <div className="region-cost">
                                            <span>해금 비용</span>
                                            <strong>{region.unlockCost > 0 ? `${formatMoney(region.unlockCost)}원` : '기본 지역'}</strong>
                                        </div>
                                        <button
                                            type="button"
                                            className={`toss-button ${
                                                isCurrent ? 'unlocked' : isUnlocked || canUnlock ? 'primary' : 'disabled'
                                            }`}
                                            onClick={handleAction}
                                            disabled={isCurrent || (!isUnlocked && !canUnlock)}
                                        >
                                            {isCurrent ? (
                                                <>
                                                    <FaCheckCircle />
                                                    사용 중
                                                </>
                                            ) : isUnlocked ? (
                                                <>
                                                    <FaArrowRight />
                                                    이 지역으로 이동
                                                </>
                                            ) : canUnlock ? (
                                                <>
                                                    <FaMapMarkedAlt />
                                                    해금하고 이동
                                                </>
                                            ) : (
                                                <>
                                                    <FaLock />
                                                    {isNextUnlock ? '다음 목표 진행 중' : '이전 지역 필요'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
