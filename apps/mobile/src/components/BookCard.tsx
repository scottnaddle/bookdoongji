import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { CatalogBookDetail } from "../data/mock";
import { SALE_TYPE_BADGE, SALE_TYPE_LABEL, SALE_TYPE_ORDER, discountRate, formatPrice, lowestPaidSku } from "../lib/format";
import { colors } from "../lib/theme";

/** 표지 이미지가 준비되기 전까지 쓰는 색 블록 표지 팔레트 */
const COVER_TONES = ["#2f634e", "#b5753c", "#3f7c62", "#7a5c3e", "#265040"] as const;

function coverTone(bookId: string): string {
  let hash = 0;
  for (const ch of bookId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return COVER_TONES[hash % COVER_TONES.length] ?? COVER_TONES[0];
}

/** 색 블록 + 제목으로 만든 자리표시 표지 */
export function BookCover({ book, width }: { book: CatalogBookDetail | { id: string; title: string }; width: number }) {
  return (
    <View style={[styles.cover, { width, height: width * 1.42, backgroundColor: coverTone(book.id) }]}>
      <View style={styles.coverSpine} />
      <Text style={[styles.coverTitle, { fontSize: Math.max(10, width / 9) }]} numberOfLines={4}>
        {book.title}
      </Text>
      <Text style={styles.coverBrand}>책둥지</Text>
    </View>
  );
}

interface BookCardProps {
  book: CatalogBookDetail;
  onPress?: () => void;
  /** grid: 세로형(가로 스크롤·그리드), row: 가로형(검색·카테고리 목록) */
  variant?: "grid" | "row";
  style?: StyleProp<ViewStyle>;
}

export default function BookCard({ book, onPress, variant = "grid", style }: BookCardProps) {
  const priceSku = lowestPaidSku(book.skus);
  const rate = priceSku ? discountRate(priceSku) : 0;
  const saleTypes = SALE_TYPE_ORDER.filter((type) => book.skus.some((sku) => sku.saleType === type));
  const isRow = variant === "row";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${book.title}, ${book.authors.join(", ")}`}
      style={({ pressed }) => [isRow ? styles.row : styles.grid, pressed && styles.pressed, style]}
    >
      <BookCover book={book} width={isRow ? 72 : 120} />
      <View style={isRow ? styles.rowInfo : styles.gridInfo}>
        <View style={styles.badges}>
          {saleTypes.map((type) => (
            <Text key={type} style={[styles.badge, { backgroundColor: SALE_TYPE_BADGE[type].bg, color: SALE_TYPE_BADGE[type].fg }]}>
              {SALE_TYPE_LABEL[type]}
            </Text>
          ))}
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {book.authors.join(", ")} · {book.publisher}
        </Text>
        {priceSku ? (
          <View style={styles.priceLine}>
            {rate > 0 && <Text style={styles.rate}>{rate}%</Text>}
            <Text style={styles.price}>{formatPrice(priceSku.salePrice)}~</Text>
          </View>
        ) : (
          <Text style={styles.price}>무료</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { width: 120 },
  row: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 12,
  },
  pressed: { opacity: 0.7 },
  gridInfo: { marginTop: 8, gap: 3 },
  rowInfo: { flex: 1, gap: 4, justifyContent: "center" },
  cover: {
    borderRadius: 4,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 8,
    justifyContent: "space-between",
    overflow: "hidden",
    shadowColor: colors.nest900,
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  coverSpine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  coverTitle: { color: colors.white, fontWeight: "700" },
  coverBrand: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontWeight: "600" },
  badges: { flexDirection: "row", gap: 4 },
  badge: {
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    overflow: "hidden",
  },
  title: { fontSize: 14, fontWeight: "700", color: colors.nest900 },
  meta: { fontSize: 12, color: colors.gray },
  priceLine: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  rate: { fontSize: 13, fontWeight: "800", color: colors.danger },
  price: { fontSize: 14, fontWeight: "800", color: colors.nest900 },
});
