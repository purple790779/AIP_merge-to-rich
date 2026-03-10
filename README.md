# Merge Money Tycoon

토스 앱 진입형 `머지 + 방치형 + 타이쿤` 웹 게임 프로젝트입니다.  
React + Vite + TypeScript + Zustand 기반이며, PWA와 Capacitor Android 빌드를 함께 운영합니다.

## 현재 기준 상태
- 버전: `v1.5.14`
- 보드: `5x5` (`25칸`)
- 코인 단계: `Lv.1 ~ Lv.18`
- 라이브 상태: Google Play 등록 완료, 운영 업데이트 진행 중
- 기준 저장소: [purple790779/AIP_merge-to-rich](https://github.com/purple790779/AIP_merge-to-rich)

## 최근 반영 요약
- GitHub Actions `Android AAB Build` workflow를 릴리즈 기준으로 정리
- 기존 운영 저장소 기준을 `purple790779/AIP_merge-to-rich`로 복귀
- GitHub Pages 기본 링크를 `purple790779.github.io` 기준으로 정리
- AAB 서명/배포 기준 문서를 현재 저장소 기준으로 다시 정리

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
git clone https://github.com/purple790779/AIP_merge-to-rich.git
cd AIP_merge-to-rich
npm install
npm run dev
```

## 검증 명령
```bash
npm run lint
npm run build
```

## 실행 / 배포
- 로컬 개발 서버: `npm run dev`
- 로컬 접속 주소: `http://127.0.0.1:5173/AIP_merge-to-rich/`
- GitHub Pages 주소: [https://purple790779.github.io/AIP_merge-to-rich/](https://purple790779.github.io/AIP_merge-to-rich/)
- Pages 배포 방식:
  - `main` push
  - 또는 GitHub Actions `Deploy Web To GitHub Pages` 수동 실행

주의:
- Pages 주소가 `404`면 코드 문제가 아니라 아직 원격 배포가 안 된 상태일 가능성이 큽니다.
- 로컬 PC Node가 `22.x`가 아니면 `npm run build`가 prebuild 가드에서 차단될 수 있습니다.

## 현재 기준 문서
- [docs/DEVELOPMENT_WORKFLOW.md](./docs/DEVELOPMENT_WORKFLOW.md)
- [docs/ONBOARDING.md](./docs/ONBOARDING.md)
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [docs/CHANGELOG.md](./docs/CHANGELOG.md)
- [docs/ROADMAP.md](./docs/ROADMAP.md)
- [docs/PHASE1_TASKS.md](./docs/PHASE1_TASKS.md)
- [docs/MISSION_SYSTEM.md](./docs/MISSION_SYSTEM.md)
- [docs/ACHIEVEMENT_SYSTEM.md](./docs/ACHIEVEMENT_SYSTEM.md)
- [docs/WORLD_EXPANSION_PLAN.md](./docs/WORLD_EXPANSION_PLAN.md)
- [docs/ANDROID_RELEASE_WORKFLOW.md](./docs/ANDROID_RELEASE_WORKFLOW.md)
- [docs/PRIVACY_POLICY.md](./docs/PRIVACY_POLICY.md)

## 다음 세션 인수인계
- [docs/NEXT_SESSION_HANDOFF_2026-03-10.md](./docs/NEXT_SESSION_HANDOFF_2026-03-10.md)
- [docs/AUTONOMOUS_PROGRESS_2026-03-10.md](./docs/AUTONOMOUS_PROGRESS_2026-03-10.md)
- [docs/AUTONOMOUS_PROGRESS_2026-03-09.md](./docs/AUTONOMOUS_PROGRESS_2026-03-09.md)

## 참고 문서
- [docs/RETURN_REWARD_PLAN.md](./docs/RETURN_REWARD_PLAN.md)
- [docs/TEMPLATE_GUIDE.md](./docs/TEMPLATE_GUIDE.md)
- [docs/STORE_LISTING.md](./docs/STORE_LISTING.md)
- [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

## 운영 메모
- 기능 추가보다 먼저 저장 안정성, UI 깨짐, 기기별 레이아웃을 본다.
- 코드 수정 시 `README`, `CHANGELOG`, 필요 시 `ARCHITECTURE`, `handoff`까지 함께 갱신한다.
- OpenClo와 로컬 Codex를 병행하므로 기준 저장소와 handoff 문서는 항상 최신으로 유지한다.
