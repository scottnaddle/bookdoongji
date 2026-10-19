import type { Metadata } from "next";
import BookCard from "@/components/BookCard";
import { searchBooks } from "@/lib/api";

interface Props {
  searchParams: { q?: string | string[] };
}

/** ?q= 가 여러 번 오면 첫 번째 값만 쓴다 */
function readQuery(searchParams: Props["searchParams"]): string {
  const raw = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  return (raw ?? "").trim();
}

export function generateMetadata({ searchParams }: Props): Metadata {
  const q = readQuery(searchParams);
  return { title: q ? `'${q}' 검색 결과` : "도서 검색" };
}

export default async function SearchPage({ searchParams }: Props) {
  const q = readQuery(searchParams);
  const results = q ? await searchBooks(q) : [];

  return (
    <div className="pt-8">
      <form action="/search" method="get" role="search" className="flex gap-2">
        <label htmlFor="search-page-input" className="sr-only">
          검색어
        </label>
        <input
          id="search-page-input"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="책 제목, 저자, 출판사로 찾기"
          className="w-full rounded-lg border border-nest-200 bg-white px-4 py-3 text-base outline-none focus:border-nest-500 focus:ring-2 focus:ring-nest-100"
        />
        <button type="submit" className="shrink-0 rounded-lg bg-nest-600 px-5 font-bold text-white hover:bg-nest-700">
          검색
        </button>
      </form>

      {!q ? (
        <p className="mt-16 text-center text-sm text-gray-500">찾고 싶은 책의 제목, 저자, 출판사를 입력해 보세요.</p>
      ) : (
        <>
          <h1 className="mt-8 text-lg font-bold text-gray-900">
            <span className="text-nest-700">‘{q}’</span> 검색 결과{" "}
            <span className="text-sm font-medium text-gray-500">{results.length}건</span>
          </h1>
          {results.length > 0 ? (
            <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-5">
              {results.map((book) => (
                <li key={book.id}>
                  <BookCard book={book} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-10 rounded-2xl bg-white py-16 text-center text-sm text-gray-500">
              검색 결과가 없어요. 다른 검색어로 다시 찾아보세요.
            </p>
          )}
        </>
      )}
    </div>
  );
}
