import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookCard from "@/components/BookCard";
import { getBooks, getCategories } from "@/lib/api";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = (await getCategories()).find((c) => c.id === params.id);
  return { title: category ? `${category.name} 도서` : "카테고리" };
}

export default async function CategoryPage({ params }: Props) {
  const categories = await getCategories();
  const category = categories.find((c) => c.id === params.id);
  if (!category) notFound();

  const books = await getBooks(category.id);
  const topLevel = categories.filter((c) => c.parentId === null);

  return (
    <div className="pt-8">
      <nav aria-label="breadcrumb" className="text-xs text-gray-500">
        <Link href="/" className="hover:text-nest-700">
          홈
        </Link>
        <span className="mx-1.5">›</span>
        <span className="text-gray-700">{category.name}</span>
      </nav>

      <h1 className="mt-2 text-2xl font-extrabold text-gray-900">{category.name}</h1>

      <ul className="mt-5 flex flex-wrap gap-2" aria-label="다른 분야">
        {topLevel.map((c) => (
          <li key={c.id}>
            <Link
              href={`/category/${c.id}`}
              aria-current={c.id === category.id ? "page" : undefined}
              className={`inline-block rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                c.id === category.id
                  ? "bg-nest-600 text-white"
                  : "border border-nest-200 bg-white text-gray-700 hover:border-nest-400"
              }`}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-gray-500">
        총 <strong className="text-gray-900">{books.length}</strong>권
      </p>

      {books.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-5">
          {books.map((book) => (
            <li key={book.id}>
              <BookCard book={book} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 rounded-2xl bg-white py-16 text-center text-sm text-gray-500">
          이 분야에는 아직 등록된 도서가 없어요.
        </p>
      )}
    </div>
  );
}
