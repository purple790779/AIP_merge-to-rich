# 다음 세션 인수인계

상태: Report  
기준일: 2026-03-10

## 현재 기준
- 기준 버전: `v1.5.14`
- 기준 저장소: `https://github.com/purple790779/AIP_merge-to-rich.git`
- 로컬 실행 주소: `http://127.0.0.1:5173/AIP_merge-to-rich/`
- 라이브 상태: Google Play 등록 완료, 운영 업데이트 진행 중
- AAB 릴리즈 기준: `purple790779` 저장소의 GitHub Actions + 기존 signing secrets 사용

## 이번 세션에서 정리한 것
- 기준 저장소를 `purple790779/AIP_merge-to-rich`로 복귀
- 로컬 git remote origin을 `purple790779` 저장소 기준으로 맞춤
- `README`, `ONBOARDING`, `PRIVACY_POLICY`, `ANDROID_RELEASE_WORKFLOW`를 현재 저장소 기준으로 정리
- GitHub Pages 링크를 `purple790779.github.io` 기준으로 변경
- Android 버전을 `1.5.14`, `versionCode 19`로 올림

## 다음에 바로 할 일
1. `purple790779` 저장소에 현재 변경분 push
2. GitHub Actions `Android AAB Build` 실행 또는 `main` push로 자동 실행 확인
3. artifact에서 `app-release.aab` 다운로드
4. Google Play Console 새 버전에 업로드

## 확인 포인트
- `purple790779` 저장소에 repository secrets 4개가 실제로 살아 있는지
- Pages 배포를 계속 쓸지, 이번엔 AAB 릴리즈만 사용할지
- 현재 워크스페이스의 git author는 아직 `Master-Tak79`로 남아 있음
  - remote는 바꿨지만 user.name / user.email은 일부러 건드리지 않았음

## 검증 상태
- `npm run lint`: 통과
- `npx tsc -b`: 통과
- `npx vite build`: 통과
- 로컬 URL 응답 `200` 확인

## 주의사항
- 이 환경에서는 `git` CLI가 PATH에 없어 직접 push는 못 함
- 실제 원격 반영은 GitHub Desktop, IDE git, OpenClo, 또는 사용자의 다른 git 가능한 환경에서 해야 함
- 다음 세션에서는 `README -> CHANGELOG -> 이 handoff` 순서로 열면 맥락이 이어짐
