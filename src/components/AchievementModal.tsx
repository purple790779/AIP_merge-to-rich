import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoTrophy } from 'react-icons/io5';
import { FaCheck, FaLock, FaGift } from 'react-icons/fa';
import { useGameStore } from '../store/useGameStore';
import { ACHIEVEMENTS } from '../types/game';

interface AchievementModalProps {
    onClose: () => void;
}

export function AchievementModal({ onClose }: AchievementModalProps) {
    const unlockedAchievements = useGameStore(state => state.unlockedAchievements);
    const checkAchievements = useGameStore(state => state.checkAchievements);
    const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

    // 모달 열릴 때 업적 체크
    useEffect(() => {
        const newAchievements = checkAchievements();
        if (newAchievements.length === 0) return;

        const timer = window.setTimeout(() => {
            setNewlyUnlocked(newAchievements);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
        }, 0);

        return () => window.clearTimeout(timer);
    }, [checkAchievements]);

    const formatReward = (reward: number) => {
        if (reward >= 1000000000) return `${(reward / 1000000000).toFixed(0)}B`;
        if (reward >= 1000000) return `${(reward / 1000000).toFixed(0)}M`;
        if (reward >= 1000) return `${(reward / 1000).toFixed(0)}K`;
        return reward.toString();
    };

    const unlockedCount = unlockedAchievements.length;
    const totalCount = ACHIEVEMENTS.length;

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal-container toss-modal achievement-modal"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
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

                {/* 진행 상황 */}
                <div className="achievement-progress">
                    <span className="progress-label">달성 현황</span>
                    <span className="progress-value">{unlockedCount} / {totalCount}</span>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                        />
                    </div>
                </div>

                {/* 새로 달성한 업적 알림 */}
                <AnimatePresence>
                    {newlyUnlocked.length > 0 && (
                        <motion.div
                            className="achievement-new-banner"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <FaGift className="banner-icon" />
                            <span>{newlyUnlocked.length}개의 새로운 업적 달성! 보상이 지급되었습니다!</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 업적 목록 */}
                <div className="modal-content achievement-content">
                    <div className="achievement-list">
                        {ACHIEVEMENTS.map((achievement) => {
                            const isUnlocked = unlockedAchievements.includes(achievement.id);
                            const isNew = newlyUnlocked.includes(achievement.id);

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
                                        <div className="achievement-title">{achievement.title}</div>
                                        <div className="achievement-desc">{achievement.description}</div>
                                    </div>
                                    {achievement.reward && (
                                        <div className={`achievement-reward ${isUnlocked ? 'claimed' : ''}`}>
                                            {isUnlocked ? '획득' : `+${formatReward(achievement.reward)}`}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
