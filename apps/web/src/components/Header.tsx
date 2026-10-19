import Link from "next/link";
import { getCategories } from "@/lib/api";
import AuthButtons from "./AuthButtons";

/** 상단 헤더 — 검색은 GET 폼(/search?q=)이라 클라이언트 JS가 필요 없다 */
export default async function Header() {
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-20 border-b border-nest-100 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="책둥지 홈">
          <NestMark />
          <span className="text-xl font-extrabold tracking-tight text-nest-800">책둥지</span>
        </Link>

        <form action="/search" method="get" role="search" className="order-last w-full md:order-none md:w-auto md:flex-1">
          <label htmlFor="header-search" className="sr-only">
            도서 검색
          </label>
          <div className="flex items-center rounded-full border border-nest-200 bg-white px-4 focus-within:border-nest-500 focus-within:ring-2 focus-within:ring-nest-100">
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder="책 제목, 저자, 출판사로 찾기"
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-gray-400"
            />
            <button type="submit" className="shrink-0 text-sm font-semibold text-nest-600 hover:text-nest-800">
              검색
            </button>
          </div>
        </form>

        <nav aria-label="주요 메뉴" className="ml-auto md:ml-0">
          <ul className="flex items-center gap-4 text-sm font-medium text-gray-700">
            {categories
              .filter((c) => c.parentId === null)
              .map((category) => (
                <li key={category.id}>
                  <Link href={`/category/${category.id}`} className="hover:text-nest-600">
                    {category.name}
                  </Link>
                </li>
              ))}
            <li>
              <Link href="/#free" className="rounded-full bg-yellow-200 px-2.5 py-1 text-yellow-900 hover:bg-yellow-300">
                무료
              </Link>
            </li>
            <AuthButtons />
          </ul>
        </nav>
      </div>
    </header>
  );
}

/** 둥지 위의 펼친 책 모양 로고 */
function NestMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M4 19c3 6 21 6 24 0" fill="none" stroke="#b5753c" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 22c4 3 16 3 20 0" fill="none" stroke="#b5753c" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 9c-3-2-7-2-10-1v10c3-1 7-1 10 1z" fill="#3f7c62" />
      <path d="M16 9c3-2 7-2 10-1v10c-3-1-7-1-10 1z" fill="#2f634e" />
    </svg>
  );
}
