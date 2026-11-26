import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 模型能力对比",
  description: "前沿 AI 模型的综合智能、能力维度与 API 价格静态数据表。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
