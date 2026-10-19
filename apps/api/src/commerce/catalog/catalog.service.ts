import { Injectable, NotFoundException } from "@nestjs/common";
import {
  bookSchema,
  skuSchema,
  type BookWithSkus,
  type Category,
  type Paginated,
  type SaleType,
  type Sku,
} from "@bookdoongji/shared";
import { MOCK_BOOKS, MOCK_CATEGORIES, MOCK_SKUS, type CatalogBook } from "./catalog.mock-data";

/** 상세 응답: 도서 + 카테고리 ID + 판매 SKU */
export interface CatalogBookDetail extends BookWithSkus {
  categoryId: string;
}

/** 목록 조회 조건 */
export interface ListBooksQuery {
  categoryId?: string;
  page: number;
  pageSize: number;
}

/** 검색 조건 */
export interface SearchBooksQuery extends Omit<ListBooksQuery, "categoryId"> {
  q: string;
  saleType?: SaleType;
}

/**
 * 카탈로그 서비스 (목업 데이터 기반).
 * Prisma 연동 시 이 클래스 내부만 교체하면 컨트롤러·응답 형식은 그대로 유지된다.
 */
@Injectable()
export class CatalogService {
  private readonly books: CatalogBook[];
  private readonly skus: Sku[];
  private readonly categories: Category[] = MOCK_CATEGORIES;

  constructor() {
    // 목업 데이터도 공유 Zod 스키마로 검증해, 잘못된 데이터가 섞이면 부팅 단계에서 바로 실패시킨다
    this.books = MOCK_BOOKS.map((book) => ({ ...bookSchema.parse(book), categoryId: book.categoryId }));
    this.skus = MOCK_SKUS.map((sku) => skuSchema.parse(sku));
  }

  listCategories(): Category[] {
    return this.categories;
  }

  listBooks(query: ListBooksQuery): Paginated<CatalogBook> {
    const filtered = query.categoryId
      ? this.books.filter((book) => book.categoryId === query.categoryId)
      : this.books;
    return paginate(filtered, query.page, query.pageSize);
  }

  getBook(id: string): CatalogBookDetail {
    const book = this.books.find((b) => b.id === id);
    if (!book) {
      throw new NotFoundException(`도서를 찾을 수 없습니다: ${id}`);
    }
    return { ...book, skus: this.skus.filter((sku) => sku.bookId === id) };
  }

  /**
   * 부분일치 검색 — 제목·저자·출판사에 검색어가 포함되면 결과에 넣는다.
   * 대소문자와 공백 차이는 무시한다. saleType을 주면 해당 유형 SKU가 있는 도서만 남긴다.
   */
  search(query: SearchBooksQuery): Paginated<CatalogBook> {
    const keyword = normalize(query.q);
    const matched = this.books.filter((book) => {
      const haystack = [book.title, book.publisher, ...book.authors].map(normalize);
      if (!haystack.some((text) => text.includes(keyword))) return false;
      if (query.saleType) {
        return this.skus.some((sku) => sku.bookId === book.id && sku.saleType === query.saleType);
      }
      return true;
    });
    return paginate(matched, query.page, query.pageSize);
  }
}

/** 검색 비교용 정규화: 소문자 + 공백 제거 */
function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

/** 메모리 배열 페이지네이션 (page는 1부터) */
function paginate<T>(all: T[], page: number, pageSize: number): Paginated<T> {
  const start = (page - 1) * pageSize;
  return {
    items: all.slice(start, start + pageSize),
    page,
    pageSize,
    total: all.length,
    hasNext: start + pageSize < all.length,
  };
}
