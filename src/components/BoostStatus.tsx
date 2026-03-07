import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { FaBolt, FaCoins, FaRobot } from 'react-icons/fa';
import type { BoostType } from '../types/game';
import { useGameStore } from '../store/useGameStore';

const BOOST_META: Record<BoostType, { label: string; className: string; icon: ReactNode }> = {
    AUTO_MERGE: { label: '자동 병합', className: 'auto-merge', icon: <FaRobot /> },
    DOUBLE_INCOME: { label: '수익 2배', className: 'double-income', icon: <FaCoins /> },
    AUTO_SPAWN: { label: '자동 생산', className: 'auto-spawn', icon: <FaBolt /> },
};

export function BoostStatus() {
    const activeBoosts = useGameStore(state => state.activeBoosts);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    const runningBoosts = activeBoosts.filter(boost => boost.endTime > now);

    const formatRemaining = (endTime: number) => {
        const remainingSec = Math.max(0, Math.ceil((endTime - now) / 1000));
        if (remainingSec >= 60) return `${Math.ceil(remainingSec / 60)}분`;
        return `${remainingSec}초`;
    };

    return (
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
    );
}
