import type { Sku } from "@bookdoongji/shared";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookCover } from "../components/BookCard";
import type { CatalogBookDetail } from "../data/mock";
import { getBook } from "../lib/api";
import { SALE_TYPE_ORDER, discountRate, formatDate, formatPrice, skuLabel } from "../lib/format";
import { colors } from "../lib/theme";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetail">;

/** 옵션 정렬: 소장 → 대여(짧은 기간 순) → 무료 */
function sortSkus(skus: Sku[]): Sku[] {
  return [...skus].sort(
    (a, b) =>
      SALE_TYPE_ORDER.indexOf(a.saleType) - SALE_TYPE_ORDER.indexOf(b.saleType) ||
      (a.rentalDays ?? 0) - (b.rentalDays ?? 0),
  );
}

export default function ProductDetailScreen({ route }: Props) {
  const { bookId } = route.params;
  // undefined: 로딩 중, null: 없는 도서
  const [book, setBook] = useState<CatalogBookDetail | null | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setBook(undefined);
    void getBook(bookId).then((detail) => {
      if (!alive) return;
      setBook(detail);
      // 기본 선택: 첫 번째 유료 옵션 (없으면 첫 옵션)
      const skus = detail ? sortSkus(detail.skus) : [];
      setSelectedId((skus.find((s) => s.saleType !== "FREE") ?? skus[0])?.id ?? null);
    });
    return () => {
      alive = false;
    };
  }, [bookId]);

  if (book === undefined) {
    return <ActivityIndicator style={styles.loading} color={colors.nest600} />;
  }
  if (book === null) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>도서를 찾을 수 없어요.</Text>
      </View>
    );
  }

  const skus = sortSkus(book.skus);
  const selected = skus.find((s) => s.id === selectedId);

  const onPurchase = () => {
    if (!selected) return;
    const action = selected.saleType === "FREE" ? "맛보기를 서재에 담았어요" : `${skuLabel(selected)} 결제는 준비 중이에요`;
    Alert.alert(book.title, action);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <BookCover book={book} width={150} />
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.meta}>
            {book.authors.join(", ")} 저 · {book.publisher}
          </Text>
          <Text style={styles.metaSub}>
            출간 {formatDate(book.publishedAt)} · ISBN {book.isbn}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>구매 옵션</Text>
        <View style={styles.options}>
          {skus.map((sku) => {
            const active = sku.id === selectedId;
            const rate = discountRate(sku);
            return (
              <Pressable
                key={sku.id}
                onPress={() => setSelectedId(sku.id)}
                style={[styles.option, active && styles.optionActive]}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
              >
                <View style={[styles.radio, active && styles.radioActive]} />
                <View style={styles.optionBody}>
                  <Text style={styles.optionLabel}>{skuLabel(sku)}</Text>
                  {sku.rentalEndAt && (
                    <Text style={styles.optionNote}>{formatDate(sku.rentalEndAt)}까지 대여 판매</Text>
                  )}
                </View>
                <View style={styles.optionPrice}>
                  {rate > 0 && <Text style={styles.listPrice}>{formatPrice(sku.listPrice)}</Text>}
                  <Text style={styles.salePrice}>
                    {rate > 0 && <Text style={styles.rate}>{rate}% </Text>}
                    {sku.saleType === "FREE" ? "무료" : formatPrice(sku.salePrice)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>책 소개</Text>
        <Text style={styles.description}>{book.description}</Text>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [styles.cta, (!selected || pressed) && styles.ctaDim]}
          onPress={onPurchase}
          disabled={!selected}
        >
          <Text style={styles.ctaText}>
            {!selected
              ? "판매 중인 옵션이 없어요"
              : selected.saleType === "FREE"
                ? "무료로 읽기"
                : `${formatPrice(selected.salePrice)} ${selected.saleType === "RENTAL" ? "대여하기" : "구매하기"}`}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  loading: { marginTop: 60 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { color: colors.gray, fontSize: 15 },
  content: { padding: 16, paddingBottom: 32 },
  hero: { alignItems: "center", gap: 6, paddingVertical: 12 },
  title: { fontSize: 20, fontWeight: "800", color: colors.nest900, textAlign: "center", marginTop: 14 },
  meta: { fontSize: 14, color: colors.nest700 },
  metaSub: { fontSize: 12, color: colors.gray },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.nest900, marginTop: 24, marginBottom: 10 },
  options: { gap: 8 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  optionActive: { borderColor: colors.nest600, backgroundColor: colors.nest50 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.nest200 },
  radioActive: { borderColor: colors.nest600, borderWidth: 6 },
  optionBody: { flex: 1, gap: 2 },
  optionLabel: { fontSize: 15, fontWeight: "700", color: colors.nest900 },
  optionNote: { fontSize: 12, color: colors.twig },
  optionPrice: { alignItems: "flex-end" },
  listPrice: { fontSize: 12, color: colors.gray, textDecorationLine: "line-through" },
  salePrice: { fontSize: 15, fontWeight: "800", color: colors.nest900 },
  rate: { color: colors.danger },
  description: { fontSize: 14, lineHeight: 22, color: colors.nest900 },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
  },
  cta: { backgroundColor: colors.nest600, borderRadius: 12, paddingVertical: 15, alignItems: "center" },
  ctaDim: { opacity: 0.6 },
  ctaText: { color: colors.white, fontSize: 16, fontWeight: "800" },
});
