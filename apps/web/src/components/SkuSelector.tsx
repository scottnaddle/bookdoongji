"use client";

import { useState } from "react";
import type { Sku } from "@bookdoongji/shared";
import {
  SALE_TYPE_BADGE,
  SALE_TYPE_LABEL,
  SALE_TYPE_ORDER,
  discountRate,
  formatDate,
  formatPrice,
  skuLabel,
} from "@/lib/format";

/** 상품 상세의 SKU 선택(소장/대여/무료) + 가격 + 장바구니 버튼 */
export default function SkuSelector({ skus, bookId }: { skus: Sku[]; bookId: string }) {
  const sorted = [...skus].sort((a, b) => SALE_TYPE_ORDER.indexOf(a.saleType) - SALE_TYPE_ORDER.indexOf(b.saleType));
  const [selectedId, setSelectedId] = useState(sorted[0]?.id);
  const [notice, setNotice] = useState<string | null>(null);
  const selected = sorted.find((sku) => sku.id === selectedId);

  if (!selected) {
    return <p className="rounded-lg bg-gray-100 p-4 text-sm text-gray-600">현재 판매 중인 상품이 없습니다.</p>;
  }

  const rate = discountRate(selected);
  const isFree = selected.saleType === "FREE";

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-gray-800">구매 방식</legend>
        <div className="space-y-2">
          {sorted.map((sku) => (
            <label
              key={sku.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border bg-white px-4 py-3 transition-colors ${
                sku.id === selectedId ? "border-nest-500 ring-2 ring-nest-100" : "border-gray-200 hover:border-nest-300"
              }`}
            >
              <input
                type="radio"
                name="sku"
                value={sku.id}
                checked={sku.id === selectedId}
                onChange={() => {
                  setSelectedId(sku.id);
                  setNotice(null);
                }}
                className="accent-nest-600"
              />
              <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${SALE_TYPE_BADGE[sku.saleType]}`}>
                {SALE_TYPE_LABEL[sku.saleType]}
              </span>
              <span className="flex-1 text-sm text-gray-800">
                {skuLabel(sku)}
                {sku.rentalEndAt && (
                  <span className="ml-1 text-xs text-gray-500">({formatDate(sku.rentalEndAt)}까지 판매)</span>
                )}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {sku.saleType === "FREE" ? "무료" : formatPrice(sku.salePrice)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="rounded-lg bg-paper-dark px-4 py-4">
        <p className="text-xs text-gray-500">{skuLabel(selected)} 결제 금액</p>
        {isFree ? (
          <p className="mt-1 text-2xl font-extrabold text-yellow-700">0원</p>
        ) : (
          <p className="mt-1 flex items-baseline gap-2">
            {rate > 0 && <span className="text-xl font-extrabold text-rose-600">{rate}%</span>}
            <span className="text-2xl font-extrabold text-gray-900">{formatPrice(selected.salePrice)}</span>
            {rate > 0 && <span className="text-sm text-gray-400 line-through">{formatPrice(selected.listPrice)}</span>}
          </p>
        )}
        {selected.saleType === "RENTAL" && selected.rentalDays && (
          <p className="mt-1 text-xs text-violet-700">구매일로부터 {selected.rentalDays}일 동안 읽을 수 있어요.</p>
        )}
      </div>

      <button
        type="button"
        onClick={() =>
          setNotice(isFree ? "내 서재에 담았어요. 바로 읽어 보세요!" : `장바구니에 담았어요 · ${skuLabel(selected)}`)
        }
        className="w-full rounded-lg bg-nest-600 py-3.5 text-base font-bold text-white transition-colors hover:bg-nest-700 active:bg-nest-800"
      >
        {isFree ? "무료로 받기" : "장바구니 담기"}
      </button>
      {isFree && (
        <>
          <a
            href={`/reader/${bookId}`}
            className="block w-full rounded-lg border-2 border-nest-600 py-3 text-center text-base font-bold text-nest-700 transition-colors hover:bg-nest-50"
          >
            📖 바로 읽기
          </a>
          <a
            href={`/watch/${bookId}`}
            className="block w-full rounded-lg bg-amber-400 py-3 text-center text-base font-bold text-amber-950 transition-colors hover:bg-amber-500"
          >
            🎬 영상과 함께 보기
          </a>
        </>
      )}
      <p role="status" aria-live="polite" className="min-h-5 text-center text-sm text-nest-700">
        {notice}
      </p>
    </div>
  );
}
