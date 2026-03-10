# 개발 환경 구성 및 인수인계 가이드 (ONBOARDING)

상태: Current  
기준일: 2026-03-10

이 문서는 새 개발자나 다른 작업 환경(OpenClo, 로컬 Codex, 다른 PC)이 프로젝트를 처음 받아서 개발 및 배포 환경을 빠르게 맞추기 위한 기준 문서입니다.

## 1. 사전 요구사항
- Node.js: `22.x`
- npm: `11+`
- Git
- Android Studio / JDK 21 (Android 릴리즈 작업 시)

## 2. 프로젝트 초기 세팅

```bash
git clone https://github.com/purple790779/AIP_merge-to-rich.git
cd AIP_merge-to-rich
npm install
```

## 3. 로컬 개발 서버 실행

```bash
npm run dev
```

- 기본 접속 주소: `http://127.0.0.1:5173/AIP_merge-to-rich/`
- Vite 기본 주소인 `http://localhost:5173`로 열어도 되지만, 현재 base 경로 검증은 `/AIP_merge-to-rich/` 기준으로 보는 편이 안전합니다.

## 4. Android 릴리즈 / keystore

중요:
- 현재 Play Console 업로드 기준 signing secrets와 keystore는 `purple790779/AIP_merge-to-rich` 저장소 기준으로 관리합니다.
- 새 저장소나 다른 계정으로 옮기면 repository secrets를 다시 넣어야 합니다.

### 4.1. 로컬 릴리즈 빌드용 파일
로컬에서 직접 release build를 만들려면:

1. `upload.keystore` 파일을 준비
2. `android/keystore.properties.example`을 복사해서 `android/keystore.properties` 생성
3. 아래 값을 채움

```properties
ANDROID_KEYSTORE_PATH=upload.keystore
ANDROID_KEY_ALIAS=your_alias
ANDROID_KEYSTORE_PASSWORD=your_store_password
ANDROID_KEY_PASSWORD=your_key_password
```

## 5. GitHub Actions 릴리즈

GitHub Repository `Settings -> Secrets and variables -> Actions` 에 아래 4개가 있어야 합니다.

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_PASSWORD`

workflow:
- 이름: `Android AAB Build`
- 파일: `.github/workflows/android-build.yml`

결과물:
- `app-release.aab`
- `app-release.aab.sha256`
- `build-metadata.txt`

## 6. 자주 쓰는 명령
- `npm run dev`: 개발 서버 실행
- `npm run lint`: 린트
- `npm run build`: 타입체크 + 프로덕션 빌드
- `VITE_BUILD_TARGET=capacitor npm run build`: Android WebView 기준 빌드
- `npx cap sync android`: 웹 빌드 결과를 Android 프로젝트로 반영

## 7. 릴리즈 기본 순서
1. 코드 수정
2. 로컬 확인
3. 버전 업데이트
4. `README`, `CHANGELOG`, 필요 시 `handoff` 문서 업데이트
5. `main` push
6. GitHub Actions artifact 다운로드
7. Google Play Console 업로드
