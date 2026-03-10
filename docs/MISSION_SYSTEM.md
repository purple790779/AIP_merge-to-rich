# 미션 시스템 가이드

상태: Current  
기준일: 2026-03-09

## 목표
- 짧은 세션에서 바로 달성 가능한 목표와, 장기 플레이 목표를 함께 제공한다.
- 업적과 다르게 미션은 `보상 수령 루프`를 제공한다.

## 구조
- 정의 파일: `src/game/missions.ts`
- 상태 저장:
  - `dailyMissionClaimedIds` + `dailyMissionClaimedDayKey`
  - `weeklyMissionClaimedIds` + `weeklyMissionClaimedWeekKey`
  - `missionClaimedIds` (`milestone` 전용)
  - `totalMissionRewardsClaimed` (업적용 누적 카운트)
- 수령 액션: `claimMissionReward(missionId)` (`src/store/useGameStore.ts`)
- UI: `MissionModal` (`src/components/MissionModal.tsx`)

## 카테고리 구성
- Daily Quick Wins: 3개
- Weekly Goals: 6개
- Long-term Milestones: 9개
- 총 18개 미션

각 미션은 아래 필드를 가진다.
- `id`
- `cadence`
- `title`
- `description`
- `icon`
- `conditionType`
- `target`
- `reward`

## 보상 / claim 정책
- Daily 미션은 KST 날짜 기준으로 1일 1회 수령 가능
- Weekly 미션은 KST 주차 기준으로 1주 1회 수령 가능
- Milestone 미션은 영구 1회 수령
- 수령 시 cadence별 claim bucket과 `totalMissionRewardsClaimed`를 함께 갱신
- 보상 지급은 `totalMoney`, `totalEarnedMoney`에 즉시 반영

## UX 원칙
- 상단 버튼은 claimable 상태만 배지로 표시
- 미션 모달은 현재 주기 기준의 수령 상태를 보여준다
- 미션은 플레이어가 직접 보상을 수령하는 구조를 유지한다
