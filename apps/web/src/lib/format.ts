import type { SaleType, Sku } from "@bookdoongji/shared";

export const SALE_TYPE_LABEL: Record<SaleType, string> = {
  OWN: "소장",
  RENTAL: "대여",
  FREE: "무료",
};

/** 뱃지 색상: 소장(회색) / 대여(보라) / 무료(노랑) */
export const SALE_TYPE_BADGE: Record<SaleType, string> = {
  OWN: "bg-gray-100 text-gray-700 ring-gray-300",
  RENTAL: "bg-violet-100 text-violet-700 ring-violet-300",
  FREE: "bg-yellow-200 text-yellow-900 ring-yellow-400",
};

/** 뱃지 표시 순서 */
export const SALE_TYPE_ORDER: SaleType[] = ["OWN", "RENTAL", "FREE"];

/** 19800 → "19,800원" */
export function formatPrice(won: number): string {
  return `${won.toLocaleString("ko-KR")}원`;
}

/** 정가 대비 할인율(%) — 할인이 없으면 0 */
export function discountRate(sku: Pick<Sku, "listPrice" | "salePrice">): number {
  if (sku.listPrice <= 0 || sku.salePrice >= sku.listPrice) return 0;
  return Math.round(((sku.listPrice - sku.salePrice) / sku.listPrice) * 100);
}

/** "2026-03-02" → "2026.03.02" (시간대 영향 없이 문자열로 변환) */
export function formatDate(iso: string): string {
  return iso.slice(0, 10).replaceAll("-", ".");
}

/** SKU 옵션 이름: 소장 / 대여 30일 / 무료 맛보기 */
export function skuLabel(sku: Sku): string {
  if (sku.saleType === "RENTAL") return sku.rentalDays ? `대여 ${sku.rentalDays}일` : "대여";
  if (sku.saleType === "FREE") return "무료 맛보기";
  return "소장";
}
