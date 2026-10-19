# 책둥지 (BookDoongji) — 수험서 eBook 플랫폼

## 개요
sconn.io(수험서 eBook 플랫폼)를 참고한 오리지널 클론 프로젝트.
**브랜드·문구·상품 데이터·이미지·디자인 토큰을 복사하지 말 것. 기능·구조만 참고해 오리지널로 구현.**

## 참고 자료 (reference/)
- `reference/STRATEGY.md` — 전체 기술 전략 (필독)
- `reference/docs/backend-api-design.md` — API 설계
- `reference/research/agy-research.md` — sconn.io 리서치
- `reference/research/rea-apk-analysis.md` — 원본 앱 APK 분석

## 기술 스택 (STRATEGY.md 기준)
- 모노레포: Turborepo + pnpm workspaces
- 백엔드: NestJS 10 + Prisma + PostgreSQL
- 웹: Next.js 14 App Router + Tailwind CSS
- 모바일: React Native + Expo
- 공유: packages/shared (TypeScript 타입 + Zod 스키마)

## MVP 범위
- 판매 유형: 소장(OWN) / 대여(RENTAL) / 무료(FREE)
- 웹: 홈 / 카테고리 / 상품상세 / 검색 / 리더(책 보기 + 필기)
- 리더: 펜 / 형광펜 / 지우개, 페이지별 필기 저장, 사용자별 저장
- 백엔드 API: 카탈로그(도서/카테고리/검색), 기기 페어링, 필기 동기화

## 개발 순서
1. 모노레포 스캐폴딩 + packages/shared
2. 백엔드 (NestJS + Prisma)
3. 웹 프론트 (Next.js)
4. 리더 (필기 기능 포함)
5. 모바일 앱 (Expo)

## 주의
- 오리지널 코드만 작성
- 한국어 UI
- 각 단계마다 빌드/타입체크 통과 확인
