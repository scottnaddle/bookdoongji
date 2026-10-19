import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookCover from "@/components/BookCover";
import SkuSelector from "@/components/SkuSelector";
import { getBook, getCategories } from "@/lib/api";
import { formatDate } from "@/lib/format";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getBook(params.id);
  return book ? { title: book.title, description: book.description } : { title: "도서를 찾을 수 없음" };
}

export default async function ProductPage({ params }: Props) {
  const [book, categories] = await Promise.all([getBook(params.id), getCategories()]);
  if (!book) notFound();

  const category = categories.find((c) => c.id === book.categoryId);

  return (
    <div className="pt-8">
      <nav aria-label="breadcrumb" className="text-xs text-gray-500">
        <Link href="/" className="hover:text-nest-700">
          홈
        </Link>
        {category && (
          <>
            <span className="mx-1.5">›</span>
            <Link href={`/category/${category.id}`} className="hover:text-nest-700">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-[minmax(0,300px)_1fr] lg:grid-cols-[minmax(0,300px)_1fr_360px]">
        {/* 표지 영역 */}
        <div className="mx-auto w-full max-w-[260px] md:max-w-none">
          <BookCover id={book.id} title={book.title} publisher={book.publisher} size="lg" />
        </div>

        {/* 도서 정보 */}
        <div>
          <h1 className="text-2xl font-extrabold leading-snug text-gray-900 md:text-3xl">{book.title}</h1>
          <dl className="mt-4 grid grid-cols-[4.5rem_1fr] gap-y-1.5 text-sm">
            <dt className="text-gray-500">저자</dt>
            <dd className="text-gray-900">{book.authors.join(", ")}</dd>
            <dt className="text-gray-500">출판사</dt>
            <dd className="text-gray-900">{book.publisher}</dd>
            <dt className="text-gray-500">출간일</dt>
            <dd className="text-gray-900">{formatDate(book.publishedAt)}</dd>
            <dt className="text-gray-500">ISBN</dt>
            <dd className="font-mono text-gray-900">{book.isbn}</dd>
          </dl>

          <section className="mt-8 border-t border-nest-100 pt-6">
            <h2 className="text-base font-bold text-gray-900">책 소개</h2>
            <p className="mt-3 text-sm leading-7 text-gray-700">{book.description}</p>
          </section>
        </div>

        {/* 구매 영역 — SKU 선택만 클라이언트 컴포넌트 */}
        <aside className="md:col-span-2 lg:col-span-1">
          <div className="rounded-2xl border border-nest-100 bg-white p-5 lg:sticky lg:top-24">
            <SkuSelector skus={book.skus} bookId={book.id} />
          </div>
        </aside>
      </div>
    </div>
  );
}
