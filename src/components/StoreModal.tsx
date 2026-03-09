import { motion } from 'framer-motion';
import { FaArrowUp, FaBolt, FaChartLine, FaGem, FaPercentage, FaRobot, FaShoppingBag, FaTimes } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { useGameStore } from '../store/useGameStore';
import { COIN_LEVELS } from '../types/game';
import { formatMoney } from '../utils/formatMoney';
import {
    ECONOMY_LIMITS,
    getAutoMergeUpgradeCost,
    getAutoMergeUpgradeLevel,
    getIncomeMultiplier,
    getIncomeMultiplierUpgradeCost,
    getIncomeSpeedUpgradeCost,
    getIncomeSpeedUpgradeLevel,
    getMergeBonusAveragePercent,
    getMergeBonusPercent,
    getMergeBonusUpgradeCost,
    getSpawnLevelUpgradeCost,
    getSpawnSpeedUpgradeCost,
    getSpawnSpeedUpgradeLevel,
} from '../game/economy';

interface StoreModalProps {
    onClose: () => void;
}

export function StoreModal({ onClose }: StoreModalProps) {
    const totalMoney = useGameStore((state) => state.totalMoney);
    const spawnLevel = useGameStore((state) => state.spawnLevel);
    const spawnCooldown = useGameStore((state) => state.spawnCooldown);
    const incomeInterval = useGameStore((state) => state.incomeInterval);
    const mergeBonusLevel = useGameStore((state) => state.mergeBonusLevel);
    const gemSystemUnlocked = useGameStore((state) => state.gemSystemUnlocked);
    const incomeMultiplierLevel = useGameStore((state) => state.incomeMultiplierLevel) ?? 0;
    const autoMergeInterval = useGameStore((state) => state.autoMergeInterval) ?? 5000;

    const upgradeSpawnLevel = useGameStore((state) => state.upgradeSpawnLevel);
    const upgradeSpeed = useGameStore((state) => state.upgradeSpeed);
    const upgradeIncomeSpeed = useGameStore((state) => state.upgradeIncomeSpeed);
    const upgradeMergeBonus = useGameStore((state) => state.upgradeMergeBonus);
    const unlockGemSystem = useGameStore((state) => state.unlockGemSystem);
    const upgradeIncomeMultiplier = useGameStore((state) => state.upgradeIncomeMultiplier);
    const upgradeAutoMergeSpeed = useGameStore((state) => state.upgradeAutoMergeSpeed);

    const levelCost = getSpawnLevelUpgradeCost(spawnLevel);
    const speedLevel = getSpawnSpeedUpgradeLevel(spawnCooldown);
    const speedCost = getSpawnSpeedUpgradeCost(spawnCooldown);
    const isMaxSpeed = spawnCooldown <= ECONOMY_LIMITS.minSpawnCooldown;
    const isMaxLevel = spawnLevel >= ECONOMY_LIMITS.maxSpawnLevel;

    const incomeLevel = getIncomeSpeedUpgradeLevel(incomeInterval);
    const incomeCost = getIncomeSpeedUpgradeCost(incomeInterval);
    const isMaxIncome = incomeInterval <= ECONOMY_LIMITS.minIncomeInterval;

    const mergeBonusCost = getMergeBonusUpgradeCost(mergeBonusLevel);
    const mergeBonusPercent = getMergeBonusPercent(mergeBonusLevel);
    const mergeBonusAveragePercent = getMergeBonusAveragePercent(mergeBonusLevel);
    const isMaxMergeBonus = mergeBonusLevel >= ECONOMY_LIMITS.maxMergeBonusLevel;

    const gemCost = ECONOMY_LIMITS.gemUnlockCost;

    const incomeMultiplierCost = getIncomeMultiplierUpgradeCost(incomeMultiplierLevel);
    const isMaxIncomeMultiplier = incomeMultiplierLevel >= ECONOMY_LIMITS.maxIncomeMultiplierLevel;
    const currentMultiplier = getIncomeMultiplier(incomeMultiplierLevel).toFixed(1);

    const autoMergeLevel = getAutoMergeUpgradeLevel(autoMergeInterval);
    const autoMergeCost = getAutoMergeUpgradeCost(autoMergeInterval);
    const isMaxAutoMerge = autoMergeInterval <= ECONOMY_LIMITS.minAutoMergeInterval;

    const handleUpgrade = (upgradeFn: () => boolean, isSpecial = false) => () => {
        if (upgradeFn()) {
            if (navigator.vibrate) navigator.vibrate(isSpecial ? [100, 50, 100, 50, 100] : [50, 50, 50]);
            return;
        }

        if (navigator.vibrate) navigator.vibrate(200);
    };

    return (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div
                className="modal-container toss-modal"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(event) => event.stopPropagation()}
            >
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

                <div className="store-balance">
                    <span className="balance-label">보유 자산</span>
                    <span className="balance-amount">{formatMoney(totalMoney)}원</span>
                </div>

                <div className="modal-content scrollable">
                    <div className="upgrade-card">
                        <div className="upgrade-header">
                            <div className="upgrade-icon level emoji-icon">
                                <span>{COIN_LEVELS[spawnLevel]?.emoji ?? '🪙'}</span>
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">시작 레벨</div>
                                <div className="upgrade-desc">생성 코인의 기본 레벨을 올립니다. 하위 코인은 자동으로 환급됩니다.</div>
                            </div>
                            <div className="upgrade-level">Lv.{spawnLevel}</div>
                        </div>

                        <div className="upgrade-preview">
                            <span className="preview-emoji">{COIN_LEVELS[spawnLevel]?.emoji}</span>
                            <FaArrowUp className="preview-arrow" />
                            <span className="preview-emoji">{COIN_LEVELS[spawnLevel + 1]?.emoji ?? '🏁'}</span>
                        </div>

                        <button onClick={handleUpgrade(upgradeSpawnLevel)} disabled={totalMoney < levelCost || isMaxLevel} className={`toss-button ${totalMoney >= levelCost && !isMaxLevel ? 'primary' : 'disabled'}`}>
                            {isMaxLevel ? '최대 레벨' : `${formatMoney(levelCost)}원`}
                        </button>
                    </div>

                    <div className="upgrade-card">
                        <div className="upgrade-header">
                            <div className="upgrade-icon merge">
                                <FaPercentage />
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">머지 보너스</div>
                                <div className="upgrade-desc">10% 확률로 추가 보너스를 얻습니다. 평균 기대 보너스는 +{mergeBonusAveragePercent.toFixed(1)}%입니다.</div>
                            </div>
                            <div className="upgrade-level">Lv.{mergeBonusLevel}</div>
                        </div>

                        <button onClick={handleUpgrade(upgradeMergeBonus)} disabled={totalMoney < mergeBonusCost || isMaxMergeBonus} className={`toss-button ${totalMoney >= mergeBonusCost && !isMaxMergeBonus ? 'gold' : 'disabled'}`}>
                            {isMaxMergeBonus ? `최대 보너스 (${mergeBonusPercent.toFixed(1)}%)` : `${formatMoney(Math.floor(mergeBonusCost))}원`}
                        </button>
                    </div>

                    <div className="upgrade-card">
                        <div className="upgrade-header">
                            <div className="upgrade-icon income">
                                <FaChartLine />
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">수익 주기</div>
                                <div className="upgrade-desc">수익이 지급되는 간격을 줄입니다. 현재 {Math.max(1, incomeInterval / 1000).toFixed(1)}초마다 지급됩니다.</div>
                            </div>
                            <div className="upgrade-level">Lv.{incomeLevel}</div>
                        </div>

                        <button onClick={handleUpgrade(upgradeIncomeSpeed)} disabled={totalMoney < incomeCost || isMaxIncome} className={`toss-button ${totalMoney >= incomeCost && !isMaxIncome ? 'secondary' : 'disabled'}`}>
                            {isMaxIncome ? '최대 속도' : `${formatMoney(Math.floor(incomeCost))}원`}
                        </button>
                    </div>

                    <div className="upgrade-card">
                        <div className="upgrade-header">
                            <div className="upgrade-icon" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                                <FaRobot />
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">자동 병합 속도</div>
                                <div className="upgrade-desc">자동 병합 부스트 중 병합 주기를 줄입니다. 현재 {Math.max(0.2, autoMergeInterval / 1000).toFixed(1)}초</div>
                            </div>
                            <div className="upgrade-level">Lv.{autoMergeLevel}</div>
                        </div>

                        <button onClick={handleUpgrade(upgradeAutoMergeSpeed)} disabled={totalMoney < autoMergeCost || isMaxAutoMerge} className={`toss-button ${totalMoney >= autoMergeCost && !isMaxAutoMerge ? 'gold' : 'disabled'}`}>
                            {isMaxAutoMerge ? '최대 속도 (0.2초)' : `${formatMoney(autoMergeCost)}원`}
                        </button>
                    </div>

                    <div className="upgrade-card">
                        <div className="upgrade-header">
                            <div className="upgrade-icon income">
                                <FaTimes />
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">수익 배율</div>
                                <div className="upgrade-desc">기본 수익에 항상 적용되는 영구 배율입니다. 광고형 2배 부스트와도 중첩됩니다.</div>
                            </div>
                            <div className="upgrade-level">Lv.{incomeMultiplierLevel}</div>
                        </div>

                        <button onClick={handleUpgrade(upgradeIncomeMultiplier)} disabled={totalMoney < incomeMultiplierCost || isMaxIncomeMultiplier} className={`toss-button ${totalMoney >= incomeMultiplierCost && !isMaxIncomeMultiplier ? 'tertiary' : 'disabled'}`}>
                            {isMaxIncomeMultiplier ? `최대 배율 (${currentMultiplier}x)` : `${formatMoney(incomeMultiplierCost)}원`}
                        </button>
                    </div>

                    <div className="upgrade-card">
                        <div className="upgrade-header">
                            <div className="upgrade-icon speed">
                                <FaBolt />
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">자동 생산 속도</div>
                                <div className="upgrade-desc">자동 생산 부스트 중 코인 생성 속도를 줄입니다. 현재 {Math.max(0.2, spawnCooldown / 1000).toFixed(1)}초</div>
                            </div>
                            <div className="upgrade-level">Lv.{speedLevel}</div>
                        </div>

                        <button onClick={handleUpgrade(upgradeSpeed)} disabled={totalMoney < speedCost || isMaxSpeed} className={`toss-button ${totalMoney >= speedCost && !isMaxSpeed ? 'primary' : 'disabled'}`}>
                            {isMaxSpeed ? '최대 속도' : `${formatMoney(Math.floor(speedCost))}원`}
                        </button>
                    </div>

                    <div className="upgrade-card special">
                        <div className="upgrade-header">
                            <div className="upgrade-icon gem">
                                <FaGem />
                            </div>
                            <div className="upgrade-info">
                                <div className="upgrade-title">보석 시스템</div>
                                <div className="upgrade-desc">
                                    {gemSystemUnlocked
                                        ? '해금 완료. 토스 빌딩 이후 보석 단계로 진입할 수 있습니다.'
                                        : '토스 빌딩 이후 보석 단계로 확장할 수 있는 기능입니다.'}
                                </div>
                            </div>
                            {gemSystemUnlocked && <div className="upgrade-level">완료</div>}
                        </div>

                        <button onClick={handleUpgrade(unlockGemSystem, true)} disabled={totalMoney < gemCost || gemSystemUnlocked} className={`toss-button ${gemSystemUnlocked ? 'unlocked' : (totalMoney >= gemCost ? 'rainbow' : 'disabled')}`}>
                            {gemSystemUnlocked ? '해금 완료' : `${formatMoney(gemCost)}원`}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
