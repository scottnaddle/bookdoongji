import Ionicons from "@expo/vector-icons/Ionicons";
import type { Category } from "@bookdoongji/shared";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState, type ComponentProps } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BookCard from "../components/BookCard";
import { MOCK_BANNERS, type CatalogBookDetail } from "../data/mock";
import { getBooks, getCategories } from "../lib/api";
import { colors } from "../lib/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

/** 카테고리 숏컷 아이콘 — 모르는 카테고리는 기본 책 아이콘 */
const CATEGORY_ICON: Record<string, IconName> = {
  "cat-civil": "business-outline",
  "cat-license": "ribbon-outline",
  "cat-language": "language-outline",
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<CatalogBookDetail[] | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    let alive = true;
    void Promise.all([getCategories(), getBooks()]).then(([cats, list]) => {
      if (!alive) return;
      setCategories(cats.filter((c) => c.parentId === null));
      setBooks(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  const bannerWidth = width - 32;
  const newest = books ? [...books].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)) : [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 상단: 로고 + 검색 */}
        <View style={styles.header}>
          <Text style={styles.logo}>책둥지</Text>
          <Pressable
            style={styles.searchBox}
            onPress={() => navigation.navigate("Search")}
            accessibilityRole="search"
            accessibilityLabel="도서 검색"
          >
            <Ionicons name="search" size={18} color={colors.gray} />
            <Text style={styles.searchPlaceholder}>수험서 제목·저자·출판사 검색</Text>
          </Pressable>
        </View>

        {/* 배너 캐러셀 */}
        <FlatList
          data={MOCK_BANNERS}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={bannerWidth + 12}
          decelerationRate="fast"
          contentContainerStyle={styles.bannerList}
          onMomentumScrollEnd={(e) =>
            setBannerIndex(Math.round(e.nativeEvent.contentOffset.x / (bannerWidth + 12)))
          }
          renderItem={({ item }) => (
            <Pressable
              style={[styles.banner, { width: bannerWidth, backgroundColor: item.color }]}
              onPress={() => item.bookId && navigation.navigate("ProductDetail", { bookId: item.bookId })}
            >
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
            </Pressable>
          )}
        />
        <View style={styles.dots}>
          {MOCK_BANNERS.map((b, i) => (
            <View key={b.id} style={[styles.dot, i === bannerIndex && styles.dotActive]} />
          ))}
        </View>

        {/* 카테고리 숏컷 */}
        <View style={styles.shortcuts}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              style={styles.shortcut}
              onPress={() => navigation.navigate("Tabs", { screen: "Category", params: { categoryId: cat.id } })}
            >
              <View style={styles.shortcutIcon}>
                <Ionicons name={CATEGORY_ICON[cat.id] ?? "book-outline"} size={24} color={colors.nest600} />
              </View>
              <Text style={styles.shortcutLabel}>{cat.name}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.shortcut} onPress={() => navigation.navigate("Tabs", { screen: "Category" })}>
            <View style={styles.shortcutIcon}>
              <Ionicons name="apps-outline" size={24} color={colors.nest600} />
            </View>
            <Text style={styles.shortcutLabel}>전체</Text>
          </Pressable>
        </View>

        {/* 추천 도서 */}
        <Section title="둥지 추천 수험서" />
        {books === null ? (
          <ActivityIndicator style={styles.loading} color={colors.nest600} />
        ) : (
          <FlatList
            data={books}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bookList}
            renderItem={({ item }) => (
              <BookCard book={item} onPress={() => navigation.navigate("ProductDetail", { bookId: item.id })} />
            )}
          />
        )}

        {/* 신간 */}
        <Section title="새로 나온 책" />
        <View style={styles.newList}>
          {newest.slice(0, 3).map((book) => (
            <BookCard
              key={book.id}
              book={book}
              variant="row"
              onPress={() => navigation.navigate("ProductDetail", { bookId: book.id })}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { paddingBottom: 32 },
  header: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  logo: { fontSize: 24, fontWeight: "800", color: colors.nest700 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchPlaceholder: { color: colors.gray, fontSize: 14 },
  bannerList: { paddingHorizontal: 16, gap: 12, marginTop: 16 },
  banner: { height: 140, borderRadius: 14, padding: 20, justifyContent: "flex-end", gap: 6 },
  bannerTitle: { color: colors.white, fontSize: 19, fontWeight: "800" },
  bannerSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.nest200 },
  dotActive: { width: 16, backgroundColor: colors.nest600 },
  shortcuts: { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 16, marginTop: 20 },
  shortcut: { alignItems: "center", gap: 6, width: 72 },
  shortcutIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.nest50,
    alignItems: "center",
    justifyContent: "center",
  },
  shortcutLabel: { fontSize: 12, fontWeight: "600", color: colors.nest900 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.nest900,
    paddingHorizontal: 16,
    marginTop: 28,
    marginBottom: 12,
  },
  loading: { marginVertical: 40 },
  bookList: { paddingHorizontal: 16, gap: 14, paddingBottom: 6 },
  newList: { paddingHorizontal: 16 },
});
