# [AIP_merge-to-rich] Implementation Plan - Gameplay Fixes & Extensions

## Goal Description
Fix critical drag-and-drop bugs (coins overlapping, flying away) and implement missing core features (Store, Collection, Achievements) to enhance gameplay depth and stability.

## User Review Required
> [!IMPORTANT]
> **Drag Logic Change**: Unsuccessful drags (invalid target, empty space) will now strictly **snap back** to the original position.

## Proposed Changes

### Gameplay Logic (Stability)
#### [MODIFY] [useGameStore.ts](file:///E:/Daddy_Project/Apps-in-Toss/AIP_merge-to-rich/src/store/useGameStore.ts)
- Update `moveCoin` and `spawnCoin` to ensure strict grid validation.
- Add `upgradeSpeed` action for store functionality.

#### [MODIFY] [Coin.tsx](file:///E:/Daddy_Project/Apps-in-Toss/AIP_merge-to-rich/src/components/Coin.tsx)
- Implement `dragSnapToOrigin` functionality manually or via framer-motion props.
- Ensure `zIndex` is handled correctly during drag to preventing clipping.

### New Features
#### [NEW] [StoreModal.tsx](file:///E:/Daddy_Project/Apps-in-Toss/AIP_merge-to-rich/src/components/StoreModal.tsx)
- UI for upgrading 'Spawn Rate' and 'Spawn Level'.

#### [NEW] [CollectionModal.tsx](file:///E:/Daddy_Project/Apps-in-Toss/AIP_merge-to-rich/src/components/CollectionModal.tsx)
- Grid view of unlocked coins.

#### [NEW] [AchievementSystem.tsx](file:///E:/Daddy_Project/Apps-in-Toss/AIP_merge-to-rich/src/components/AchievementSystem.tsx)
- Simple toast notification for reaching milestones.

## Verification Plan
### Manual Verification
- **Drag Test**: Drag a coin to an empty space -> Should return to origin.
- **Merge Test**: Drag Lv.1 to Lv.1 -> Should become Lv.2.
- **Store Test**: Buy upgrade -> Check if money decreases and stats improve.
