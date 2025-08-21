import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TCP Client (Next) + Go Server",
  description: "Demo: front chama TCP via API interna, Go responde",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
