/**
 * 책둥지 API 클라이언트 (서버 컴포넌트용).
 * - NEXT_PUBLIC_API_URL 이 없거나 요청이 실패하면 apiFetch 는 null 을 돌려준다.
 * - 카탈로그 함수들은 null 이면 src/data/mock.ts 목업 데이터로 폴백한다.
 */
import {
  MOCK_BOOKS,
  MOCK_CATEGORIES,
  withMockSkus,
  type CatalogBook,
  type CatalogBookDetail,
  type Category,
  type Paginated,
} from "@/data/mock";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
const CATALOG = "/v1/commerce/catalog";

/** 응답이 늦을 때 목업으로 넘어가기까지 기다리는 시간 */
const TIMEOUT_MS = 3000;

/** fetch 래퍼 — 성공 시 JSON, 환경변수 미설정·네트워크 오류·비정상 응답이면 null */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
      signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** 목록 API는 SKU를 주지 않으므로 상세를 함께 조회해 뱃지·가격 정보를 채운다 */
async function attachSkus(books: CatalogBook[]): Promise<CatalogBookDetail[]> {
  return Promise.all(books.map(async (book) => (await getBook(book.id)) ?? { ...book, skus: [] }));
}

export async function getCategories(): Promise<Category[]> {
  const data = await apiFetch<{ items: Category[] }>(`${CATALOG}/categories`);
  return data?.items ?? MOCK_CATEGORIES;
}

export async function getBooks(categoryId?: string): Promise<CatalogBookDetail[]> {
  const params = new URLSearchParams({ pageSize: "100" });
  if (categoryId) params.set("categoryId", categoryId);
  const data = await apiFetch<Paginated<CatalogBook>>(`${CATALOG}/books?${params}`);
  if (data) return attachSkus(data.items);
  const books = categoryId ? MOCK_BOOKS.filter((b) => b.categoryId === categoryId) : MOCK_BOOKS;
  return books.map(withMockSkus);
}

export async function getBook(id: string): Promise<CatalogBookDetail | null> {
  const data = await apiFetch<CatalogBookDetail>(`${CATALOG}/books/${encodeURIComponent(id)}`);
  if (data) return data;
  const book = MOCK_BOOKS.find((b) => b.id === id);
  return book ? withMockSkus(book) : null;
}

export async function searchBooks(q: string): Promise<CatalogBookDetail[]> {
  const keyword = normalize(q);
  if (!keyword) return [];
  const params = new URLSearchParams({ q: q.trim(), pageSize: "100" });
  const data = await apiFetch<Paginated<CatalogBook>>(`${CATALOG}/search?${params}`);
  if (data) return attachSkus(data.items);
  // 백엔드 검색과 같은 규칙: 제목·저자·출판사 부분일치, 대소문자·공백 무시
  return MOCK_BOOKS.filter((book) =>
    [book.title, book.publisher, ...book.authors].some((text) => normalize(text).includes(keyword)),
  ).map(withMockSkus);
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}
