import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrossMart — Myanmar's Most Trusted Cross-Border Marketplace",
  description:
    "Shop from Thailand, China, Japan with real-time cargo tracking. In-stock, cargo, and promotion products.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
