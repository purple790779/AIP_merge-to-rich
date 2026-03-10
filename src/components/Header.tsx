import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getBoostMultiplier, getIncomeMultiplier } from '../game/economy';
import { formatMoney } from '../utils/formatMoney';
import { useGameStore } from '../store/useGameStore';

export function Header() {
    const totalMoney = useGameStore((state) => state.totalMoney);
    const incomePerTick = useGameStore((state) => state.incomePerTick);
    const incomeInterval = useGameStore((state) => state.incomeInterval);
    const incomeMultiplierLevel = useGameStore((state) => state.incomeMultiplierLevel) ?? 0;
    const activeBoosts = useGameStore((state) => state.activeBoosts);
    const grantMoney = useGameStore((state) => state.grantMoney);

    const prevMoneyRef = useRef(totalMoney);
    const incomePerTickRef = useRef(incomePerTick);
    const grantMoneyRef = useRef(grantMoney);
    const [isIncreasing, setIsIncreasing] = useState(false);
    const [progressCycleKey, setProgressCycleKey] = useState(0);

    const boostMultiplier = getBoostMultiplier(activeBoosts);
    const incomeMultiplier = getIncomeMultiplier(incomeMultiplierLevel);
    const effectiveIncome = Math.floor(incomePerTick * incomeMultiplier * boostMultiplier);
    const incomeCycleLabel = `${incomeInterval / 1000}초마다 자동 수익`;

    useEffect(() => {
        setIsIncreasing(totalMoney > prevMoneyRef.current);
        prevMoneyRef.current = totalMoney;
    }, [totalMoney]);

    useEffect(() => {
        incomePerTickRef.current = incomePerTick;
    }, [incomePerTick]);

    useEffect(() => {
        grantMoneyRef.current = grantMoney;
    }, [grantMoney]);

    useEffect(() => {
        const timerId = window.setInterval(() => {
            const currentIncome = incomePerTickRef.current;
            if (currentIncome > 0) {
                grantMoneyRef.current(currentIncome, 'passive_income');
            }
            setProgressCycleKey((value) => value + 1);
        }, incomeInterval);

        return () => window.clearInterval(timerId);
    }, [incomeInterval]);

    return (
        <div className="header-container">
            <div className="header-card">
                <div className="header-main-row">
                    <div className="header-main-stat">
                        <div className="header-label">총 자산</div>
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={totalMoney}
                                initial={{ y: isIncreasing ? 10 : -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: isIncreasing ? -10 : 10, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="header-value"
                            >
                                {formatMoney(totalMoney)}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <motion.div
                        key={`${incomePerTick}-${incomeMultiplierLevel}-${boostMultiplier}`}
                        initial={{ scale: 1.04, opacity: 0.9 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="header-income-pill"
                    >
                        <span className="header-income-pill-label">{incomeCycleLabel}</span>
                        <span className="header-income-pill-value">+{formatMoney(effectiveIncome)}</span>
                    </motion.div>
                </div>

                <div className="income-progress-bar">
                    <div
                        key={`${incomeInterval}-${progressCycleKey}`}
                        className="income-progress-fill"
                        style={{ animationDuration: `${incomeInterval}ms` }}
                    />
                </div>
            </div>
        </div>
    );
}
