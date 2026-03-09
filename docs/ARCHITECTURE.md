# 아키텍처 가이드

상태: Current  
기준일: 2026-03-09

이 문서는 `v1.5.2` 기반(2026-03-09 작업 반영) 실제 코드 구조를 설명합니다.

## 핵심 구조

### `src/App.tsx`
- 메인 화면 오케스트레이션
- timed reward 자동 노출 / suppression 제어
- 일일 보상 자정 경계 갱신용 시계 보유

### `src/store/useGameStore.ts`
- 게임 액션 오케스트레이션
- timed reward preview 생성 / 수령 / 폐기
- 미션 보상 수령 가드(`claimMissionReward`)

### `src/game/missions.ts`
- 미션 정의(카테고리 cadence/조건/목표/보상)
- 진행도/수령 가능 계산 로직

### `src/game/achievements.ts`
- 업적 정의(카테고리/티어/조건/보상/점수)
- 업적 진행도 계산 + 레거시 랭크 계산
- 108개 장기 업적 데이터(발견/숙련/경제/수집/복귀/업그레이드/완성자)

### `src/components/MissionModal.tsx`
- 미션 카테고리별(일일/주간/마일스톤) 진행도/보상 수령 UI
- 수령 가능 상태를 명시적으로 보여주는 메인 콘텐츠 확장 포인트

### `src/components/AchievementModal.tsx`
- 2단 탐색 구조(카테고리 목록 -> 카테고리 상세)
- 레거시 랭크 카드, 카테고리 진행 카드, 상세 화면 Back 내비게이션

### `src/components/StoreModal.tsx`
- 섹션형 상점 UI(핵심 성장/자동화/특수 해금)
- 카드별 진행률/효과 칩/CTA를 통한 업그레이드 구매 동선 제공

### `src/store/persistence.ts`
- persist partialize
- hydration fallback
- pending reward 복원

### `src/components/TimedRewardTray.tsx`
- 보류 중인 timed reward 재오픈 진입점

## timed reward 원칙
- 복귀 보상과 오프라인 보상은 pending state로 유지합니다.
- 모달을 닫는 행위와 보상을 버리는 행위를 분리합니다.
- pending reward는 저장 대상에 포함합니다.
- 앱 재시작 후에도 pending reward가 복원됩니다.
- 이미 pending 상태인 reward는 refresh 시 새 계산값으로 덮어쓰지 않습니다.

## 미션 원칙
- 미션 정의는 데이터 중심으로 관리하고, UI는 정의를 렌더링만 합니다.
- 미션 보상 수령은 store 액션 단일 경로에서만 허용합니다.
- 수령 이력(`missionClaimedIds`)은 persist 대상입니다.

## 운영 우선 원칙
- 라이브 단계에서는 저장 안정성, 보상 중복 방지, 기기별 레이아웃 안정성을 기능 추가보다 우선합니다.
- 문구 깨짐이나 safe-area 문제는 기능 버그와 같은 우선순위로 다룹니다.
- 구조 변경 시 `README`, `CHANGELOG`, `ROADMAP`, `PHASE1_TASKS`를 함께 갱신합니다.
