import { useEffect, useState, useCallback, useRef } from 'react';
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
  BoostStatus,
  AchievementModal
} from './components';
import { useGameStore } from './store/useGameStore';
import { MAX_MONEY, ACHIEVEMENTS, COIN_LEVELS } from './types/game';
import { FaCoins, FaQuestion, FaTrophy } from 'react-icons/fa';
import { IoSettingsSharp } from 'react-icons/io5';
import { AnimatePresence, motion } from 'framer-motion';

type ModalType = 'store' | 'collection' | 'help' | 'settings' | 'boost' | 'achievement' | 'ending' | null;

function App() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const unlockedAchievements = useGameStore(state => state.unlockedAchievements);
  const resetGame = useGameStore(state => state.resetGame);
  const totalMoney = useGameStore(state => state.totalMoney);
  const lastDiscoveredLevel = useGameStore(state => state.lastDiscoveredLevel);
  const [showAchievementBadge, setShowAchievementBadge] = useState(false);
  const [celebrationText, setCelebrationText] = useState<string | null>(null);
  const [discoveryText, setDiscoveryText] = useState<string | null>(null);
  const hasSeenEndingRef = useRef(false);
  const prevUnlockedAchievementsRef = useRef<string[]>(unlockedAchievements);
  const discoveryShowTimerRef = useRef<number | null>(null);
  const discoveryHideTimerRef = useRef<number | null>(null);

  // ??肄붿씤 諛쒓껄 ?뚮┝
  useEffect(() => {
    if (lastDiscoveredLevel === null || lastDiscoveredLevel < 2) return;
    const coinInfo = COIN_LEVELS[lastDiscoveredLevel];
    if (!coinInfo) return;

    if (discoveryShowTimerRef.current) window.clearTimeout(discoveryShowTimerRef.current);
    if (discoveryHideTimerRef.current) window.clearTimeout(discoveryHideTimerRef.current);

    discoveryShowTimerRef.current = window.setTimeout(() => {
      setDiscoveryText(`??${coinInfo.emoji} ${coinInfo.name} 泥?蹂묓빀 ?깃났!`);
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
        setCelebrationText(`?럦 "${achievement.title}" ?낆쟻 ?ъ꽦!`);
        hideTimer = window.setTimeout(() => setCelebrationText(null), 3000);
      }
    }, 0);

    return () => {
      window.clearTimeout(showTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [unlockedAchievements]);

  // ?붾뵫 泥댄겕 (9999議??꾨떖)
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

  const handleOpenAchievement = () => {
    setShowAchievementBadge(false);
    setActiveModal('achievement');
  };

  // 寃뚯엫 由ъ뀑 (理쒕??먯궛 ?낆쟻? ?좎?)
  const handleReset = useCallback(() => {
    if (!window.confirm(' 정말 처음부터 다시 시작하시겠습니까?\n모든 코인, 자산, 업그레이드가 초기화됩니다.')) {
      return;
    }

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
      {/* ?낆쟻 異뺥븯 ?좎뒪??*/}
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

      {/* ??肄붿씤 諛쒓껄 ?좎뒪??*/}
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

      {/* 寃뚯엫 ??댄? + ?ㅻ뜑 ?꾩씠肄?*/}
      <div className="title-row">
        <h1 className="game-title">
          <FaCoins className="game-title-icon" style={{ color: '#fbbf24' }} />
          <span>癒몄? 癒몃땲 ??댁엘</span>
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

      {/* ?곷떒 ?뺣낫 */}
      <Header />

      {/* 寃뚯엫 蹂대뱶 */}
      <Board />

      {/* 遺?ㅽ듃 踰꾪듉 */}
      <div className="boost-row">
        <BoostStatus />
        <AdButton onClick={() => setActiveModal('boost')} />
      </div>

      {/* ?섎떒 而⑦듃濡?*/}
      <Controls
        onOpenStore={() => setActiveModal('store')}
        onOpenCollection={() => setActiveModal('collection')}
      />

      {/* 紐⑤떖 ?덉씠??*/}
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
                <div className="ending-trophy">?룇</div>
                <h2 className="ending-title">異뺥븯?⑸땲??</h2>
                <p className="ending-subtitle">理쒕? ?먯궛 ?낆쟻???ъ꽦?섏??듬땲??</p>
                <p className="ending-amount">9,999議곗썝</p>
                <p className="ending-message">
                  ?뱀떊? ?꾩꽕??遺?먭? ?섏뿀?듬땲??<br />
                  ???낆쟻? ?곸썝??湲곕줉?⑸땲??
                </p>
                <div className="ending-buttons">
                  <button
                    className="toss-button primary"
                    onClick={() => setActiveModal(null)}
                  >
                    怨꾩냽 ?뚮젅??
                  </button>
                  <button
                    className="toss-button secondary"
                    onClick={handleReset}
                  >
                    泥섏쓬遺???ㅼ떆?섍린
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
