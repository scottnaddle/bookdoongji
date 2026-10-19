import type { Category } from "@bookdoongji/shared";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BookCard from "../components/BookCard";
import type { CatalogBookDetail } from "../data/mock";
import { getBooks, getCategories } from "../lib/api";
import { colors } from "../lib/theme";
import type { RootStackParamList, TabParamList } from "../navigation/AppNavigator";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Category">,
  NativeStackScreenProps<RootStackParamList>
>;

/** 카테고리 칩 + 해당 카테고리 도서 목록. 칩 선택은 라우트 파라미터(categoryId)로 관리한다 */
export default function CategoryScreen({ navigation, route }: Props) {
  const categoryId = route.params?.categoryId;
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<CatalogBookDetail[] | null>(null);

  useEffect(() => {
    let alive = true;
    void getCategories().then((cats) => alive && setCategories(cats.filter((c) => c.parentId === null)));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setBooks(null);
    void getBooks(categoryId).then((list) => alive && setBooks(list));
    return () => {
      alive = false;
    };
  }, [categoryId]);

  const chips: { id: string | undefined; name: string }[] = [{ id: undefined, name: "전체" }, ...categories];

  return (
    <View style={styles.container}>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {chips.map((chip) => {
            const active = chip.id === categoryId;
            return (
              <Pressable
                key={chip.id ?? "all"}
                onPress={() => navigation.setParams({ categoryId: chip.id })}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {books === null ? (
        <ActivityIndicator style={styles.loading} color={colors.nest600} />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={<Text style={styles.count}>총 {books.length}권</Text>}
          ListEmptyComponent={<Text style={styles.empty}>이 카테고리에 등록된 도서가 아직 없어요.</Text>}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              variant="row"
              onPress={() => navigation.navigate("ProductDetail", { bookId: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.nest600, borderColor: colors.nest600 },
  chipText: { fontSize: 14, fontWeight: "600", color: colors.nest900 },
  chipTextActive: { color: colors.white },
  loading: { marginTop: 40 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  count: { fontSize: 13, color: colors.gray, marginBottom: 4 },
  separator: { height: 1, backgroundColor: colors.line },
  empty: { textAlign: "center", color: colors.gray, marginTop: 40 },
});
