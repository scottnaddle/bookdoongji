# 백엔드 API 구조 설계 (동기화 API 분리 반영)

> 작성일: 2026-10-18
> 근거: STRATEGY.md §4(데이터 모델)·§5(단계 계획) + REA APK 분석(research/rea-apk-analysis.md)
> 원칙: 분석에서 얻은 것은 **아키텍처 패턴**(API 분리, 기기 연결, 델타 동기화)이며, 경로·스키마·코드는 전부 오리지널로 설계한다. 원본의 URL·JSON 구조를 그대로 가져오지 않는다.

---

## 1. API 영역 분리

단일 NestJS 모놀리스 안에서 두 개의 논리 영역으로 분리한다. 모듈 경계가 명확하므로 트래픽·보안 정책이 달라지는 시점에 물리 분리(별도 배포)할 수 있다.

| 영역 | 담당 | 특징 |
|---|---|---|
| **Commerce API** | 카탈로그·장바구니·주문·결제·쿠폰·권리(license/entitlement) 조회 | 웹 SSR이 직접 호출. 결제 멱등성·트랜잭션 정합성이 핵심. 읽기 캐시 적극 활용 |
| **Sync API** | 기기 등록·필기 동기화·읽기 위치·펜 프리셋·다운로드 라이선스 발급 | 앱 전용. 로컬-우선(local-first) 가정, 높은 쓰기 빈도, 오프라인 복원력이 핵심 |

공통: 인증(JWT), 감사 로그, rate limit, OpenAPI 문서.

URL 네임스페이스:

```text
https://api.책둥지.example/v1/commerce/...
https://api.책둥지.example/v1/sync/...
```

버전은 `/v1`부터 시작하고, 하위 호환이 깨지는 변경에만 `/v2`를 올린다. 앱은 강제 업데이트 없이 최소 2개 메이저 버전을 지원한다.

### 왜 분리하는가 (분석에서 얻은 패턴)

- 커머스와 동기화는 장애 격리 단위가 다르다. 결제 장애가 필기 동기화를 막아서는 안 되고, 그 반대도 마찬가지다.
- 동기화 API는 쓰기 빈도가 높고 페이로드가 작으며(델타), 커머스 API는 읽기가 많고 캐시 친화적이다. 스케일링·캐시 전략을 따로 가져간다.
- 보안 경계가 다르다. 다운로드 라이선스 발급은 기기 바인딩 토큰을 요구하고, 커머스 결제는 사용자 인증 + PG 웹훅 서명 검증을 요구한다.

---

## 2. 인증 모델

| 토큰 | 발급처 | 용도 |
|---|---|---|
| `user_access_token` (JWT, 1시간) | Commerce 로그인 | 커머스·서재·권리 조회 |
| `device_token` (JWT, 30일, 기기 공개키 바인딩) | Sync 기기 등록 | 필기 동기화·다운로드 라이선스 요청. 해당 기기에서만 유효 |
| `download_token` (서명 URL, 5분) | Sync 라이선스 발급 | 암호화 콘텐츠 1회성 다운로드 |

기기 분실·양도 시 `device_token`을 취소하면 해당 기기의 오프라인 라이선스도 다음 온라인 검증 시 무효화된다.

---

## 3. 기기 등록·마이그레이션 (Sync)

분석에서 확인된 "기기 연결 → 마이그레이션" 흐름을 오리지널 페어링 코드 방식으로 설계한다.

### 3.1 기기 등록 (페어링 코드)

```text
POST /v1/sync/devices/pairing-code      → { code: "482913", expiresAt }   # 웹/기존 기기에서 발급
POST /v1/sync/devices                   → { deviceId, deviceToken }        # 앱에서 code 제출
  body: { pairingCode, platform: "android"|"ios", deviceName, publicKey }
GET  /v1/sync/devices                   → 등록 기기 목록
DELETE /v1/sync/devices/:deviceId       → 기기 해제 (라이선스 취소 + 토큰 무효화)
```

- 페어링 코드는 6자리 숫자, 10분 유효, 1회용.
- 한 계정당 기본 5대까지 등록 (정책값으로 조정).

### 3.2 기기 마이그레이션

```text
POST /v1/sync/devices/:deviceId/migrate
  body: { targetDeviceId }
```

- 구 기기의 필기 스냅샷을 신 기기로 이전 가능한 상태로 표시하고, 구 기기의 `device_token`과 오프라인 라이선스를 취소한다.
- 필기 데이터 자체는 서버에 이미 동기화되어 있으므로, 마이그레이션은 "권리 이전 + 구 기기 무효화"가 핵심이다.

---

## 4. 필기 동기화 프로토콜 (Sync)

STRATEGY.md §4.5 원칙을 그대로 따른다: **로컬 우선 기록 → 비동기 델타 동기화 → 충돌 시 무음 삭제 금지**.

### 4.1 데이터 단위

필기 1건 = annotation 1건. 수정은 새 revision으로 기록한다 (immutable event + snapshot 혼합).

```text
annotation {
  id, userId, bookId, assetVersion, pageRef,
  type: "stroke" | "highlight" | "text" | "shape" | "mask",
  payload: { ...도구별 좌표/색상/굵기... },   # 서버는 스키마 검증만, 해석은 클라이언트
  revision: 7,                                # 단조 증가
  createdAt, updatedAt, deletedAt?
}
```

- `pageRef`는 페이지 번호가 아니라 콘텐츠 버전 + 안정 페이지 식별자 (판본 변경 시 좌표 호환 검사).
- 서버는 payload 내부를 해석하지 않는다 (향후 도구 확장 시 서버 변경 불필요).

### 4.2 델타 동기화

```text
GET  /v1/sync/annotations/delta?bookId=...&sinceRevision=42
  → { annotations: [...], latestRevision: 58, hasMore: false }

POST /v1/sync/annotations/batch
  body: { bookId, baseRevision: 42, annotations: [...] }
  → { accepted: [...], conflicts: [...] }
```

- 업로드 시 클라이언트가 기준으로 삼은 `baseRevision`을 함께 보낸다.
- 서버 revision이 baseRevision보다 앞서 있고 같은 annotation이 양쪽에서 변경됐으면 **충돌**: 서버는 양쪽 버전을 모두 보존하고, 응답의 `conflicts`에 알려준다. 클라이언트가 사용자에게 선택 UI를 보여준다. 어느 한쪽을 무음으로 버리지 않는다.
- 네트워크 단절 시 로컬 DB에 계속 기록하고, 재연결 시 자동 재시도 (exponential backoff).

### 4.3 읽기 위치·기타 상태

```text
GET /v1/sync/reading-position?bookId=...
PUT /v1/sync/reading-position   { bookId, assetVersion, pageRef, updatedAt }
```

- 마지막 읽은 위치도 revision 없이 `updatedAt` 기준 last-write-wins (충돌 시 최신 시각 승리, 데이터 손실 영향이 작음).

---

## 5. 펜 프리셋 (Sync)

분석에서 "펜 설정을 JSON 번들로 내장"한 패턴을 참고하되, 스키마는 오리지널로 정의한다.

- 앱에 **기본 프리셋 번들** 내장 (오프라인 즉시 사용).
- 서버는 기본값 조회 + 사용자 커스텀 프리셋 저장소만 제공한다.

```text
GET /v1/sync/pen-presets/defaults   → { version: 3, presets: [...] }
GET /v1/sync/pen-presets/custom     → 사용자 저장 프리셋
PUT /v1/sync/pen-presets/custom     → 사용자 프리셋 저장 (Zod 스키마 검증)
```

```ts
// packages/shared에 정의할 오리지널 스키마
interface PenPreset {
  id: string;
  name: string;                       // "기본 볼펜" 등 한국어 표시명
  tool: 'pen' | 'brush' | 'highlighter' | 'eraser';
  color: string;                      // #RRGGBB
  thickness: number;                  // pt
  opacity: number;                    // 0~1
}
```

---

## 6. 다운로드 라이선스·콘텐츠 전달 (Sync)

```text
POST /v1/sync/download-licenses
  body: { bookId, deviceId }
  → { downloadUrl (5분 서명 URL), expiresAt, checksum, assetVersion }
  # 서버는 entitlement(열람 권리) 유효성을 먼저 검증한다
```

- 원본 파일은 절대 공개 URL로 제공하지 않는다.
- 앱은 다운로드 후 `checksum`을 검증하고, 오프라인 유예 기간(정책값, 예: 7일) 동안 열람 가능하다.
- 유예 기간 만료 또는 기기 취소 시 다음 온라인 검증 때 잠긴다.

---

## 7. 오답노트 (Phase 3, 설계만)

분석에서 "PDF 템플릿 기반 오답노트 생성" 패턴을 확인. 우리 구현은 **서버 측 템플릿 렌더링**으로 설계한다.

- 문항·선택지·정답·해설 데이터 모델(STRATEGY.md Phase 3)이 갖춰진 뒤,
  서버가 오답 문항을 모아 PDF로 렌더링 → 서재에 `library_item`으로 추가.
- 템플릿은 서버 리소스로 버전 관리 (앱 번들에 포함하지 않음 → 템플릿 개선 시 앱 업데이트 불필요).

Phase 1~2에서는 API 자리에 `501 Not Implemented` 스텁으로 둔다.

---

## 8. Commerce API 요약 (Sync와 대조용)

```text
GET  /v1/commerce/catalog/books?categoryId=&page=
GET  /v1/commerce/catalog/books/:id        # SKU(소장/대여/무료) 포함
GET  /v1/commerce/catalog/categories
GET  /v1/commerce/catalog/search?q=&saleType=
POST /v1/commerce/cart/items
POST /v1/commerce/orders                   # 멱등성 키 필수
POST /v1/commerce/payments/:id/confirm     # PG 웹훅은 별도 /v1/commerce/webhooks/pg
GET  /v1/commerce/library                  # 내 서재 (권리 기준)
GET  /v1/commerce/orders/:id
```

주문·결제·권리 발급의 트랜잭션 경계와 멱등성 처리는 STRATEGY.md §4 원칙을 따른다.

---

## 9. NestJS 모듈 매핑

```text
apps/api/src/
  commerce/
    catalog/        # Book, Product, Sku, Category
    cart/
    order/          # Order, OrderItem, 멱등성
    payment/        # Payment, PaymentEvent, Refund, PG 웹훅
    coupon/
    library/        # LibraryItem, Entitlement 조회
  sync/
    device/         # Device, 페어링 코드, 마이그레이션
    annotation/     # Annotation 델타 동기화, 충돌 처리
    reading-position/
    pen-preset/
    download/       # DownloadLicense, 서명 URL 발급
  common/
    auth/           # JWT, device_token 검증 가드
    prisma/
    audit/
```

`commerce`와 `sync`는 서로를 import하지 않는다. 공유가 필요한 것(인증, Prisma, 감사)은 `common`에만 둔다. 물리 분리가 필요해지면 `sync/` 디렉토리를 통째로 분리하면 된다.

---

## 10. 다음 단계

1. `apps/api` NestJS 스캐폴딩 + Prisma 스키마 (Book/Product/Sku/User/Order/Entitlement/Device/Annotation)
2. `packages/shared`에 PenPreset·Annotation·Device 타입 + Zod 스키마 추가
3. Sync 모듈부터 TDD로 구현 (델타 동기화 충돌 케이스가 핵심 테스트)
4. OpenAPI 명세 자동 생성 (NestJS Swagger) → `packages/shared` API 클라이언트 생성
