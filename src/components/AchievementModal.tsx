import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaCheck, FaGift, FaLock } from 'react-icons/fa';
import { IoClose, IoTrophy } from 'react-icons/io5';
import {
    ACHIEVEMENTS,
    ACHIEVEMENT_CATEGORY_META,
    ACHIEVEMENT_CATEGORY_ORDER,
    getAchievementCategorySummary,
    getAchievementProgress,
    getAchievementRankProgress,
} from '../game/achievements';
import { useGameStore } from '../store/useGameStore';
import { formatMoney } from '../utils/formatMoney';

interface AchievementModalProps {
    onClose: () => void;
}

export function AchievementModal({ onClose }: AchievementModalProps) {
    const checkAchievements = useGameStore((state) => state.checkAchievements);
    const gameState = useGameStore((state) => state);
    const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

    useEffect(() => {
        const newAchievements = checkAchievements();
        if (newAchievements.length === 0) return;

        const timerId = window.setTimeout(() => {
            setNewlyUnlocked(newAchievements);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
        }, 0);

        return () => window.clearTimeout(timerId);
    }, [checkAchievements]);

    const unlockedCount = gameState.unlockedAchievements.length;
    const totalCount = ACHIEVEMENTS.length;
    const unlockedSet = useMemo(() => new Set(gameState.unlockedAchievements), [gameState.unlockedAchievements]);
    const rankProgress = useMemo(
        () => getAchievementRankProgress(gameState.unlockedAchievements),
        [gameState.unlockedAchievements]
    );
    const categorySummary = useMemo(
        () => getAchievementCategorySummary(gameState.unlockedAchievements),
        [gameState.unlockedAchievements]
    );

    const achievementGroups = ACHIEVEMENT_CATEGORY_ORDER.map((category) => ({
        category,
        meta: ACHIEVEMENT_CATEGORY_META[category],
        items: ACHIEVEMENTS.filter((achievement) => achievement.category === category),
    }));

    return (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div
                className="modal-container toss-modal achievement-modal"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-header">
                    <div className="modal-title-row">
                        <div className="modal-icon achievement">
                            <IoTrophy />
                        </div>
                        <h2>업적</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <IoClose />
                    </button>
                </div>

                <div className="achievement-progress">
                    <span className="progress-label">달성 현황</span>
                    <span className="progress-value">{unlockedCount} / {totalCount}</span>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${(unlockedCount / totalCount) * 100}%` }} />
                    </div>
                </div>

                <div className="achievement-rank-card">
                    <div className="achievement-rank-header">
                        <span>레거시 랭크</span>
                        <strong>{rankProgress.currentRank.badge} {rankProgress.currentRank.name}</strong>
                    </div>
                    <div className="achievement-rank-progress-row">
                        <span>점수 {formatMoney(rankProgress.score)}</span>
                        <span>
                            {rankProgress.nextRank
                                ? `다음 랭크: ${rankProgress.nextRank.badge} ${rankProgress.nextRank.name}`
                                : '최종 랭크 달성'}
                        </span>
                    </div>
                    <div className="mission-progress-bar achievement-rank-progress-bar">
                        <div className="mission-progress-fill" style={{ width: `${rankProgress.progressPercent}%` }} />
                    </div>
                </div>

                <div className="achievement-category-strip">
                    {categorySummary.map((summary) => (
                        <div key={summary.category} className="achievement-category-pill">
                            <span>{ACHIEVEMENT_CATEGORY_META[summary.category].title}</span>
                            <strong>{summary.unlockedCount}/{summary.totalCount}</strong>
                        </div>
                    ))}
                </div>

                <AnimatePresence>
                    {newlyUnlocked.length > 0 && (
                        <motion.div className="achievement-new-banner" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <FaGift className="banner-icon" />
                            <span>{newlyUnlocked.length}개의 새 업적이 해금되었습니다.</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="modal-content achievement-content">
                    <div className="achievement-list">
                        {achievementGroups.map((group) => (
                            <section key={group.category} className="achievement-section">
                                <header className="achievement-section-header">
                                    <h3>{group.meta.title}</h3>
                                    <span>{group.meta.subtitle}</span>
                                </header>
                                {group.items.map((achievement) => {
                                    const isUnlocked = unlockedSet.has(achievement.id);
                                    const isNew = newlyUnlocked.includes(achievement.id);
                                    const progress = getAchievementProgress(gameState, achievement);

                                    return (
                                        <motion.div
                                            key={achievement.id}
                                            className={`achievement-item ${isUnlocked ? 'unlocked' : 'locked'} ${isNew ? 'new' : ''}`}
                                            initial={isNew ? { scale: 1.05 } : {}}
                                            animate={isNew ? { scale: [1.05, 1] } : {}}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="achievement-icon-wrapper">
                                                {isUnlocked ? (
                                                    <span className="achievement-emoji">{achievement.icon}</span>
                                                ) : (
                                                    <FaLock className="locked-icon" />
                                                )}
                                                {isUnlocked && (
                                                    <div className="achievement-check">
                                                        <FaCheck />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="achievement-info">
                                                <div className="achievement-title-row">
                                                    <div className="achievement-title">{achievement.title}</div>
                                                    {achievement.tier && <span className="achievement-tier">T{achievement.tier}</span>}
                                                </div>
                                                <div className="achievement-desc">{achievement.description}</div>
                                                {!isUnlocked && progress.target !== null && (
                                                    <>
                                                        <div className="achievement-progress-row">
                                                            <span>{formatMoney(progress.current)} / {formatMoney(progress.target)}</span>
                                                            <span>{progress.percent}%</span>
                                                        </div>
                                                        <div className="mission-progress-bar">
                                                            <div className="mission-progress-fill" style={{ width: `${progress.percent}%` }} />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            {achievement.reward !== undefined && achievement.reward > 0 && (
                                                <div className={`achievement-reward ${isUnlocked ? 'claimed' : ''}`}>
                                                    {isUnlocked ? '수령 완료' : `+${formatMoney(achievement.reward)}원`}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </section>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
