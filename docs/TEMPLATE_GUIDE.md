# 템플릿 가이드

상태: Current  
기준일: 2026-03-08

이 저장소는 다음 미니게임을 시작할 때 재사용 가능한 보일러플레이트 역할도 합니다.

## 1. 재사용 가치가 있는 구조

추천 유지 대상:
- `game/economy.ts`: 비용 / 배율 공식
- `game/rewards.ts`: 보상 원천과 timed reward 계산
- `store/gameState.ts`, `store/persistence.ts`: 초기 상태와 hydration fallback
- `RewardSource` 타입: 일반 수익, 보상, 광고 보너스를 같은 축으로 관리

## 2. 다음 게임에도 그대로 가져갈 패턴

### 보상 진입점 패턴
- `RewardSource`를 두고 보상 원천을 타입으로 관리합니다.
- 단순 수익, 머지 보너스, 일일 보상, 복귀 보상, 오프라인 보상, 향후 광고 보너스까지 같은 축으로 정리합니다.
- 수익화 SDK를 붙일 때도 store 바깥에서 임의로 돈을 넣지 말고 이 진입점으로 연결합니다.

### timed reward 패턴
- 복귀 / 오프라인 보상처럼 “시간 기반으로 나중에 받을 수 있는 보상”은 pending state로 유지합니다.
- 모달을 닫는 행위와 보상을 폐기하는 행위를 분리합니다.
- 메인 화면에는 pending reward 재오픈 진입점을 둡니다.
- refresh 시 이미 pending 상태인 reward를 무조건 덮어쓰지 않습니다.

### 문서 운영 패턴
- 구조 변경 시 `README`, `CHANGELOG`, `ARCHITECTURE`, `ROADMAP`, `PHASE1_TASKS`를 같이 갱신합니다.
- 버전 메타데이터는 마지막에 맞추는 게 아니라 작업 배치 종료 조건에 포함합니다.

## 3. 새 프로젝트 시작 순서
1. 저장소 복제
2. 게임 콘셉트에 맞게 `types/game.ts`와 `game/economy.ts` 조정
3. `RewardSource`와 보상 진입점부터 확정
4. 저장 필드와 hydration fallback 설계
5. README / CHANGELOG / ARCHITECTURE 초안부터 같이 시작
