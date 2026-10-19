# 책둥지 모바일 (@bookdoongji/mobile)

Expo SDK 52 · React Native · TypeScript 기반 책둥지 앱.

## 화면 구성

| 구분 | 화면 | 파일 |
| --- | --- | --- |
| 하단 탭 | 홈 (배너 · 카테고리 숏컷 · 추천/신간) | `src/screens/HomeScreen.tsx` |
| 하단 탭 | 카테고리 (칩 필터 + 도서 목록) | `src/screens/CategoryScreen.tsx` |
| 하단 탭 | 내 서재 (목업 · 진행률 · 대여 만료) | `src/screens/LibraryScreen.tsx` |
| 하단 탭 | 마이 (프로필 · 메뉴 목업) | `src/screens/MyScreen.tsx` |
| 스택 | 상품 상세 (소장/대여/무료 옵션 선택) | `src/screens/ProductDetailScreen.tsx` |
| 스택 | 검색 (디바운스 · 추천 검색어) | `src/screens/SearchScreen.tsx` |

내비게이션 정의와 라우트 타입은 `src/navigation/AppNavigator.tsx` 에 있다.

## 실행 방법

모노레포 루트에서 의존성을 설치하고 공유 패키지를 빌드한 뒤 Expo 개발 서버를 띄운다.

```bash
# 저장소 루트
pnpm install
pnpm --filter @bookdoongji/shared build

# apps/mobile
cd apps/mobile
npx expo start
```

- `a` → Android 에뮬레이터, `i` → iOS 시뮬레이터, 실기기는 Expo Go 앱으로 QR 스캔
- 의존성 버전이 SDK 52와 맞는지 확인: `npx expo install --check`

> pnpm 모노레포에서 Metro가 패키지를 못 찾으면 루트 `.npmrc`에 `node-linker=hoisted`를 추가하고 다시 설치한다
> (Expo SDK 52는 pnpm의 격리형 node_modules를 완전히 지원하지 않는다).

## 백엔드 API 연결

`src/lib/api.ts` 는 `EXPO_PUBLIC_API_URL` 이 있으면 NestJS 백엔드(`/v1/commerce/catalog/*`)를 호출하고,
없거나 요청이 실패(3초 타임아웃 포함)하면 `src/data/mock.ts` 목업으로 폴백한다.

```bash
# apps/mobile/.env
EXPO_PUBLIC_API_URL=http://192.168.0.10:3001   # 실기기: PC의 LAN IP
# Android 에뮬레이터는 http://10.0.2.2:3001, iOS 시뮬레이터는 http://localhost:3001
```

## 목업 데이터

`src/data/mock.ts` 의 카테고리 · 도서 · SKU는 `apps/web/src/data/mock.ts`,
`apps/api/src/commerce/catalog/catalog.mock-data.ts` 와 같은 내용을 유지한다.
배너 · 내 서재 · 프로필 목업은 모바일 전용이다.
표지는 아직 CDN이 없어 색 블록 자리표시 표지(`BookCover`)로 그린다.
