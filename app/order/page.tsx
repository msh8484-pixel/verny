import type { Metadata } from "next";
import Shell from "@/components/Shell";
import VideoHero from "@/components/VideoHero";
import OrderCta from "@/components/OrderCta";

export const metadata: Metadata = { title: "Order — VERNY" };

export default function OrderPage() {
  return (
    <Shell>
      <VideoHero src="/video/pg-order.mp4" poster="/video/pg-order.jpg" title="Order" sub="Shop" />
      <OrderCta />
    </Shell>
  );
}
