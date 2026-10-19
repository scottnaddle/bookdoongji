/**
 * 모바일 폴백용 카탈로그 목업 데이터 (apps/web/src/data/mock.ts 와 같은 구조).
 * apps/api/src/commerce/catalog/catalog.mock-data.ts 와 동일한 내용을 유지한다
 * (API 서버가 없거나 응답하지 않을 때 src/lib/api.ts 에서 사용).
 */
import type { Book, Category, Paginated, SaleType, Sku } from "@bookdoongji/shared";

export type { Book, Category, Paginated, SaleType, Sku };

/** 목록 응답용 도서 — 공유 Book 타입에 카테고리 ID를 더한 형태 (API의 CatalogBook과 동일) */
export interface CatalogBook extends Book {
  categoryId: string;
}

/** 상세 응답: 도서 + 카테고리 ID + 판매 SKU (API의 CatalogBookDetail과 동일) */
export interface CatalogBookDetail extends CatalogBook {
  skus: Sku[];
}

/** 표지 이미지 자리표시 URL (실제 CDN 연결 전) */
const coverUrl = (bookId: string): string => `https://cdn.bookdoongji.example/covers/${bookId}.png`;

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-civil", name: "공무원", parentId: null },
  { id: "cat-license", name: "자격증", parentId: null },
  { id: "cat-language", name: "어학", parentId: null },
];

export const MOCK_BOOKS: CatalogBook[] = [
  {
    id: "bk-001",
    categoryId: "cat-civil",
    title: "둥지 행정법총론 핵심 압축노트",
    authors: ["한서윤"],
    publisher: "책둥지북스",
    isbn: "9990000000011",
    publishedAt: "2026-03-02",
    description:
      "행정작용·행정구제 파트를 도식 중심으로 압축한 9급·7급 공무원 대비 요약서. 단원별 OX 확인 문제 수록.",
    coverUrl: coverUrl("bk-001"),
  },
  {
    id: "bk-002",
    categoryId: "cat-civil",
    title: "한 장씩 넘기는 한국사 연표 600제",
    authors: ["도하람", "윤지성"],
    publisher: "책둥지북스",
    isbn: "9990000000028",
    publishedAt: "2026-01-15",
    description: "선사시대부터 현대사까지 연표 흐름으로 정리한 문항 600개. 시대별 오답 유형 분석 포함.",
    coverUrl: coverUrl("bk-002"),
  },
  {
    id: "bk-003",
    categoryId: "cat-license",
    title: "정보처리기사 실기 손코딩 트레이닝",
    authors: ["백승우"],
    publisher: "둥지에듀",
    isbn: "9990000000035",
    publishedAt: "2026-05-20",
    description:
      "C·Java·Python 코드 추적 문제와 SQL 작성 문제를 유형별로 반복 훈련하는 실기 대비서. 최신 출제 경향 반영.",
    coverUrl: coverUrl("bk-003"),
  },
  {
    id: "bk-004",
    categoryId: "cat-license",
    title: "전기기능사 필기 7일 완주 플랜",
    authors: ["오태민"],
    publisher: "둥지에듀",
    isbn: "9990000000042",
    publishedAt: "2026-07-08",
    description: "전기이론·전기기기·전기설비를 하루 단위 학습 플랜으로 나눈 단기 완성 교재. 계산 문제 공식 카드 제공.",
    coverUrl: coverUrl("bk-004"),
  },
  {
    id: "bk-005",
    categoryId: "cat-language",
    title: "토익 RC 실전 모의고사 5회분",
    authors: ["Grace Lim", "정유나"],
    publisher: "책둥지북스",
    isbn: "9990000000059",
    publishedAt: "2026-09-01",
    description: "Part 5~7 실전 감각을 위한 오리지널 모의고사 5회분. 문항별 해설과 패러프레이징 표현 정리 수록.",
    coverUrl: coverUrl("bk-005"),
  },
];

/** 도서별 판매 SKU — 소장 + 대여 기본, 일부 도서는 무료 맛보기 추가 */
export const MOCK_SKUS: Sku[] = [
  // bk-001: 소장 / 대여 30일 / 무료 맛보기
  { id: "sku-001-own", bookId: "bk-001", saleType: "OWN", listPrice: 22000, salePrice: 19800 },
  { id: "sku-001-rent", bookId: "bk-001", saleType: "RENTAL", listPrice: 9000, salePrice: 7900, rentalDays: 30 },
  { id: "sku-001-free", bookId: "bk-001", saleType: "FREE", listPrice: 0, salePrice: 0 },
  // bk-002: 소장 / 대여 60일
  { id: "sku-002-own", bookId: "bk-002", saleType: "OWN", listPrice: 25000, salePrice: 22500 },
  { id: "sku-002-rent", bookId: "bk-002", saleType: "RENTAL", listPrice: 12000, salePrice: 9900, rentalDays: 60 },
  // bk-003: 소장 / 대여 90일 / 무료 맛보기
  { id: "sku-003-own", bookId: "bk-003", saleType: "OWN", listPrice: 28000, salePrice: 25200 },
  { id: "sku-003-rent", bookId: "bk-003", saleType: "RENTAL", listPrice: 14000, salePrice: 11900, rentalDays: 90 },
  { id: "sku-003-free", bookId: "bk-003", saleType: "FREE", listPrice: 0, salePrice: 0 },
  // bk-004: 소장 / 대여 14일
  { id: "sku-004-own", bookId: "bk-004", saleType: "OWN", listPrice: 18000, salePrice: 16200 },
  { id: "sku-004-rent", bookId: "bk-004", saleType: "RENTAL", listPrice: 6000, salePrice: 4900, rentalDays: 14 },
  // bk-005: 소장 / 대여 30일 (판매 종료 시각 고정)
  { id: "sku-005-own", bookId: "bk-005", saleType: "OWN", listPrice: 19500, salePrice: 17500 },
  {
    id: "sku-005-rent",
    bookId: "bk-005",
    saleType: "RENTAL",
    listPrice: 8000,
    salePrice: 6900,
    rentalDays: 30,
    rentalEndAt: "2027-06-30T23:59:59+09:00",
  },
];

/** 도서에 SKU를 붙여 상세 형태로 만든다 */
export function withMockSkus(book: CatalogBook): CatalogBookDetail {
  return { ...book, skus: MOCK_SKUS.filter((sku) => sku.bookId === book.id) };
}

// ─────────────────────────────────────────────
// 모바일 전용 목업 (홈 배너 · 내 서재 · 마이)
// ─────────────────────────────────────────────

/** 홈 상단 배너 */
export interface HomeBanner {
  id: string;
  title: string;
  subtitle: string;
  /** 배너 배경색 */
  color: string;
  /** 누르면 이동할 도서 (없으면 이동 안 함) */
  bookId?: string;
}

export const MOCK_BANNERS: HomeBanner[] = [
  {
    id: "bn-1",
    title: "가을 합격 시즌, 대여 최대 30% 할인",
    subtitle: "공무원·자격증 수험서를 부담 없이 빌려 보세요",
    color: "#2f634e",
    bookId: "bk-002",
  },
  {
    id: "bn-2",
    title: "정보처리기사 실기 무료 맛보기",
    subtitle: "손코딩 트레이닝 1장을 지금 바로 읽어 보세요",
    color: "#b5753c",
    bookId: "bk-003",
  },
  {
    id: "bn-3",
    title: "필기하며 읽는 eBook",
    subtitle: "펜·형광펜 필기가 모든 기기에 동기화됩니다",
    color: "#265040",
  },
];

/** 내 서재 항목 — 구매/대여한 도서와 읽기 진행 상태 */
export interface LibraryItem {
  bookId: string;
  saleType: SaleType;
  /** 읽은 비율 (0~1) */
  progress: number;
  /** 마지막으로 읽은 시각 (ISO) */
  lastReadAt: string;
  /** 대여 만료 시각 (ISO) — 대여 도서만 */
  expiresAt?: string;
}

export const MOCK_LIBRARY: LibraryItem[] = [
  { bookId: "bk-001", saleType: "OWN", progress: 0.42, lastReadAt: "2026-10-17T22:10:00+09:00" },
  {
    bookId: "bk-003",
    saleType: "RENTAL",
    progress: 0.18,
    lastReadAt: "2026-10-16T08:30:00+09:00",
    expiresAt: "2026-11-14T23:59:59+09:00",
  },
  { bookId: "bk-005", saleType: "FREE", progress: 0.9, lastReadAt: "2026-10-10T19:45:00+09:00" },
];

/** 마이 화면 프로필 */
export interface MockProfile {
  nickname: string;
  email: string;
  /** 보유 포인트 */
  points: number;
  /** 사용 가능한 쿠폰 수 */
  coupons: number;
  /** 등록 기기 수 / 최대 기기 수 */
  devices: { used: number; max: number };
}

export const MOCK_PROFILE: MockProfile = {
  nickname: "둥지수험생",
  email: "reader@bookdoongji.example",
  points: 3200,
  coupons: 2,
  devices: { used: 1, max: 3 },
};
