# 미션 시스템 가이드

상태: Current  
기준일: 2026-03-09

## 1. 목표
- 일일 목표는 2~3개 빠른 완료형만 유지해 체크리스트 피로를 줄입니다.
- 체류/리텐션 동력은 주간 페이스 목표와 장기 마일스톤(성장/수집/발견)에서 가져갑니다.
- 단순 업적(패시브 해금)과 달리, 미션은 보상 수령 액션으로 중기 목표를 능동적으로 추적합니다.

## 2. 구조
- 정의 파일: `src/game/missions.ts`
- 상태 저장: `missionClaimedIds` (`src/types/game.ts`, `src/store/persistence.ts`)
- 수령 액션: `claimMissionReward(missionId)` (`src/store/useGameStore.ts`)
- UI: `MissionModal` (`src/components/MissionModal.tsx`)

## 3. 카테고리 구성
- Daily Quick Wins(3개): 짧은 세션에서 빠르게 끝낼 수 있는 가벼운 목표만 배치
- Weekly Goals(6개): 여러 세션에 걸쳐 자연스럽게 누적되는 중기 목표
- Long-term Milestones(9개): 리셋 압박 없이 쌓이는 성장/수집/발견 목표

총 18개 미션으로 구성되며, 각 미션은 아래 필드를 가집니다.
- `id`, `cadence`, `title`, `description`, `icon`
- `conditionType`, `target`, `reward`

추가된 조건 타입:
- `discovered_level_count`: 발견한 코인 종류 수(도감 확장 동기)

## 4. 보상/가드 원칙
- 보상은 미션별 1회만 수령 가능합니다.
- 수령 시점에만 `missionClaimedIds`에 기록합니다.
- 완료되지 않은 미션, 이미 수령한 미션은 store 레벨에서 거부합니다.
- 수령 보상은 `totalMoney`, `totalEarnedMoney`에 동시에 반영됩니다.

## 5. UX 원칙
- 상단 성장 목표 버튼에 수령 가능 배지를 표시합니다.
- 모달 내 각 미션은 진행률(값/퍼센트/바)과 상태(진행 중/수령 가능/수령 완료)를 명시합니다.
- 모달 상단에 "모든 목표는 선택적이며 장기 목표는 리셋되지 않음" 안내를 고정해 의무감/FOMO를 완화합니다.
- 모든 카테고리는 같은 컴포넌트 구조를 사용해 확장 시 데이터 추가만으로 대응합니다.

## 6. 확장 포인트
- 시즌 한정/이벤트 미션은 `conditionType` 확장으로 추가 가능합니다.
- 미션 보상을 화폐 외 리소스(부스트 토큰 등)로 확장하려면 reward 스키마를 객체화합니다.
