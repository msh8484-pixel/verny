import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import FloatingCta from "@/components/FloatingCta";
import SmoothScroll from "@/components/fx/SmoothScroll";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif-next",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VERNY — Trust Begins at the Detail",
  description:
    "프리미엄 신사 정장 양말 VERNY. 면 70·나일론 25·폴리우레탄 5, FREE 250–280mm, Made in Korea. ㈜베러스.",
  openGraph: {
    title: "VERNY — Trust Begins at the Detail",
    description: "프리미엄 신사 정장 양말 VERNY — 디테일에서 시작되는 신뢰.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={serif.variable}>
      <body>
        <SmoothScroll />
        {children}
        <FloatingCta />
      </body>
    </html>
  );
}
