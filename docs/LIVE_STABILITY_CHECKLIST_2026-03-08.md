# 라이브 안정성 체크리스트 (2026-03-08)

상태: Report  
기준일: 2026-03-08

## 결과 요약
- 대상 버전: `v1.5.2`
- 결과: 치명 이슈 없음, 즉시 배포 차단 이슈 없음

## 체크 항목
1. Build / lint
- 상태: PASS
- 근거:
  - `npm run lint` 성공
  - `npm run build` 성공 (TypeScript + Vite + PWA 산출 완료)

2. Local dependency resolution (Rollup optional deps)
- 상태: PASS
- 확인: `@rollup/rollup-linux-x64-gnu` 누락으로 재현되던 빌드 실패를 `npm i` 재설치로 복구

3. Daily reward claim guardrail
- 상태: PASS (코드 경로 점검)
- 확인: `isDailyRewardClaimAvailable(lastClaimDayKey, lastClaimAt)` 경로로 시계 역행 시 수령 차단

4. Timed reward reliability
- 상태: PASS (코드 경로 점검)
- 확인:
  - `refreshTimedRewards()`에서 `lastSeenAt` 역행 저장 방지
  - 복귀 보상 pending 시 오프라인 보상 신규 생성 억제
  - pending reward가 있으면 기존 값을 덮어쓰지 않음

5. UI consistency
- 상태: PASS
- 확인: 상단 일일 보상 배지와 모달 수령 가능 상태가 동일 store 판정(`canClaimDailyReward`)을 사용

## 저위험 수정 내역
- 리텐션 업적 4종 추가
  - 일일 보상 7회 / 30회
  - 복귀 보상 3회
  - 오프라인 보상 10회

## 잔여 리스크
- 기기 시스템 시간을 의도적으로 조작하는 극단 케이스는 완전 차단이 어려워, 서버 검증 없는 로컬 게임 한계가 존재
- timed reward 수치(복귀 x30/x60/x120, 오프라인 50%/최대 4시간)는 실플레이 데이터 기반 재튜닝 필요
