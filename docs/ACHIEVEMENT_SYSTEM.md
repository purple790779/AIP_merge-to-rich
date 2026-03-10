# 업적 시스템 가이드

상태: Current  
기준일: 2026-03-09

## 개요
- 정의 파일: `src/game/achievements.ts`
- 총 업적 수: 108개
- 카테고리: 7개
  - discovery
  - merge_mastery
  - wealth_progression
  - collection
  - retention
  - upgrade_mastery
  - completionist
- 보상 지급: `checkAchievements` 경로에서 자동 해금 후 즉시 지급

## 랭크 메타
- 업적은 tier별 점수를 가진다
- 누적 점수로 랭크가 계산된다
- 업적 메뉴 상단에서 현재 랭크 / 점수 / 다음 랭크 진행도를 보여준다

## UI 구조
1. 1차 화면: 카테고리 카드 목록
2. 카테고리 선택: 해당 카테고리 상세 목록
3. 상세 화면: 잠금/해금/진행도/보상 정보 표시

## 상세 화면 UX 원칙
- sticky 헤더 대신 일반 레이아웃으로 유지해 모바일 레이어 충돌을 줄인다
- 잠금 업적은 카드 전체 opacity가 아니라 배경/테두리/텍스트 대비로 구분한다
- 상세 리스트는 단일 스크롤 컨테이너 기준으로 유지한다
- 업적 메뉴는 열 때 `checkAchievements()`를 다시 호출하지 않는 `view-first` 구조다

## 운영 메모
- 업적은 자동 해금, 미션은 수동 보상 수령으로 역할을 분리한다
- 새 업적 추가 시 가능하면 기존 `GameState` 메트릭을 우선 재사용한다
