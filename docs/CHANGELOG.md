# 변경 이력

상태: Current  
기준일: 2026-03-10

## [1.5.6] - 2026-03-10

### 지역 확장 UI
- 현재 지역 배너를 메인 화면에 추가
- 지역 선택 / 해금 모달 1차 구현
- 해금된 지역 선택과 다음 지역 순차 해금을 store 액션으로 연결
- 지역별 전용 보드가 아직 미구현임을 UI에 명시

### 경제 / 리텐션 명확화
- 미션 현금 보상을 `small / medium / large` 구간형 multiplier로 재조정해 daily/weekly/초중반 milestone 보상은 약간 살리고, 대형 장기 milestone 보상은 과도하게 부풀지 않도록 정리
- 일일 보상 상태 계산을 utility 단일 경로로 통합해 claim 가능 여부, 다음 리셋 시각, streak cap 정보를 같은 규칙으로 계산
- 일일 보상 모달에 `다음 KST 리셋`, `7일차 보너스 cap`, `기기 시간 rollback 잠금` 안내를 추가해 보상 문구 해석을 쉽게 정리

### 문서 / QA / 검증
- `v1.5.6` morning snapshot을 실제 코드(`App`, `RegionModal`, `StoreModal`, `worlds`, `useGameStore`, `persistence`) 기준으로 재감사
- 현재 지역 해금/선택의 실제 진입점이 `RegionModal`이고, `StoreModal`은 `다음 지역 목표`와 장기 해금 힌트 노출 역할이라는 점을 문서 전반에 명확히 반영
- `AchievementModal`의 상세 필터 초기화를 effect 밖의 네비게이션 핸들러로 이동해 현재 ESLint(`react-hooks/set-state-in-effect`) 규칙과 충돌하지 않도록 정리
- fresh worktree 기준 `npm install`, `npm run lint`, `npm run build` 검증 통과
- `npm audit` 기준 의존성 트리에 취약점 8건(중간 1, 높음 7)이 보고되지만 이번 docs/QA pass에서는 미조치

### 문서 / 버전
- `package.json`, `package-lock.json`, `android/app/build.gradle`을 `v1.5.6` 기준으로 유지
- 아키텍처, 로드맵, 작업표, 월드 확장 계획, handoff, progress 문서를 `2026-03-10` QA 기준으로 갱신

## [1.5.5] - 2026-03-09

### 경제 / 상점
- 수익 주기 업그레이드를 `250ms` 단위 체감형으로 재조정
- 머지 보너스 기대값과 비용 곡선을 1차 리밸런싱
- 시작 레벨 업그레이드가 기존 보드를 삭제 / 환급하지 않도록 수정
- 미션 / 업적 현금 보상 비중을 축소해 메인 경제 압박을 회복
- 상점을 `핵심 성장 / 부스트 튜닝 / 장기 해금` 구조로 재정렬
- 부스트 전용 자동화 튜닝이 영구 성장축처럼 읽히지 않도록 문구와 칩을 수정

### UX / 문구
- 상점 카드에 다음 투자 효율과 다음 지역 목표를 표시
- 코인 레벨명과 상점 관련 사용자 노출 문구를 정리

### 문서 / 버전
- `package.json`, `package-lock.json`, `android/app/build.gradle`을 `v1.5.5` 기준으로 동기화
- README, 아키텍처, 로드맵, 작업표, 템플릿 가이드를 최신 구조로 갱신

## [1.5.4] - 2026-03-09

### 월드 확장 준비
- `world/region` 메타데이터 스캐폴딩 추가 (`src/game/worlds.ts`)
- `GameState`에 `unlockedRegionIds`, `currentRegionId` 추가
- 단일 보드 구조에서 지역 확장형 구조로 넘어가기 위한 문서 기준 정리

### 문서
- `WORLD_EXPANSION_PLAN.md` 추가
- ROADMAP / PHASE1_TASKS / TEMPLATE_GUIDE를 지역 확장 기준으로 갱신

## [1.5.3] - 2026-03-09

### 안정성 / 정합성
- 미션 cadence를 실제 동작과 맞게 보정
  - daily: KST day reset
  - weekly: KST week reset
  - milestone: 영구 1회 클리어
- 미션 누적 수령 횟수 `totalMissionRewardsClaimed`를 분리해 cadence reset과 업적 조건이 충돌하지 않도록 수정
- 엔딩 후 초기화 시 `completionist_max_money` 업적 보존이 실제로 동작하도록 수정
- 설정 모달의 초기화 경로도 같은 업적 보존 규칙을 사용하도록 정리

### UI / UX
- 업적 메뉴가 열릴 때 `checkAchievements()`로 store를 변경하지 않도록 정리
- 잠금 업적 카드의 전체 opacity를 제거해 상세 목록 가독성 회복
- 미션 모달이 현재 day/week 기준의 실제 수령 상태를 반영하도록 수정

### 문서 / 버전
- `package.json`, `package-lock.json`, `android/app/build.gradle`을 `v1.5.3` 기준으로 동기화
- README, 아키텍처, 미션/업적 시스템 문서를 현재 구조 기준으로 갱신

## [1.5.2] - 2026-03-08

### 라이브 운영 안정화
- 보류 중인 복귀 보상 / 오프라인 보상을 persist 대상에 포함해 앱 재시작 후에도 다시 받을 수 있도록 수정
- hydration 시 유효한 pending reward만 복원하도록 보정
- 일일 보상 가능 상태가 KST 자정 경계에서 자동 갱신되도록 `App.tsx`에 분 단위 시계 갱신 추가

### UI / UX
- 좁은 화면에서 상단 게임 타이틀이 버튼 영역과 겹치지 않도록 레이아웃 조정
- 메인 화면, 헤더, 일일 보상, timed reward 모달 / tray 주요 문구 정리

## [1.5.1] - 2026-03-08

### timed reward UX 보완
- timed reward 모달을 닫아도 pending reward를 유지하도록 수정
- 복귀 보상 / 오프라인 보상을 메인 화면 tray에서 다시 열 수 있도록 추가
- timed reward 모달의 `나중에 받기 / 버리기 / 받기` 동작을 분리

## [1.5.0] - 2026-03-08

### 구조 리팩토링
- `useGameStore.ts`를 orchestration 중심으로 정리하고 게임 로직을 `game/*` 모듈로 분리
- 초기 상태와 persist 처리를 `store/*` 계층으로 분리
- 스타일 구조를 `styles/*` 파일로 정리

### 기능
- 복귀 보상 구현
- 오프라인 보상 최소형 구현
- reward source 구조 정리
