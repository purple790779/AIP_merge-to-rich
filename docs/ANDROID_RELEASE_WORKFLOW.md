# Android AAB Release Workflow

상태: Current  
기준일: 2026-03-10

## 목적
- GitHub Actions로 서명된 `AAB`를 만들고
- Google Play Console에 바로 올릴 수 있는 artifact를 안정적으로 받는 것

## 기준 저장소
- 현재 릴리즈 기준 저장소: [purple790779/AIP_merge-to-rich](https://github.com/purple790779/AIP_merge-to-rich)
- 이유:
  - 기존 Google Play 업로드 이력이 이 저장소 기준
  - signing secrets와 keystore가 이 저장소에 이미 있음

## 현재 workflow
- 파일: [.github/workflows/android-build.yml](D:/Projects/Web/AIP_merge-to-rich/.github/workflows/android-build.yml)
- 이름: `Android AAB Build`
- 트리거:
  - `main` push
  - GitHub Actions `Run workflow`

## 결과물
Actions 완료 후 artifact 1개가 생성됩니다.

artifact 구성:
- `app-release.aab`
- `app-release.aab.sha256`
- `build-metadata.txt`

artifact 이름 형식:
- `merge-money-tycoon-aab-v<app_version>-vc<version_code>`

## 필요한 GitHub Secrets
GitHub Repository `Settings -> Secrets and variables -> Actions` 에 아래 4개가 있어야 합니다.

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_PASSWORD`

설명:
- `ANDROID_KEYSTORE_BASE64`: 업로드용 keystore 파일을 base64로 인코딩한 값
- 나머지 3개: 서명용 alias / 비밀번호

## keystore base64 만드는 방법
PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("D:\path\to\upload.keystore")) | Set-Clipboard
```

복사된 값을 `ANDROID_KEYSTORE_BASE64` secret에 넣으면 됩니다.

## 배포 순서
1. 버전 올리기
2. `main`에 push
3. GitHub `Actions` 탭에서 `Android AAB Build` 확인
4. 완료 후 artifact 다운로드
5. `app-release.aab`를 Google Play Console에 업로드

## 현재 버전 기준
- 앱 버전: `v1.5.14`
- Android `versionCode`: `19`
- Android `versionName`: `1.5.14`

## 주의사항
- 이 workflow는 `signed release AAB`를 만듭니다. secrets가 비어 있으면 실패합니다.
- artifact에 `sha256`과 `build-metadata.txt`를 같이 넣어 어떤 커밋에서 나온 빌드인지 추적할 수 있게 했습니다.
- `capacitor.config.ts`의 앱 이름은 현재 `머지 머니 타이쿤` 기준입니다.

## 실패 시 우선 확인할 것
1. keystore secret 4개가 모두 들어있는지
2. `ANDROID_KEYSTORE_BASE64`가 실제 keystore를 base64 인코딩한 값인지
3. `versionCode`가 이전 Play Console 업로드본보다 큰지
4. `main`에 반영된 커밋이 맞는지
