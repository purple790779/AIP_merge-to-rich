import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { COIN_LEVELS } from '../types/game';
import { IoClose } from 'react-icons/io5';
import { FaArrowUp, FaShoppingBag, FaChartLine, FaGem, FaPercentage, FaTimes, FaRobot } from 'react-icons/fa';
import { FaBolt } from 'react-icons/fa';

interface StoreModalProps {
    onClose: () => void;
}

export function StoreModal({ onClose }: StoreModalProps) {
    const totalMoney = useGameStore(state => state.totalMoney);
    const spawnLevel = useGameStore(state => state.spawnLevel);
    const spawnCooldown = useGameStore(state => state.spawnCooldown);
    const incomeInterval = useGameStore(state => state.incomeInterval);
    const mergeBonusLevel = useGameStore(state => state.mergeBonusLevel);
    const gemSystemUnlocked = useGameStore(state => state.gemSystemUnlocked);
    const incomeMultiplierLevel = useGameStore(state => state.incomeMultiplierLevel) ?? 0;
    const autoMergeInterval = useGameStore(state => state.autoMergeInterval) ?? 5000;

    const upgradeSpawnLevel = useGameStore(state => state.upgradeSpawnLevel);
    const upgradeSpeed = useGameStore(state => state.upgradeSpeed);
    const upgradeIncomeSpeed = useGameStore(state => state.upgradeIncomeSpeed);
    const upgradeMergeBonus = useGameStore(state => state.upgradeMergeBonus);
    const unlockGemSystem = useGameStore(state => state.unlockGemSystem);
    const upgradeIncomeMultiplier = useGameStore(state => state.upgradeIncomeMultiplier);
    const upgradeAutoMergeSpeed = useGameStore(state => state.upgradeAutoMergeSpeed);

    // 비용 계산
    const levelCost = 5000 * Math.pow(spawnLevel, 3.5);

    // 생산 속도 레벨 (1~10) - 비용 증가
    const speedLevel = Math.floor((5000 - spawnCooldown) / 500) + 1;
    const speedCost = 3000 * Math.pow(speedLevel, 2.8);
    const isMaxSpeed = spawnCooldown <= 200;
    const isMaxLevel = spawnLevel >= 11;

    // 수익 속도 레벨 (1~90) - 비용 대폭 증가
    const incomeLevel = Math.floor((10000 - incomeInterval) / 100) + 1;
    const incomeCost = 5000 * Math.pow(incomeLevel, 3.0);
    const isMaxIncome = incomeInterval <= 1000;

    // 머지 보너스 (0.5% 단위, 최대 60레벨 = 30%)
    const mergeBonusCost = 1000 * Math.pow(mergeBonusLevel + 1, 2.5);
    const isMaxMergeBonus = mergeBonusLevel >= 60;

    // 보석 시스템 해금
    const gemCost = 1000000000; // 10억원

    // 신규: 수익 배율
    const incomeMultiplierCost = Math.floor(15000 * Math.pow(incomeMultiplierLevel + 1, 2.8));
    const isMaxIncomeMultiplier = incomeMultiplierLevel >= 80;
    const currentMultiplier = (1.0 + incomeMultiplierLevel * 0.1).toFixed(1);

    // 신규: 자동 병합 속도
    const autoMergeLevel = Math.floor((5000 - autoMergeInterval) / 200) + 1;
    const autoMergeCost = Math.floor(25000 * Math.pow(autoMergeLevel, 3.0));
    const isMaxAutoMerge = autoMergeInterval <= 200;

    // 공통 업그레이드 핸들러 (성공=짧은 진동, 실패=긴 진동)
    const handleUpgrade = (upgradeFn: () => boolean, isSpecial = false) => () => {
        if (upgradeFn()) {
            if (navigator.vibrate) navigator.vibrate(isSpecial ? [100, 50, 100, 50, 100] : [50, 50, 50]);
        } else {
            if (navigator.vibrate) navigator.vibrate(200);
        }
    };

    const handleBuyLevel = handleUpgrade(upgradeSpawnLevel);
    const handleBuySpeed = handleUpgrade(upgradeSpeed);
    const handleBuyIncome = handleUpgrade(upgradeIncomeSpeed);
    const handleBuyMergeBonus = handleUpgrade(upgradeMergeBonus);
    const handleBuyGem = handleUpgrade(unlockGemSystem, true);
    const handleBuyIncomeMultiplier = handleUpgrade(upgradeIncomeMultiplier);
    const handleBuyAutoMergeSpeed = handleUpgrade(upgradeAutoMergeSpeed);

    const formatMoney = (amount: number): string => {
        if (amount >= 100000000) {
            return `${(amount / 100000000).toFixed(1)}억`;
        }
        if (amount >= 10000) {
            return `${(amount / 10000).toFixed(0)}만`;
        }
        return amount.toLocaleString();
    };

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal-container toss-modal"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="modal-header">
                    <div className="modal-title-row">
                        <div className="modal-icon store">
                            <FaShoppingBag />
                        </div>
                        <h2>상점</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <IoClose />
                    </button>
                </div>

                {/* 잔액 표시 */}
                <div className="store-balance">
                    <span className="balance-label">내 자산</span>
                    <span className="balance-amount">{formatMoney(totalMoney)}원</span>
                </div>

                {/* 컨텐츠 */}
                <div className="modal-content scrollable">
                    {/* 1. 시작 레벨 업그레이드 */}
                    <div className="upgrade-card">
                        <div className="upgrade-header">
                            <div className="upgrade-icon level emoji-icon">
                                <span>{COIN_LEVELS[spawnLevel]?.emoji || '🪙'}</span>
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">시작 레벨</div>
                                <div className="upgrade-desc">생성 레벨이 올라갑니다. 하위 코인 자동 환원. (Max Lv.11)</div>
                            </div>
                            <div className="upgrade-level">Lv.{spawnLevel}</div>
                        </div>

                        <div className="upgrade-preview">
                            <span className="preview-emoji">{COIN_LEVELS[spawnLevel]?.emoji}</span>
                            <FaArrowUp className="preview-arrow" />
                            <span className="preview-emoji">{COIN_LEVELS[spawnLevel + 1]?.emoji || '🏆'}</span>
                        </div>

                        <button
                            onClick={handleBuyLevel}
                            disabled={totalMoney < levelCost || isMaxLevel}
                            className={`toss-button ${totalMoney >= levelCost && !isMaxLevel ? 'primary' : 'disabled'}`}
                        >
                            {isMaxLevel ? '최대 레벨' : `${formatMoney(levelCost)}원`}
                        </button>
                    </div>

                    {/* 2. 머지 보너스 (일반) */}
                    <div className="upgrade-card">
                        <div className="upgrade-header">
                            <div className="upgrade-icon merge">
                                <FaPercentage />
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">🎯 머지 보너스</div>
                                <div className="upgrade-desc">10% 확률로 {(mergeBonusLevel * 0.5).toFixed(1)}% 보너스 (Max Lv.60 → 30%)</div>
                            </div>
                            <div className="upgrade-level">Lv.{mergeBonusLevel}</div>
                        </div>

                        <button
                            onClick={handleBuyMergeBonus}
                            disabled={totalMoney < mergeBonusCost || isMaxMergeBonus}
                            className={`toss-button ${totalMoney >= mergeBonusCost && !isMaxMergeBonus ? 'gold' : 'disabled'}`}
                        >
                            {isMaxMergeBonus ? '최대 보너스' : `${formatMoney(Math.floor(mergeBonusCost))}원`}
                        </button>
                    </div>

                    {/* 3. 수익 속도 (일반) */}
                    <div className="upgrade-card">
                        <div className="upgrade-header">
                            <div className="upgrade-icon income">
                                <FaChartLine />
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">📈 수익 속도</div>
                                <div className="upgrade-desc">현재 간격: {(incomeInterval / 1000).toFixed(1)}초 (Max Lv.90 → 1.0초)</div>
                            </div>
                            <div className="upgrade-level">Lv.{incomeLevel}</div>
                        </div>

                        <button
                            onClick={handleBuyIncome}
                            disabled={totalMoney < incomeCost || isMaxIncome}
                            className={`toss-button ${totalMoney >= incomeCost && !isMaxIncome ? 'secondary' : 'disabled'}`}
                        >
                            {isMaxIncome ? '최대 속도' : `${formatMoney(Math.floor(incomeCost))}원`}
                        </button>
                    </div>

                    {/* --- 부스트 관련 업그레이드 --- */}

                    {/* 4. 자동 병합 속도 (부스트: AUTO_MERGE) */}
                    <div className="upgrade-card">
                        <div className="upgrade-header">
                            <div className="upgrade-icon" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                                <FaRobot />
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">🤖 자동 병합 속도</div>
                                <div className="upgrade-desc">부스트 시 간격: {(autoMergeInterval / 1000).toFixed(1)}초 (Max Lv.24 → 0.2초)</div>
                            </div>
                            <div className="upgrade-level">Lv.{autoMergeLevel}</div>
                        </div>

                        <button
                            onClick={handleBuyAutoMergeSpeed}
                            disabled={totalMoney < autoMergeCost || isMaxAutoMerge}
                            className={`toss-button ${totalMoney >= autoMergeCost && !isMaxAutoMerge ? 'gold' : 'disabled'}`}
                        >
                            {isMaxAutoMerge ? '최대 속도 (0.2초)' : `${formatMoney(autoMergeCost)}원`}
                        </button>
                    </div>

                    {/* 5. 수익 배율 (부스트: DOUBLE_INCOME 연관) */}
                    <div className="upgrade-card">
                        <div className="upgrade-header">
                            <div className="upgrade-icon income">
                                <FaTimes />
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">💰 수익 배율</div>
                                <div className="upgrade-desc">기본 수익에 {currentMultiplier}배 상시 적용 (2배 부스트와 중첩, Max Lv.80 → 9.0배)</div>
                            </div>
                            <div className="upgrade-level">Lv.{incomeMultiplierLevel}</div>
                        </div>

                        <button
                            onClick={handleBuyIncomeMultiplier}
                            disabled={totalMoney < incomeMultiplierCost || isMaxIncomeMultiplier}
                            className={`toss-button ${totalMoney >= incomeMultiplierCost && !isMaxIncomeMultiplier ? 'tertiary' : 'disabled'}`}
                        >
                            {isMaxIncomeMultiplier ? '최대 배율 (9.0x)' : `${formatMoney(incomeMultiplierCost)}원`}
                        </button>
                    </div>

                    {/* 6. 자동 생산 속도 (부스트: AUTO_SPAWN) */}
                    <div className="upgrade-card">
                        <div className="upgrade-header">
                            <div className="upgrade-icon speed">
                                <FaBolt />
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">⚡ 자동 생산 속도</div>
                                <div className="upgrade-desc">부스트 시 쿨타임: {(spawnCooldown / 1000).toFixed(1)}초 (Max Lv.10 → 0.2초)</div>
                            </div>
                            <div className="upgrade-level">Lv.{speedLevel}</div>
                        </div>

                        <button
                            onClick={handleBuySpeed}
                            disabled={totalMoney < speedCost || isMaxSpeed}
                            className={`toss-button ${totalMoney >= speedCost && !isMaxSpeed ? 'primary' : 'disabled'}`}
                        >
                            {isMaxSpeed ? '최대 속도' : `${formatMoney(Math.floor(speedCost))}원`}
                        </button>
                    </div>

                    {/* 7. 보석 시스템 해금 (항상 맨 밑) */}
                    <div className="upgrade-card special">
                        <div className="upgrade-header">
                            <div className="upgrade-icon gem">
                                <FaGem />
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">💎 보석 시스템</div>
                                <div className="upgrade-desc">
                                    {gemSystemUnlocked
                                        ? '해금됨! 토스 빌딩 이후 보석으로 업그레이드 가능'
                                        : '토스 빌딩 이후 보석 단계 해금'}
                                </div>
                            </div>
                            {gemSystemUnlocked && <div className="upgrade-level">✓</div>}
                        </div>

                        <button
                            onClick={handleBuyGem}
                            disabled={totalMoney < gemCost || gemSystemUnlocked}
                            className={`toss-button ${gemSystemUnlocked ? 'unlocked' : (totalMoney >= gemCost ? 'rainbow' : 'disabled')}`}
                        >
                            {gemSystemUnlocked ? '해금 완료!' : `${formatMoney(gemCost)}원`}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
