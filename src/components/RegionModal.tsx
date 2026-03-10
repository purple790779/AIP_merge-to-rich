import { motion } from 'framer-motion';
import { FaCheckCircle, FaLock, FaMapMarkedAlt, FaArrowRight } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { getNextLockedRegion, WORLD_REGIONS } from '../game/worlds';
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

    const nextLockedRegion = getNextLockedRegion(unlockedRegionIds);

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
                        현재는 지역 메타/UI 1차 적용 단계입니다. 지역별 전용 보드와 생산 라인은 다음 배치에서 분리됩니다.
                    </p>

                    <div className="region-summary-card">
                        <div>
                            <span className="region-summary-label">다음 해금 목표</span>
                            <strong>{nextLockedRegion ? nextLockedRegion.name : '모든 지역 해금 완료'}</strong>
                        </div>
                        <span className="region-summary-value">
                            {nextLockedRegion ? `${formatMoney(nextLockedRegion.unlockCost)}원` : '완료'}
                        </span>
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
                                                {!isUnlocked && <span className="region-chip locked">잠김</span>}
                                            </div>
                                            <p>{region.unlockSummary}</p>
                                        </div>
                                    </div>

                                    <div className="region-loop">
                                        <span>핵심 루프</span>
                                        <strong>{region.coreLoop}</strong>
                                    </div>

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
                                                    {isNextUnlock ? '자산 부족' : '이전 지역 필요'}
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
