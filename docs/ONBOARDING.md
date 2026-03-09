# 개발 환경 구축 및 인수인계 가이드 (ONBOARDING)

상태: Current  
기준일: 2026-03-08

본 문서는 새로운 개발자(또는 새로운 PC)가 이 프로젝트를 처음 체크아웃받고 개발 및 배포 환경을 세팅하기 위한 필수 가이드입니다.

## 1. 사전 요구사항 (Prerequisites)
프로젝트를 실행하려면 다음 소프트웨어가 로컬 환경에 설치되어 있어야 합니다.
- **Node.js**: `v22.x` 이상 (최소 v20 LTS 권장)
- **npm**: `v11.x` 이상 (Node.js 설치 시 포함)
- **Git**

## 2. 프로젝트 초기 세팅
GitHub 저장소에서 프로젝트를 클론하고 의존성을 설치합니다.

```bash
# 1. 저장소 클론
git clone https://github.com/Master-Tak79/AIP_merge-to-rich.git

# 2. 프로젝트 디렉토리 이동
cd AIP_merge-to-rich

# 3. 패키지 설치
npm install
```

## 3. 로컬 개발 서버 실행
다음 명령어를 통해 개발용 로컬 웹 서버를 구동합니다.

```bash
npm run dev
```
브라우저에서 `http://localhost:5173` 접속 시 방치형 머지 게임이 실행됩니다. 코드를 수정하면 브라우저가 자동 새로고침(HMR) 됩니다.

## 4. 🚨 중요: Android 빌드 및 Keystore (보안) 설정

이 프로젝트(v1.4.0)부터 보안을 위해 **Android 릴리즈 키스토어(`release.keystore`)는 Git 저장소에 포함되지 않습니다.**
프로덕션용 `.aab` 파일을 빌드하거나 GitHub Actions에서 자동 배포하려면 다음 설정이 "반드시" 필요합니다.

### 4.1. 로컬 빌드용 Keystore 세팅
1. 인수인계 받은 (또는 백업해 둔) 원본 `release.keystore` 파일을 로컬 저장소의 `android/app/` 폴더 안으로 복사합니다.
2. `android/keystore.properties.example` 파일을 복사하여 `android/keystore.properties`를 생성합니다.
3. `android/keystore.properties`에 아래와 같이 비밀번호 및 정보를 기입합니다. (이 파일은 `.gitignore`에 등록되어 안전합니다.)

```properties
ANDROID_KEYSTORE_PATH=release.keystore
ANDROID_KEY_ALIAS=저장된_키스토어_별칭(alias)
ANDROID_KEYSTORE_PASSWORD=스토어비밀번호
ANDROID_KEY_PASSWORD=별칭비밀번호
```

### 4.2. GitHub Actions CI/CD 환경 세팅
GitHub 서버에서 자동으로 앱 빌드를 생성하게 하려면, GitHub 리포지토리의 **[Settings -> Secrets and variables -> Actions]** 메뉴에서 다음 4개의 Secret을 모두 등록해야 합니다.

1. **`ANDROID_KEYSTORE_BASE64`**: 원본 `.keystore` 파일을 Base64 문자열로 인코딩한 값입니다. 공백이나 줄바꿈 없이 한 줄로 입력해야 합니다.
   - *Windows Base64 인코딩 방법*:
     ```powershell
     [Convert]::ToBase64String([IO.File]::ReadAllBytes("release.keystore")) | Set-Clipboard
     ```
2. **`ANDROID_KEY_ALIAS`**: 예) `key0`
3. **`ANDROID_KEY_PASSWORD`**: 키 비밀번호
4. **`ANDROID_KEYSTORE_PASSWORD`**: 스토어 비밀번호

위 4개가 모두 정상 등록되면, `main` 브랜치에 `git push`가 발생할 때마다 GitHub Actions가 자동으로 빌드를 실행하여 프로덕션용 `app-release.aab` 파일을 제공합니다.

### 4.3. GitHub Actions에서 AAB 다운로드하기
Secrets 등록이 완료되었다면, 코드를 `main` 브랜치에 Push하면 자동으로 빌드가 시작됩니다.

1. GitHub 저장소 페이지 → 상단 **Actions** 탭 클릭
2. 최신 **"Android Build"** 워크플로우 선택
3. **Status**가 ✅ `Success`인지 확인
4. 하단 **Artifacts** 섹션에서 **`app-release-aab`** 클릭 → ZIP으로 다운로드
5. ZIP 압축 해제 → 내부의 `app-release.aab` 파일이 Google Play Console에 업로드할 서명된 App Bundle입니다

> ⚠️ 빌드 실패 시: Actions 로그 상단의 디버그 메시지에서 어떤 Secret이 **EMPTY**인지 확인하세요. 대부분은 Secret 미등록 또는 오타 문제입니다.

## 5. 자주 쓰는 명령어 도감
- `npm run dev`: 웹 로컬 개발 서버 열기
- `npm run build`: 정적 웹 파일 빌드 (웹앱/PWA 전용)
- `VITE_BUILD_TARGET=capacitor npm run build`: Android Capacitor 전용 빌드
- `npx cap sync android`: 수정한 웹 빌드 결과물을 Android 프로젝트로 복사동기화

## 6. 릴리즈 배포 워크플로우 (전체 흐름)
코드 수정부터 구글 플레이 배포까지의 전체 과정입니다.

```text
1. 코드 수정 (WebStorm, VS Code 등)
   ↓
2. 로컬 테스트: npm run dev → 브라우저에서 동작 확인
   ↓
3. 버전 범프:
   - package.json 의 "version" 필드
   - android/app/build.gradle 의 versionCode (+1) 및 versionName
   - docs/CHANGELOG.md 에 변경 이력 추가
   ↓
4. 커밋 & 푸시:
   git add .
   git commit -m "release: v1.X.X - 변경사항 요약"
   git push
   ↓
5. GitHub Actions 자동 빌드 (약 3~5분 소요)
   ↓
6. Actions → Artifacts → app-release-aab 다운로드
   ↓
7. Google Play Console → 프로덕션 → 새 버전 만들기 → aab 업로드 → 검토 제출
```
