import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { NavigatorScreenParams } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { ComponentProps } from "react";
import { colors } from "../lib/theme";
import CategoryScreen from "../screens/CategoryScreen";
import HomeScreen from "../screens/HomeScreen";
import LibraryScreen from "../screens/LibraryScreen";
import MyScreen from "../screens/MyScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import SearchScreen from "../screens/SearchScreen";

/** 하단 탭 라우트 */
export type TabParamList = {
  Home: undefined;
  Category: { categoryId?: string } | undefined;
  Library: undefined;
  My: undefined;
};

/** 루트 스택 라우트 — 탭 위로 상품상세·검색이 쌓인다 */
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  ProductDetail: { bookId: string };
  Search: { initialQuery?: string } | undefined;
};

declare global {
  // useNavigation() 을 인자 없이 써도 라우트 타입이 추론되도록 등록
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

type IconName = ComponentProps<typeof Ionicons>["name"];

const TAB_META: Record<keyof TabParamList, { label: string; icon: IconName; iconActive: IconName }> = {
  Home: { label: "홈", icon: "home-outline", iconActive: "home" },
  Category: { label: "카테고리", icon: "grid-outline", iconActive: "grid" },
  Library: { label: "서재", icon: "library-outline", iconActive: "library" },
  My: { label: "마이", icon: "person-outline", iconActive: "person" },
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const meta = TAB_META[route.name];
        return {
          title: meta.label,
          tabBarLabel: meta.label,
          tabBarActiveTintColor: colors.nest600,
          tabBarInactiveTintColor: colors.gray,
          headerTitleStyle: { fontWeight: "700", color: colors.nest900 },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? meta.iconActive : meta.icon} size={size} color={color} />
          ),
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Category" component={CategoryScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} options={{ title: "내 서재" }} />
      <Tab.Screen name="My" component={MyScreen} options={{ title: "마이페이지" }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.nest700,
        headerTitleStyle: { fontWeight: "700", color: colors.nest900 },
        headerBackTitle: "뒤로",
      }}
    >
      <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "상품 상세" }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: "검색" }} />
    </Stack.Navigator>
  );
}
