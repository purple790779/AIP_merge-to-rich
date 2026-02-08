import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { FaChartLine } from 'react-icons/fa';

// 숫자를 한국 원화 형식으로 포맷 (억 단위까지 숫자, 조 단위부터 축약, 최대 9999조)
function formatMoney(amount: number): string {
    const rounded = Math.floor(amount);
    const maxValue = 9999 * 1000000000000; // 9999조
    const capped = Math.min(rounded, maxValue);

    if (capped >= 1000000000000) {
        // 조 단위 (1조 이상) - 억 단위도 함께 표시
        const jo = Math.floor(capped / 1000000000000);
        const eok = Math.floor((capped % 1000000000000) / 100000000);
        if (eok > 0) {
            return `${jo.toLocaleString()}조 ${eok}억`;
        }
        return `${jo.toLocaleString()}조`;
    }
    if (capped >= 100000000) {
        // 억 단위 (1억 이상)
        return `${Math.floor(capped / 100000000).toLocaleString()}억`;
    }
    if (capped >= 10000) {
        // 만 단위
        return `${(capped / 10000).toFixed(1)}만`;
    }
    return capped.toLocaleString();
}

export function Header() {
    const totalMoney = useGameStore(state => state.totalMoney);
    const pps = useGameStore(state => state.pps);
    const incomeInterval = useGameStore(state => state.incomeInterval);
    const addMoney = useGameStore(state => state.addMoney);

    const prevMoneyRef = useRef(totalMoney);
    const ppsRef = useRef(pps);
    const addMoneyRef = useRef(addMoney);
    const [isIncreasing, setIsIncreasing] = useState(false);

    // 수익 프로그레스바 상태
    const [incomeProgress, setIncomeProgress] = useState(0);
    const startTimeRef = useRef(0);

    useEffect(() => {
        setIsIncreasing(totalMoney > prevMoneyRef.current);
        prevMoneyRef.current = totalMoney;
    }, [totalMoney]);

    // PPS에 따른 수익 발생 (incomeInterval마다)
    useEffect(() => {
        ppsRef.current = pps;
    }, [pps]);

    useEffect(() => {
        addMoneyRef.current = addMoney;
    }, [addMoney]);

    // 수익 프로그레스바 애니메이션
    useEffect(() => {
        let animationId: number;
        startTimeRef.current = Date.now();

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTimeRef.current;
            const progress = (elapsed / incomeInterval) * 100;

            if (progress >= 100) {
                // 수익 지급
                const currentPps = ppsRef.current;
                if (currentPps > 0) {
                    addMoneyRef.current(currentPps);
                }
                startTimeRef.current = now;
                setIncomeProgress(0);
            } else {
                setIncomeProgress(progress);
            }

            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
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

            {/* PPS 표시 + 프로그레스바 */}
            <div className="pps-card">
                <div className="pps-info">
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
                {/* 수익 프로그레스바 */}
                <div className="income-progress-bar">
                    <motion.div
                        className="income-progress-fill"
                        style={{ width: `${incomeProgress}%` }}
                        transition={{ duration: 0.1 }}
                    />
                </div>
            </div>
        </div>
    );
}
