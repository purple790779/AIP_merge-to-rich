# 아키텍처 가이드

상태: Current  
기준일: 2026-03-10

이 문서는 `v1.5.6` 기준의 실제 코드 구조를 설명합니다.

## 핵심 구조

### `src/App.tsx`
- 메인 화면 오케스트레이션
- timed reward 자동 노출 / suppression 제어
- 일일 보상 자정 경계 갱신용 시계 보유
- 현재 지역 배너와 지역 모달 진입 버튼 보유

### `src/store/useGameStore.ts`
- 게임 액션 오케스트레이션
- timed reward preview 생성 / 수령 / 폐기
- 미션 보상 수령 액션 `claimMissionReward`
- 지역 해금 / 선택 액션 `unlockRegion`, `selectRegion`

### `src/store/gameState.ts`
- 초기 상태 정의
- 단일 보드 게임이지만 region 확장 대비 필드 포함
  - `unlockedRegionIds`
  - `currentRegionId`

### `src/store/persistence.ts`
- persist partialize
- hydration fallback
- region 스캐폴딩 필드 복원
- pending timed reward와 mission cadence 버킷 복원

### `src/game/worlds.ts`
- 월드 / 지역 메타데이터
- 시작 지역과 다음 해금 지역 순서 정의
- 현재는 지역별 보드를 만들기 위한 기준 데이터 레이어 역할

### `src/game/economy.ts`
- 업그레이드 비용 곡선
- 미션 / 업적 현금 보상 스케일링
- 다음 투자 효율 미리보기 계산
- `핵심 성장`과 `부스트 튜닝`을 구분하는 기준점

### `src/game/missions.ts`
- 미션 정의 데이터
- cadence(`daily`, `weekly`, `milestone`) 규칙
- claim 상태 계산 / claimable count 계산

### `src/game/achievements.ts`
- 업적 정의 데이터
- 진행도 계산 / 점수 계산 / 랭크 계산
- 7개 카테고리, 총 108개 업적 데이터 관리

## 주요 UI 컴포넌트

### `src/components/MissionModal.tsx`
- 미션 카테고리별 진행도와 보상 수령 UI
- 현재 KST day / KST week 기준의 실제 수령 상태 표시

### `src/components/AchievementModal.tsx`
- 카테고리 목록 -> 상세 2단계 탐색
- view-first 구조
- 열 때 store 상태를 다시 변경하지 않음
- 상세 필터 초기화는 effect가 아니라 카테고리 진입 / 복귀 핸들러에서 처리해 현재 React Hooks lint 규칙과 충돌하지 않음

### `src/components/StoreModal.tsx`
- `핵심 성장 / 부스트 튜닝 / 장기 해금` 3섹션 상점
- 다음 투자 효율을 카드 단위로 표시
- 다음 지역 목표를 상단 힌트로 보여줌
- 현재 기준 region 해금 자체는 여기서 처리하지 않고, 장기 목표 안내와 gem 시스템 해금이 중심

### `src/components/RegionModal.tsx`
- 해금된 지역 선택 UI
- 다음 해금 지역 비용 표시
- 현재 region progression의 실제 해금 / 이동 진입점
- 아직 실제 지역별 보드 분리까지는 수행하지 않음

## timed reward 원칙
- 복귀 보상과 오프라인 보상은 pending state로 유지합니다.
- 모달을 닫는 행위와 보상을 버리는 행위를 분리합니다.
- pending reward는 persist 대상입니다.
- 앱 재시작 후에도 pending reward가 복원됩니다.
- 이미 pending 상태인 reward는 refresh 시 새 계산값으로 덮어쓰지 않습니다.

## 미션 원칙
- 미션 정의는 데이터 중심으로 관리하고 UI는 렌더링에 집중합니다.
- 미션 보상 수령은 store 액션 단일 경로에서만 허용합니다.
- 미션 claim 상태는 cadence별로 분리합니다.
  - `dailyMissionClaimedIds` + `dailyMissionClaimedDayKey`
  - `weeklyMissionClaimedIds` + `weeklyMissionClaimedWeekKey`
  - `missionClaimedIds`는 milestone 전용
- 업적용 누적 수치는 `totalMissionRewardsClaimed`로 별도 추적합니다.

## 지역 확장 원칙
- 초기 플레이는 단일 보드로 유지하되, 저장 구조는 region 확장을 받아들일 수 있어야 합니다.
- `worlds.ts`는 지금 당장 UI에 노출되지 않더라도 다음 배치의 설계 기준점입니다.
- `v1.5.6`부터는 현재 지역 / 해금 지역을 실제 UI에서 조작할 수 있습니다.
- 다만 지역별 보드와 생산 계열은 아직 공용 구조를 사용합니다.
- region unlock UX는 `RegionModal`이 맡고, `StoreModal`은 다음 목표를 안내하는 보조 위치로 동작합니다.
- 향후 상점, 미션, 컬렉션, 수익화는 지역 구조 위에서 다시 연결합니다.

## 운영 우선순위 원칙
- 라이브 서비스 단계에서는 새 기능보다 저장 안정성, 보상 중복 방지, 기기별 레이아웃 안정성을 우선합니다.
- 함정 업그레이드는 방치하지 않고, 체감과 비용이 어긋나면 먼저 문구/공식부터 정리합니다.
- 구조 변경 시 `README`, `CHANGELOG`, `ROADMAP`, `PHASE1_TASKS`도 함께 갱신합니다.

## 2026-03-10 검증 기준선
- fresh worktree에서는 먼저 `npm install`이 필요합니다.
- 검증 기준 명령은 `npm run lint`, `npm run build`입니다.
- `v1.5.6` morning QA pass 기준 두 명령 모두 Node `22.x`에서 통과했습니다.
