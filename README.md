# Merge Money Tycoon

토스 스타일의 `머지 + 방치형 + 타이쿤` 웹 게임 프로젝트입니다.  
React + Vite + TypeScript + Zustand 기반이며, PWA와 Capacitor(Android) 빌드를 함께 운영합니다.

## 현재 기준 상태
- 버전: `v1.5.6`
- 보드 크기: `5x5` (`25칸`)
- 코인 단계: `Lv.1 ~ Lv.18`
- 지역 메타:
  - `시티 뱅크 -> 골드 익스체인지 -> 젬 마켓 -> 스페이스 볼트`
  - 현재 지역 배너 + 지역 선택/해금 UI 1차 반영
  - 지역별 전용 보드/생산 라인은 아직 미구현
- 성장 로드맵: Daily Quick Wins(3) / Weekly Goals(6) / Long-term Milestones(9), 총 18개 미션
- 경제 1차 리밸런싱:
  - 수익 주기 업그레이드를 `100ms` 단위 잔업형에서 `250ms` 단위 체감형으로 조정
  - 시작 레벨 업그레이드는 기존 코인 삭제/환급 없이 `이후 생성분만 상향`
  - 미션 / 업적 현금 보상은 메인 경제를 덮지 않도록 축소
- 상점 구조:
  - `핵심 성장 / 부스트 튜닝 / 장기 해금` 3섹션
  - 광고형 자동화는 영구 성장축이 아니라 `부스트 전용 튜닝`으로 명시
  - region unlock의 실제 진입점은 `RegionModal`, 상점은 `다음 지역 목표` 안내 중심
- 미션 cadence:
  - Daily: `KST day reset`
  - Weekly: `KST week reset`
  - Milestone: `persistent one-time clear`
- 업적 시스템: 7개 카테고리, 총 108개 업적, 랭크 메타, 카테고리 2단계 탐색 UI
- 업적 메뉴 원칙:
  - 열 때 store 상태를 변경하지 않는 `view-first` 구조
  - 잠금 업적은 전체 opacity가 아니라 대비 차이로 구분
- 일일 보상: 구현 완료, KST 자정 기준 갱신
- 복귀 보상: 구현 완료
- 오프라인 보상: 최소형 구현 완료
- timed reward UX: 닫아도 보류 유지, 앱 재시작 후에도 유지, 메인 화면에서 재오픈 가능
- 광고 SDK / IAP: 미연동, 보상 진입점 구조만 준비됨
- `2026-03-10` morning QA pass 기준 fresh install 후 `npm run lint`, `npm run build` 통과

## 기술 스택
- React 19
- TypeScript 5
- Vite 7
- Zustand
- Framer Motion
- Tailwind CSS 4
- Capacitor 8

## 개발 환경
- Node.js `22.x`
- npm `11+`

```bash
node -v
npm -v
```

## 시작하기
```bash
npm install
npm run dev
```

## 검증 명령
```bash
npm run lint
npm run build
```

## 현재 기준 문서
- [ONBOARDING.md](./docs/ONBOARDING.md)
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [CHANGELOG.md](./docs/CHANGELOG.md)
- [ROADMAP.md](./docs/ROADMAP.md)
- [PHASE1_TASKS.md](./docs/PHASE1_TASKS.md)
- [MISSION_SYSTEM.md](./docs/MISSION_SYSTEM.md)
- [ACHIEVEMENT_SYSTEM.md](./docs/ACHIEVEMENT_SYSTEM.md)
- [WORLD_EXPANSION_PLAN.md](./docs/WORLD_EXPANSION_PLAN.md)
- [PRIVACY_POLICY.md](./docs/PRIVACY_POLICY.md)

## 다음 세션 인수인계
- [NEXT_SESSION_HANDOFF_2026-03-08.md](./docs/NEXT_SESSION_HANDOFF_2026-03-08.md)
- [AUTONOMOUS_PROGRESS_2026-03-10.md](./docs/AUTONOMOUS_PROGRESS_2026-03-10.md)
- [AUTONOMOUS_PROGRESS_2026-03-09.md](./docs/AUTONOMOUS_PROGRESS_2026-03-09.md)

## 참고 문서
- [RETURN_REWARD_PLAN.md](./docs/RETURN_REWARD_PLAN.md)
- [TEMPLATE_GUIDE.md](./docs/TEMPLATE_GUIDE.md)
- [STORE_LISTING.md](./docs/STORE_LISTING.md)
- [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

## 운영 메모
- 라이브 서비스 단계에서는 새 기능보다 저장 안정성, 보상 중복 방지, 기기별 레이아웃 안정성을 우선합니다.
- 코드 수정이 있으면 `README`, `CHANGELOG`, `ARCHITECTURE`, `ROADMAP`, `PHASE1_TASKS`를 함께 갱신합니다.
