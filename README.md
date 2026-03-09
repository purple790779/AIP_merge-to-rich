# Merge Money Tycoon

토스 앱용 머지 + 방치형 웹 게임 프로젝트입니다.  
React + Vite + TypeScript + Zustand 기반이며, PWA와 Capacitor(Android) 빌드를 함께 지원합니다.

현재 기준 상태:
- 버전: `v1.5.2`
- 보드 크기: `5x5` (`25칸`)
- 코인 단계: `Lv.1 ~ Lv.18`
- 성장 로드맵: Daily Quick Wins(3) / Weekly Goals(6) / Long-term Milestones(9), 총 18개 목표형 미션 및 보상 수령 UI
- 업적 시스템: 7개 카테고리, 총 108개 장기 업적 + 레거시 랭크(점수 기반 메타 진행), 카테고리 2단 탐색 UI
- 일일 보상: 구현 완료, KST 자정 경계 자동 갱신 반영
- 복귀 보상: 구현 완료
- 오프라인 보상: 최소형 구현 완료
- timed reward UX: 닫아도 보류 유지, 앱 재시작 후에도 유지, 메인 화면에서 재오픈 가능
- 광고 SDK / IAP: 미연동, 보상 진입점 구조만 준비 완료

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
- [PRIVACY_POLICY.md](./docs/PRIVACY_POLICY.md)

## 다음 세션 인수인계
- [NEXT_SESSION_HANDOFF_2026-03-08.md](./docs/NEXT_SESSION_HANDOFF_2026-03-08.md)

이 문서는 내일 오픈클로 또는 로컬 Codex 세션에서 바로 이어 작업할 수 있도록 현재 상태, 검증 결과, 다음 우선순위를 정리한 handoff 문서입니다.

## 참고 문서
- [RETURN_REWARD_PLAN.md](./docs/RETURN_REWARD_PLAN.md)
- [TEMPLATE_GUIDE.md](./docs/TEMPLATE_GUIDE.md)
- [STORE_LISTING.md](./docs/STORE_LISTING.md)
- [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

## 운영 메모
- 라이브 서비스 단계에서는 기능 추가보다 저장 안정성, 보상 중복 방지, 기기별 레이아웃 안정성을 우선합니다.
- 코드 수정이 있으면 `README`, `CHANGELOG`, `ARCHITECTURE`, `ROADMAP`, `PHASE1_TASKS`를 함께 갱신합니다.
