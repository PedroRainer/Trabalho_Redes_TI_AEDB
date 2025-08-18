import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Go WebSocket + Next.js",
  description: "Demo de WebSocket com Go (views) e Next",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
