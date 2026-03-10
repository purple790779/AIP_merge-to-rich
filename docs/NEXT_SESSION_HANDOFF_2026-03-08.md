# 다음 세션 인수인계

상태: Report  
기준일: 2026-03-09

## 1. 현재 기준
- 기준 버전: `v1.5.6`
- 현재 단계: 플레이스토어 라이브 운영 + 콘텐츠 확장 + 수익화 준비
- 최근 반영:
  - 미션 cadence를 실제 reset 구조로 보정
  - 엔딩 업적 보존 버그 수정
  - 업적 메뉴를 view-first 구조로 정리
  - locked achievement 카드 가독성 보정
  - world/region 확장 스캐폴딩 추가
  - 상점 / 경제 1차 리밸런싱 반영
  - 현재 지역 배너 + 지역 선택 / 해금 UI 1차 반영

## 2. 이번 배치에서 바뀐 것
- Daily / Weekly / Milestone 미션이 이름뿐이 아니라 실제로 reset / persistent 규칙을 따른다
- `totalMissionRewardsClaimed`를 분리해 미션 업적이 cadence reset에 영향받지 않도록 수정했다
- `completionist_max_money` 업적은 게임 초기화 후에도 유지된다
- 업적 메뉴는 열 때 `checkAchievements()`로 state를 바꾸지 않는다
- 수익 주기 업그레이드는 `250ms` 단위 체감형으로 재조정됐다
- 시작 레벨 업그레이드는 기존 보드를 삭제 / 환급하지 않는다
- 미션 / 업적 현금 보상은 메인 경제를 덮지 않도록 줄였다
- 상점에서 부스트 전용 자동화 튜닝을 별도 섹션으로 명시했다
- 해금된 지역은 선택 가능하고, 다음 지역은 순차 해금 가능하다
- 다만 현재는 지역별 전용 보드가 아니라 공용 보드를 공유한다

## 3. 검증 상태
- `eslint`: 통과
- `tsc -b`: 통과
- `vite build`: 통과
- 프로젝트 요구 Node 버전: `22.x`

## 4. 다음 세션 우선순위
1. deadlock rescue 시스템 초안
2. 복귀 / 오프라인 보상 수치 재조정
3. 지역별 생산 계열 설계
4. 문자열 전수 감사

## 5. 바로 보면 좋은 문서
- [README.md](../README.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ROADMAP.md](./ROADMAP.md)
- [PHASE1_TASKS.md](./PHASE1_TASKS.md)
- [CHANGELOG.md](./CHANGELOG.md)
