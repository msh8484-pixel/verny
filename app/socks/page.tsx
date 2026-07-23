import type { Metadata } from "next";
import Shell from "@/components/Shell";
import VideoHero from "@/components/VideoHero";
import SockDetail from "@/components/SockDetail";

export const metadata: Metadata = { title: "Socks — VERNY" };

export default function SocksPage() {
  return (
    <Shell>
      <VideoHero src="/hero-ad.mp4" poster="/hero-ad.jpg" title="Socks" sub="The Product" />
      <SockDetail />
    </Shell>
  );
}
