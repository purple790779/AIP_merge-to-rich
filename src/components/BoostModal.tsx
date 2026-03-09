import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FaBolt, FaCoins, FaRobot } from 'react-icons/fa';
import { IoClose, IoPlayCircle, IoTimeOutline } from 'react-icons/io5';
import { useGameStore } from '../store/useGameStore';
import type { BoostType } from '../types/game';

interface BoostModalProps {
    onClose: () => void;
}

export function BoostModal({ onClose }: BoostModalProps) {
    const activateBoost = useGameStore((state) => state.activateBoost);
    const isBoostActive = useGameStore((state) => state.isBoostActive);
    const autoMergeInterval = useGameStore((state) => state.autoMergeInterval) ?? 5000;
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const [adProgress, setAdProgress] = useState(0);

    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const isMountedRef = useRef(true);

    const durationSeconds = 300;
    const durationMinutes = durationSeconds / 60;

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (intervalRef.current) window.clearInterval(intervalRef.current);
            if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleWatchAd = (type: BoostType) => {
        setIsWatchingAd(true);
        setAdProgress(0);

        intervalRef.current = window.setInterval(() => {
            if (!isMountedRef.current) return;

            setAdProgress((value) => {
                if (value >= 100) {
                    if (intervalRef.current) window.clearInterval(intervalRef.current);
                    return 100;
                }

                return value + 2;
            });
        }, 50);

        timeoutRef.current = window.setTimeout(() => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);

            activateBoost(type, durationSeconds);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

            requestAnimationFrame(() => {
                if (!isMountedRef.current) return;
                setIsWatchingAd(false);
                onClose();
            });
        }, 3000);
    };

    const renderBoostCard = (type: BoostType, title: string, description: string, icon: ReactNode, colorClass: string) => {
        const active = isBoostActive(type);

        return (
            <div className={`upgrade-card ${active ? 'active-boost' : ''}`} style={active ? { borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.1)' } : {}}>
                <div className="upgrade-header">
                    <div className={`upgrade-icon ${colorClass}`}>{icon}</div>
                    <div className="upgrade-info">
                        <div className="upgrade-title">{title}</div>
                        <div className="upgrade-desc">{description}</div>
                    </div>
                </div>

                <button
                    onClick={() => handleWatchAd(type)}
                    disabled={isWatchingAd}
                    className={`toss-button ${active ? 'unlocked' : 'primary'}`}
                    style={{ marginTop: '12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                    {active ? (
                        <>
                            <IoTimeOutline />
                            시간 +{durationMinutes}분 연장
                        </>
                    ) : (
                        <>
                            <IoPlayCircle />
                            광고 보고 활성화 ({durationMinutes}분)
                        </>
                    )}
                </button>
            </div>
        );
    };

    return (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={!isWatchingAd ? onClose : undefined}>
            <motion.div
                className="modal-container toss-modal"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-header">
                    <div className="modal-title-row">
                        <div className="modal-icon speed" style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>
                            <IoPlayCircle />
                        </div>
                        <h2>무료 부스트</h2>
                    </div>
                    {!isWatchingAd && (
                        <button className="modal-close" onClick={onClose}>
                            <IoClose />
                        </button>
                    )}
                </div>

                {isWatchingAd && (
                    <div className="ad-sim-overlay">
                        <div className="ad-sim-loader">▶</div>
                        <h3>광고 시청 중...</h3>
                        <div className="ad-sim-bar">
                            <div className="ad-sim-bar-fill" style={{ width: `${adProgress}%` }} />
                        </div>
                    </div>
                )}

                <div className="modal-content scrollable">
                    <div className="help-text reward-help-text">
                        광고를 시청하면 {durationMinutes}분 동안 핵심 부스트 효과를 받을 수 있습니다.
                    </div>

                    {renderBoostCard(
                        'AUTO_MERGE',
                        '자동 병합',
                        `현재 설정 기준 ${(autoMergeInterval / 1000).toFixed(1)}초마다 같은 코인을 자동으로 병합합니다.`,
                        <FaRobot />,
                        'level'
                    )}

                    {renderBoostCard(
                        'DOUBLE_INCOME',
                        '수익 2배',
                        '주기 수익과 머지 보너스가 2배로 적용됩니다.',
                        <FaCoins />,
                        'income'
                    )}

                    {renderBoostCard(
                        'AUTO_SPAWN',
                        '자동 생산',
                        '비용은 그대로 소모하면서 코인을 자동으로 생산합니다.',
                        <FaBolt />,
                        'speed'
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
