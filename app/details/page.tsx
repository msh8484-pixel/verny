import type { Metadata } from "next";
import Shell from "@/components/Shell";
import VideoHero from "@/components/VideoHero";
import Detail from "@/components/Detail";

export const metadata: Metadata = { title: "Details — VERNY" };

export default function DetailsPage() {
  return (
    <Shell>
      <VideoHero src="/video/pg-details.mp4" poster="/video/pg-details.jpg" title="Details" sub="The Detail" />
      <Detail />
    </Shell>
  );
}
