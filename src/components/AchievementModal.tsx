import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaCheck, FaChevronLeft, FaGift, FaLock } from 'react-icons/fa';
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
import type { AchievementCategory } from '../types/game';
import { formatMoney } from '../utils/formatMoney';

interface AchievementModalProps {
    onClose: () => void;
}

type AchievementDetailFilter = 'all' | 'active' | 'locked' | 'done';

type AchievementListItem = {
    index: number;
    achievement: (typeof ACHIEVEMENTS)[number];
    isUnlocked: boolean;
    isActive: boolean;
    isNew: boolean;
    progress: ReturnType<typeof getAchievementProgress>;
    statusTone: 'done' | 'active' | 'locked';
    statusLabel: string;
    sortPriority: number;
};

const DETAIL_FILTER_COPY: Record<AchievementDetailFilter, { label: string; note: string; helper: string }> = {
    all: {
        label: '전체',
        note: '진행 중이거나 방금 해금한 업적을 먼저 보여줍니다.',
        helper: '추천 순서',
    },
    active: {
        label: '진행 중',
        note: '지금 손대면 바로 진척이 나는 업적만 모아봅니다.',
        helper: '바로 추적',
    },
    done: {
        label: '완료',
        note: '이미 달성한 업적만 모아서 회고용으로 확인합니다.',
        helper: '달성 기록',
    },
    locked: {
        label: '미진행',
        note: '아직 첫 조건을 밟지 않은 업적만 보여줍니다.',
        helper: '다음 목표',
    },
};

export function AchievementModal({ onClose }: AchievementModalProps) {
    const gameState = useGameStore((state) => state);
    const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | null>(null);
    const [detailFilter, setDetailFilter] = useState<AchievementDetailFilter>('all');
    const contentRef = useRef<HTMLDivElement | null>(null);
    const previousUnlockedAchievementsRef = useRef<string[]>(gameState.unlockedAchievements);

    useEffect(() => {
        const previousUnlocked = previousUnlockedAchievementsRef.current;
        const newAchievements = gameState.unlockedAchievements.filter((id) => !previousUnlocked.includes(id));
        previousUnlockedAchievementsRef.current = gameState.unlockedAchievements;

        if (newAchievements.length === 0) return;

        setNewlyUnlocked(newAchievements);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);

        const timerId = window.setTimeout(() => {
            setNewlyUnlocked((current) =>
                current.filter((achievementId) => !newAchievements.includes(achievementId))
            );
        }, 3000);

        return () => window.clearTimeout(timerId);
    }, [gameState.unlockedAchievements]);

    useEffect(() => {
        if (!contentRef.current) return;
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }, [selectedCategory, detailFilter]);


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

    const achievementGroups = useMemo(() => {
        return ACHIEVEMENT_CATEGORY_ORDER.map((category) => ({
            category,
            meta: ACHIEVEMENT_CATEGORY_META[category],
            items: ACHIEVEMENTS.filter((achievement) => achievement.category === category),
        }));
    }, []);

    const selectedGroup = selectedCategory
        ? achievementGroups.find((group) => group.category === selectedCategory) ?? null
        : null;
    const selectedSummary = selectedCategory
        ? categorySummary.find((summary) => summary.category === selectedCategory) ?? null
        : null;
    const selectedPercent = selectedSummary && selectedSummary.totalCount > 0
        ? Math.floor((selectedSummary.unlockedCount / selectedSummary.totalCount) * 100)
        : 0;

    const selectedAchievementItems = useMemo<AchievementListItem[]>(() => {
        if (!selectedGroup) return [];

        return selectedGroup.items.map((achievement, index) => {
            const isUnlocked = unlockedSet.has(achievement.id);
            const progress = getAchievementProgress(gameState, achievement);
            const isActive = !isUnlocked && progress.target !== null && progress.current > 0;
            const isNew = newlyUnlocked.includes(achievement.id);
            const statusTone: AchievementListItem['statusTone'] = isUnlocked
                ? 'done'
                : isActive
                    ? 'active'
                    : 'locked';
            const statusLabel = isUnlocked ? '완료' : isActive ? '진행 중' : '잠김';
            const sortPriority = isNew ? 0 : isActive ? 1 : !isUnlocked ? 2 : 3;

            return {
                index,
                achievement,
                isUnlocked,
                isActive,
                isNew,
                progress,
                statusTone,
                statusLabel,
                sortPriority,
            };
        });
    }, [gameState, newlyUnlocked, selectedGroup, unlockedSet]);

    const filteredAchievements = useMemo(() => {
        const sortedItems = [...selectedAchievementItems].sort((a, b) => {
            if (detailFilter !== 'all') return a.index - b.index;
            if (a.sortPriority !== b.sortPriority) return a.sortPriority - b.sortPriority;
            return a.index - b.index;
        });

        if (detailFilter === 'all') return sortedItems;
        if (detailFilter === 'active') return sortedItems.filter((item) => item.isActive);
        if (detailFilter === 'locked') return sortedItems.filter((item) => !item.isUnlocked && !item.isActive);
        return sortedItems.filter((item) => item.isUnlocked);
    }, [detailFilter, selectedAchievementItems]);

    const activeCount = selectedAchievementItems.filter((item) => item.isActive).length;
    const lockedCount = selectedAchievementItems.filter((item) => !item.isUnlocked && !item.isActive).length;
    const doneCount = selectedAchievementItems.filter((item) => item.isUnlocked).length;

    const detailFilterCards: Array<{ key: AchievementDetailFilter; value: number }> = [
        { key: 'all', value: selectedAchievementItems.length },
        { key: 'active', value: activeCount },
        { key: 'done', value: doneCount },
        { key: 'locked', value: lockedCount },
    ];

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
                        <h2>{selectedGroup ? selectedGroup.meta.title : '업적'}</h2>
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

                <AnimatePresence>
                    {newlyUnlocked.length > 0 && (
                        <motion.div className="achievement-new-banner" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <FaGift className="banner-icon" />
                            <span>{newlyUnlocked.length}개의 새 업적이 해금되었습니다.</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="modal-content achievement-content" ref={contentRef}>
                    <AnimatePresence mode="wait">
                        {!selectedGroup ? (
                            <motion.div key="category-list" className="achievement-category-screen" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}>
                                <p className="achievement-view-note">카테고리를 선택해 상세 업적과 진행도를 확인하세요.</p>
                                <div className="achievement-category-grid">
                                    {categorySummary.map((summary) => {
                                        const meta = ACHIEVEMENT_CATEGORY_META[summary.category];
                                        const percent = summary.totalCount > 0
                                            ? Math.floor((summary.unlockedCount / summary.totalCount) * 100)
                                            : 0;

                                        return (
                                            <button
                                                key={summary.category}
                                                className={`achievement-category-card ${meta.accent}`}
                                                onClick={() => {
                                                    if (navigator.vibrate) navigator.vibrate(15);
                                                    setDetailFilter('all');
                                                    setSelectedCategory(summary.category);
                                                }}
                                                type="button"
                                            >
                                                <div className="achievement-category-card-top">
                                                    <span className="achievement-category-icon">{meta.icon}</span>
                                                    <div className="achievement-category-copy">
                                                        <strong>{meta.title}</strong>
                                                        <span>{meta.subtitle}</span>
                                                    </div>
                                                    <span className="achievement-category-percent">{percent}%</span>
                                                </div>
                                                <p>{meta.flavor}</p>
                                                <div className="achievement-category-footer">
                                                    <span>{summary.unlockedCount} / {summary.totalCount}</span>
                                                    <span>탭해서 보기</span>
                                                </div>
                                                <div className="mission-progress-bar">
                                                    <div className="mission-progress-fill" style={{ width: `${percent}%` }} />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key={selectedGroup.category} className="achievement-detail-screen" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>
                                <div className="achievement-detail-header">
                                    <div className="achievement-detail-top">
                                        <button
                                            className="achievement-back"
                                            onClick={() => {
                                                if (navigator.vibrate) navigator.vibrate(12);
                                                setDetailFilter('all');
                                                setSelectedCategory(null);
                                            }}
                                            type="button"
                                        >
                                            <FaChevronLeft />
                                            <span>카테고리 목록</span>
                                        </button>
                                        <div className="achievement-detail-meta">
                                            <strong>{selectedGroup.meta.title}</strong>
                                            <span>{selectedGroup.meta.flavor}</span>
                                        </div>
                                        {selectedSummary && <span className="achievement-detail-count">{selectedSummary.unlockedCount}/{selectedSummary.totalCount}</span>}
                                    </div>
                                    {selectedSummary && (
                                        <div className="achievement-detail-progress">
                                            <div className="achievement-detail-progress-row">
                                                <span>완료율</span>
                                                <strong>{selectedPercent}%</strong>
                                            </div>
                                            <div className="mission-progress-bar">
                                                <div className="mission-progress-fill" style={{ width: `${selectedPercent}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="achievement-list">
                                    <div className="achievement-filter-grid">
                                        {detailFilterCards.map(({ key, value }) => (
                                            <button
                                                key={key}
                                                type="button"
                                                className={`achievement-filter-card ${detailFilter === key ? 'active' : ''}`}
                                                onClick={() => setDetailFilter(key)}
                                            >
                                                <span>{DETAIL_FILTER_COPY[key].label}</span>
                                                <strong>{value}</strong>
                                                <small>{DETAIL_FILTER_COPY[key].helper}</small>
                                            </button>
                                        ))}
                                    </div>

                                    <p className="achievement-filter-note">{DETAIL_FILTER_COPY[detailFilter].note}</p>

                                    {filteredAchievements.map(({ achievement, isUnlocked, isActive, isNew, progress, statusLabel, statusTone }) => (
                                        <motion.div
                                            key={achievement.id}
                                            className={`achievement-item ${isUnlocked ? 'unlocked' : isActive ? 'in-progress' : 'locked'} ${isNew ? 'new' : ''}`}
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
                                                    <div className="achievement-title-stack">
                                                        <div className="achievement-title">{achievement.title}</div>
                                                        <div className="achievement-card-meta">
                                                            {achievement.tier && <span className="achievement-tier">T{achievement.tier}</span>}
                                                            <span className={`achievement-status-pill ${statusTone}`}>{statusLabel}</span>
                                                            {isNew && <span className="achievement-status-pill new">NEW</span>}
                                                        </div>
                                                    </div>

                                                    {achievement.reward !== undefined && achievement.reward > 0 && (
                                                        <div className={`achievement-reward ${isUnlocked ? 'claimed' : ''}`}>
                                                            {isUnlocked ? '보상 지급 완료' : `+${formatMoney(achievement.reward)}원`}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="achievement-desc">{achievement.description}</div>

                                                {!isUnlocked && progress.target !== null ? (
                                                    <>
                                                        <div className="achievement-progress-row">
                                                            <span>{formatMoney(progress.current)} / {formatMoney(progress.target)}</span>
                                                            <span>{progress.percent}%</span>
                                                        </div>
                                                        <div className="mission-progress-bar">
                                                            <div className="mission-progress-fill" style={{ width: `${progress.percent}%` }} />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="achievement-subnote">
                                                        {isUnlocked
                                                            ? '달성 즉시 보상이 지급되었습니다.'
                                                            : '첫 조건을 달성하면 진행도가 이곳에 표시됩니다.'}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {filteredAchievements.length === 0 && (
                                        <div className="achievement-empty-state">
                                            선택한 필터에 표시할 업적이 없습니다.
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}
