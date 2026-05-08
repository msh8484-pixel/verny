import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VERNY — Trust Begins at the Detail",
  description: "프리미엄 드레스 양말 VERNY. 립조직 8:2, 라이크라 커프밴드, 28cm 정장 양말.",
  openGraph: {
    title: "VERNY — Trust Begins at the Detail",
    description: "프리미엄 드레스 양말 VERNY",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
