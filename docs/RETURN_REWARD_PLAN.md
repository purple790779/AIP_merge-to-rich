# 복귀 보상 설계 메모

상태: Current  
기준일: 2026-03-08

현재 구현 상태:
- 구현 완료
- `v1.5.2` 기준 실제 코드와 일치

## 규칙
- 기준 시간대: KST
- 대상 조건: 마지막 접속 기준 48시간 이상 미접속
- 보상 배수:
  - 48시간 이상 ~ 72시간 미만: `x24`
  - 72시간 이상 ~ 168시간 미만: `x48`
  - 168시간 이상: `x90`
- 보상 기준값: 현재 `spawnLevel` 코인 가치
- 상한: `min(기준 코인 가치 x 300, 5,000,000)`

## 상태 필드
- `lastSeenAt`
- `lastSeenDayKey`
- `returnRewardLastEligibleAt`
- `returnRewardLastClaimAt`
- `returnRewardTotalClaimed`
- `pendingReturnReward`

## UX
- 앱 진입 시 eligibility 검사
- 대상이면 `ReturnRewardModal` 자동 노출
- 수령 시 즉시 자산 반영
- 중복 수령 방지를 위해 pending reward와 claim 기록을 함께 관리
- 복귀 보상이 pending이면 동일 진입 시점에서 오프라인 보상을 신규 생성하지 않아 중복 정산 체감을 완화

## 다음 조정 포인트
- 실제 플레이 기준 배수 재조정
- 상한값 재조정
- 광고 시청 시 추가 지급 연결 여부 검토
