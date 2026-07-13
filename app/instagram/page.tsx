import type { Metadata } from "next";
import Shell from "@/components/Shell";
import VideoHero from "@/components/VideoHero";
import InstaFeed from "@/components/InstaFeed";

export const metadata: Metadata = { title: "Instagram — VERNY" };

export default function InstagramPage() {
  return (
    <Shell>
      <VideoHero src="/video/pg-instagram.mp4" poster="/video/pg-instagram.jpg" title="Instagram" sub="@verny.official" />
      <InstaFeed />
    </Shell>
  );
}
