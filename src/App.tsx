import { useEffect, useState } from 'react';
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
  BoostModal
} from './components';
import { useGameStore } from './store/useGameStore';
import type { BoostType } from './types/game';
import { FaBolt, FaCoins, FaRobot, FaQuestion } from 'react-icons/fa';
import { IoSettingsSharp } from 'react-icons/io5';
import { AnimatePresence } from 'framer-motion';

type ModalType = 'store' | 'collection' | 'help' | 'settings' | 'boost' | null;

const BOOST_META: Record<BoostType, { label: string; className: string; icon: ReactNode }> = {
  AUTO_MERGE: { label: '자동 병합', className: 'auto-merge', icon: <FaRobot /> },
  DOUBLE_INCOME: { label: '수익 2배', className: 'double-income', icon: <FaCoins /> },
  AUTO_SPAWN: { label: '자동 생산', className: 'auto-spawn', icon: <FaBolt /> },
};

function App() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const activeBoosts = useGameStore(state => state.activeBoosts);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const runningBoosts = activeBoosts.filter(boost => boost.endTime > now);

  const formatRemaining = (endTime: number) => {
    const remainingSec = Math.max(0, Math.ceil((endTime - now) / 1000));
    if (remainingSec >= 60) return `${Math.ceil(remainingSec / 60)}분`;
    return `${remainingSec}초`;
  };

  return (
    <div className="game-container">
      {/* 게임 타이틀 + 헤더 아이콘 */}
      <div className="title-row">
        <h1 className="game-title">
          <FaCoins className="game-title-icon" style={{ color: '#fbbf24' }} />
          <span>머지 머니 타이쿤</span>
        </h1>
        <div className="title-actions">
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
      </AnimatePresence>
    </div>
  );
}

export default App;
