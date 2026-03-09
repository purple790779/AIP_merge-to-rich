# [AIP_merge-to-rich] Live Operations Implementation Plan

## Goal Description
The game is already live on Google Play.
The current goal is no longer "ship the first playable build", but to maintain a healthy live product, improve retention, and prepare monetization without destabilizing the existing release.

## Current Working Policy
- Development is **local-first**.
- Make small, reversible commits locally.
- Push to GitHub only when explicitly requested or when a stable milestone is ready.
- Before any push candidate: run build + basic smoke test + save/load sanity check.

## Current Priority Tracks

### Track A — Live Stability
- Re-check save/load reliability.
- Review version-to-version compatibility risks.
- Audit core UI flows for accidental blockers or regressions.

### Track B — Retention Foundation
- Add at least one strong return loop.
- Recommended first candidates:
  1. Daily reward
  2. Return bonus
  3. Lightweight mission loop

### Track C — Monetization Readiness
- Prepare systems that can later support monetization cleanly.
- Favor player-friendly structures first:
  - rewarded ads
  - ad removal
  - starter packs
- Do not rush monetization before the repeat-play loop feels solid.

## Proposed Near-Term Tasks

### [PLAN] Live document refresh
- Update roadmap and phase planning docs for post-launch reality.
- Keep release/ownership references current.

### [PLAN] Retention feature selection
- Choose one first implementation target:
  - Daily reward
  - Return reward
  - Mission board

### [PLAN] Stability checklist
- Save/load
- Offline progression behavior
- Core merge loop
- Reward claim flow
- Basic Android/web smoke pass

## Honest Recommendation
Do not stay local-only for too long.
Local-first is good for fast iteration, but stable checkpoints should still be preserved with local commits and occasional remote sync when requested.
