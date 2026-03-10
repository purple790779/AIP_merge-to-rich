# 템플릿 가이드

상태: Current  
기준일: 2026-03-09

이 저장소는 다음 미니게임이나 라이브 운영형 방치 게임의 출발점으로 재사용할 수 있습니다.

## 재사용 가치가 높은 구조
- `game/economy.ts`: 비용 / 배율 / 성장 공식
- `game/rewards.ts`: 보상 계산과 timed reward 처리
- `game/missions.ts`: 데이터 중심 미션 구조
- `game/achievements.ts`: 데이터 중심 업적 구조
- `store/gameState.ts`, `store/persistence.ts`: 초기 상태 / hydration fallback
- `RewardSource` 기반 보상 진입점 분리

## 다음 게임에도 그대로 가져갈 패턴

### 보상 진입점 분리
- 일반 수익, 머지 보너스, 일일 보상, 복귀 보상, 오프라인 보상, 광고 보상은 같은 entrypoint를 통과하게 둡니다.

### timed reward 패턴
- 보류 가능
- 재오픈 가능
- 폐기와 닫기를 분리
- persist 대상에 포함

### 지역 확장형 구조 패턴
- 단일 보드 게임이라도 초반부터 `world/region` 메타를 염두에 둡니다.
- 권장 필드:
  - `unlockedRegionIds`
  - `currentRegionId`
- 초기에는 단일 보드로 시작해도, 지역 메타가 있으면 이후 확장 비용이 크게 줄어듭니다.

### 경제 튜닝 패턴
- 업그레이드 비용 공식은 `game/economy.ts`에만 둡니다.
- 미션 / 업적 보상도 별도 상수가 아니라 같은 파일에서 스케일링합니다.
- 상점은 최소한 `핵심 성장`, `부스트 전용 튜닝`, `장기 해금`을 구분해 플레이어가 함정 투자를 덜 하게 만듭니다.
- 기존 보드를 지워버리는 업그레이드는 플레이타임을 압축하므로, 정말 의도한 설계가 아니면 피합니다.

### 문서 운영 패턴
- 코드 수정과 함께 `README`, `CHANGELOG`, `ARCHITECTURE`, `ROADMAP`, `PHASE1_TASKS`를 같이 갱신합니다.
- 버전 업데이트는 작업 종료 조건에 포함합니다.
