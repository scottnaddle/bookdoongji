/**
 * 카탈로그 목업 데이터 (DB 연결 전 임시).
 * 도서명·저자·출판사·ISBN·소개 문구는 모두 책둥지 오리지널 가상 데이터다.
 * ISBN은 실제 도서와 겹치지 않도록 999로 시작하는 가상 번호를 쓴다.
 */
import type { Book, Category, Sku } from "@bookdoongji/shared";

/** 카탈로그 응답용 도서 — 공유 Book 타입에 카테고리 ID를 더한 형태 */
export interface CatalogBook extends Book {
  categoryId: string;
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
