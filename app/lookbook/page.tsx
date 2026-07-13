import type { Metadata } from "next";
import Shell from "@/components/Shell";
import VideoHero from "@/components/VideoHero";
import Lookbook from "@/components/Lookbook";

export const metadata: Metadata = { title: "Lookbook — VERNY" };

export default function LookbookPage() {
  return (
    <Shell>
      <VideoHero src="/video/pg-lookbook.mp4" poster="/video/pg-lookbook.jpg" title="Lookbook" sub="As Worn" />
      <Lookbook />
    </Shell>
  );
}
