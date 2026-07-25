import Shell from "@/components/Shell";
import HeroVideo from "@/components/HeroVideo";
import Showcase from "@/components/Showcase";
import Story from "@/components/Story";
import Detail from "@/components/Detail";
import Lookbook from "@/components/Lookbook";
import InstaFeed from "@/components/InstaFeed";
import OrderCta from "@/components/OrderCta";

export default function Home() {
  return (
    <Shell>
      {/* 홈 히어로 포스터 = LCP 요소. 고우선 프리로드로 첫 페인트 앞당김 */}
      <link rel="preload" as="image" href="/hero-ad.jpg" fetchPriority="high" />
      <HeroVideo />
      <Showcase />
      <Story />
      <Detail />
      <Lookbook />
      <InstaFeed />
      <OrderCta />
    </Shell>
  );
}
