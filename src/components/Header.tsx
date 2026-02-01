import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { FaChartLine } from 'react-icons/fa';

// 숫자를 한국 원화 형식으로 포맷 (소수점 버림)
function formatMoney(amount: number): string {
    const rounded = Math.floor(amount);
    if (rounded >= 100000000) {
        return `${(rounded / 100000000).toFixed(1)}억`;
    }
    if (rounded >= 10000) {
        return `${(rounded / 10000).toFixed(1)}만`;
    }
    return rounded.toLocaleString();
}

export function Header() {
    const totalMoney = useGameStore(state => state.totalMoney);
    const pps = useGameStore(state => state.pps);
    const incomeInterval = useGameStore(state => state.incomeInterval);
    const addMoney = useGameStore(state => state.addMoney);

    const prevMoneyRef = useRef(totalMoney);
    const ppsRef = useRef(pps);
    const addMoneyRef = useRef(addMoney);
    const isIncreasing = totalMoney > prevMoneyRef.current;

    useEffect(() => {
        prevMoneyRef.current = totalMoney;
    }, [totalMoney]);

    // PPS에 따른 수익 발생 (incomeInterval마다)
    useEffect(() => {
        ppsRef.current = pps;
    }, [pps]);

    useEffect(() => {
        addMoneyRef.current = addMoney;
    }, [addMoney]);

    useEffect(() => {
        const interval = setInterval(() => {
            const currentPps = ppsRef.current;
            if (currentPps > 0) {
                addMoneyRef.current(currentPps);
            }
        }, incomeInterval);

        return () => clearInterval(interval);
    }, [incomeInterval]);

    return (
        <div className="header-container">
            {/* 총 자산 */}
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

            {/* PPS 표시 */}
            <div className="pps-card">
                <span className="pps-label">
                    <FaChartLine style={{ display: 'inline', marginRight: 6 }} />
                    {incomeInterval / 1000}초당 수익
                </span>
                <motion.span
                    key={pps}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="pps-value"
                >
                    +{formatMoney(pps)}원
                </motion.span>
            </div>
        </div>
    );
}
