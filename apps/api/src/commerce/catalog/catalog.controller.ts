import { Controller, Get, Param, Query } from "@nestjs/common";
import { saleTypeSchema } from "@bookdoongji/shared";
import { z } from "zod";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { CatalogService, type ListBooksQuery, type SearchBooksQuery } from "./catalog.service";

/** 페이지 파라미터 (쿼리스트링은 문자열이므로 숫자로 변환) */
const pagingShape = {
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
};

const listBooksQuerySchema = z.object({
  categoryId: z.string().min(1).optional(),
  ...pagingShape,
});

const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "검색어(q)를 입력해 주세요"),
  saleType: saleTypeSchema.optional(),
  ...pagingShape,
});

/** Commerce API — 카탈로그 (도서 · 카테고리 · 검색) */
@Controller("v1/commerce/catalog")
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  /** 도서 목록 — ?categoryId=&page=&pageSize= */
  @Get("books")
  listBooks(@Query(new ZodValidationPipe(listBooksQuerySchema)) query: ListBooksQuery) {
    return this.catalog.listBooks(query);
  }

  /** 도서 상세 — 판매 SKU(소장/대여/무료) 포함 */
  @Get("books/:id")
  getBook(@Param("id") id: string) {
    return this.catalog.getBook(id);
  }

  /** 카테고리 목록 */
  @Get("categories")
  listCategories() {
    return { items: this.catalog.listCategories() };
  }

  /** 부분일치 검색 — ?q=&saleType=&page=&pageSize= */
  @Get("search")
  search(@Query(new ZodValidationPipe(searchQuerySchema)) query: SearchBooksQuery) {
    return this.catalog.search(query);
  }
}
