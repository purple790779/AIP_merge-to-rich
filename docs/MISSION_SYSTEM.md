# 미션 시스템 가이드

상태: Current  
기준일: 2026-03-10

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
- 모달 상단에는 전체 `즉시 수령` / `근접 목표` 집계를 먼저 보여줘 긴 세션에서도 지금 확인할 이유를 한 번에 읽게 한다
- 각 cadence 트랙은 `수령 가능`, `근접`, `다음 포커스` pill을 함께 노출해 체크리스트보다 `지금 받기 vs 조금만 더` 판단을 우선시한다
- 개별 미션 카드는 진행률 / 남은 수치 / 상태 pill을 함께 보여주되, 추천 표시는 정렬 기반 파생 정보로만 계산해 claim 저장 구조는 바꾸지 않는다
