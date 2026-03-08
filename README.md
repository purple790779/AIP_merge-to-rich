# Merge Money Tycoon

토스 앱 내 미니게임용 머지/방치형 웹 게임 프로젝트입니다.  
React + Vite + TypeScript + Zustand 기반이며, PWA와 Capacitor(Android) 빌드를 지원합니다.

## 기술 스택
- React 19
- TypeScript 5
- Vite 7
- Zustand
- Framer Motion
- Tailwind CSS 4
- Capacitor 8

## 개발 환경
- Node.js `22.x` (루트 `.nvmrc` 기준)
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

## 품질 점검
```bash
npm run lint
npm run build
```

## 빌드 타겟
- 기본 웹/PWA 빌드:
```bash
npm run build
```

- Capacitor(WebView) 빌드 경로:
```bash
# bash/zsh
VITE_BUILD_TARGET=capacitor npm run build

# PowerShell
$env:VITE_BUILD_TARGET='capacitor'; npm run build
```

- PWA 플러그인 비활성(빌드 문제 분리용):
```bash
# bash/zsh
VITE_ENABLE_PWA=false npm run build

# PowerShell
$env:VITE_ENABLE_PWA='false'; npm run build
```

## Android 릴리즈 서명
릴리즈 빌드는 아래 4개 값을 통해 서명 정보를 주입합니다.
- `ANDROID_KEYSTORE_PATH`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_PASSWORD`

예시 템플릿: `android/keystore.properties.example`

중요:
- `keystore` 파일은 저장소에 커밋하지 않습니다.
- CI는 `ANDROID_KEYSTORE_BASE64` GitHub Secret을 복원해 `upload.keystore`를 생성합니다.

## 데이터 저장/개인정보
- 게임 데이터는 브라우저 로컬 스토리지에 저장됩니다.
- 서버로 개인정보를 수집/전송하지 않습니다.
- 상세 정책: `public/privacy.html`, `docs/PRIVACY_POLICY.md`

## 문서 가이드 (Documentation)
원활한 인수인계와 향후 개발을 위해 다음 문서들을 반드시 먼저 읽어보시길 권장합니다.

- **[인수인계 및 환경세팅 가이드 `docs/ONBOARDING.md`](docs/ONBOARDING.md)**: 🚨 새 개발 환경 구축 및 Secret 보호
- **[시스템 아키텍처 및 로직 `docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)**: React, Zustand, 상태 로직 분석
- **[에셋 자동화 및 AI 에이전트 지침 `docs/ASSET_GUIDE.md`](docs/ASSET_GUIDE.md)**: 저작권 우회를 위한 AI 기반 에셋 자동화 가이드
- **[신규 게임 템플릿화 구축 `docs/TEMPLATE_GUIDE.md`](docs/TEMPLATE_GUIDE.md)**: 현재 프로젝트 기반의 보일러플레이트 구축 가이드

### 히스토리 및 기타
- 변경 이력: `docs/CHANGELOG.md`
- 종합 개발 로그: `docs/DEV_LOG_FULL.md`
- 로드맵: `docs/ROADMAP.md`
- 트러블슈팅: `docs/TROUBLESHOOTING.md`
