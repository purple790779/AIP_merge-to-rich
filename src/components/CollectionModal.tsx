import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COIN_LEVELS, COIN_PPS } from '../types/game';
import { IoClose } from 'react-icons/io5';
import { FaLock, FaBook, FaCoins, FaQuestion } from 'react-icons/fa';
import { BsCash, BsCashStack } from 'react-icons/bs';
import { GiGoldBar, GiDiamondHard, GiCrystalGrowth, GiCutDiamond, GiMoonOrbit } from 'react-icons/gi';
import { useGameStore } from '../store/useGameStore';

interface CollectionModalProps {
    onClose: () => void;
}

// 아이콘 헬퍼
const getLevelIcon = (level: number) => {
    if (level <= 4) return <FaCoins />;
    if (level <= 6) return <BsCash />;
    if (level <= 9) return <BsCashStack />;
    if (level === 10) return <GiGoldBar />;
    if (level === 11) return <GiDiamondHard />;
    if (level === 12) return <FaCoins />;
    // 보석 단계
    if (level === 13) return <GiCrystalGrowth />; // 루비
    if (level === 14) return <GiCrystalGrowth />; // 사파이어
    if (level === 15) return <GiCrystalGrowth />; // 에메랄드
    if (level === 16) return <GiCutDiamond />; // 블랙 다이아
    if (level === 17) return <GiMoonOrbit />; // 우주석
    if (level === 18) return <FaQuestion />; // 비트코인 (히든)
    return <FaCoins />;
};

export function CollectionModal({ onClose }: CollectionModalProps) {
    const discoveredLevels = useGameStore(state => state.discoveredLevels);
    const gemSystemUnlocked = useGameStore(state => state.gemSystemUnlocked);
    const bitcoinDiscovered = useGameStore(state => state.bitcoinDiscovered);

    const [showBitcoinHint, setShowBitcoinHint] = useState(false);

    // 기존 저장 데이터 호환: 발견 레벨이 없으면 레벨 1 기본 해금
    const normalizedDiscoveredLevels = discoveredLevels.length > 0 ? discoveredLevels : [1];
    const discoveredLevelSet = new Set(normalizedDiscoveredLevels);

    // 보석 시스템 해금 여부에 따른 최대 레벨
    const maxVisibleLevel = gemSystemUnlocked ? 17 : 12;

    // 수집 통계 (비트코인 제외)
    const totalLevels = maxVisibleLevel;
    const unlockedCount = normalizedDiscoveredLevels.filter(level => level <= totalLevels).length;

    const handleBitcoinClick = () => {
        if (!bitcoinDiscovered) {
            setShowBitcoinHint(true);
            setTimeout(() => setShowBitcoinHint(false), 3000);
        }
    };

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal-container toss-modal collection-modal"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="modal-header">
                    <div className="modal-title-row">
                        <div className="modal-icon collection">
                            <FaBook />
                        </div>
                        <h2>도감</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <IoClose />
                    </button>
                </div>

                {/* 수집 현황 */}
                <div className="collection-stats">
                    <span className="stats-label">수집 현황</span>
                    <span className="stats-value">{unlockedCount} / {totalLevels}</span>
                </div>

                {/* 컨텐츠 */}
                <div className="modal-content collection-content">
                    <div className="collection-grid">
                        {Object.entries(COIN_LEVELS)
                            .filter(([lvlStr]) => {
                                const level = parseInt(lvlStr);
                                // 보석 시스템 미해금 시 12까지만, 비트코인은 항상 마지막에 표시
                                if (level === 18) return true;
                                if (level > 12 && !gemSystemUnlocked) return false;
                                return true;
                            })
                            .map(([lvlStr, info]) => {
                                const level = parseInt(lvlStr);
                                const isUnlocked = discoveredLevelSet.has(level);
                                const pps = COIN_PPS[level] || 0;
                                const isBitcoin = level === 18;

                                // 비트코인 특별 처리
                                if (isBitcoin) {
                                    return (
                                        <div
                                            key={level}
                                            className={`collection-item ${bitcoinDiscovered ? 'unlocked bitcoin' : 'mystery'}`}
                                            onClick={handleBitcoinClick}
                                        >
                                            {bitcoinDiscovered ? (
                                                <>
                                                    <div className="collection-icon bitcoin">
                                                        <span className="bitcoin-emoji">₿</span>
                                                    </div>
                                                    <div className="collection-name">{info.name}</div>
                                                    <div className="collection-pps">+{(pps / 1000000000).toFixed(0)}B/초</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="collection-icon mystery">
                                                        <span className="mystery-icon">✨</span>
                                                    </div>
                                                    <div className="collection-name">???</div>
                                                    <div className="collection-hint">터치하세요</div>
                                                </>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={level}
                                        className={`collection-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                                    >
                                        {isUnlocked ? (
                                            <>
                                                <div className={`collection-icon level-${level}`}>
                                                    {getLevelIcon(level)}
                                                </div>
                                                <div className="collection-name">{info.name}</div>
                                                <div className="collection-pps">+{pps >= 1000000 ? `${(pps / 1000000).toFixed(0)}M` : pps >= 1000 ? `${(pps / 1000).toFixed(0)}K` : pps}/초</div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="collection-icon locked">
                                                    <FaLock />
                                                </div>
                                                <div className="collection-name">???</div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* 비트코인 힌트 툴팁 */}
                <AnimatePresence>
                    {showBitcoinHint && (
                        <motion.div
                            className="bitcoin-tooltip"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <span className="tooltip-icon">🔮</span>
                            <span className="tooltip-text">
                                "우주의 끝에서<br />디지털 금을 찾아라"
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
