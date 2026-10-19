import Link from "next/link";
import BookCard from "@/components/BookCard";
import { getBooks, getCategories } from "@/lib/api";

/** 카테고리별 숏컷 아이콘 (등록되지 않은 카테고리는 기본 아이콘) */
const CATEGORY_ICON: Record<string, string> = {
  "cat-civil": "🏛️",
  "cat-license": "📜",
  "cat-language": "🗣️",
};

export default async function HomePage() {
  const [categories, books] = await Promise.all([getCategories(), getBooks()]);
  // 추천: 최신 출간순
  const recommended = [...books].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const freeBooks = books.filter((book) => book.skus.some((sku) => sku.saleType === "FREE"));

  return (
    <div className="space-y-14 pt-6">
      {/* 히어로 */}
      <section className="relative overflow-hidden rounded-3xl bg-nest-700 px-6 py-12 text-white md:px-12 md:py-16">
        <div className="relative z-10 max-w-xl">
          <p className="text-sm font-semibold text-nest-200">수험서 eBook 서점</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">
            합격까지 머무는 곳,
            <br />
            <span className="text-yellow-200">책둥지</span>에서 공부하세요
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-nest-100 md:text-base">
            필요한 기간만 빌려 읽는 대여, 오래 두고 보는 소장,
            <br className="hidden md:inline" /> 먼저 펼쳐 보는 무료 맛보기까지.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="#recommended"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-nest-800 hover:bg-nest-50"
            >
              추천 도서 보기
            </Link>
            <Link
              href="#free"
              className="rounded-full border border-yellow-200/60 px-5 py-2.5 text-sm font-bold text-yellow-100 hover:bg-white/10"
            >
              무료로 맛보기
            </Link>
          </div>
        </div>
        {/* 장식: 둥지 곡선 */}
        <svg
          className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 text-twig/40 md:h-80 md:w-80"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M20 110c25 60 135 60 160 0" />
          <path d="M35 128c30 40 100 40 130 0" />
          <path d="M50 146c25 22 75 22 100 0" />
        </svg>
      </section>

      {/* 카테고리 숏컷 */}
      <section aria-labelledby="category-heading">
        <h2 id="category-heading" className="text-lg font-bold text-gray-900">
          분야별로 찾기
        </h2>
        <ul className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-6">
          {categories
            .filter((c) => c.parentId === null)
            .map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.id}`}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-nest-100 bg-white px-3 py-5 text-sm font-semibold text-gray-800 transition-colors hover:border-nest-300 hover:bg-nest-50"
                >
                  <span className="text-3xl" aria-hidden="true">
                    {CATEGORY_ICON[category.id] ?? "📚"}
                  </span>
                  {category.name}
                </Link>
              </li>
            ))}
        </ul>
      </section>

      {/* 추천 도서 */}
      <section id="recommended" aria-labelledby="recommended-heading" className="scroll-mt-24">
        <SectionHeading id="recommended-heading" title="둥지 추천 도서" subtitle="새로 나온 수험서부터 차례로 모았어요" />
        <BookGrid>
          {recommended.map((book) => (
            <li key={book.id}>
              <BookCard book={book} />
            </li>
          ))}
        </BookGrid>
      </section>

      {/* 무료 도서 */}
      <section id="free" aria-labelledby="free-heading" className="scroll-mt-24 rounded-3xl bg-yellow-50 px-5 py-8 md:px-8">
        <SectionHeading id="free-heading" title="무료로 먼저 펼쳐 보기" subtitle="앞부분을 무료로 읽고 나에게 맞는지 확인하세요" />
        {freeBooks.length > 0 ? (
          <BookGrid>
            {freeBooks.map((book) => (
              <li key={book.id}>
                <BookCard book={book} />
              </li>
            ))}
          </BookGrid>
        ) : (
          <p className="mt-6 text-sm text-gray-500">지금은 무료 도서가 없어요.</p>
        )}
      </section>
    </div>
  );
}

function SectionHeading({ id, title, subtitle }: { id: string; title: string; subtitle: string }) {
  return (
    <div>
      <h2 id={id} className="text-lg font-bold text-gray-900">
        {title}
      </h2>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function BookGrid({ children }: { children: React.ReactNode }) {
  return <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-5">{children}</ul>;
}
