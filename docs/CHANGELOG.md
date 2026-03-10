# 변경 이력

상태: Current  
기준일: 2026-03-10

## [1.5.14] - 2026-03-10

### 저장소 기준 복귀
- 기준 저장소를 `purple790779/AIP_merge-to-rich`로 다시 맞춤
- 로컬 git remote origin을 `https://github.com/purple790779/AIP_merge-to-rich.git`로 정리
- `package.json` homepage를 `https://purple790779.github.io/AIP_merge-to-rich`로 변경

### 문서 / 배포 안내 정리
- `README`를 현재 운영 저장소 기준으로 전면 정리
- `ONBOARDING`, `PRIVACY_POLICY`, `ANDROID_RELEASE_WORKFLOW`, `NEXT_SESSION_HANDOFF`를 현재 저장소 기준으로 갱신
- GitHub Pages / AAB 배포 안내를 `purple790779` 저장소 기준으로 통일

### 버전 / 메타데이터
- `package.json`, `package-lock.json`, `android/app/build.gradle`을 `v1.5.14` 기준으로 갱신
- Android `versionCode`를 `19`로 상향
- `capacitor.config.ts` 앱 이름을 `머지 머니 타이쿤`으로 정리

## [1.5.13] - 2026-03-10

### Android 릴리즈 레일 정리
- `.github/workflows/android-build.yml`을 signed release AAB 기준으로 재정리
- build artifact에 `app-release.aab`, `sha256`, `build-metadata.txt`를 함께 업로드하도록 보강
- Gradle / npm 캐시, metadata 추출, keystore secret 검증 단계를 추가
- `capacitor.config.ts`의 Android 앱 이름을 `머지 머니 타이쿤` 기준으로 정리
- `docs/ANDROID_RELEASE_WORKFLOW.md` 추가

### 버전 / 문서
- `package.json`, `package-lock.json`, `android/app/build.gradle`을 `v1.5.13` 기준으로 갱신
- `README`, `CHANGELOG`, `NEXT_SESSION_HANDOFF_2026-03-10` 최신화

## [1.5.12] - 2026-03-10

### 화면 통일감 보정
- 보드 아래 `생산 CTA`와 `WORLD JOURNEY` 카드 폭을 보드와 같은 기준으로 맞춤
- 상단 quick action 알림 점과 기존 보상 배지 색상을 빨간색 기준으로 통일
- 보드 좌상단 안내를 `핫존` 중심 문구로 단순화하고 `중앙 창구` 표현을 `중앙 핫존`으로 정리
- 코인 드래그/드롭 배치 모션의 과한 오버슈트를 줄이고 더 단단한 스프링 감각으로 조정

### 버전 / 문서
- `package.json`, `package-lock.json`, `android/app/build.gradle`을 `v1.5.12` 기준으로 갱신
- `README`, `CHANGELOG`, `NEXT_SESSION_HANDOFF_2026-03-10` 최신화

## [1.5.11] - 2026-03-10

### 메인 화면 3차 정리
- 상단 액션을 `일일 보상 / 성장 목표 / 업적 / 상점 / 도감` 아이콘 레일로 재배치
- 부스트 진입 버튼을 타이틀 우측 상단으로 이동하고, 활성 부스트는 작은 아이콘 + 툴팁으로 축소
- 하단 `상점 / 도감` 세로 스택을 제거하고 생산 CTA만 메인 플레이 비중으로 유지
- `WORLD JOURNEY` 카드를 요약형으로 축소해 세로 길이를 줄임
- 보드 핫존 배지를 작은 보너스 칩으로 축소

### 문자 / UI 정리
- `App`, `Header`, `Controls`, `BoostStatus`, `TimedRewardTray`, `Board` 기준 주요 노출 문자열을 정리
- 메인 shell에서 중복되던 quick action / boost DOM을 제거하고 상단 기준으로 통일

### 버전 / 문서
- `package.json`, `package-lock.json`, `android/app/build.gradle`을 `v1.5.11` 기준으로 갱신
- `README`, `CHANGELOG`, `NEXT_SESSION_HANDOFF_2026-03-10` 최신화

## [1.5.10] - 2026-03-10

### 메인 화면 2차 재배치
- 일일 보상 / 성장 목표 / 업적 / 부스트를 보드 아래가 아니라 타이틀 아래 상단으로 이동
- 게임 타이틀 크기를 줄여 작은 화면에서 상단 높이를 절약
- 상점 / 도감을 생산 버튼 옆의 아이콘 버튼으로 이동
- 중복 utility / boost 영역을 줄이고 `상단 허브 -> 보드 -> 생산 CTA -> 지역 카드` 구조로 정리

## [1.5.9] - 2026-03-10

### 메인 화면 compact pass
- 메인 화면에서 CTA와 하단 메뉴가 잘리던 문제를 줄이기 위해 여백과 패딩을 축소
- 부스트 상태를 아이콘 버튼 + 툴팁 기반으로 변경
- 보류 보상 트레이를 compact pill strip 형태로 변경
- 하단 보조 카드와 중복 메타를 줄여 메인 플레이 루프 비중을 높임

## [1.5.8] - 2026-03-10

### 웹 실행 경로 복구
- GitHub Pages가 비어 있어 `404`가 나던 상태를 확인
- `.github/workflows/pages-deploy.yml` 추가
- `main` push 또는 수동 Actions 실행으로 Pages 배포가 가능하도록 복구

## [1.5.7] - 2026-03-10

### 진행도 / 구조 정합성
- 지역 목표를 `해금 시점 baseline 이후 진행` 기준으로 계산하도록 수정
- deadlock rescue 지원금을 `totalEarnedMoney`에 합산하지 않도록 수정
- `AchievementModal`이 전체 store를 구독하지 않고 필요한 상태만 selector로 구독하도록 경량화
- handoff 문서 기준일을 `2026-03-10` 기준으로 갱신

## [1.5.6] - 2026-03-10

### 지역 확장 UI 1차
- 메인 화면에서 현재 지역 진입 배너와 지역 선택/해금 모달을 연결
- 지역 진행도, 운영 목표, 다음 해금 조건을 `RegionModal`에서 확인 가능하도록 정리

## [1.5.5] - 2026-03-09

### 경제 / 상점 1차 리밸런싱
- 수익 주기 업그레이드와 머지 보너스 기대값 곡선을 재조정
- 시작 레벨 업그레이드가 기존 보드를 삭제/환급하지 않도록 수정
- 상점 구조를 `핵심 성장 / 부스트 튜닝 / 장기 해금` 기준으로 재정리

## [1.5.4] - 2026-03-09

### 월드 확장 스캐폴딩
- `world/region` 메타 구조 추가
- `unlockedRegionIds`, `currentRegionId` 상태 추가
- `WORLD_EXPANSION_PLAN.md` 작성

## [1.5.3] - 2026-03-09

### 미션 cadence / 업적 보존
- daily / weekly / milestone 미션 reset 구조 정리
- 엔딩 후 `completionist_max_money` 업적이 보존되도록 수정
- 업적 메뉴를 `view-first` 구조로 조정
