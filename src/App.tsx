import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBullseye, FaCoins, FaGift, FaMapMarkedAlt, FaQuestion, FaTrophy } from 'react-icons/fa';
import { IoSettingsSharp } from 'react-icons/io5';
import './index.css';
import {
    AchievementModal,
    AdButton,
    Board,
    BoostModal,
    BoostStatus,
    CollectionModal,
    Controls,
    DailyRewardModal,
    Header,
    HelpModal,
    MissionModal,
    OfflineRewardModal,
    RegionModal,
    ReturnRewardModal,
    SettingsModal,
    StoreModal,
    TimedRewardTray,
} from './components';
import { ACHIEVEMENTS } from './game/achievements';
import { getRegionById, WORLD_REGIONS, getNextLockedRegion } from './game/worlds';
import { useGameStore } from './store/useGameStore';
import { getClaimableMissionCountByMetrics } from './game/missions';
import { COIN_LEVELS, MAX_MONEY } from './types/game';
import { formatMoney } from './utils/formatMoney';

type ModalType =
    | 'store'
    | 'collection'
    | 'help'
    | 'settings'
    | 'boost'
    | 'achievement'
    | 'dailyReward'
    | 'mission'
    | 'returnReward'
    | 'offlineReward'
    | 'region'
    | 'ending'
    | null;

type TimedRewardModalType = Extract<ModalType, 'returnReward' | 'offlineReward'>;

function App() {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [suppressedTimedRewardModal, setSuppressedTimedRewardModal] = useState<TimedRewardModalType | null>(null);
    const [showAchievementBadge, setShowAchievementBadge] = useState(false);
    const [celebrationText, setCelebrationText] = useState<string | null>(null);
    const [discoveryText, setDiscoveryText] = useState<string | null>(null);
    const [worldTransitionText, setWorldTransitionText] = useState<string | null>(null);
    const [, setDailyRewardClock] = useState(() => Date.now());

    const unlockedAchievements = useGameStore((state) => state.unlockedAchievements);
    const resetGame = useGameStore((state) => state.resetGame);
    const totalMoney = useGameStore((state) => state.totalMoney);
    const canClaimDailyRewardFromStore = useGameStore((state) => state.canClaimDailyReward);
    const missionClaimedIds = useGameStore((state) => state.missionClaimedIds);
    const dailyMissionClaimedIds = useGameStore((state) => state.dailyMissionClaimedIds);
    const dailyMissionClaimedDayKey = useGameStore((state) => state.dailyMissionClaimedDayKey);
    const weeklyMissionClaimedIds = useGameStore((state) => state.weeklyMissionClaimedIds);
    const weeklyMissionClaimedWeekKey = useGameStore((state) => state.weeklyMissionClaimedWeekKey);
    const totalMergeCount = useGameStore((state) => state.totalMergeCount);
    const totalEarnedMoney = useGameStore((state) => state.totalEarnedMoney);
    const discoveredLevels = useGameStore((state) => state.discoveredLevels);
    const spawnLevel = useGameStore((state) => state.spawnLevel);
    const dailyRewardTotalClaimed = useGameStore((state) => state.dailyRewardTotalClaimed);
    const returnRewardTotalClaimed = useGameStore((state) => state.returnRewardTotalClaimed);
    const offlineRewardTotalClaimed = useGameStore((state) => state.offlineRewardTotalClaimed);
    const lastDiscoveredLevel = useGameStore((state) => state.lastDiscoveredLevel);
    const pendingReturnReward = useGameStore((state) => state.pendingReturnReward);
    const pendingOfflineReward = useGameStore((state) => state.pendingOfflineReward);
    const refreshTimedRewards = useGameStore((state) => state.refreshTimedRewards);
    const dismissTimedReward = useGameStore((state) => state.dismissTimedReward);
    const currentRegionId = useGameStore((state) => state.currentRegionId);
    const unlockedRegionIds = useGameStore((state) => state.unlockedRegionIds);
    const nextLockedRegion = getNextLockedRegion(unlockedRegionIds);
    const currentRegion = getRegionById(currentRegionId);
    const showRegionStatus = Boolean(currentRegion);
    const nextRegionUnlockProgress = nextLockedRegion ? Math.min(1, totalMoney / nextLockedRegion.unlockCost) : 1;
    const nextRegionRemaining = nextLockedRegion ? Math.max(0, nextLockedRegion.unlockCost - totalMoney) : 0;
    const worldJourneySummary = nextLockedRegion
        ? nextRegionUnlockProgress >= 1
            ? `${nextLockedRegion.name} 입장 준비 완료 · 지도에서 해금 후 바로 이동할 수 있습니다.`
            : `${formatMoney(nextRegionRemaining)}원 남음 · ${nextLockedRegion.tagline}`
        : '모든 지역이 해금되었습니다. 원하는 권역으로 자유롭게 이동하세요.';

    const hasSeenEndingRef = useRef(false);
    const prevUnlockedAchievementsRef = useRef<string[]>(unlockedAchievements);
    const discoveryShowTimerRef = useRef<number | null>(null);
    const discoveryHideTimerRef = useRef<number | null>(null);
    const worldTransitionTimerRef = useRef<number | null>(null);
    const prevRegionIdRef = useRef(currentRegionId);
    const prevUnlockedRegionCountRef = useRef(unlockedRegionIds.length);

    const canClaimDailyReward = canClaimDailyRewardFromStore();
    const claimableMissionCount = getClaimableMissionCountByMetrics(
        {
            totalMergeCount,
            totalEarnedMoney,
            discoveredLevels,
            spawnLevel,
            dailyRewardTotalClaimed,
            returnRewardTotalClaimed,
            offlineRewardTotalClaimed,
        },
        {
            dailyMissionClaimedIds,
            dailyMissionClaimedDayKey,
            weeklyMissionClaimedIds,
            weeklyMissionClaimedWeekKey,
            missionClaimedIds,
        }
    );
    const effectiveSuppressedTimedRewardModal =
        suppressedTimedRewardModal === 'returnReward' && !pendingReturnReward
            ? null
            : suppressedTimedRewardModal === 'offlineReward' && !pendingOfflineReward
                ? null
                : suppressedTimedRewardModal;

    useEffect(() => {
        const timerId = window.setInterval(() => {
            setDailyRewardClock(Date.now());
        }, 60_000);

        return () => window.clearInterval(timerId);
    }, []);

    useEffect(() => {
        refreshTimedRewards();
    }, [refreshTimedRewards]);

    useEffect(() => {
        const syncHeartbeat = () => {
            useGameStore.getState().syncSessionHeartbeat();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                syncHeartbeat();
                return;
            }

            useGameStore.getState().refreshTimedRewards();
            setDailyRewardClock(Date.now());
        };

        window.addEventListener('pagehide', syncHeartbeat);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('pagehide', syncHeartbeat);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        if (activeModal) return;

        const nextModal: ModalType =
            pendingReturnReward && effectiveSuppressedTimedRewardModal !== 'returnReward'
                ? 'returnReward'
                : pendingOfflineReward && effectiveSuppressedTimedRewardModal !== 'offlineReward'
                    ? 'offlineReward'
                    : null;

        if (!nextModal) return;

        const timerId = window.setTimeout(() => {
            setActiveModal(nextModal);
        }, 0);

        return () => window.clearTimeout(timerId);
    }, [activeModal, effectiveSuppressedTimedRewardModal, pendingOfflineReward, pendingReturnReward]);

    useEffect(() => {
        if (lastDiscoveredLevel === null || lastDiscoveredLevel < 2) return;

        const coinInfo = COIN_LEVELS[lastDiscoveredLevel];
        if (!coinInfo) return;

        if (discoveryShowTimerRef.current) window.clearTimeout(discoveryShowTimerRef.current);
        if (discoveryHideTimerRef.current) window.clearTimeout(discoveryHideTimerRef.current);

        discoveryShowTimerRef.current = window.setTimeout(() => {
            setDiscoveryText(`새 코인 발견! ${coinInfo.emoji} ${coinInfo.name}`);
            useGameStore.getState().clearLastDiscoveredLevel();
            discoveryShowTimerRef.current = null;
        }, 0);

        discoveryHideTimerRef.current = window.setTimeout(() => {
            setDiscoveryText(null);
            discoveryHideTimerRef.current = null;
        }, 2500);
    }, [lastDiscoveredLevel]);

    useEffect(() => {
        return () => {
            if (discoveryShowTimerRef.current) window.clearTimeout(discoveryShowTimerRef.current);
            if (discoveryHideTimerRef.current) window.clearTimeout(discoveryHideTimerRef.current);
            if (worldTransitionTimerRef.current) window.clearTimeout(worldTransitionTimerRef.current);
        };
    }, []);

    useEffect(() => {
        const previousRegionId = prevRegionIdRef.current;
        const previousUnlockedRegionCount = prevUnlockedRegionCountRef.current;

        let nextWorldTransitionText: string | null = null;
        if (unlockedRegionIds.length > previousUnlockedRegionCount) {
            nextWorldTransitionText = `새 지역 해금 · ${currentRegion.name}`;
        } else if (currentRegionId !== previousRegionId) {
            nextWorldTransitionText = `지역 이동 · ${currentRegion.name}`;
        }

        prevRegionIdRef.current = currentRegionId;
        prevUnlockedRegionCountRef.current = unlockedRegionIds.length;

        if (!nextWorldTransitionText) return;

        const showTimerId = window.setTimeout(() => {
            if (worldTransitionTimerRef.current) window.clearTimeout(worldTransitionTimerRef.current);
            setWorldTransitionText(nextWorldTransitionText);
            worldTransitionTimerRef.current = window.setTimeout(() => {
                setWorldTransitionText(null);
                worldTransitionTimerRef.current = null;
            }, 2400);
        }, 0);

        return () => window.clearTimeout(showTimerId);
    }, [currentRegion.name, currentRegionId, unlockedRegionIds.length]);

    useEffect(() => {
        const previous = prevUnlockedAchievementsRef.current;
        const newlyUnlocked = unlockedAchievements.filter((id) => !previous.includes(id));

        prevUnlockedAchievementsRef.current = unlockedAchievements;
        if (newlyUnlocked.length === 0) return;

        let hideTimer: number | undefined;
        const showTimer = window.setTimeout(() => {
            setShowAchievementBadge(true);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

            const achievement = ACHIEVEMENTS.find((item) => item.id === newlyUnlocked[0]);
            if (achievement) {
                setCelebrationText(`업적 달성! "${achievement.title}"`);
                hideTimer = window.setTimeout(() => setCelebrationText(null), 3000);
            }
        }, 0);

        return () => {
            window.clearTimeout(showTimer);
            if (hideTimer) window.clearTimeout(hideTimer);
        };
    }, [unlockedAchievements]);

    useEffect(() => {
        if (totalMoney < MAX_MONEY || hasSeenEndingRef.current) return;

        const timerId = window.setTimeout(() => {
            hasSeenEndingRef.current = true;
            setActiveModal('ending');
        }, 0);

        return () => window.clearTimeout(timerId);
    }, [totalMoney]);

    useEffect(() => {
        if (totalMoney < MAX_MONEY) {
            hasSeenEndingRef.current = false;
        }
    }, [totalMoney]);

    const handleOpenAchievement = () => {
        setShowAchievementBadge(false);
        setActiveModal('achievement');
    };

    const handleReset = useCallback(() => {
        if (!window.confirm('정말 처음부터 다시 시작하시겠습니까?\n모든 코인, 자산, 업그레이드가 초기화됩니다.')) {
            return;
        }

        const store = useGameStore.getState();
        const hasMaxMoneyAchievement = store.unlockedAchievements.includes('completionist_max_money');

        resetGame();

        if (hasMaxMoneyAchievement) {
            useGameStore.setState((state) => ({
                unlockedAchievements: state.unlockedAchievements.includes('completionist_max_money')
                    ? state.unlockedAchievements
                    : [...state.unlockedAchievements, 'completionist_max_money'],
            }));
        }

        setActiveModal(null);
        setSuppressedTimedRewardModal(null);
        setShowAchievementBadge(false);
        hasSeenEndingRef.current = false;
    }, [resetGame]);

    const closeTimedRewardModal = (type: TimedRewardModalType) => {
        setSuppressedTimedRewardModal(type);
        setActiveModal(null);
    };

    const openTimedRewardModal = (type: TimedRewardModalType) => {
        setSuppressedTimedRewardModal(null);
        setActiveModal(type);
    };

    const handleDismissTimedReward = (type: 'return_reward' | 'offline_reward') => {
        dismissTimedReward(type);
        setSuppressedTimedRewardModal(type === 'return_reward' ? 'returnReward' : 'offlineReward');
        setActiveModal(null);
    };

    return (
        <div className="game-container">
            <AnimatePresence>
                {celebrationText && (
                    <motion.div
                        className="celebration-toast"
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        {celebrationText}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {discoveryText && (
                    <motion.div
                        className="discovery-toast"
                        initial={{ y: -100, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -100, opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                        {discoveryText}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {worldTransitionText && (
                    <motion.div
                        className="world-transition-toast"
                        initial={{ y: -100, opacity: 0, scale: 0.92 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -100, opacity: 0, scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                    >
                        {worldTransitionText}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="shell-top">
                <div className="title-row">
                    <h1 className="game-title">
                        <FaCoins className="game-title-icon" style={{ color: '#fbbf24' }} />
                        <span>머지 머니 타이쿤</span>
                    </h1>
                    <div className="title-actions">
                        <button className="title-icon-btn" onClick={() => setActiveModal('help')} aria-label="도움말">
                            <FaQuestion />
                        </button>
                        <button className="title-icon-btn" onClick={() => setActiveModal('settings')} aria-label="설정">
                            <IoSettingsSharp />
                        </button>
                    </div>
                </div>

                <Header />

            </div>

            <main className="play-surface">
                <div className="board-stage">
                    <Board />
                </div>

                <div className="shell-support-stack">
                    <div className="utility-shortcuts" role="toolbar" aria-label="진행 빠른 메뉴">
                        <button
                            type="button"
                            className="utility-shortcut daily"
                            onClick={() => setActiveModal('dailyReward')}
                            aria-label="일일 보상"
                        >
                            <span className="utility-shortcut-icon">
                                <FaGift />
                            </span>
                            <span className="utility-shortcut-main">
                                <span className="utility-shortcut-label">일일 보상</span>
                                <span className="utility-shortcut-meta">
                                    {canClaimDailyReward ? '지금 수령 가능' : '다음 리셋 대기'}
                                </span>
                            </span>
                            {canClaimDailyReward && (
                                <motion.span
                                    className="daily-reward-badge"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500 }}
                                />
                            )}
                        </button>

                        <button
                            type="button"
                            className="utility-shortcut mission"
                            onClick={() => setActiveModal('mission')}
                            aria-label="성장 목표"
                        >
                            <span className="utility-shortcut-icon">
                                <FaBullseye />
                            </span>
                            <span className="utility-shortcut-main">
                                <span className="utility-shortcut-label">성장 목표</span>
                                <span className="utility-shortcut-meta">
                                    {claimableMissionCount > 0 ? `${claimableMissionCount}개 수령 가능` : '진행 중'}
                                </span>
                            </span>
                            {claimableMissionCount > 0 && (
                                <motion.span
                                    className="mission-badge"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500 }}
                                />
                            )}
                        </button>

                        <button
                            type="button"
                            className="utility-shortcut achievement"
                            onClick={handleOpenAchievement}
                            aria-label="업적"
                        >
                            <span className="utility-shortcut-icon">
                                <FaTrophy />
                            </span>
                            <span className="utility-shortcut-main">
                                <span className="utility-shortcut-label">업적</span>
                                <span className="utility-shortcut-meta">
                                    {showAchievementBadge ? '새 업적 도착' : `${unlockedAchievements.length}개 해금`}
                                </span>
                            </span>
                            {showAchievementBadge && (
                                <motion.span
                                    className="achievement-badge"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500 }}
                                />
                            )}
                        </button>
                    </div>

                    <TimedRewardTray
                        pendingReturnReward={pendingReturnReward}
                        pendingOfflineReward={pendingOfflineReward}
                        onOpenReturnReward={() => openTimedRewardModal('returnReward')}
                        onOpenOfflineReward={() => openTimedRewardModal('offlineReward')}
                    />

                    <div className="boost-row">
                        <BoostStatus />
                        <AdButton onClick={() => setActiveModal('boost')} />
                    </div>

                    <Controls
                        onOpenStore={() => setActiveModal('store')}
                        onOpenCollection={() => setActiveModal('collection')}
                    />

                    {showRegionStatus && (
                        <button
                            type="button"
                            className="region-status-pill"
                            onClick={() => setActiveModal('region')}
                        >
                            <span className="region-status-pill-top">
                                <span className="region-status-pill-title">
                                    <FaMapMarkedAlt />
                                    <span className="region-status-pill-text">
                                        <span className="region-status-pill-kicker">WORLD JOURNEY</span>
                                        <strong>{currentRegion.name}</strong>
                                        <span className="region-status-pill-copy">{currentRegion.tagline}</span>
                                    </span>
                                </span>
                                <span className="region-status-pill-progress">
                                    {nextLockedRegion ? `${Math.round(nextRegionUnlockProgress * 100)}%` : '완료'}
                                </span>
                            </span>

                            <span className="region-status-pill-bottom">
                                <span className="region-status-pill-status">{worldJourneySummary}</span>
                                <span className="region-status-pill-count">
                                    {unlockedRegionIds.length}/{WORLD_REGIONS.length} 지역
                                </span>
                            </span>

                            {nextLockedRegion && (
                                <span className="region-status-pill-meter" aria-hidden="true">
                                    <span
                                        className="region-status-pill-meter-fill"
                                        style={{ width: `${nextRegionUnlockProgress * 100}%` }}
                                    />
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </main>

            <AnimatePresence>
                {activeModal === 'store' && <StoreModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'collection' && <CollectionModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'help' && <HelpModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'settings' && <SettingsModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'boost' && <BoostModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'achievement' && <AchievementModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'dailyReward' && <DailyRewardModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'mission' && <MissionModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'region' && <RegionModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'returnReward' && (
                    <ReturnRewardModal
                        onClose={() => closeTimedRewardModal('returnReward')}
                        onDismiss={() => handleDismissTimedReward('return_reward')}
                    />
                )}
                {activeModal === 'offlineReward' && (
                    <OfflineRewardModal
                        onClose={() => closeTimedRewardModal('offlineReward')}
                        onDismiss={() => handleDismissTimedReward('offline_reward')}
                    />
                )}
                {activeModal === 'ending' && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-container ending-modal"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            <div className="ending-content">
                                <div className="ending-trophy">🏆</div>
                                <h2 className="ending-title">축하합니다!</h2>
                                <p className="ending-subtitle">최대 자산 업적을 달성했습니다.</p>
                                <p className="ending-amount">9,999조원</p>
                                <p className="ending-message">
                                    당신은 전설적인 부자가 되었습니다.
                                    <br />
                                    이 업적은 영원히 기록됩니다.
                                </p>
                                <div className="ending-buttons">
                                    <button className="toss-button primary" onClick={() => setActiveModal(null)}>
                                        계속 플레이
                                    </button>
                                    <button className="toss-button secondary" onClick={handleReset}>
                                        처음부터 다시 하기
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
