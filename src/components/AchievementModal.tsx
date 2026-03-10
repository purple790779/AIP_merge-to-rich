import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaCheck, FaChevronLeft, FaGift, FaLock } from 'react-icons/fa';
import { IoClose, IoTrophy } from 'react-icons/io5';
import { useShallow } from 'zustand/react/shallow';
import {
    ACHIEVEMENTS,
    ACHIEVEMENT_CATEGORY_META,
    ACHIEVEMENT_CATEGORY_ORDER,
    type AchievementMetricState,
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
    isNearComplete: boolean;
    isRecommended: boolean;
    isNew: boolean;
    remaining: number | null;
    progress: ReturnType<typeof getAchievementProgress>;
    statusTone: 'done' | 'active' | 'locked' | 'focus';
    statusLabel: string;
    sortPriority: number;
};

function formatProgressValue(value: number): string {
    return value.toLocaleString('ko-KR');
}

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
    const achievementState = useGameStore(
        useShallow((state) => ({
            coins: state.coins,
            totalMoney: state.totalMoney,
            unlockedAchievements: state.unlockedAchievements,
            totalMergeCount: state.totalMergeCount,
            totalEarnedMoney: state.totalEarnedMoney,
            discoveredLevels: state.discoveredLevels,
            dailyRewardTotalClaimed: state.dailyRewardTotalClaimed,
            dailyRewardStreak: state.dailyRewardStreak,
            returnRewardTotalClaimed: state.returnRewardTotalClaimed,
            offlineRewardTotalClaimed: state.offlineRewardTotalClaimed,
            spawnLevel: state.spawnLevel,
            spawnCooldown: state.spawnCooldown,
            incomeInterval: state.incomeInterval,
            mergeBonusLevel: state.mergeBonusLevel,
            gemSystemUnlocked: state.gemSystemUnlocked,
            incomeMultiplierLevel: state.incomeMultiplierLevel,
            autoMergeInterval: state.autoMergeInterval,
            totalMissionRewardsClaimed: state.totalMissionRewardsClaimed,
        }))
    );
    const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | null>(null);
    const [detailFilter, setDetailFilter] = useState<AchievementDetailFilter>('all');
    const contentRef = useRef<HTMLDivElement | null>(null);
    const previousUnlockedAchievementsRef = useRef<string[]>(achievementState.unlockedAchievements);

    useEffect(() => {
        const previousUnlocked = previousUnlockedAchievementsRef.current;
        const newAchievements = achievementState.unlockedAchievements.filter((id) => !previousUnlocked.includes(id));
        previousUnlockedAchievementsRef.current = achievementState.unlockedAchievements;

        if (newAchievements.length === 0) return;

        setNewlyUnlocked(newAchievements);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);

        const timerId = window.setTimeout(() => {
            setNewlyUnlocked((current) =>
                current.filter((achievementId) => !newAchievements.includes(achievementId))
            );
        }, 3000);

        return () => window.clearTimeout(timerId);
    }, [achievementState.unlockedAchievements]);

    useEffect(() => {
        if (!contentRef.current) return;
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }, [selectedCategory, detailFilter]);


    const unlockedCount = achievementState.unlockedAchievements.length;
    const totalCount = ACHIEVEMENTS.length;
    const unlockedSet = useMemo(() => new Set(achievementState.unlockedAchievements), [achievementState.unlockedAchievements]);
    const rankProgress = useMemo(
        () => getAchievementRankProgress(achievementState.unlockedAchievements),
        [achievementState.unlockedAchievements]
    );
    const categorySummary = useMemo(
        () => getAchievementCategorySummary(achievementState.unlockedAchievements),
        [achievementState.unlockedAchievements]
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
    const selectedRecommendedId = useMemo(() => {
        if (!selectedGroup) return null;

        const candidates = selectedGroup.items
            .filter((achievement) => !unlockedSet.has(achievement.id))
            .map((achievement, index) => {
                const progress = getAchievementProgress(achievementState as AchievementMetricState, achievement);
                const remaining = progress.target !== null ? Math.max(0, progress.target - progress.current) : Number.MAX_SAFE_INTEGER;

                return {
                    achievementId: achievement.id,
                    index,
                    progress,
                    remaining,
                    nearBoost: progress.percent >= 70 ? 0 : 1,
                    untouchedPenalty: progress.current > 0 ? 0 : 1,
                };
            })
            .sort((a, b) => {
                if (a.nearBoost !== b.nearBoost) return a.nearBoost - b.nearBoost;
                if (a.untouchedPenalty !== b.untouchedPenalty) return a.untouchedPenalty - b.untouchedPenalty;
                if (a.progress.percent !== b.progress.percent) return b.progress.percent - a.progress.percent;
                if (a.remaining !== b.remaining) return a.remaining - b.remaining;
                return a.index - b.index;
            });

        return candidates[0]?.achievementId ?? null;
    }, [achievementState, selectedGroup, unlockedSet]);

    const selectedAchievementItems = useMemo<AchievementListItem[]>(() => {
        if (!selectedGroup) return [];

        return selectedGroup.items.map((achievement, index) => {
            const isUnlocked = unlockedSet.has(achievement.id);
            const progress = getAchievementProgress(achievementState as AchievementMetricState, achievement);
            const isActive = !isUnlocked && progress.target !== null && progress.current > 0;
            const isNearComplete = !isUnlocked && progress.target !== null && progress.percent >= 70;
            const isRecommended = !isUnlocked && achievement.id === selectedRecommendedId;
            const isNew = newlyUnlocked.includes(achievement.id);
            const remaining = progress.target !== null ? Math.max(0, progress.target - progress.current) : null;
            const statusTone: AchievementListItem['statusTone'] = isUnlocked
                ? 'done'
                : isRecommended
                    ? 'focus'
                    : isActive
                    ? 'active'
                    : 'locked';
            const statusLabel = isUnlocked ? '완료' : isRecommended ? '추천' : isActive ? '진행 중' : '잠김';
            const sortPriority = isNew ? 0 : isRecommended ? 1 : isNearComplete ? 2 : isActive ? 3 : !isUnlocked ? 4 : 5;

            return {
                index,
                achievement,
                isUnlocked,
                isActive,
                isNearComplete,
                isRecommended,
                isNew,
                remaining,
                progress,
                statusTone,
                statusLabel,
                sortPriority,
            };
        });
    }, [achievementState, newlyUnlocked, selectedGroup, selectedRecommendedId, unlockedSet]);

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
    const nearCompleteCount = selectedAchievementItems.filter((item) => item.isNearComplete).length;
    const lockedCount = selectedAchievementItems.filter((item) => !item.isUnlocked && !item.isActive).length;
    const doneCount = selectedAchievementItems.filter((item) => item.isUnlocked).length;
    const recommendedItem = selectedAchievementItems.find((item) => item.isRecommended) ?? null;

    const categoryFocus = useMemo(() => {
        return achievementGroups.map((group) => {
            const summary = categorySummary.find((item) => item.category === group.category);
            const items = group.items
                .filter((achievement) => !unlockedSet.has(achievement.id))
                .map((achievement, index) => {
                    const progress = getAchievementProgress(achievementState as AchievementMetricState, achievement);
                    const remaining = progress.target !== null ? Math.max(0, progress.target - progress.current) : Number.MAX_SAFE_INTEGER;

                    return {
                        id: achievement.id,
                        title: achievement.title,
                        index,
                        progress,
                        remaining,
                        isNearComplete: progress.target !== null && progress.percent >= 70,
                        isActive: progress.target !== null && progress.current > 0,
                    };
                });
            const activeItems = items.filter((item) => item.isActive);
            const nearItems = items.filter((item) => item.isNearComplete);
            const recommended = [...items].sort((a, b) => {
                if (a.isNearComplete !== b.isNearComplete) return a.isNearComplete ? -1 : 1;
                if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
                if (a.progress.percent !== b.progress.percent) return b.progress.percent - a.progress.percent;
                if (a.remaining !== b.remaining) return a.remaining - b.remaining;
                return a.index - b.index;
            })[0] ?? null;
            const score = (nearItems.length * 4) + (activeItems.length * 2) + (recommended ? 1 : 0);

            return {
                category: group.category,
                score,
                activeCount: activeItems.length,
                nearCount: nearItems.length,
                recommended,
                isCompleted: summary ? summary.unlockedCount >= summary.totalCount : false,
            };
        });
    }, [achievementGroups, categorySummary, achievementState, unlockedSet]);

    const spotlightCategories = useMemo(() => {
        return [...categoryFocus]
            .filter((item) => !item.isCompleted && item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 2);
    }, [categoryFocus]);

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
                                {spotlightCategories.length > 0 && (
                                    <div className="achievement-overview-focus">
                                        <div className="achievement-overview-focus-head">
                                            <strong>지금 신경 쓰면 좋은 카테고리</strong>
                                            <span>완주 압박 없이, 곧 달성 가능한 목표 위주로 추천합니다.</span>
                                        </div>
                                        <div className="achievement-overview-focus-list">
                                            {spotlightCategories.map((focusItem) => {
                                                const meta = ACHIEVEMENT_CATEGORY_META[focusItem.category];

                                                return (
                                                    <button
                                                        key={focusItem.category}
                                                        type="button"
                                                        className={`achievement-overview-focus-card ${meta.accent}`}
                                                        onClick={() => {
                                                            setDetailFilter('all');
                                                            setSelectedCategory(focusItem.category);
                                                        }}
                                                    >
                                                        <div className="achievement-overview-focus-row">
                                                            <span>{meta.icon} {meta.title}</span>
                                                            <strong>{focusItem.nearCount > 0 ? `근접 ${focusItem.nearCount}` : `진행 ${focusItem.activeCount}`}</strong>
                                                        </div>
                                                        <small>{focusItem.recommended ? focusItem.recommended.title : '다음 목표를 확인해보세요.'}</small>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                <div className="achievement-category-grid">
                                    {categorySummary.map((summary) => {
                                        const meta = ACHIEVEMENT_CATEGORY_META[summary.category];
                                        const focus = categoryFocus.find((item) => item.category === summary.category);
                                        const percent = summary.totalCount > 0
                                            ? Math.floor((summary.unlockedCount / summary.totalCount) * 100)
                                            : 0;
                                        const focusLabel = summary.unlockedCount === summary.totalCount
                                            ? '완주'
                                            : focus && focus.nearCount > 0
                                                ? `근접 ${focus.nearCount}`
                                                : focus && focus.activeCount > 0
                                                    ? `진행 ${focus.activeCount}`
                                                    : '다음 목표';

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
                                                    <span className="achievement-category-focus-pill">{focusLabel}</span>
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
                                    {recommendedItem && !recommendedItem.isUnlocked && (
                                        <div className="achievement-next-focus">
                                            <div className="achievement-next-focus-head">
                                                <span>다음 추천 업적</span>
                                                <strong>{recommendedItem.achievement.title}</strong>
                                            </div>
                                            <div className="achievement-next-focus-meta">
                                                <span>{recommendedItem.progress.percent}% 진행</span>
                                                <span>
                                                    {recommendedItem.remaining !== null
                                                        ? `${formatProgressValue(recommendedItem.remaining)} 남음`
                                                        : '조건 달성 시 해금'}
                                                </span>
                                            </div>
                                            <p>근접 업적 {nearCompleteCount}개가 있어 짧은 세션에서도 체감 성장을 만들기 좋습니다.</p>
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

                                    {filteredAchievements.map(({ achievement, isUnlocked, isActive, isNearComplete, isRecommended, isNew, remaining, progress, statusLabel, statusTone }) => (
                                        <motion.div
                                            key={achievement.id}
                                            className={`achievement-item ${isUnlocked ? 'unlocked' : isActive ? 'in-progress' : 'locked'} ${isNew ? 'new' : ''} ${isNearComplete ? 'near-complete' : ''} ${isRecommended ? 'recommended' : ''}`}
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
                                                            {isNearComplete && <span className="achievement-status-pill near">근접</span>}
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
                                                            <span>{formatProgressValue(progress.current)} / {formatProgressValue(progress.target)}</span>
                                                            <span>{progress.percent}%</span>
                                                        </div>
                                                        <div className="mission-progress-bar">
                                                            <div className="mission-progress-fill" style={{ width: `${progress.percent}%` }} />
                                                        </div>
                                                        {remaining !== null && (
                                                            <div className="achievement-subnote">
                                                                {remaining === 0
                                                                    ? '조건 달성 완료. 잠시 후 자동 해금됩니다.'
                                                                    : `${formatProgressValue(remaining)}만 더 채우면 다음 달성입니다.`}
                                                            </div>
                                                        )}
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
