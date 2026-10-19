import type { Config } from "tailwindcss";

/** 책둥지 오리지널 디자인 토큰 — 숲(둥지) 녹색 + 따뜻한 종이색 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nest: {
          50: "#f1f7f4",
          100: "#dcebe3",
          200: "#b9d6c7",
          300: "#8dbaa3",
          400: "#5f997e",
          500: "#3f7c62",
          600: "#2f634e",
          700: "#265040",
          800: "#1f4034",
          900: "#18322a",
        },
        paper: {
          DEFAULT: "#faf7f1",
          dark: "#f1ece2",
        },
        twig: "#b5753c",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        book: "4px 6px 14px -4px rgba(24, 50, 42, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
