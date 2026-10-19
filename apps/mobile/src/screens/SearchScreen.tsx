import Ionicons from "@expo/vector-icons/Ionicons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import BookCard from "../components/BookCard";
import type { CatalogBookDetail } from "../data/mock";
import { searchBooks } from "../lib/api";
import { colors } from "../lib/theme";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Search">;

/** 입력이 멈춘 뒤 검색을 보내기까지 기다리는 시간 */
const DEBOUNCE_MS = 300;

const SUGGESTIONS = ["행정법", "한국사", "정보처리기사", "토익"];

export default function SearchScreen({ navigation, route }: Props) {
  const [query, setQuery] = useState(route.params?.initialQuery ?? "");
  const [results, setResults] = useState<CatalogBookDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const keyword = query.trim();
    if (!keyword) {
      setResults([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    const timer = setTimeout(() => {
      void searchBooks(keyword).then((list) => {
        if (!alive) return;
        setResults(list);
        setLoading(false);
      });
    }, DEBOUNCE_MS);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [query]);

  const hasQuery = query.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.inputWrap}>
        <Ionicons name="search" size={18} color={colors.gray} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="제목·저자·출판사로 검색"
          placeholderTextColor={colors.gray}
          style={styles.input}
          autoFocus
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
      </View>

      {!hasQuery ? (
        <View style={styles.suggest}>
          <Text style={styles.suggestTitle}>추천 검색어</Text>
          <View style={styles.suggestRow}>
            {SUGGESTIONS.map((word) => (
              <Pressable key={word} style={styles.suggestChip} onPress={() => setQuery(word)}>
                <Text style={styles.suggestText}>{word}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : loading ? (
        <ActivityIndicator style={styles.loading} color={colors.nest600} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            results.length > 0 ? <Text style={styles.count}>검색 결과 {results.length}건</Text> : null
          }
          ListEmptyComponent={<Text style={styles.empty}>‘{query.trim()}’에 대한 검색 결과가 없어요.</Text>}
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
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.nest200,
    borderRadius: 10,
  },
  input: { flex: 1, paddingVertical: 10, fontSize: 15, color: colors.nest900 },
  suggest: { paddingHorizontal: 16, gap: 10 },
  suggestTitle: { fontSize: 14, fontWeight: "700", color: colors.nest900 },
  suggestRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.nest50 },
  suggestText: { fontSize: 13, color: colors.nest700 },
  loading: { marginTop: 40 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  count: { fontSize: 13, color: colors.gray, marginBottom: 4 },
  separator: { height: 1, backgroundColor: colors.line },
  empty: { textAlign: "center", color: colors.gray, marginTop: 40 },
});
