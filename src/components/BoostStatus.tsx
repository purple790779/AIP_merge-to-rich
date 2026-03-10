import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { FaBolt, FaCoins, FaRobot } from 'react-icons/fa';
import type { BoostType } from '../types/game';
import { useGameStore } from '../store/useGameStore';

const BOOST_META: Record<BoostType, { label: string; className: string; icon: ReactNode }> = {
    AUTO_MERGE: { label: '자동 합성', className: 'auto-merge', icon: <FaRobot /> },
    DOUBLE_INCOME: { label: '수익 2배', className: 'double-income', icon: <FaCoins /> },
    AUTO_SPAWN: { label: '자동 생산', className: 'auto-spawn', icon: <FaBolt /> },
};

export function BoostStatus() {
    const activeBoosts = useGameStore((state) => state.activeBoosts);
    const [now, setNow] = useState(() => Date.now());
    const [openBoostType, setOpenBoostType] = useState<BoostType | null>(null);

    useEffect(() => {
        const timerId = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timerId);
    }, []);

    useEffect(() => {
        if (!openBoostType) return;

        const timerId = window.setTimeout(() => {
            setOpenBoostType(null);
        }, 1600);

        return () => window.clearTimeout(timerId);
    }, [openBoostType]);

    const runningBoosts = activeBoosts.filter((boost) => boost.endTime > now);

    const formatRemaining = (endTime: number) => {
        const remainingSeconds = Math.max(0, Math.ceil((endTime - now) / 1000));
        if (remainingSeconds >= 60) return `${Math.ceil(remainingSeconds / 60)}분`;
        return `${remainingSeconds}초`;
    };

    if (runningBoosts.length === 0) return null;

    return (
        <div className="boost-status" role="toolbar" aria-label="활성 부스트">
            {runningBoosts.map((boost) => {
                const meta = BOOST_META[boost.type];
                const isOpen = openBoostType === boost.type;
                const tooltipText = `${meta.label} · ${formatRemaining(boost.endTime)}`;

                return (
                    <button
                        key={boost.type}
                        type="button"
                        className={`boost-icon-button ${meta.className} ${isOpen ? 'is-open' : ''}`}
                        onClick={() => setOpenBoostType((current) => (current === boost.type ? null : boost.type))}
                        aria-label={tooltipText}
                        title={tooltipText}
                    >
                        <span className="boost-chip-icon">{meta.icon}</span>
                        {isOpen && <span className="boost-tooltip">{tooltipText}</span>}
                    </button>
                );
            })}
        </div>
    );
}
