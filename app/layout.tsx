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

// 배포 도메인에 맞춰 OG/canonical 절대경로 자동 생성 (핸드오버 후 도메인이 바뀌어도 유효)
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

const TITLE = "VERNY — Trust Begins at the Detail";
const DESC =
  "프리미엄 신사 정장 양말 VERNY. 면 80·폴리에스터 14·라이크라 3·나일론 3, FREE 250–280mm, Made in Korea. ㈜베러스.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: TITLE, template: "%s — VERNY" },
  description: DESC,
  keywords: ["VERNY", "베르니", "신사 양말", "정장 양말", "드레스 삭스", "선물세트", "베러스", "BETTERUS"],
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: "프리미엄 신사 정장 양말 VERNY — 디테일에서 시작되는 신뢰.",
    type: "website",
    siteName: "VERNY",
    locale: "ko_KR",
    url: "/",
    images: [{ url: "/hero-ad.jpg", width: 1280, height: 720, alt: "VERNY 프리미엄 신사 정장 양말" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: "프리미엄 신사 정장 양말 VERNY — 디테일에서 시작되는 신뢰.",
    images: ["/hero-ad.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={serif.variable}>
      <body>
        {/* Pretendard variable + 동적 서브셋 — 렌더 페이지에 쓰인 글자만 다운로드 (React 19가 <head>로 호이스트) */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          precedence="high"
        />
        <SmoothScroll />
        {children}
        <FloatingCta />
      </body>
    </html>
  );
}
