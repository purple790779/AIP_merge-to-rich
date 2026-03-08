# 향후 프로젝트 템플릿화 가이드 (TEMPLATE_GUIDE)

이 프로젝트(`AIP_merge-to-rich`)는 매우 훌륭하고 안정적인 모던 프론트엔드 + 앱 하이브리드 보일러플레이트(Boilerplate, 템플릿)를 갖추고 있습니다.

이후 **새로운 토스 미니앱이나 방치형/클리커 방식의 웹/앱 게임**을 만드실 때, 바닥(from scratch)부터 시작하지 마시고 **이 프로젝트 저장소를 그대로 복사해서 템플릿으로 활용하는 것**을 적극 권장합니다.

## 1. 이 템플릿이 가지고 있는 강력한 기본 "무기"들
- **PWA (Progressive Web App)**: 오프라인 캐싱과 홈 화면 추가 기능(서비스 워커)이 이미 세팅되어 있음 (`vite-plugin-pwa`)
- **React 19 + TypeScript + Vite**: 초고속 렌더링과 강력한 타입 체크, 최고속도 로컬 빌드 환경
- **Capacitor**: 웹으로 짠 코드를 명령어 1줄로 완전한 Android/iOS 네이티브 앱 형태로 패키징
- **Zustand + Persist**: 복잡한 DB 설정 없이 브라우저 로컬 저장소에 유저 데이터를 무한 저장/복구 가능
- **GitHub Actions 자동화 파이프라인**: (초기 세팅만 해주면) `git push` 명령어 한 줄로 곧장 구글 플레이용 `.aab` 암호화 번들이 만들어져 나오는 클라우드 공장 환경 (`android-build.yml`)
- **디자인/유스케이스 방어 로직**: React `ErrorBoundary`를 통한 튕김 런타임 방어 UI가 구비됨

## 2. 새로운 게임을 이 템플릿으로 시작하는 절차

미래에 "새 게임 프로젝트 만들어야겠다" 하실 때, 다음 절차를 거치세요:

### Step A: 코드 복제와 정리
1. 현재 `AIP_merge-to-rich` 폴더 자체를 PC의 다른 곳에 "새_프로젝트_이름" 폴더로 복사합니다. 그 후 내부의 `.git` 숨김 폴더를 지우고 새로 `git init`을 합니다.
2. 게임 특화 로직인 `src/store/useGameStore.ts` 의 변수들과 `src/components/` 산하의 보드/코인 컴포넌트들을 모두 지우거나 초기화합니다.
3. 하지만 `main.tsx`와 `App.tsx`의 골격(PWA 등록 코드와 ErrorBoundary)은 유지합니다.
4. `index.css`의 글로벌 설정과 Tailwind 환경(`tailwind.config` 대신 v4 CSS 세팅)은 그대로 써먹습니다.

### Step B: 이름 변경 (Renaming)
새 게임의 정체성으로 이름을 바꿔줍니다.
- `package.json` 안의 `name` (예: "new-clicker-game")
- `capacitor.config.ts` 안의 `appId` (예: "com.yourcompany.newgame")와 `appName` (예: "결정의 신 복각판")
- 안드로이드 실제 표시 이름인 `android/app/src/main/res/values/strings.xml` 의 `<string name="app_name">` 내부 값 변경 

### Step C: 빌드/보안 세팅 분리
1. 구글 플레이 스토어 정책상, **절대로 기존 게임의 키스토어(`release.keystore`)를 재사용해서 서명하면 안 됩니다.** 앱 업데이트가 아닌 엉뚱한 충돌을 유발합니다.
2. 새 프로젝트에 맞는 새로운 이름의 `.keystore` 파일을 새로 발급받습니다. (이때도 잊지 말고 AI 에이전트에게 "안드로이드 키스토어 파일 비밀번호 1234로 하나 새로 짜줘" 하면 알아서 파워쉘/cmd 명령어로 만들어 줍니다.)
3. 새 프로젝트 용으로 GitHub 저장소를 파고, 아까 했던 것처럼 새로 만든 키스토어를 Base64로 뽑아내서 GitHub Secrets 4종 세트(`ANDROID_KEYSTORE_BASE64` 등)를 등록합니다.

## 3. 요약 (AI에게 신작 맡길 때의 주문법)

가장 편한 방법은 빈 깡통 프로젝트를 만들 때, 저(AI 에이전트)를 호출하셔서 이렇게 복붙해서 명령을 내리십시오.

> **작업 명령서**:
> "내 컴퓨터의 `E:\Daddy_Project\AIP_merge-to-rich` 폴더 소스를 베이스로 해서 전혀 다른 장르의 클리커 게임을 하나 만들려고 해.
> 현재 폴더를 `E:\Daddy_Project\New_Game`으로 복사하는 명령어를 써서 환경을 구축해주고, 새 저장소를 위해 `.git`, `node_modules`는 날리고 초기화 해줘.
> 그리고 기존에 있던 합치기(Merge) 관련 컴포넌트나 Zustand 데이터는 싹 지워주고, `package.json`과 `capacitor` 설정들의 이름을 'New Awesome Game'으로 교체해서 깨끗한 보일러플레이트 상태로 만들어줘."

이 명령 한 번이면, AI가 기존의 최적화된 빌드/배포 세팅은 그대로 살려두면서 내용물만 싹 뺀 채로 10분 만에 새 프로젝트 세팅을 마칠 것입니다!
