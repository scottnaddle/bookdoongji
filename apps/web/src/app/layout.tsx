import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "책둥지",
    template: "%s | 책둥지",
  },
  description: "수험서 eBook을 소장·대여·무료 맛보기로 만나는 책둥지",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
