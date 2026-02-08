import { useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import './index.css';
import {
  Header,
  Board,
  Controls,
  StoreModal,
  CollectionModal,
  HelpModal,
  SettingsModal,
  AdButton,
  BoostModal,
  AchievementModal
} from './components';
import { useGameStore } from './store/useGameStore';
import type { BoostType } from './types/game';
import { MAX_MONEY, ACHIEVEMENTS, COIN_LEVELS } from './types/game';
import { FaBolt, FaCoins, FaRobot, FaQuestion, FaTrophy } from 'react-icons/fa';
import { IoSettingsSharp } from 'react-icons/io5';
import { AnimatePresence, motion } from 'framer-motion';

type ModalType = 'store' | 'collection' | 'help' | 'settings' | 'boost' | 'achievement' | 'ending' | null;

const BOOST_META: Record<BoostType, { label: string; className: string; icon: ReactNode }> = {
  AUTO_MERGE: { label: '자동 병합', className: 'auto-merge', icon: <FaRobot /> },
  DOUBLE_INCOME: { label: '수익 2배', className: 'double-income', icon: <FaCoins /> },
  AUTO_SPAWN: { label: '자동 생산', className: 'auto-spawn', icon: <FaBolt /> },
};

function App() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const activeBoosts = useGameStore(state => state.activeBoosts);
  const unlockedAchievements = useGameStore(state => state.unlockedAchievements);
  const resetGame = useGameStore(state => state.resetGame);
  const totalMoney = useGameStore(state => state.totalMoney);
  const lastDiscoveredLevel = useGameStore(state => state.lastDiscoveredLevel);
  const [now, setNow] = useState(() => Date.now());
  const [showAchievementBadge, setShowAchievementBadge] = useState(false);
  const [celebrationText, setCelebrationText] = useState<string | null>(null);
  const [discoveryText, setDiscoveryText] = useState<string | null>(null);
  const hasSeenEndingRef = useRef(false);
  const prevUnlockedAchievementsRef = useRef<string[]>(unlockedAchievements);
  const discoveryShowTimerRef = useRef<number | null>(null);
  const discoveryHideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 새 코인 발견 알림
  useEffect(() => {
    if (lastDiscoveredLevel === null || lastDiscoveredLevel < 2) return;
    const coinInfo = COIN_LEVELS[lastDiscoveredLevel];
    if (!coinInfo) return;

    if (discoveryShowTimerRef.current) window.clearTimeout(discoveryShowTimerRef.current);
    if (discoveryHideTimerRef.current) window.clearTimeout(discoveryHideTimerRef.current);

    discoveryShowTimerRef.current = window.setTimeout(() => {
      setDiscoveryText(`✨ ${coinInfo.emoji} ${coinInfo.name} 첫 병합 성공!`);
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
    };
  }, []);

  useEffect(() => {
    const previous = prevUnlockedAchievementsRef.current;
    const newlyUnlocked = unlockedAchievements.filter(id => !previous.includes(id));

    prevUnlockedAchievementsRef.current = unlockedAchievements;
    if (newlyUnlocked.length === 0) return;

    let hideTimer: number | undefined;
    const showTimer = window.setTimeout(() => {
      setShowAchievementBadge(true);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

      const achievement = ACHIEVEMENTS.find(a => a.id === newlyUnlocked[0]);
      if (achievement) {
        setCelebrationText(`🎉 "${achievement.title}" 업적 달성!`);
        hideTimer = window.setTimeout(() => setCelebrationText(null), 3000);
      }
    }, 0);

    return () => {
      window.clearTimeout(showTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [unlockedAchievements]);

  // 엔딩 체크 (9999조 도달)
  useEffect(() => {
    if (totalMoney < MAX_MONEY || hasSeenEndingRef.current) return;
    const timer = window.setTimeout(() => {
      hasSeenEndingRef.current = true;
      setActiveModal('ending');
    }, 0);

    return () => window.clearTimeout(timer);
  }, [totalMoney]);

  useEffect(() => {
    if (totalMoney < MAX_MONEY) {
      hasSeenEndingRef.current = false;
    }
  }, [totalMoney]);

  const runningBoosts = activeBoosts.filter(boost => boost.endTime > now);

  const formatRemaining = (endTime: number) => {
    const remainingSec = Math.max(0, Math.ceil((endTime - now) / 1000));
    if (remainingSec >= 60) return `${Math.ceil(remainingSec / 60)}분`;
    return `${remainingSec}초`;
  };

  const handleOpenAchievement = () => {
    setShowAchievementBadge(false);
    setActiveModal('achievement');
  };

  // 게임 리셋 (최대자산 업적은 유지)
  const handleReset = useCallback(() => {
    const store = useGameStore.getState();
    const hasMaxMoneyAchievement = store.unlockedAchievements.includes('max_money');

    resetGame();

    if (hasMaxMoneyAchievement) {
      useGameStore.setState(state => ({
        unlockedAchievements: state.unlockedAchievements.includes('max_money')
          ? state.unlockedAchievements
          : [...state.unlockedAchievements, 'max_money'],
      }));
    }

    setActiveModal(null);
    setShowAchievementBadge(false);
    hasSeenEndingRef.current = false;
  }, [resetGame]);

  return (
    <div className="game-container">
      {/* 업적 축하 토스트 */}
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

      {/* 새 코인 발견 토스트 */}
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

      {/* 게임 타이틀 + 헤더 아이콘 */}
      <div className="title-row">
        <h1 className="game-title">
          <FaCoins className="game-title-icon" style={{ color: '#fbbf24' }} />
          <span>머지 머니 타이쿤</span>
        </h1>
        <div className="title-actions">
          <button className="title-icon-btn achievement-btn" onClick={handleOpenAchievement}>
            <FaTrophy />
            {showAchievementBadge && (
              <motion.span
                className="achievement-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              />
            )}
          </button>
          <button className="title-icon-btn" onClick={() => setActiveModal('help')}>
            <FaQuestion />
          </button>
          <button className="title-icon-btn" onClick={() => setActiveModal('settings')}>
            <IoSettingsSharp />
          </button>
        </div>
      </div>

      {/* 상단 정보 */}
      <Header />

      {/* 게임 보드 */}
      <Board />

      {/* 부스트 버튼 */}
      <div className="boost-row">
        <div className="boost-status">
          {runningBoosts.length === 0 ? (
            <span className="boost-empty">{'활성 부스트 없음'}</span>
          ) : (
            runningBoosts.map(boost => {
              const meta = BOOST_META[boost.type];
              return (
                <div key={boost.type} className={`boost-chip ${meta.className}`}>
                  <span className="boost-chip-icon">{meta.icon}</span>
                  <span className="boost-chip-label">{meta.label}</span>
                  <span className="boost-chip-time">{formatRemaining(boost.endTime)}</span>
                </div>
              );
            })
          )}
        </div>
        <AdButton onClick={() => setActiveModal('boost')} />
      </div>

      {/* 하단 컨트롤 */}
      <Controls
        onOpenStore={() => setActiveModal('store')}
        onOpenCollection={() => setActiveModal('collection')}
      />

      {/* 모달 레이어 */}
      <AnimatePresence>
        {activeModal === 'store' && (
          <StoreModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'collection' && (
          <CollectionModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'help' && (
          <HelpModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'settings' && (
          <SettingsModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'boost' && (
          <BoostModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'achievement' && (
          <AchievementModal onClose={() => setActiveModal(null)} />
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
                <p className="ending-subtitle">최대 자산 업적을 달성하였습니다!</p>
                <p className="ending-amount">9,999조원</p>
                <p className="ending-message">
                  당신은 전설의 부자가 되었습니다!<br />
                  이 업적은 영원히 기록됩니다.
                </p>
                <div className="ending-buttons">
                  <button
                    className="toss-button primary"
                    onClick={() => setActiveModal(null)}
                  >
                    계속 플레이
                  </button>
                  <button
                    className="toss-button secondary"
                    onClick={handleReset}
                  >
                    처음부터 다시하기
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
