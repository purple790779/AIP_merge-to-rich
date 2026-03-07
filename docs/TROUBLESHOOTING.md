# Merge Money Tycoon 트러블슈팅 가이드

작성일: 2026-03-05

## 1. 빠른 점검 순서
1. Node 버전 확인: `node -v` (`22.x` 권장, `.nvmrc` 기준)
2. 의존성 확인: `npm install`
3. 정적 점검: `npm run lint`
4. 빌드 검증: `npm run build`
5. 개발 실행: `npm run dev`

### 빌드 크래시 원인 분리 커맨드
- 기본 빌드:
  - PowerShell: `npm run build`
  - bash/zsh: `npm run build`
- PWA 플러그인 비활성 빌드:
  - PowerShell: `$env:VITE_ENABLE_PWA='false'; npm run build`
  - bash/zsh: `VITE_ENABLE_PWA=false npm run build`
- 증상 예시: `vite build`가 `modules transformed` 직후 종료코드 `-1073740791`로 종료

## 2. 증상별 대응

### A. 빌드가 실패한다
- 증상 예시:
  - `TS2552: Cannot find name 'set'`
  - `vite config` 로딩 실패
  - `vite build` 비정상 종료 (`-1073740791`)
- 확인 포인트:
  - `src/store/useGameStore.ts`의 `onRehydrateStorage` 구현이 최신인지 확인
  - `node -v`가 `22.x`인지 확인
  - `VITE_ENABLE_PWA=false`일 때도 동일 증상인지 비교
  - 로컬 보안 정책으로 `esbuild` 실행 차단(`EPERM`)이 있는지 확인
- 조치:
  - 현재 기준 구현은 하이드레이션 콜백에서 상태를 직접 보정해야 함
  - Node를 `22.x`로 통일한 뒤 재빌드
  - PWA 비활성 빌드가 정상이라면 `vite-plugin-pwa` 설정/캐시를 우선 점검
  - 권한 문제면 관리자 권한 터미널 또는 보안 정책 예외로 재시도

### B. 수익 배율 업그레이드가 체감되지 않는다
- 증상:
  - 2배 부스트 OFF 상태에서 배율 업그레이드가 적용되지 않는 것처럼 보임
- 확인 포인트:
  - `applyIncomeMultipliers` 공통 함수 사용 여부
  - `addMoney`, `tryMerge`(머지 보너스) 모두 공통 함수 통과 여부
- 조치:
  - 수익 배율은 항상 적용, `DOUBLE_INCOME`은 추가 곱(`x2`)으로 처리해야 함

### C. 머지 보너스 수치가 설명과 다르다
- 증상:
  - 머지 보너스가 배율/부스트와 중첩되지 않음
- 확인 포인트:
  - 머지 시 `totalMoney += mergeBonus` 직접 가산 코드 존재 여부
- 조치:
  - 머지 보너스도 공통 배율 함수로 계산 후 반영

### D. “처음부터 다시하기” 후 상태가 이상하다
- 증상:
  - 일부 업그레이드/도감/히스토리 값이 남거나 초기값이 경로마다 다름
- 확인 포인트:
  - `App.tsx`에서 부분 `setState`로 리셋하고 있는지 확인
- 조치:
  - `resetGame()`으로 전체 초기화 후 필요한 예외(예: `max_money` 업적)만 선택 복원

### E. 업적 배지/토스트가 늦거나 누락된다
- 증상:
  - 조건을 달성했는데 업적 UI 반영이 지연됨
- 확인 포인트:
  - 폴링 방식만 사용하는지 확인
  - 생성/합성/수익/업그레이드 액션에서 즉시 체크하는지 확인
- 조치:
  - 주요 액션 완료 시 `checkAchievements()` 호출
  - UI는 `unlockedAchievements` 변화 감지로 배지/토스트 노출

### F. 도감 해금이 실제 발견 이력과 다르다
- 증상:
  - 실제로 못 본 코인이 해금된 것처럼 보임
- 확인 포인트:
  - 도감 해금 기준이 `spawnLevel`, `board max level`인지 확인
- 조치:
  - `discoveredLevels` 기반으로 해금/수집률 계산

### G. 보드가 비었는데 생산 버튼이 비활성 상태다
- 증상:
  - 머지로 빈칸이 생겼는데 생산 버튼이 즉시 활성화되지 않음
- 확인 포인트:
  - `Controls.tsx`가 `coins.length` selector에 직접 구독하는지 확인
- 조치:
  - 보드 full 판단을 함수 호출(`isBoardFull()`)이 아닌 `coins.length >= TOTAL_CELLS` 구독으로 유지

## 3. 상태 저장(퍼시스트) 마이그레이션 체크리스트
- 하이드레이션 시 아래 값 기본 보정 확인:
  - `pps`
  - `discoveredLevels`
  - `lastDiscoveredLevel`
  - `incomeMultiplierLevel`
  - `autoMergeInterval`
  - `totalEarnedMoney`

## 4. 회귀 테스트 체크리스트
- Node 22 환경에서 `npm run build`가 정상 완료되는지 확인
- 수익 배율 업그레이드만 올린 뒤(2배 부스트 OFF) 수익 증가 확인
- 2배 부스트 ON 시 동일 수익이 정확히 2배 추가로 중첩되는지 확인
- 머지 보너스도 같은 배율 규칙이 적용되는지 확인
- 보드 가득찬 상태에서 머지 후 생산 버튼이 즉시 활성화되는지 확인
- 엔딩 진입 후 리셋 시 게임이 정상 초기화되는지 확인
- 업적 달성 직후 배지/토스트가 즉시 노출되는지 확인
- 도감이 실제 발견 코인만 해금되는지 확인

## 5. 참고 문서
- 버그/이슈 상세 리포트: `docs/BUG_ISSUE_REPORT.md`
- 전체 개발 로그: `docs/DEV_LOG_FULL.md`
- 변경 이력: `docs/CHANGELOG.md`
