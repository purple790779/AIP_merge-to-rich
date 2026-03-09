import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaChartLine } from 'react-icons/fa';
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
                        {formatMoney(totalMoney)}원
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="pps-card">
                <div className="pps-info">
                    <span className="pps-label">
                        <FaChartLine style={{ display: 'inline', marginRight: 6 }} />
                        {incomeInterval / 1000}초마다 수익
                    </span>
                    <motion.span
                        key={`${incomePerTick}-${incomeMultiplierLevel}-${boostMultiplier}`}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="pps-value"
                    >
                        +{formatMoney(effectiveIncome)}원
                    </motion.span>
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
