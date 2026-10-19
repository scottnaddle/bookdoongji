import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { BookCover } from "../components/BookCard";
import { MOCK_BOOKS, MOCK_LIBRARY, type LibraryItem, type SaleType } from "../data/mock";
import { SALE_TYPE_BADGE, SALE_TYPE_LABEL, formatDate } from "../lib/format";
import { colors } from "../lib/theme";

type Filter = "ALL" | SaleType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "전체" },
  { key: "OWN", label: "소장" },
  { key: "RENTAL", label: "대여" },
  { key: "FREE", label: "무료" },
];

/** 대여 만료까지 남은 일수 (오늘 만료면 0) */
function daysLeft(expiresAt: string): number {
  return Math.max(0, Math.ceil((Date.parse(expiresAt) - Date.now()) / 86_400_000));
}

/** 내 서재 (목업) — 최근 읽은 순 정렬, 판매 유형 필터 */
export default function LibraryScreen() {
  const navigation = useNavigation();
  const [filter, setFilter] = useState<Filter>("ALL");

  const items = useMemo(
    () =>
      MOCK_LIBRARY.filter((item) => filter === "ALL" || item.saleType === filter)
        .map((item) => ({ item, book: MOCK_BOOKS.find((b) => b.id === item.bookId) }))
        .filter((row): row is { item: LibraryItem; book: (typeof MOCK_BOOKS)[number] } => row.book !== undefined)
        .sort((a, b) => b.item.lastReadAt.localeCompare(a.item.lastReadAt)),
    [filter],
  );

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.filter, active && styles.filterActive]}
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={items}
        keyExtractor={(row) => row.item.bookId}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.empty}>서재에 담긴 책이 없어요.</Text>}
        renderItem={({ item: { item, book } }) => {
          const percent = Math.round(item.progress * 100);
          const badge = SALE_TYPE_BADGE[item.saleType];
          return (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              onPress={() => navigation.navigate("ProductDetail", { bookId: book.id })}
            >
              <BookCover book={book} width={64} />
              <View style={styles.info}>
                <View style={styles.badgeLine}>
                  <Text style={[styles.badge, { backgroundColor: badge.bg, color: badge.fg }]}>
                    {SALE_TYPE_LABEL[item.saleType]}
                  </Text>
                  {item.expiresAt && (
                    <Text style={styles.expire}>
                      {daysLeft(item.expiresAt)}일 남음 · {formatDate(item.expiresAt)} 만료
                    </Text>
                  )}
                </View>
                <Text style={styles.title} numberOfLines={2}>
                  {book.title}
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${percent}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {percent}% 읽음 · 최근 {formatDate(item.lastReadAt)}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  filters: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  filter: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  filterActive: { backgroundColor: colors.nest600, borderColor: colors.nest600 },
  filterText: { fontSize: 13, fontWeight: "600", color: colors.nest900 },
  filterTextActive: { color: colors.white },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  separator: { height: 1, backgroundColor: colors.line },
  empty: { textAlign: "center", color: colors.gray, marginTop: 40 },
  row: { flexDirection: "row", gap: 14, paddingVertical: 14 },
  pressed: { opacity: 0.7 },
  info: { flex: 1, gap: 6, justifyContent: "center" },
  badgeLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  badge: { fontSize: 10, fontWeight: "700", paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3, overflow: "hidden" },
  expire: { fontSize: 11, color: colors.twig, fontWeight: "600" },
  title: { fontSize: 15, fontWeight: "700", color: colors.nest900 },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: colors.nest100, overflow: "hidden" },
  progressFill: { height: 5, backgroundColor: colors.nest500 },
  progressText: { fontSize: 12, color: colors.gray },
});
