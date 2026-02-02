import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { IoClose, IoPlayCircle, IoTimeOutline } from 'react-icons/io5';
import { FaRobot, FaBolt, FaCoins } from 'react-icons/fa';
import { useGameStore } from '../store/useGameStore';
import type { BoostType } from '../types/game';

interface BoostModalProps {
    onClose: () => void;
}

export function BoostModal({ onClose }: BoostModalProps) {
    const activateBoost = useGameStore(state => state.activateBoost);
    const isBoostActive = useGameStore(state => state.isBoostActive);
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const [adProgress, setAdProgress] = useState(0);

    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const isMountedRef = useRef(true);

    const DURATION_SECONDS = 300; // 5분

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleWatchAd = (type: BoostType) => {
        setIsWatchingAd(true);
        setAdProgress(0);

        // 광고 시뮬레이션 (3초)
        intervalRef.current = window.setInterval(() => {
            if (!isMountedRef.current) return;
            setAdProgress(prev => {
                if (prev >= 100) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return 100;
                }
                return prev + 2;
            });
        }, 50);

        timeoutRef.current = window.setTimeout(() => {
            if (intervalRef.current) clearInterval(intervalRef.current);

            // Activate boost first, then close modal
            activateBoost(type, DURATION_SECONDS);

            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

            // Use requestAnimationFrame to ensure state is settled before closing
            requestAnimationFrame(() => {
                if (isMountedRef.current) {
                    setIsWatchingAd(false);
                    onClose();
                }
            });
        }, 3000); // 3초 광고
    };

    const renderBoostCard = (type: BoostType, title: string, desc: string, icon: ReactNode, colorClass: string) => {
        const active = isBoostActive(type);

        return (
            <div className={`upgrade-card ${active ? 'active-boost' : ''}`} style={active ? { borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.1)' } : {}}>
                <div className="upgrade-header">
                    <div className={`upgrade-icon ${colorClass}`}>
                        {icon}
                    </div>
                    <div className="upgrade-info">
                        <div className="upgrade-title">{title}</div>
                        <div className="upgrade-desc">{desc}</div>
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
                            <IoTimeOutline /> 시간 +3분 연장
                        </>
                    ) : (
                        <>
                            <IoPlayCircle /> 광고 보고 활성화 (3분)
                        </>
                    )}
                </button>
            </div>
        );
    };

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isWatchingAd ? onClose : undefined}
        >
            <motion.div
                className="modal-container toss-modal"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
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

                {/* 광고 시청 중 오버레이 */}
                {isWatchingAd && (
                    <div className="ad-overlay" style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.85)', zIndex: 50,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        color: 'white', borderRadius: '24px'
                    }}>
                        <div className="loader" style={{ marginBottom: '20px', fontSize: '40px' }}>📺</div>
                        <h3>광고 시청 중...</h3>
                        <div style={{ width: '200px', height: '6px', background: '#333', borderRadius: '3px', marginTop: '15px', overflow: 'hidden' }}>
                            <div style={{ width: `${adProgress}%`, height: '100%', background: '#10b981', transition: 'width 0.1s' }} />
                        </div>
                    </div>
                )}

                {/* 컨텐츠 */}
                <div className="modal-content scrollable">
                    <div className="help-text" style={{ padding: '0 4px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>
                        광고를 시청하고 3분 동안 특별한 효과를 얻으세요!
                    </div>

                    {renderBoostCard(
                        'AUTO_MERGE',
                        '자동 병합',
                        '1초마다 같은 코인을 자동으로 합칩니다.',
                        <FaRobot />,
                        'level' // 재사용 (노란색)
                    )}

                    {renderBoostCard(
                        'DOUBLE_INCOME',
                        '수익 2배',
                        '초당 수익(PPS)과 머지 보너스가 2배가 됩니다.',
                        <FaCoins />,
                        'income' // 보라색
                    )}

                    {renderBoostCard(
                        'AUTO_SPAWN',
                        '자동 생산',
                        '자동으로 코인을 생산합니다 (비용 소모)',
                        <FaBolt />,
                        'speed' // 파란색
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
