import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BsCash, BsCashStack } from 'react-icons/bs';
import { FaBook, FaCoins, FaLock, FaQuestion } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { GiCrystalGrowth, GiCutDiamond, GiDiamondHard, GiGoldBar, GiMoonOrbit } from 'react-icons/gi';
import { COIN_BASE_INCOME, COIN_LEVELS } from '../types/game';
import { useGameStore } from '../store/useGameStore';

interface CollectionModalProps {
    onClose: () => void;
}

const getLevelIcon = (level: number) => {
    if (level <= 4) return <FaCoins />;
    if (level <= 6) return <BsCash />;
    if (level <= 9) return <BsCashStack />;
    if (level === 10) return <GiGoldBar />;
    if (level === 11) return <GiDiamondHard />;
    if (level === 12) return <FaCoins />;
    if (level === 13) return <GiCrystalGrowth />;
    if (level === 14) return <GiCrystalGrowth />;
    if (level === 15) return <GiCrystalGrowth />;
    if (level === 16) return <GiCutDiamond />;
    if (level === 17) return <GiMoonOrbit />;
    if (level === 18) return <FaQuestion />;
    return <FaCoins />;
};

const formatIncome = (amount: number) => {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(0)}B`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(0)}M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
    return amount.toString();
};

export function CollectionModal({ onClose }: CollectionModalProps) {
    const discoveredLevels = useGameStore((state) => state.discoveredLevels);
    const gemSystemUnlocked = useGameStore((state) => state.gemSystemUnlocked);
    const bitcoinDiscovered = useGameStore((state) => state.bitcoinDiscovered);
    const [showBitcoinHint, setShowBitcoinHint] = useState(false);

    const normalizedDiscoveredLevels = discoveredLevels.length > 0 ? discoveredLevels : [1];
    const discoveredLevelSet = new Set(normalizedDiscoveredLevels);
    const maxVisibleLevel = gemSystemUnlocked ? 17 : 12;
    const totalLevels = maxVisibleLevel;
    const unlockedCount = normalizedDiscoveredLevels.filter((level) => level <= totalLevels).length;

    const handleBitcoinClick = () => {
        if (bitcoinDiscovered) return;
        setShowBitcoinHint(true);
        window.setTimeout(() => setShowBitcoinHint(false), 3000);
    };

    return (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div
                className="modal-container toss-modal collection-modal"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(event) => event.stopPropagation()}
            >
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

                <div className="collection-stats">
                    <span className="stats-label">수집 현황</span>
                    <span className="stats-value">{unlockedCount} / {totalLevels}</span>
                </div>

                <div className="modal-content collection-content">
                    <div className="collection-grid">
                        {Object.entries(COIN_LEVELS)
                            .filter(([levelText]) => {
                                const level = Number.parseInt(levelText, 10);
                                if (level === 18) return true;
                                if (level > 12 && !gemSystemUnlocked) return false;
                                return true;
                            })
                            .map(([levelText, coinInfo]) => {
                                const level = Number.parseInt(levelText, 10);
                                const isUnlocked = discoveredLevelSet.has(level);
                                const income = COIN_BASE_INCOME[level] ?? 0;

                                if (level === 18) {
                                    return (
                                        <div key={level} className={`collection-item ${bitcoinDiscovered ? 'unlocked bitcoin' : 'mystery'}`} onClick={handleBitcoinClick}>
                                            {bitcoinDiscovered ? (
                                                <>
                                                    <div className="collection-icon bitcoin">
                                                        <span className="bitcoin-emoji">₿</span>
                                                    </div>
                                                    <div className="collection-name">{coinInfo.name}</div>
                                                    <div className="collection-pps">기준 수익 +{formatIncome(income)}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="collection-icon mystery">
                                                        <span className="mystery-icon">?</span>
                                                    </div>
                                                    <div className="collection-name">???</div>
                                                    <div className="collection-hint">숨겨진 코인</div>
                                                </>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={level} className={`collection-item ${isUnlocked ? 'unlocked' : 'locked'}`}>
                                        {isUnlocked ? (
                                            <>
                                                <div className={`collection-icon level-${level}`}>{getLevelIcon(level)}</div>
                                                <div className="collection-name">{coinInfo.name}</div>
                                                <div className="collection-pps">기준 수익 +{formatIncome(income)}</div>
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

                <AnimatePresence>
                    {showBitcoinHint && (
                        <motion.div className="bitcoin-tooltip" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                            <span className="tooltip-icon">🌌</span>
                            <span className="tooltip-text">
                                우주석 너머에서
                                <br />
                                마지막 코인을 찾아보세요.
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
