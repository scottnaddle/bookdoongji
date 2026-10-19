"use client";

import Link from "next/link";
import type { CatalogBookDetail } from "@/data/mock";
import { SALE_TYPE_BADGE, SALE_TYPE_LABEL, SALE_TYPE_ORDER, discountRate, formatPrice } from "@/lib/format";
import BookCover from "./BookCover";

export default function BookCard({ book }: { book: CatalogBookDetail }) {
  const saleTypes = SALE_TYPE_ORDER.filter((type) => book.skus.some((sku) => sku.saleType === type));
  const own = book.skus.find((sku) => sku.saleType === "OWN");
  const rental = book.skus.find((sku) => sku.saleType === "RENTAL");
  // 대표 가격은 소장가, 없으면 대여가
  const main = own ?? rental;
  const rate = main ? discountRate(main) : 0;

  return (
    <Link href={`/product/${book.id}`} className="group block">
      <div className="transition-transform duration-200 group-hover:-translate-y-1">
        <BookCover id={book.id} title={book.title} publisher={book.publisher} />
      </div>

      {saleTypes.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1" aria-label="판매 유형">
          {saleTypes.map((type) => (
            <li key={type} className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${SALE_TYPE_BADGE[type]}`}>
              {SALE_TYPE_LABEL[type]}
            </li>
          ))}
        </ul>
      )}

      <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 group-hover:text-nest-700">
        {book.title}
      </h3>
      <p className="mt-0.5 truncate text-xs text-gray-500">
        {book.authors.join(", ")} · {book.publisher}
      </p>

      {main ? (
        <p className="mt-1.5 flex items-baseline gap-1.5">
          {rate > 0 && <span className="text-sm font-bold text-rose-600">{rate}%</span>}
          <span className="text-sm font-bold text-gray-900">{formatPrice(main.salePrice)}</span>
          {rate > 0 && <span className="text-xs text-gray-400 line-through">{formatPrice(main.listPrice)}</span>}
        </p>
      ) : (
        saleTypes.includes("FREE") && (
          <div className="mt-1.5 flex items-center gap-2">
            <p className="text-sm font-bold text-yellow-700">무료</p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/reader/${book.id}`;
              }}
              className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-[11px] font-semibold text-yellow-800 hover:bg-yellow-200"
            >
              📖 맛보기
            </button>
          </div>
        )
      )}
      {own && rental && (
        <p className="mt-0.5 text-xs text-violet-700">
          대여 {rental.rentalDays}일 {formatPrice(rental.salePrice)}
        </p>
      )}
    </Link>
  );
}
