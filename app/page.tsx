import Shell from "@/components/Shell";
import HeroVideo from "@/components/HeroVideo";
import Showcase from "@/components/Showcase";
import Story from "@/components/Story";
import Detail from "@/components/Detail";
import Lookbook from "@/components/Lookbook";
import InstaFeed from "@/components/InstaFeed";
import OrderCta from "@/components/OrderCta";
import Marquee from "@/components/fx/Marquee";

export default function Home() {
  return (
    <Shell>
      <HeroVideo />
      <Showcase />
      <Marquee />
      <Story />
      <Detail />
      <Lookbook />
      <Marquee text="VERNY" sub="Since the Detail" speed={40} />
      <InstaFeed />
      <OrderCta />
    </Shell>
  );
}
