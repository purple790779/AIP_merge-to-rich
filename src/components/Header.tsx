import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { FaChartLine } from 'react-icons/fa';
import { formatMoney } from '../utils/formatMoney';



export function Header() {
    const totalMoney = useGameStore(state => state.totalMoney);
    const pps = useGameStore(state => state.pps);
    const incomeInterval = useGameStore(state => state.incomeInterval);
    const addMoney = useGameStore(state => state.addMoney);

    const prevMoneyRef = useRef(totalMoney);
    const ppsRef = useRef(pps);
    const addMoneyRef = useRef(addMoney);
    const [isIncreasing, setIsIncreasing] = useState(false);
    const [progressCycleKey, setProgressCycleKey] = useState(0);

    useEffect(() => {
        setIsIncreasing(totalMoney > prevMoneyRef.current);
        prevMoneyRef.current = totalMoney;
    }, [totalMoney]);

    // PPS???곕Ⅸ ?섏씡 諛쒖깮 (incomeInterval留덈떎)
    useEffect(() => {
        ppsRef.current = pps;
    }, [pps]);

    useEffect(() => {
        addMoneyRef.current = addMoney;
    }, [addMoney]);

    // incomeInterval留덈떎 ?섏씡 吏湲?+ 吏꾪뻾諛??ъ씠??由ъ뀑
    useEffect(() => {
        const timerId = window.setInterval(() => {
            const currentPps = ppsRef.current;
            if (currentPps > 0) {
                addMoneyRef.current(currentPps);
            }
            setProgressCycleKey(prev => prev + 1);
        }, incomeInterval);

        return () => {
            window.clearInterval(timerId);
        };
    }, [incomeInterval]);

    return (
        <div className="header-container">
            {/* 珥??먯궛 */}
            <div className="header-card">
                <div className="header-label">珥??먯궛</div>
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={totalMoney}
                        initial={{ y: isIncreasing ? 10 : -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: isIncreasing ? -10 : 10, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="header-value"
                    >
                        {formatMoney(totalMoney)}??
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* PPS ?쒖떆 + ?꾨줈洹몃젅?ㅻ컮 */}
            <div className="pps-card">
                <div className="pps-info">
                    <span className="pps-label">
                        <FaChartLine style={{ display: 'inline', marginRight: 6 }} />
                        {incomeInterval / 1000}珥덈떦 ?섏씡
                    </span>
                    <motion.span
                        key={pps}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="pps-value"
                    >
                        +{formatMoney(pps)}??
                    </motion.span>
                </div>
                {/* ?섏씡 ?꾨줈洹몃젅?ㅻ컮 */}
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
