import type { SaleType, Sku } from "@bookdoongji/shared";

export const SALE_TYPE_LABEL: Record<SaleType, string> = {
  OWN: "소장",
  RENTAL: "대여",
  FREE: "무료",
};

/** 뱃지 색상: 소장(회색) / 대여(보라) / 무료(노랑) — 웹과 같은 규칙 */
export const SALE_TYPE_BADGE: Record<SaleType, { bg: string; fg: string }> = {
  OWN: { bg: "#f3f4f6", fg: "#374151" },
  RENTAL: { bg: "#ede9fe", fg: "#6d28d9" },
  FREE: { bg: "#fef08a", fg: "#713f12" },
};

/** 뱃지 표시 순서 */
export const SALE_TYPE_ORDER: SaleType[] = ["OWN", "RENTAL", "FREE"];

/** 19800 → "19,800" (기기 Intl 지원 여부와 무관하게 동작) */
export function formatNumber(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** 19800 → "19,800원" */
export function formatPrice(won: number): string {
  return `${formatNumber(won)}원`;
}

/** 정가 대비 할인율(%) — 할인이 없으면 0 */
export function discountRate(sku: Pick<Sku, "listPrice" | "salePrice">): number {
  if (sku.listPrice <= 0 || sku.salePrice >= sku.listPrice) return 0;
  return Math.round(((sku.listPrice - sku.salePrice) / sku.listPrice) * 100);
}

/** "2026-03-02" → "2026.03.02" */
export function formatDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, ".");
}

/** SKU 옵션 이름: 소장 / 대여 30일 / 무료 맛보기 */
export function skuLabel(sku: Sku): string {
  if (sku.saleType === "RENTAL") return sku.rentalDays ? `대여 ${sku.rentalDays}일` : "대여";
  if (sku.saleType === "FREE") return "무료 맛보기";
  return "소장";
}

/** 목록 카드에 보여줄 대표 가격 — 유료 SKU 중 최저 판매가 */
export function lowestPaidSku(skus: Sku[]): Sku | undefined {
  return skus
    .filter((sku) => sku.saleType !== "FREE")
    .reduce<Sku | undefined>((min, sku) => (!min || sku.salePrice < min.salePrice ? sku : min), undefined);
}
