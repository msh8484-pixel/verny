import type { Metadata } from "next";
import Shell from "@/components/Shell";
import VideoHero from "@/components/VideoHero";
import Story from "@/components/Story";

export const metadata: Metadata = { title: "Story — VERNY" };

export default function StoryPage() {
  return (
    <Shell>
      <VideoHero src="/video/pg-story.mp4" poster="/video/pg-story.jpg" title="Story" sub="The Gift Set" />
      <Story />
    </Shell>
  );
}
