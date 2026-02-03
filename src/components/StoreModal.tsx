import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { COIN_LEVELS } from '../types/game';
import { IoClose } from 'react-icons/io5';
import { FaArrowUp, FaShoppingBag, FaChartLine, FaGem, FaPercentage } from 'react-icons/fa';
import { FaCoins, FaBolt } from 'react-icons/fa';

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
    const upgradeSpawnLevel = useGameStore(state => state.upgradeSpawnLevel);
    const upgradeSpeed = useGameStore(state => state.upgradeSpeed);
    const upgradeIncomeSpeed = useGameStore(state => state.upgradeIncomeSpeed);
    const upgradeMergeBonus = useGameStore(state => state.upgradeMergeBonus);
    const unlockGemSystem = useGameStore(state => state.unlockGemSystem);

    // 비용 계산
    const levelCost = 1000 * Math.pow(spawnLevel, 2);

    // 생산 속도 레벨 (1~10)
    const speedLevel = Math.floor((5000 - spawnCooldown) / 500) + 1;
    const speedCost = 500 * Math.pow(speedLevel, 1.5);
    const isMaxSpeed = spawnCooldown <= 200;
    const isMaxLevel = spawnLevel >= 11;

    // 수익 속도 레벨 (1~90)
    const incomeLevel = Math.floor((10000 - incomeInterval) / 100) + 1;
    const incomeCost = 300 * Math.pow(incomeLevel, 1.3);
    const isMaxIncome = incomeInterval <= 1000;

    // 머지 보너스
    const mergeBonusCost = 200 * Math.pow(mergeBonusLevel + 1, 1.4);
    const isMaxMergeBonus = mergeBonusLevel >= 50;

    // 보석 시스템 해금
    const gemCost = 100000000; // 1억원

    const handleBuyLevel = () => {
        if (upgradeSpawnLevel()) {
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        } else {
            if (navigator.vibrate) navigator.vibrate(200);
        }
    };

    const handleBuySpeed = () => {
        if (upgradeSpeed()) {
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        } else {
            if (navigator.vibrate) navigator.vibrate(200);
        }
    };

    const handleBuyIncome = () => {
        if (upgradeIncomeSpeed()) {
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        } else {
            if (navigator.vibrate) navigator.vibrate(200);
        }
    };

    const handleBuyMergeBonus = () => {
        if (upgradeMergeBonus()) {
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        } else {
            if (navigator.vibrate) navigator.vibrate(200);
        }
    };

    const handleBuyGem = () => {
        if (unlockGemSystem()) {
            if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
        } else {
            if (navigator.vibrate) navigator.vibrate(200);
        }
    };

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
                    {/* 레벨 업그레이드 */}
                    <div className="upgrade-card">
                        <div className="upgrade-header">
                            <div className="upgrade-icon level">
                                <FaCoins />
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">시작 레벨</div>
                                <div className="upgrade-desc">생성 레벨이 올라갑니다. 업그레이드 시 기존 하위 코인은 총자산으로 환원됩니다.</div>
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

                    {/* 생산 속도 업그레이드 */}
                    <div className="upgrade-card">
                        <div className="upgrade-header">
                            <div className="upgrade-icon speed">
                                <FaBolt />
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">자동 생산 속도</div>
                                <div className="upgrade-desc">부스트 시 쿨타임: {(spawnCooldown / 1000).toFixed(1)}초</div>
                            </div>
                            <div className="upgrade-level">Lv.{speedLevel}</div>
                        </div>

                        <button
                            onClick={handleBuySpeed}
                            disabled={totalMoney < speedCost || isMaxSpeed}
                            className={`toss-button ${totalMoney >= speedCost && !isMaxSpeed ? 'secondary' : 'disabled'}`}
                        >
                            {isMaxSpeed ? '최대 속도' : `${formatMoney(Math.floor(speedCost))}원`}
                        </button>
                    </div>

                    {/* 수익 속도 업그레이드 */}
                    <div className="upgrade-card">
                        <div className="upgrade-header">
                            <div className="upgrade-icon income">
                                <FaChartLine />
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">수익 속도</div>
                                <div className="upgrade-desc">현재 간격: {(incomeInterval / 1000).toFixed(1)}초</div>
                            </div>
                            <div className="upgrade-level">Lv.{incomeLevel}</div>
                        </div>

                        <button
                            onClick={handleBuyIncome}
                            disabled={totalMoney < incomeCost || isMaxIncome}
                            className={`toss-button ${totalMoney >= incomeCost && !isMaxIncome ? 'tertiary' : 'disabled'}`}
                        >
                            {isMaxIncome ? '최대 속도' : `${formatMoney(Math.floor(incomeCost))}원`}
                        </button>
                    </div>

                    {/* 머지 보너스 업그레이드 */}
                    <div className="upgrade-card">
                        <div className="upgrade-header">
                            <div className="upgrade-icon merge">
                                <FaPercentage />
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">머지 보너스</div>
                                <div className="upgrade-desc">합성 시 {mergeBonusLevel}% 보너스</div>
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

                    {/* 보석 시스템 해금 */}
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
