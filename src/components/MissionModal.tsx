import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaBullseye } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import {
    MISSIONS,
    getActiveMissionClaimedIds,
    getMissionMetricValueFromMetrics,
    type MissionCadence,
} from '../game/missions';
import { useGameStore } from '../store/useGameStore';
import { formatMoney } from '../utils/formatMoney';

interface MissionModalProps {
    onClose: () => void;
}

const CADENCE_META: Record<MissionCadence, { title: string; subtitle: string }> = {
    daily: {
        title: '빠른 오늘 목표',
        subtitle: '2~3개만 가볍게. 부담 없이 빠르게 끝내는 구간',
    },
    weekly: {
        title: '주간 페이스 목표',
        subtitle: '한 번에 몰아서가 아니라 여러 세션에 걸쳐 자연스럽게 진행',
    },
    milestone: {
        title: '장기 마일스톤',
        subtitle: '리셋 없이 꾸준히 쌓이는 성장/수집/발견 목표',
    },
};

const CADENCE_ORDER: MissionCadence[] = ['daily', 'weekly', 'milestone'];
const NEAR_COMPLETE_THRESHOLD = 75;

function formatProgressValue(value: number): string {
    return value.toLocaleString('ko-KR');
}

export function MissionModal({ onClose }: MissionModalProps) {
    const claimMissionReward = useGameStore((state) => state.claimMissionReward);
    const missionClaimedIds = useGameStore((state) => state.missionClaimedIds);
    const dailyMissionClaimedIds = useGameStore((state) => state.dailyMissionClaimedIds);
    const dailyMissionClaimedDayKey = useGameStore((state) => state.dailyMissionClaimedDayKey);
    const weeklyMissionClaimedIds = useGameStore((state) => state.weeklyMissionClaimedIds);
    const weeklyMissionClaimedWeekKey = useGameStore((state) => state.weeklyMissionClaimedWeekKey);
    const totalMergeCount = useGameStore((state) => state.totalMergeCount);
    const totalEarnedMoney = useGameStore((state) => state.totalEarnedMoney);
    const discoveredLevels = useGameStore((state) => state.discoveredLevels);
    const spawnLevel = useGameStore((state) => state.spawnLevel);
    const dailyRewardTotalClaimed = useGameStore((state) => state.dailyRewardTotalClaimed);
    const returnRewardTotalClaimed = useGameStore((state) => state.returnRewardTotalClaimed);
    const offlineRewardTotalClaimed = useGameStore((state) => state.offlineRewardTotalClaimed);

    const groupedMissions = useMemo(() => {
        const missionStateSnapshot = {
            totalMergeCount,
            totalEarnedMoney,
            discoveredLevels,
            spawnLevel,
            dailyRewardTotalClaimed,
            returnRewardTotalClaimed,
            offlineRewardTotalClaimed,
        };
        const activeMissionClaimedIds = new Set(
            getActiveMissionClaimedIds({
                dailyMissionClaimedIds,
                dailyMissionClaimedDayKey,
                weeklyMissionClaimedIds,
                weeklyMissionClaimedWeekKey,
                missionClaimedIds,
            })
        );

        return CADENCE_ORDER.map((cadence) => {
            const missionItems = MISSIONS
                .filter((mission) => mission.cadence === cadence)
                .map((mission, index) => {
                    const isClaimed = activeMissionClaimedIds.has(mission.id);
                    const progress = Math.max(
                        0,
                        Math.min(getMissionMetricValueFromMetrics(missionStateSnapshot, mission.conditionType), mission.target)
                    );
                    const isCompleted = progress >= mission.target;
                    const isReady = !isClaimed && isCompleted;
                    const progressPercent = Math.min(100, Math.floor((progress / mission.target) * 100));
                    const isNearComplete = !isClaimed && !isCompleted && progressPercent >= NEAR_COMPLETE_THRESHOLD;
                    const remaining = Math.max(0, mission.target - progress);
                    const sortPriority = isReady ? 0 : isNearComplete ? 1 : progress > 0 ? 2 : 3;

                    return {
                        mission,
                        index,
                        isClaimed,
                        isCompleted,
                        isReady,
                        progress,
                        progressPercent,
                        isNearComplete,
                        remaining,
                        sortPriority,
                    };
                })
                .sort((a, b) => {
                    if (a.sortPriority !== b.sortPriority) return a.sortPriority - b.sortPriority;
                    if (a.remaining !== b.remaining) return a.remaining - b.remaining;
                    return a.index - b.index;
                });

            const completedCount = missionItems.filter((item) => item.isClaimed).length;
            const readyCount = missionItems.filter((item) => item.isReady).length;
            const nearCount = missionItems.filter((item) => item.isNearComplete).length;
            const nextFocus = missionItems.find((item) => !item.isClaimed) ?? null;

            return {
                cadence,
                missions: missionItems,
                completedCount,
                totalCount: missionItems.length,
                readyCount,
                nearCount,
                nextFocus,
            };
        });
    }, [
        dailyMissionClaimedDayKey,
        dailyMissionClaimedIds,
        dailyRewardTotalClaimed,
        discoveredLevels,
        missionClaimedIds,
        offlineRewardTotalClaimed,
        returnRewardTotalClaimed,
        spawnLevel,
        totalEarnedMoney,
        totalMergeCount,
        weeklyMissionClaimedIds,
        weeklyMissionClaimedWeekKey,
    ]);

    const totalMissionCount = groupedMissions.reduce((sum, group) => sum + group.totalCount, 0);
    const totalClaimedCount = groupedMissions.reduce((sum, group) => sum + group.completedCount, 0);
    const totalReadyCount = groupedMissions.reduce((sum, group) => sum + group.readyCount, 0);
    const totalNearCount = groupedMissions.reduce((sum, group) => sum + group.nearCount, 0);

    const handleClaim = (missionId: string) => () => {
        const claimed = claimMissionReward(missionId);
        if (claimed && navigator.vibrate) navigator.vibrate([50, 40, 50]);
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
                        <div className="modal-icon achievement">
                            <FaBullseye />
                        </div>
                        <h2>성장 로드맵</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <IoClose />
                    </button>
                </div>

                <div className="modal-content scrollable mission-content">
                    <div className="mission-overview-card">
                        <div className="mission-overview-header">
                            <strong>지금 확인할 포인트</strong>
                            <span>{totalClaimedCount}/{totalMissionCount} 수령 완료</span>
                        </div>
                        <div className="mission-overview-metrics">
                            <div className={`mission-overview-chip ${totalReadyCount > 0 ? 'ready' : ''}`}>
                                <span>즉시 수령</span>
                                <strong>{totalReadyCount}개</strong>
                            </div>
                            <div className={`mission-overview-chip ${totalNearCount > 0 ? 'near' : ''}`}>
                                <span>근접 목표</span>
                                <strong>{totalNearCount}개</strong>
                            </div>
                        </div>
                        <p>
                            {totalReadyCount > 0
                                ? '먼저 수령 가능한 미션부터 정리하면 다음 목표가 깔끔하게 열립니다.'
                                : totalNearCount > 0
                                    ? '거의 도착한 미션이 있습니다. 짧게 한 번 더 플레이하면 보상 구간에 진입합니다.'
                                    : '급한 미션은 없습니다. 원하는 트랙을 골라 천천히 진척을 쌓아도 됩니다.'}
                        </p>
                    </div>
                    <p className="mission-tone-note">
                        일일 체크리스트처럼 몰아치지 않아도 됩니다. 준비된 보상은 지금 받고, 나머지는 세션 리듬에 맞춰 자연스럽게 채우면 됩니다.
                    </p>
                    {groupedMissions.map(({ cadence, missions, completedCount, totalCount, readyCount, nearCount, nextFocus }) => (
                        <section key={cadence} className="mission-track">
                            <div className="mission-track-header">
                                <h3>{CADENCE_META[cadence].title}</h3>
                                <span>{completedCount}/{totalCount} 완료</span>
                            </div>
                            <p className="mission-track-subtitle">{CADENCE_META[cadence].subtitle}</p>
                            <div className="mission-track-focus-row">
                                <span className={`mission-track-pill ${readyCount > 0 ? 'ready' : ''}`}>수령 가능 {readyCount}</span>
                                <span className={`mission-track-pill ${nearCount > 0 ? 'near' : ''}`}>근접 {nearCount}</span>
                                {nextFocus && (
                                    <span className="mission-track-pill soft">
                                        다음 포커스: {nextFocus.mission.title}
                                    </span>
                                )}
                            </div>
                            <div className="mission-list">
                                {missions.map(({ mission, isClaimed, isCompleted, progress, progressPercent, isNearComplete, remaining, isReady }, index) => {
                                    const isRecommended = index === 0 && !isClaimed;

                                    return (
                                        <article
                                            key={mission.id}
                                            className={`mission-item ${isClaimed ? 'claimed' : isCompleted ? 'ready' : ''} ${isNearComplete ? 'near' : ''} ${isRecommended ? 'recommended' : ''}`}
                                        >
                                            <div className="mission-item-main">
                                                <div className="mission-icon">{mission.icon}</div>
                                                <div className="mission-info">
                                                    <div className="mission-title-row">
                                                        <strong>
                                                            {mission.title}
                                                            {isRecommended && <span className="mission-title-tag">추천</span>}
                                                        </strong>
                                                        <span className="mission-reward">+{formatMoney(mission.reward)}원</span>
                                                    </div>
                                                    <p>{mission.description}</p>
                                                    <div className="mission-progress-row">
                                                        <span>{formatProgressValue(progress)} / {formatProgressValue(mission.target)}</span>
                                                        <span>{progressPercent}%</span>
                                                    </div>
                                                    <div className="mission-progress-bar">
                                                        <div className="mission-progress-fill" style={{ width: `${progressPercent}%` }} />
                                                    </div>
                                                    <div className="mission-status-row">
                                                        <span className={`mission-status-pill ${isClaimed ? 'claimed' : isReady ? 'ready' : isNearComplete ? 'near' : 'pending'}`}>
                                                            {isClaimed ? '수령 완료' : isReady ? '지금 수령 가능' : isNearComplete ? '근접' : '진행 중'}
                                                        </span>
                                                        {!isClaimed && !isCompleted && (
                                                            <span className="mission-status-note">
                                                                {remaining > 0
                                                                    ? `${formatProgressValue(remaining)} 남음`
                                                                    : '조건 달성 직전'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                className={`toss-button ${isClaimed ? 'disabled' : isCompleted ? 'gold' : 'secondary'}`}
                                                onClick={handleClaim(mission.id)}
                                                disabled={isClaimed || !isCompleted}
                                            >
                                                {isClaimed ? '수령 완료' : isCompleted ? '보상 받기' : '진행 중'}
                                            </button>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
