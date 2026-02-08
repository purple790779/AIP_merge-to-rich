# Merge Money Tycoon 버그/이슈 리포트

작성일: 2026-02-08  
대상 프로젝트: `merge-money-tycoon` (`v1.3.0` 기준 코드)

## 1. 요약
- 리뷰 기준으로 빌드 실패 1건, 수익 계산 로직 2건, 상태 리셋/도감/업적 반영 이슈를 확인했다.
- 2026-02-08 기준으로 아래 항목은 코드에 반영 완료했다.
- 검증 결과 `npm run lint`, `npm run build` 모두 통과했다.

## 2. 이슈 상세

### [치명도: Critical] 빌드 실패 (`TS2552: set is not defined`)
- 증상: `npm run build` 시 `src/store/useGameStore.ts`의 `onRehydrateStorage`에서 컴파일 오류 발생.
- 원인: `persist` 옵션 영역에서 `set(...)`을 호출했지만 해당 스코프에 `set`이 없음.
- 조치: 하이드레이션 콜백에서 상태 객체 직접 보정 방식으로 변경.
- 반영 파일: `src/store/useGameStore.ts`
- 상태: 해결 완료

### [치명도: High] 수익 배율이 부스트 OFF일 때 미적용
- 증상: 수익 배율 업그레이드를 올려도 `DOUBLE_INCOME` 부스트가 꺼져 있으면 수익이 1배로 처리됨.
- 원인: `effectiveMultiplier = isDoubleIncome ? incomeMultiplier * 2 : 1` 로직.
- 조치: 공통 배율 함수로 수익 배율은 항상 적용하고, 2배 부스트는 추가 곱으로만 반영.
- 반영 파일: `src/store/useGameStore.ts`, `src/components/StoreModal.tsx`
- 상태: 해결 완료

### [치명도: High] 머지 보너스에 수익 배율/2배 부스트 미적용
- 증상: UI/문서 설명과 달리 머지 보너스는 배율/부스트 중첩이 되지 않음.
- 원인: 머지 보너스를 `totalMoney`에 직접 가산.
- 조치: 머지 보너스에도 공통 배율 함수 적용.
- 반영 파일: `src/store/useGameStore.ts`
- 상태: 해결 완료

### [치명도: High] 엔딩 리셋이 부분 초기화로 동작
- 증상: 엔딩 모달의 "처음부터 다시하기" 후 일부 상태가 남거나 경로별 초기값이 달라질 수 있음.
- 원인: `useGameStore.setState({...})` 부분 업데이트 사용.
- 조치: `resetGame()` 기반으로 전체 초기화 후 필요한 업적만 선택 유지.
- 반영 파일: `src/App.tsx`
- 상태: 해결 완료

### [치명도: Medium] 도감 해금 기준 불일치
- 증상: 실제 발견하지 않은 코인이 스폰 레벨/현재 최고 레벨 기준으로 해금된 것처럼 보임.
- 원인: 도감 해금 판단이 `discoveredLevels`가 아닌 `max(currentMax, spawnLevel)` 사용.
- 조치: 도감 해금/카운트를 `discoveredLevels` 기준으로 변경.
- 반영 파일: `src/components/CollectionModal.tsx`
- 상태: 해결 완료

### [치명도: Medium] 업적 반영 지연/누락 가능성
- 증상: 5초 폴링 시점 사이에 조건을 잠깐 만족하면 배지/토스트 체감이 늦거나 놓칠 수 있음.
- 원인: App 주기 체크 중심 구조.
- 조치:
  - 주요 액션(생성/합성/수익/업그레이드) 완료 시 `checkAchievements()` 즉시 호출
  - 업적 UI 배지는 `unlockedAchievements` 변화 감지 방식으로 전환
- 반영 파일: `src/store/useGameStore.ts`, `src/App.tsx`, `src/components/AchievementModal.tsx`
- 상태: 해결 완료

### [치명도: Low] 린트 규칙 위반
- 증상: `set-state-in-effect`, `refs`, `unused vars` 관련 오류로 린트 실패.
- 조치: 비동기 큐 처리/불필요 변수 제거/렌더 중 ref 접근 제거.
- 반영 파일: `src/App.tsx`, `src/components/Header.tsx`, `src/components/AchievementModal.tsx`, `src/components/StoreModal.tsx`
- 상태: 해결 완료

## 3. 추가 개선 반영
- `totalEarnedMoney` 누적값이 실제 수익 반영되도록 업데이트.
- 스토어 하이드레이션 시 마이그레이션 기본값 보정 강화:
  - `discoveredLevels`
  - `incomeMultiplierLevel`
  - `autoMergeInterval`
  - `totalEarnedMoney`

반영 파일: `src/store/useGameStore.ts`

## 4. 검증 결과
- 실행 일시: 2026-02-08
- 명령:
  - `npm run lint` ✅
  - `npm run build` ✅

## 5. 남은 리스크(코드 외)
- 로드맵 문서에 명시된 모바일 `Pull-to-refresh` 완전 차단은 별도 작업 필요.
- 저사양 기기에서 코인 수가 많은 상황의 프레임 최적화는 추가 프로파일링 권장.
