import type { BoostType, GameState, RewardSource } from '../types/game';
import type { WorldRegionId } from '../game/worlds';

export interface GameStoreState extends GameState {
    lastDiscoveredLevel: number | null;
}

export interface GameStoreActions {
    spawnCoin: () => boolean;
    moveCoin: (coinId: string, targetIndex: number) => boolean;
    tryMerge: (coinId: string, targetIndex: number) => boolean;
    triggerAutoMerge: () => boolean;
    activateBoost: (type: BoostType, durationSec: number) => void;
    isBoostActive: (type: BoostType) => boolean;
    grantMoney: (amount: number, source?: RewardSource) => number;
    upgradeSpawnLevel: () => boolean;
    upgradeSpeed: () => boolean;
    upgradeIncomeSpeed: () => boolean;
    upgradeMergeBonus: () => boolean;
    unlockGemSystem: () => boolean;
    upgradeIncomeMultiplier: () => boolean;
    upgradeAutoMergeSpeed: () => boolean;
    unlockRegion: (regionId: WorldRegionId) => boolean;
    selectRegion: (regionId: WorldRegionId) => boolean;
    claimRegionGoalReward: (goalId: string) => boolean;
    checkAchievements: () => string[];
    claimDailyReward: () => boolean;
    canClaimDailyReward: () => boolean;
    useBoardRescue: () => boolean;
    claimMissionReward: (missionId: string) => boolean;
    refreshTimedRewards: (now?: number) => void;
    claimReturnReward: () => boolean;
    claimOfflineReward: () => boolean;
    dismissTimedReward: (type: 'return_reward' | 'offline_reward') => void;
    syncSessionHeartbeat: (now?: number) => void;
    resetGame: () => void;
    clearLastMergedId: () => void;
    clearLastDiscoveredLevel: () => void;
}

export type GameStore = GameStoreState & GameStoreActions;
