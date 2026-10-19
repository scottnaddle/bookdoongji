# 책둥지(bookdoongji) 개발 인수인계서

**작성일:** 2026-10-18
**버전:** v0.3 (영상 연동 리더 포함)

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 책둥지 (bookdoongji) |
| 컨셉 | 수험서 eBook 플랫폼 — sconn.io의 기능·구조를 참고한 오리지널 구현 |
| IP 원칙 | 브랜드·문구·상품 데이터·이미지·디자인 토큰 복사 금지. 기능·구조만 참고 |
| 차별점 | **YouTube 강의 영상 + 교재 연동 필기** (sconn에 없는 기능) |

### 레포지토리

```
~/workspace/bookdoongji/          ← 주력 리포 (Claude Code로 처음부터 재개발)
├── PROJECT.md                   ← 프로젝트 개요
├── reference/                   ← 기획자료 (codex/GPT가 작성)
│   ├── STRATEGY.md              ← 전체 전략 (970줄)
│   └── docs/backend-api-design.md
├── apps/
│   ├── api/      ← NestJS 10 + Prisma (SQLite) — 백엔드
│   ├── web/      ← Next.js 14 — 웹 프론트엔드
│   └── mobile/   ← Expo ~52 — 모바일 앱
├── packages/
│   └── shared/   ← Zod 스키마 (웹·백엔드·모바일 공용)
└── mockup/
    └── video-reader.html         ← 영상 연동 리더 초기 목업

~/workspace/sconn-clone/         ← 구 리포 (opencode/DeepSeek 제작, 더 이상 사용 안 함)
```

### 기술 스택

| 레이어 | 기술 |
|--------|------|
| 모노레포 | Turborepo + pnpm |
| 백엔드 | NestJS 10, Prisma ORM, SQLite (dev.db), bcrypt, passport-jwt |
| 웹 | Next.js 14 (App Router), Tailwind CSS, TypeScript |
| 모바일 | Expo ~52, React Native |
| 공용 타입 | Zod 스키마 (`packages/shared`) |
| 배포 | Vercel (웹) |

### 로컬 실행

```bash
cd ~/workspace/bookdoongji

# 백엔드 (:3001)
cd apps/api
export PRISMA_SCHEMA_ENGINE_BINARY=~/.cache/prisma-engines/schema-engine
export PRISMA_QUERY_ENGINE_LIBRARY=~/.cache/prisma-engines/libquery_engine.so
pnpm start:dev

# 웹 (:3000)
cd apps/web
pnpm dev

# 모바일
cd apps/mobile
npx expo start
```

---

## 2. 배포 URL (테스트용)

| 용도 | URL | 비고 |
|------|-----|------|
| **웹 메인 (최신)** | https://bookdoongji-gs5801nrw-scottnaddles-projects.vercel.app | 인증 + 영상 리더 포함 |
| 영상 연동 리더 | https://bookdoongji-gs5801nrw-scottnaddles-projects.vercel.app/watch/book-001 | 🎬 핵심 기능 |
| 일반 리더 | https://bookdoongji-gs5801nrw-scottnaddles-projects.vercel.app/reader/book-001 | 왼쪽 사이드 도구모음 |
| 로그인 | https://bookdoongji-gs5801nrw-scottnaddles-projects.vercel.app/login | |
| 회원가입 | https://bookdoongji-gs5801nrw-scottnaddles-projects.vercel.app/signup | |
| 내 정보 | https://bookdoongji-gs5801nrw-scottnaddles-projects.vercel.app/my | 로그인 필요 |
| 영상 리더 목업 | https://bookdoongji-mockup-a9lzkjyoh-scottnaddles-projects.vercel.app | 초기 HTML 목업 |

> Vercel 계정: `scottnaddle` / 프로젝트명: `bookdoongji-web`

---

## 3. PRD — 제품 요구사항 정의서

### 3.1 사용자 스토리

| ID | 스토리 | 상태 |
|----|--------|------|
| US-01 | 사용자는 책 목록을 보고 카테고리별로 탐색할 수 있다 | ✅ |
| US-02 | 사용자는 책을 검색할 수 있다 (제목/저자/출판사) | ✅ |
| US-03 | 사용자는 상품 상세에서 소장/대여/무료 중 구매 방식을 선택할 수 있다 | ✅ |
| US-04 | 사용자는 무료 책을 바로 읽을 수 있다 (맛보기 버튼) | ✅ |
| US-05 | 사용자는 회원가입/로그인할 수 있다 | ✅ |
| US-06 | 사용자는 리더에서 책에 필기할 수 있다 (펜/형광펜/지우개) | ✅ |
| US-07 | 사용자는 필기가 사용자별로 저장되어 재방문 시 유지되길 원한다 | ✅ |
| US-08 | 사용자는 강의 영상을 보면서 교재에 필기할 수 있다 | ✅ |
| US-09 | 사용자는 필기를 누르면 영상이 해당 시점으로 이동하길 원한다 | ✅ |
| US-10 | 사용자는 챕터 버튼으로 영상 구간 + 교재 페이지가 함께 이동하길 원한다 | ✅ |

### 3.2 기능 명세

#### F-01. 카탈로그 (도서 목록/검색/상세)

- **경로:** `/`, `/category/[id]`, `/search`, `/product/[id]`
- **데이터:** 현재 목업 데이터 사용 (`src/data/mock.ts`)
  - 백엔드 API (`/v1/commerce/catalog`)가 있으면 API 우선, 없으면 목업 폴백 (`src/lib/api.ts`)
- **SKU 유형:** 소장(OWN) / 대여(RENTAL) / 무료(FREE)
- **무료 책 UX:**
  - 목록 카드에 `📖 맛보기` 버튼 → `/reader/[id]`로 직접 이동
  - 상품 상세에 `📖 바로 읽기` + `🎬 영상과 함께 보기` 버튼

#### F-02. 인증 (회원가입/로그인/내 정보)

- **경로:** `/login`, `/signup`, `/my`
- **구현:** `src/lib/auth.tsx` — AuthProvider (React Context)
- **저장소:** localStorage (현재)
  - `bookdoongji_user` — 로그인 세션 `{email, name}`
  - `bookdoongji_users` — 가입자 목록 `{email: {name, pw(단순 해시)}}`
- **헤더:** `src/components/AuthButtons.tsx` — 로그인 상태에 따라 로그인/회원가입 또는 사용자명/로그아웃 표시
- **백엔드 연동 (완성, 미연결):**
  - `POST /v1/auth/signup` — `{email, password, nickname}` → bcrypt 해시 저장
  - `POST /v1/auth/login` — `{email, password}` → JWT 발급
  - `GET /v1/auth/me` — JWT로 내 정보 조회
  - `GET/PATCH /v1/users/me` — 프로필 조회/수정
  - DB: SQLite (`apps/api/prisma/dev.db`), User 모델 (email unique, nickname, passwordHash nullable)
  - **TODO:** 프론트를 localStorage에서 백엔드 JWT 방식으로 전환

#### F-03. eBook 리더 (일반)

- **경로:** `/reader/[id]`
- **파일:** `src/app/reader/[id]/ReaderClient.tsx`
- **기능:**
  - 페이지 네비게이션 (이전/다음)
  - Canvas 필기: 펜 / 형광펜 / 지우개 / 색상 선택
  - **왼쪽 사이드 도구모음** (모바일 대응)
  - 로그인 모달 (비로그인 시 필기 전 로그인 유도)
  - 사용자별 localStorage 저장 (`bookdoongji_annotations:{email}:{bookId}:{page}`)
  - 페이지 이동 시 필기 유지

#### F-04. 영상 연동 리더 ⭐ 핵심 차별화 기능

- **경로:** `/watch/[id]`
- **파일:** `src/app/watch/[id]/WatchClient.tsx`
- **컨셉:** YouTube 강의 영상을 보면서 교재에 필기. 필기에 영상 시점이 자동 기록됨.

**화면 구성 (모바일 세로 기준):**
```
┌─────────────────────┐
│  YouTube 영상 플레이어  │  ← 16:9
│  ⏪10 ⏸ 10⏩  00:00  │
│  [1강][2강][3강]     │  ← 챕터 버튼
├─────────────────────┤
│  📕 교재 페이지        │
│                     │
│   (Canvas 필기 영역)   │
│                     │  ← ✏️ 플로팅 버튼 (우하단)
├─────────────────────┤
│  🕐 내 필기 타임라인   │
│  [00:42] p.1 필기  ▶ │
│  [01:15] p.2 필기  ▶ │
└─────────────────────┘
```

**핵심 기능:**
1. **YouTube IFrame Player API** 연동 — 실제 영상 재생/일시정지/시점 조회/이동
2. **타임스탬프 연동 필기** — 필기 스트로크마다 `videoTime` (초) 저장
3. **필기 타임라인** — 시간순 정렬, 클릭 시 영상 해당 시점으로 seek + 교재 페이지 이동
4. **챕터 매핑** — `CHAPTERS` 배열로 영상 구간 ↔ 교재 페이지 연결
   ```ts
   const CHAPTERS = [
     { title: '1강. 행정의 개념', page: 0, startSec: 0 },
     { title: '2강. 행정법의 원칙', page: 1, startSec: 60 },
     { title: '3강. 국가행정조직', page: 2, startSec: 120 },
   ];
   ```
5. **플로팅 팝업 도구모음** — 우하단 ✏️ 버튼 → 팝업 패널 (펜/형광펜/지우개/색상/되돌리기/전체지우기)
   - 팝업 외부 클릭 시 닫힘
   - 모바일에서 화면을 가리지 않음
6. **사용자별 저장** — `bookdoongji_watch:{email}:{bookId}` (localStorage)

**현재 하드코딩된 것 (TODO):**
- `SAMPLE_VIDEO_ID = 'dQw4w9WgXcQ'` → 실제 강의 영상 ID로 교체 필요
- `CHAPTERS`, `PAGES` → 백엔드에서 도서별 메타데이터로 제공 필요
- **백엔드 API 설계 필요:** `GET /v1/commerce/catalog/books/:id/video` (영상 URL + 챕터 매핑 반환)

#### F-05. 모바일 앱 (Expo)

- **경로:** `apps/mobile/`
- **화면:** Home / Category / ProductDetail / Search / Library / My (6개)
- **상태:** 코드 완성, typecheck 통과
- **미배포 사유:** Expo 웹 export가 샌드박스 네트워크 타임아웃으로 실패
- **대안:** EAS Build 또는 로컬 `npx expo start` + Expo Go

### 3.3 데이터 모델 (Prisma)

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  nickname     String
  passwordHash String?  // 로컬 회원가입용, 소셜 로그인은 null
  // relations: orders, entitlements, devices, annotations, readingPositions
}

// 향후 영상 연동용 추가 필요:
model BookVideo {
  id        String   @id @default(cuid())
  bookId    String
  youtubeId String   // YouTube 영상 ID
  title     String
  chapters  Json     // [{title, page, startSec}]
}
```

### 3.4 API 엔드포인트

| 메서드 | 경로 | 설명 | 상태 |
|--------|------|------|------|
| POST | `/v1/auth/signup` | 회원가입 | ✅ 테스트 통과 |
| POST | /v1/auth/login | 로그인 (JWT) | ✅ 테스트 통과 |
| GET | `/v1/auth/me` | 내 정보 | ✅ 테스트 통과 |
| GET/PATCH | `/v1/users/me` | 프로필 조회/수정 | ✅ |
| GET | `/v1/commerce/catalog/books` | 도서 목록 | ✅ |
| GET | `/v1/commerce/catalog/books/:id` | 도서 상세 | ✅ |
| POST | `/v1/sync/devices/pair` | 기기 페어링 | ✅ |
| GET | `/v1/commerce/catalog/books/:id/video` | 영상 메타데이터 | ❌ 미구현 |

---

## 4. 남은 작업 (우선순위 순)

### P0 — 즉시
1. **프론트 인증을 백엔드 JWT로 전환** — 현재 localStorage 목업. `src/lib/auth.tsx`를 백엔드 API 호출로 교체
2. **실제 강의 영상 ID 적용** — `WatchClient.tsx`의 `SAMPLE_VIDEO_ID` 교체
3. **도서별 영상/챕터 메타데이터** — 백엔드에 `BookVideo` 모델 + API 추가, 프론트에서 조회

### P1 — 단기
4. **결제 연동** — 토스페이먼츠 (sconn.io가 사용 중)
5. **모바일 앱 EAS 빌드** — 실제 .ipa/.apk 생성
6. **어노테이션 서버 동기화** — 현재 localStorage만. `/v1/sync/annotations` API는 백엔드에 이미 있음

### P2 — 중기
7. **저자용 영상-교재 매핑 도구** — 교재 등록 시 YouTube URL + 챕터 구간 입력 UI
8. **구독패스 / 스마트eBook** — sconn의 판매 모델 중 미구현분 (STRATEGY.md 참조)

---

## 5. 시행착오 기록 (재발 방지)

| 문제 | 원인 | 해결 |
|------|------|------|
| Vercel 빌드 실패 | `transpilePackages: ["@bookdoongji/shared"]`가 모노레포 외부 참조 | 제거하고 `src/types.ts`로 복사 |
| Vercel 빌드 실패 | tsconfig의 `extends: ../../tsconfig.base.json` | 자체 완결형 tsconfig로 교체 |
| Vercel 배포 시 파일 손상 | MCP에 base64로 전달 | raw text로 전달해야 함 |
| BookCard 중첩 링크 | `<Link>` 안에 `<Link>` 불가 | 안쪽을 `<button>` + `window.location.href`로 변경 |
| Expo export 실패 | 샌드박스 네트워크 타임아웃 | EAS Build 또는 로컬 실행으로 우회 |
| pnpm EPERM | workspace FS가 chown 차단 | `pnpm-lock.yaml` 등 삭제 후 재실행 |
| Prisma 엔진 다운로드 실패 | Node fetch ECONNRESET | curl로 직접 다운로드 후 환경변수로 지정 |

---

## 6. 참고 자료

- 기획: `~/workspace/bookdoongji/reference/STRATEGY.md`
- API 설계: `~/workspace/bookdoongji/reference/docs/backend-api-design.md`
- sconn 리서치: `~/workspace/bookdoongji/reference/research/agy-research.md`
- APK 분석: `~/workspace/bookdoongji/reference/research/rea-apk-analysis.md`
- 프로젝트 개요: `~/workspace/bookdoongji/PROJECT.md`
