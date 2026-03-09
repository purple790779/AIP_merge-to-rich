import { motion } from 'framer-motion';
import { FaBullseye } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { MISSIONS, getMissionMetricValueFromMetrics, type MissionCadence } from '../game/missions';
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

export function MissionModal({ onClose }: MissionModalProps) {
    const claimMissionReward = useGameStore((state) => state.claimMissionReward);
    const missionClaimedIds = useGameStore((state) => state.missionClaimedIds);
    const totalMergeCount = useGameStore((state) => state.totalMergeCount);
    const totalEarnedMoney = useGameStore((state) => state.totalEarnedMoney);
    const discoveredLevels = useGameStore((state) => state.discoveredLevels);
    const spawnLevel = useGameStore((state) => state.spawnLevel);
    const dailyRewardTotalClaimed = useGameStore((state) => state.dailyRewardTotalClaimed);
    const returnRewardTotalClaimed = useGameStore((state) => state.returnRewardTotalClaimed);
    const offlineRewardTotalClaimed = useGameStore((state) => state.offlineRewardTotalClaimed);

    const missionStateSnapshot = {
        totalMergeCount,
        totalEarnedMoney,
        discoveredLevels,
        spawnLevel,
        dailyRewardTotalClaimed,
        returnRewardTotalClaimed,
        offlineRewardTotalClaimed,
    };

    const groupedMissions = CADENCE_ORDER.map((cadence) => {
        const missions = MISSIONS.filter((mission) => mission.cadence === cadence);
        const completedCount = missions.filter((mission) => missionClaimedIds.includes(mission.id)).length;

        return {
            cadence,
            missions,
            completedCount,
            totalCount: missions.length,
        };
    });

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
                    <p className="mission-tone-note">
                        일일 체크리스트처럼 몰아치지 않아도 됩니다. 모든 목표는 선택적으로 진행되며, 장기 목표는 리셋되지 않습니다.
                    </p>
                    {groupedMissions.map(({ cadence, missions, completedCount, totalCount }) => (
                        <section key={cadence} className="mission-track">
                            <div className="mission-track-header">
                                <h3>{CADENCE_META[cadence].title}</h3>
                                <span>{completedCount}/{totalCount} 완료</span>
                            </div>
                            <p className="mission-track-subtitle">{CADENCE_META[cadence].subtitle}</p>
                            <div className="mission-list">
                                {missions.map((mission) => {
                                    const isClaimed = missionClaimedIds.includes(mission.id);
                                    const progress = Math.max(
                                        0,
                                        Math.min(getMissionMetricValueFromMetrics(missionStateSnapshot, mission.conditionType), mission.target)
                                    );
                                    const isCompleted = progress >= mission.target;
                                    const progressPercent = Math.min(100, Math.floor((progress / mission.target) * 100));

                                    return (
                                        <article
                                            key={mission.id}
                                            className={`mission-item ${isClaimed ? 'claimed' : isCompleted ? 'ready' : ''}`}
                                        >
                                            <div className="mission-item-main">
                                                <div className="mission-icon">{mission.icon}</div>
                                                <div className="mission-info">
                                                    <div className="mission-title-row">
                                                        <strong>{mission.title}</strong>
                                                        <span className="mission-reward">+{formatMoney(mission.reward)}원</span>
                                                    </div>
                                                    <p>{mission.description}</p>
                                                    <div className="mission-progress-row">
                                                        <span>{formatMoney(progress)} / {formatMoney(mission.target)}</span>
                                                        <span>{progressPercent}%</span>
                                                    </div>
                                                    <div className="mission-progress-bar">
                                                        <div className="mission-progress-fill" style={{ width: `${progressPercent}%` }} />
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
