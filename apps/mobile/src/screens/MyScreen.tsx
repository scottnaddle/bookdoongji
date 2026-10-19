import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MOCK_PROFILE } from "../data/mock";
import { formatNumber } from "../lib/format";
import { colors } from "../lib/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface MenuItem {
  icon: IconName;
  label: string;
  /** 오른쪽 보조 텍스트 */
  detail?: string;
}

const MENU_GROUPS: { title: string; items: MenuItem[] }[] = [
  {
    title: "쇼핑",
    items: [
      { icon: "receipt-outline", label: "구매 · 대여 내역" },
      { icon: "heart-outline", label: "찜한 도서" },
      { icon: "pricetag-outline", label: "쿠폰함", detail: `${MOCK_PROFILE.coupons}장` },
    ],
  },
  {
    title: "독서 · 필기",
    items: [
      {
        icon: "phone-portrait-outline",
        label: "기기 관리",
        detail: `${MOCK_PROFILE.devices.used}/${MOCK_PROFILE.devices.max}대`,
      },
      { icon: "brush-outline", label: "펜 프리셋 설정" },
      { icon: "cloud-done-outline", label: "필기 동기화", detail: "자동" },
    ],
  },
  {
    title: "고객 지원",
    items: [
      { icon: "megaphone-outline", label: "공지사항" },
      { icon: "help-circle-outline", label: "자주 묻는 질문" },
      { icon: "chatbubble-ellipses-outline", label: "1:1 문의" },
      { icon: "settings-outline", label: "앱 설정" },
    ],
  },
];

const notReady = (label: string) => Alert.alert(label, "준비 중인 기능이에요.");

/** 마이페이지 (목업) — 프로필 요약 + 메뉴 목록 */
export default function MyScreen() {
  const { nickname, email, points, coupons } = MOCK_PROFILE;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{nickname.slice(0, 1)}</Text>
        </View>
        <View style={styles.profileText}>
          <Text style={styles.nickname}>{nickname} 님</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
        <Pressable onPress={() => notReady("프로필 수정")} hitSlop={8}>
          <Ionicons name="create-outline" size={22} color={colors.nest600} />
        </Pressable>
      </View>

      <View style={styles.stats}>
        <Stat label="포인트" value={`${formatNumber(points)}P`} />
        <View style={styles.statDivider} />
        <Stat label="쿠폰" value={`${coupons}장`} />
      </View>

      {MENU_GROUPS.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <View style={styles.card}>
            {group.items.map((item, i) => (
              <Pressable
                key={item.label}
                onPress={() => notReady(item.label)}
                style={({ pressed }) => [styles.menuRow, i > 0 && styles.menuBorder, pressed && styles.pressed]}
              >
                <Ionicons name={item.icon} size={20} color={colors.nest600} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.detail && <Text style={styles.menuDetail}>{item.detail}</Text>}
                <Ionicons name="chevron-forward" size={16} color={colors.gray} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <Pressable onPress={() => notReady("로그아웃")} style={styles.logout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </Pressable>
      <Text style={styles.version}>책둥지 v0.1.0</Text>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 16, paddingBottom: 32 },
  profile: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.nest600,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontSize: 22, fontWeight: "800" },
  profileText: { flex: 1, gap: 2 },
  nickname: { fontSize: 18, fontWeight: "800", color: colors.nest900 },
  email: { fontSize: 13, color: colors.gray },
  stats: {
    flexDirection: "row",
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.nest50,
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 17, fontWeight: "800", color: colors.nest700 },
  statLabel: { fontSize: 12, color: colors.gray },
  statDivider: { width: 1, backgroundColor: colors.nest200 },
  group: { marginTop: 24 },
  groupTitle: { fontSize: 13, fontWeight: "700", color: colors.gray, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  menuBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  pressed: { backgroundColor: colors.paperDark },
  menuLabel: { flex: 1, fontSize: 15, color: colors.nest900 },
  menuDetail: { fontSize: 13, color: colors.nest600, fontWeight: "600" },
  logout: { alignSelf: "center", marginTop: 28, padding: 8 },
  logoutText: { fontSize: 14, color: colors.gray, textDecorationLine: "underline" },
  version: { textAlign: "center", fontSize: 12, color: colors.gray, marginTop: 6 },
});
