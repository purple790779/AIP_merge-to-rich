# 시스템 아키텍처 및 로직 가이드 (ARCHITECTURE)

본 문서는 프로젝트의 뼈대와 핵심 게임 로직(Global State, 그리드 연산)을 파악하고, 추후 콘텐츠 추가 시 어디를 수정해야 하는지 설명하는 기술 설계도입니다.

## 1. 폴더 및 파일 구조

```text
src/
├── components/       # UI 및 렌더링을 담당하는 React 컴포넌트들
│   ├── Board.tsx     # 4x4 머지 그리드 구현
│   ├── Coin.tsx      # 개별 코인 객체 (DnD 애니메이션)
│   ├── StoreModal.tsx# 업그레이드 상점 로직 연결
│   └── ...
├── store/
│   └── useGameStore.ts # [핵심] 게임의 모든 규칙과 상태를 관장하는 Zustand 전역 스토어
├── types/
│   └── game.ts       # TypeScript 인터페이스 (상태, 통계, 코인 타입 등)
├── index.css         # 글로벌 TailwindCSS 엔트리 및 애니메이션 키프레임
└── main.tsx          # React 마운트 지점 및 PWA Service Worker 런타임
```

## 2. 상태 관리 (State Management)
이 게임은 `Zustand` (`src/store/useGameStore.ts`)를 이용해 모든 상태 관리를 중앙 집중화합니다. React 컴포넌트는 단지 이 스토어의 값을 꺼내서 렌더링(View)할 뿐입니다.

- **핵심 기술**: `zustand/middleware/persist`를 사용하여 유저의 모든 게임 데이터(Coin 배열, 누적 골드, 강화 레벨 등)를 브라우저의 `localStorage`에 자동 저장하고 복원합니다.
- **밸런스 초기화**: 밸런스가 완전히 갈아엎어지는 큰 패치 시, `useGameStore.ts` 하단의 `version: 'vX'` 값을 한 단계 올리면 접속자들의 기존 데이터가 초기화됩니다. (현재 `v6`)

## 3. 핵심 규칙: 머지 앤 그리드 (Merge & Grid)
게임판 공간은 1차원 배열(0~15 인덱스)을 4x4 프런트엔드 CSS Grid에 맞추어 표시합니다.

- **코인 생성**: 빈 공간(`findRandomEmptyCell`) 추첨 후 새 코인 객체 배열 삽입
- **코인 병합(`tryMerge`)**:
  - 드래그 앤 드롭으로 출발지(source)와 도착지(target) 인덱스 계산
  - 대상 칸에 동전이 있고 둘의 `level`이 같다면, 대상 동전의 `level`을 `+1` 증가
  - 출발지 동전은 배열에서 삭제

## 4. 커스텀 확장 체트리스트 (How-to Guide)

### 4.1. 새로운 등급의 코인을 추가하려면?
현재 `level: 1`부터 `level: 16`까지의 코인이 있습니다. 단계를 확장하려면 다음을 수행하세요:

1. **레벨 정의 추가**: `src/types/game.ts` 의 `COIN_LEVELS` 및 `COIN_PPS` 상수에 `level: 17` 이상의 데이터(이름, 초당 수익)를 추가합니다.
2. **이미지 에셋 추가**: `public/assets/coins/` 폴더 안에 `coin_17.png` 이미지를 넣습니다. (UI 컴포넌트인 `src/components/Coin.tsx`가 레벨 숫자에 맞춰 이 이미지를 자동 로드합니다)
3. **상점/업그레이드 대응**: 코인 레벨이 확장되었으니, 상점(`StoreModal.tsx`)에서 17레벨 동전을 상점에서 바로 살 수 있도록 추가 로직을 붙일 수 있습니다.

### 4.2. 업그레이드 밸런스 비용을 수정하려면?
상점 업그레이드의 가격 인플레이션 커브는 `useGameStore.ts`의 각 업그레이드 항목 공식에 정의되어 있습니다.

*수정 예시:*
```typescript
// useGameStore.ts 내부 업그레이드 함수 중
buyCoinLevelUpgrade: () => set((state) => {
    // ⬇️ 가격 밸런스를 바꾸고 싶다면 Math.pow(x, 1.8) 등의 지수 계수를 조절하세요
    const cost = Math.floor(100 * Math.pow(state.coinLevelUpgrade, 3.5));
    if (state.score < cost) return state;
    return { score: state.score - cost, coinLevelUpgrade: state.coinLevelUpgrade + 1 };
}),
```

### 4.3 UI를 대대적으로 갈아엎으려면?
데이터(Store)와 껍데기(UI Component)가 분리되어 있습니다. Zustand 스토어를 건들릴 필요 없이, `src/components/` 산하의 `tsx` 파일들의 Tailwind 클래스와 Framer Motion(애니메이션) 설정만 뜯어고치면 작동에 100% 이상이 생기지 않습니다.
