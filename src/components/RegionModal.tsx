import { motion } from 'framer-motion';
import { FaArrowRight, FaCheckCircle, FaLock, FaMapMarkedAlt } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { getNextLockedRegion, getRegionById, WORLD_REGIONS } from '../game/worlds';
import { useGameStore } from '../store/useGameStore';
import { formatMoney } from '../utils/formatMoney';

interface RegionModalProps {
    onClose: () => void;
}

export function RegionModal({ onClose }: RegionModalProps) {
    const totalMoney = useGameStore((state) => state.totalMoney);
    const unlockedRegionIds = useGameStore((state) => state.unlockedRegionIds);
    const currentRegionId = useGameStore((state) => state.currentRegionId);
    const unlockRegion = useGameStore((state) => state.unlockRegion);
    const selectRegion = useGameStore((state) => state.selectRegion);

    const currentRegion = getRegionById(currentRegionId);
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
                        <h2>지역 선택</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <IoClose />
                    </button>
                </div>

                <div className="modal-content scrollable region-content">
                    <p className="region-note">
                        지역은 아직 공통 보드를 공유하지만, 해금 순서와 이동 선택은 실제 장기 성장 루프에 반영됩니다.
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
                                {nextLockedRegion ? `다음 목표 ${Math.round(nextRegionProgress * 100)}%` : '세계 지도 완성'}
                            </span>
                        </div>
                    </section>

                    <div className="region-summary-card">
                        <div>
                            <span className="region-summary-label">다음 해금 목표</span>
                            <strong>{nextLockedRegion ? nextLockedRegion.name : '모든 지역 해금 완료'}</strong>
                            <p className="region-summary-note">
                                {nextLockedRegion
                                    ? nextRegionProgress >= 1
                                        ? '자산 목표를 달성했습니다. 바로 해금하고 이동할 수 있습니다.'
                                        : `${formatMoney(nextRegionRemaining)}원만 더 모으면 새 권역이 열립니다.`
                                    : '원하는 권역으로 자유롭게 이동하며 엔드게임 운영을 이어가세요.'}
                            </p>
                        </div>
                        <span className="region-summary-value">
                            {nextLockedRegion ? `${Math.round(nextRegionProgress * 100)}%` : '완료'}
                        </span>
                    </div>

                    <div className="region-journey-track" aria-label="지역 진행도">
                        {WORLD_REGIONS.map((region) => {
                            const isUnlocked = unlockedRegionIds.includes(region.id);
                            const isCurrent = currentRegionId === region.id;
                            const isNextUnlock = nextLockedRegion?.id === region.id;

                            return (
                                <div
                                    key={region.id}
                                    className={`region-journey-stop ${
                                        isCurrent ? 'current' : isUnlocked ? 'unlocked' : isNextUnlock ? 'next' : 'locked'
                                    }`}
                                >
                                    <span className="region-journey-order">0{region.order}</span>
                                    <span className="region-journey-name">{region.shortName}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="region-list">
                        {WORLD_REGIONS.map((region) => {
                            const isUnlocked = unlockedRegionIds.includes(region.id);
                            const isCurrent = currentRegionId === region.id;
                            const isNextUnlock = nextLockedRegion?.id === region.id;
                            const canUnlock = isNextUnlock && totalMoney >= region.unlockCost;

                            const handleAction = () => {
                                if (isCurrent) return;

                                const success = isUnlocked ? selectRegion(region.id) : unlockRegion(region.id);
                                if (success && navigator.vibrate) navigator.vibrate([50, 30, 50]);
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

                                    <div className="region-highlight-grid">
                                        <div className="region-loop">
                                            <span>핵심 루프</span>
                                            <strong>{region.coreLoop}</strong>
                                        </div>
                                        <div className="region-loop">
                                            <span>권역 분위기</span>
                                            <strong>{region.flavor}</strong>
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
                                                <strong>{canUnlock ? '준비 완료' : `${Math.round(nextRegionProgress * 100)}%`}</strong>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${nextRegionProgress * 100}%` }} />
                                            </div>
                                            <p>
                                                {canUnlock
                                                    ? '목표 자산을 달성했습니다. 해금 후 바로 이 권역으로 이동할 수 있습니다.'
                                                    : `${formatMoney(nextRegionRemaining)}원 부족합니다. 현재 루프를 조금만 더 밀어 올리세요.`}
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
