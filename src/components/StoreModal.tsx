import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
    FaArrowUp,
    FaBolt,
    FaChartLine,
    FaCoins,
    FaGem,
    FaMagic,
    FaPercentage,
    FaRobot,
    FaShoppingBag,
    FaTimes,
} from 'react-icons/fa';
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
    getMergeBonusAverageStepPercent,
    getMergeBonusAveragePercent,
    getMergeBonusPercent,
    getMergeBonusUpgradeCost,
    getNextAutoMergeSpeedGainPercent,
    getNextIncomeSpeedGainPercent,
    getNextSpawnSpeedGainPercent,
    getSpawnLevelUpgradeCost,
    getSpawnSpeedUpgradeCost,
    getSpawnSpeedUpgradeLevel,
} from '../game/economy';
import { getNextLockedRegion } from '../game/worlds';

interface StoreModalProps {
    onClose: () => void;
}

interface StoreUpgradeCard {
    id: string;
    section: 'core' | 'automation' | 'special';
    title: string;
    description: string;
    icon: ReactNode;
    tone: 'blue' | 'amber' | 'emerald' | 'violet' | 'cyan' | 'rose';
    levelLabel: string;
    headlineMetric: string;
    detailMetric: string;
    roleLabel: string;
    progressPercent: number;
    cost: number;
    canAfford: boolean;
    isMax: boolean;
    ctaLabel: string;
    maxLabel: string;
    onUpgrade: () => boolean;
    isSpecial?: boolean;
}

function clampPercent(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
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
    const unlockedRegionIds = useGameStore((state) => state.unlockedRegionIds);

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
    const mergeBonusAverageStep = getMergeBonusAverageStepPercent(mergeBonusLevel);
    const isMaxMergeBonus = mergeBonusLevel >= ECONOMY_LIMITS.maxMergeBonusLevel;

    const gemCost = ECONOMY_LIMITS.gemUnlockCost;

    const incomeMultiplierCost = getIncomeMultiplierUpgradeCost(incomeMultiplierLevel);
    const isMaxIncomeMultiplier = incomeMultiplierLevel >= ECONOMY_LIMITS.maxIncomeMultiplierLevel;
    const currentMultiplier = getIncomeMultiplier(incomeMultiplierLevel);

    const autoMergeLevel = getAutoMergeUpgradeLevel(autoMergeInterval);
    const autoMergeCost = getAutoMergeUpgradeCost(autoMergeInterval);
    const isMaxAutoMerge = autoMergeInterval <= ECONOMY_LIMITS.minAutoMergeInterval;

    const maxSpawnSpeedLevel = getSpawnSpeedUpgradeLevel(ECONOMY_LIMITS.minSpawnCooldown);
    const maxIncomeSpeedLevel = getIncomeSpeedUpgradeLevel(ECONOMY_LIMITS.minIncomeInterval);
    const maxAutoMergeLevel = getAutoMergeUpgradeLevel(ECONOMY_LIMITS.minAutoMergeInterval);
    const nextRegion = getNextLockedRegion(unlockedRegionIds);

    const handleUpgrade = (upgradeFn: () => boolean, isSpecial = false) => () => {
        if (upgradeFn()) {
            if (navigator.vibrate) navigator.vibrate(isSpecial ? [100, 50, 100, 50, 100] : [50, 50, 50]);
            return;
        }

        if (navigator.vibrate) navigator.vibrate(200);
    };

    const cards: StoreUpgradeCard[] = [
        {
            id: 'spawn-level',
            section: 'core',
            title: '시작 레벨',
            description: '새로 생성되는 코인의 시작 레벨을 높입니다.',
            icon: <span>{COIN_LEVELS[spawnLevel]?.emoji ?? '🪙'}</span>,
            tone: 'blue',
            levelLabel: `Lv.${spawnLevel}`,
            headlineMetric: `현재 ${COIN_LEVELS[spawnLevel]?.name ?? '기본 코인'}`,
            detailMetric: `다음 ${COIN_LEVELS[spawnLevel + 1]?.name ?? '최종 단계'}`,
            roleLabel: '핵심',
            progressPercent: clampPercent(((spawnLevel - 1) / Math.max(1, ECONOMY_LIMITS.maxSpawnLevel - 1)) * 100),
            cost: levelCost,
            canAfford: totalMoney >= levelCost,
            isMax: isMaxLevel,
            ctaLabel: '레벨 업그레이드',
            maxLabel: '최대 레벨',
            onUpgrade: upgradeSpawnLevel,
        },
        {
            id: 'merge-bonus',
            section: 'core',
            title: '머지 보너스',
            description: '합병 시 추가 지급 기대값을 높입니다.',
            icon: <FaPercentage />,
            tone: 'amber',
            levelLabel: `Lv.${mergeBonusLevel}`,
            headlineMetric: `발동 20% · 보너스 ${mergeBonusPercent.toFixed(1)}%`,
            detailMetric: `평균 +${mergeBonusAveragePercent.toFixed(1)}% → +${(mergeBonusAveragePercent + mergeBonusAverageStep).toFixed(1)}%`,
            roleLabel: '핵심',
            progressPercent: clampPercent((mergeBonusLevel / ECONOMY_LIMITS.maxMergeBonusLevel) * 100),
            cost: mergeBonusCost,
            canAfford: totalMoney >= mergeBonusCost,
            isMax: isMaxMergeBonus,
            ctaLabel: '보너스 강화',
            maxLabel: `최대 보너스 (${mergeBonusPercent.toFixed(1)}%)`,
            onUpgrade: upgradeMergeBonus,
        },
        {
            id: 'income-speed',
            section: 'core',
            title: '수익 주기',
            description: '수익 지급 간격을 줄여 현금 흐름을 높입니다.',
            icon: <FaChartLine />,
            tone: 'emerald',
            levelLabel: `Lv.${incomeLevel}`,
            headlineMetric: `현재 ${Math.max(1, incomeInterval / 1000).toFixed(1)}초`,
            detailMetric: isMaxIncome
                ? `최소 ${(ECONOMY_LIMITS.minIncomeInterval / 1000).toFixed(1)}초`
                : `다음 투자 효율 +${getNextIncomeSpeedGainPercent(incomeInterval).toFixed(1)}%`,
            roleLabel: '핵심',
            progressPercent: clampPercent((incomeLevel / maxIncomeSpeedLevel) * 100),
            cost: incomeCost,
            canAfford: totalMoney >= incomeCost,
            isMax: isMaxIncome,
            ctaLabel: '주기 단축',
            maxLabel: '최대 속도',
            onUpgrade: upgradeIncomeSpeed,
        },
        {
            id: 'income-multiplier',
            section: 'automation',
            title: '수익 배율',
            description: '모든 기본 수익에 적용되는 영구 배율입니다.',
            icon: <FaTimes />,
            tone: 'violet',
            levelLabel: `Lv.${incomeMultiplierLevel}`,
            headlineMetric: `현재 ${currentMultiplier.toFixed(1)}x`,
            detailMetric: `다음 ${getIncomeMultiplier(incomeMultiplierLevel + 1).toFixed(1)}x`,
            roleLabel: '장기',
            progressPercent: clampPercent((incomeMultiplierLevel / ECONOMY_LIMITS.maxIncomeMultiplierLevel) * 100),
            cost: incomeMultiplierCost,
            canAfford: totalMoney >= incomeMultiplierCost,
            isMax: isMaxIncomeMultiplier,
            ctaLabel: '배율 강화',
            maxLabel: `최대 배율 (${currentMultiplier.toFixed(1)}x)`,
            onUpgrade: upgradeIncomeMultiplier,
        },
        {
            id: 'spawn-speed',
            section: 'automation',
            title: '부스트 생산 속도',
            description: '자동 생산 부스트 중 생산 속도를 높입니다.',
            icon: <FaBolt />,
            tone: 'cyan',
            levelLabel: `Lv.${speedLevel}`,
            headlineMetric: `현재 ${Math.max(0.2, spawnCooldown / 1000).toFixed(1)}초`,
            detailMetric: isMaxSpeed
                ? `최소 ${(ECONOMY_LIMITS.minSpawnCooldown / 1000).toFixed(1)}초`
                : `부스트 중 생산량 +${getNextSpawnSpeedGainPercent(spawnCooldown).toFixed(1)}%`,
            roleLabel: '보조',
            progressPercent: clampPercent((speedLevel / maxSpawnSpeedLevel) * 100),
            cost: speedCost,
            canAfford: totalMoney >= speedCost,
            isMax: isMaxSpeed,
            ctaLabel: '생산 가속',
            maxLabel: '최대 속도',
            onUpgrade: upgradeSpeed,
        },
        {
            id: 'auto-merge-speed',
            section: 'automation',
            title: '부스트 병합 속도',
            description: '자동 병합 부스트 중 처리 속도를 높입니다.',
            icon: <FaRobot />,
            tone: 'amber',
            levelLabel: `Lv.${autoMergeLevel}`,
            headlineMetric: `현재 ${Math.max(0.2, autoMergeInterval / 1000).toFixed(1)}초`,
            detailMetric: isMaxAutoMerge
                ? `최소 ${(ECONOMY_LIMITS.minAutoMergeInterval / 1000).toFixed(1)}초`
                : `부스트 중 처리량 +${getNextAutoMergeSpeedGainPercent(autoMergeInterval).toFixed(1)}%`,
            roleLabel: '보조',
            progressPercent: clampPercent((autoMergeLevel / maxAutoMergeLevel) * 100),
            cost: autoMergeCost,
            canAfford: totalMoney >= autoMergeCost,
            isMax: isMaxAutoMerge,
            ctaLabel: '병합 가속',
            maxLabel: '최대 속도 (0.2초)',
            onUpgrade: upgradeAutoMergeSpeed,
        },
        {
            id: 'gem-system',
            section: 'special',
            title: '보석 시스템',
            description: gemSystemUnlocked
                ? '해금 완료. 보석 성장 라인이 열렸습니다.'
                : '토스 빌딩 이후 보석 단계로 이어지는 장기 라인을 엽니다.',
            icon: <FaGem />,
            tone: 'rose',
            levelLabel: gemSystemUnlocked ? '해금 완료' : '특수 해금',
            headlineMetric: gemSystemUnlocked ? '보석 라인 활성화' : '신규 라인 잠김',
            detailMetric: `요구 자산 ${formatMoney(gemCost)}원`,
            roleLabel: '해금',
            progressPercent: gemSystemUnlocked ? 100 : 0,
            cost: gemCost,
            canAfford: totalMoney >= gemCost,
            isMax: gemSystemUnlocked,
            ctaLabel: '보석 시스템 해금',
            maxLabel: '해금 완료',
            onUpgrade: unlockGemSystem,
            isSpecial: true,
        },
    ];

    const sortCardsByActionability = (cardList: StoreUpgradeCard[]) => {
        return [...cardList].sort((a, b) => {
            const scoreA = a.isMax ? 2 : a.canAfford ? 0 : 1;
            const scoreB = b.isMax ? 2 : b.canAfford ? 0 : 1;
            return scoreA - scoreB;
        });
    };
    const coreCards = sortCardsByActionability(cards.filter((card) => card.section === 'core'));
    const automationCards = sortCardsByActionability(cards.filter((card) => card.section === 'automation'));
    const specialCards = sortCardsByActionability(cards.filter((card) => card.section === 'special'));

    const affordableCount = cards.filter((card) => !card.isMax && card.canAfford).length;
    const maxedCount = cards.filter((card) => card.isMax).length;

    const renderCard = (card: StoreUpgradeCard) => {
        const ctaLabel = card.isMax ? card.maxLabel : card.canAfford ? card.ctaLabel : '자산 부족';

        return (
            <article
                key={card.id}
                className={`store-upgrade-card tone-${card.tone} ${card.isSpecial ? 'special' : ''} ${card.canAfford && !card.isMax ? 'ready' : ''} ${card.isMax ? 'maxed' : ''}`}
            >
            <div className="store-upgrade-head">
                <div className="store-upgrade-title-row">
                    <div className={`store-upgrade-icon tone-${card.tone}`}>
                        {card.icon}
                    </div>
                    <div className="store-upgrade-copy">
                        <h3>{card.title}</h3>
                        <p>{card.description}</p>
                    </div>
                </div>
                <div className="store-upgrade-level-group">
                    <div className="store-upgrade-role">{card.roleLabel}</div>
                    <div className="store-upgrade-level">{card.levelLabel}</div>
                </div>
            </div>

            <div className="store-metric-block">
                <strong>{card.headlineMetric}</strong>
                <span>{card.detailMetric}</span>
            </div>

            <div className="store-upgrade-progress">
                <div className="store-upgrade-progress-fill" style={{ width: `${card.progressPercent}%` }} />
            </div>

            <button
                onClick={handleUpgrade(card.onUpgrade, card.isSpecial)}
                disabled={!card.canAfford || card.isMax}
                className={`store-cta ${card.canAfford && !card.isMax ? 'ready' : 'disabled'} ${card.isSpecial ? 'special' : ''}`}
                type="button"
            >
                <span>{ctaLabel}</span>
                {!card.isMax && <strong>{formatMoney(Math.floor(card.cost))}원</strong>}
            </button>
        </article>
        );
    };

    return (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div
                className="modal-container toss-modal store-modal"
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

                <div className="store-balance store-balance-hero">
                    <div className="store-balance-main">
                        <span className="balance-label">보유 자산</span>
                        <span className="balance-amount">{formatMoney(totalMoney)}원</span>
                    </div>
                    <div className="store-balance-chips">
                        <span className="store-status-chip"><FaCoins />구매 가능 {affordableCount}개</span>
                        <span className="store-status-chip"><FaMagic />최대 달성 {maxedCount}개</span>
                    </div>
                </div>

                {nextRegion && (
                    <div className="store-footer-note" style={{ marginTop: '14px' }}>
                        <FaGem />
                        <span>다음 지역 목표: {nextRegion.name} · 해금 기준 {formatMoney(nextRegion.unlockCost)}원</span>
                    </div>
                )}

                <div className="modal-content scrollable store-content">
                    <section className="store-section">
                        <header className="store-section-header">
                            <h3>핵심 성장</h3>
                            <span>현금 흐름과 시작 레벨을 직접 올리는 핵심 투자</span>
                        </header>
                        <div className="store-card-grid">
                            {coreCards.map(renderCard)}
                        </div>
                    </section>

                    <section className="store-section">
                        <header className="store-section-header">
                            <h3>부스트 튜닝</h3>
                            <span>광고형 무료 부스트를 쓸 때만 적용되는 보조 튜닝 라인</span>
                        </header>
                        <div className="store-card-grid">
                            {automationCards.map(renderCard)}
                        </div>
                    </section>

                    <section className="store-section">
                        <header className="store-section-header">
                            <h3>장기 해금</h3>
                            <span>다음 구간과 다음 자산 축을 여는 고가 투자</span>
                        </header>
                        <div className="store-card-grid">
                            {specialCards.map(renderCard)}
                        </div>
                    </section>

                    <div className="store-footer-note">
                        <FaArrowUp />
                        <span>업그레이드는 즉시 적용되며 저장 데이터와 자동 동기화됩니다.</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
