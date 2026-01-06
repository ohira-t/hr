import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MainContent } from "@/components/layout/main-content";
import { LayoutProvider } from "@/components/layout/layout-provider";

export const metadata: Metadata = {
  title: "採用管理システム - HR部",
  description: "福祉事業の採用業務を効率的に管理するシステム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#F5F5F7]">
        <LayoutProvider>
          <Sidebar />
          <MainContent>
            {children}
          </MainContent>
        </LayoutProvider>
      </body>
    </html>
  );
}
