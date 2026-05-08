"use client";

import VNavbar from "@/components/VNavbar";
import VHero from "@/components/VHero";
import VProduct from "@/components/VProduct";
import VDetails from "@/components/VDetails";
import VValues from "@/components/VValues";
import VCta from "@/components/VCta";
import VFooter from "@/components/VFooter";
import VSticky from "@/components/VSticky";

export default function Home() {
  return (
    <>
      <VNavbar />
      <VHero />
      <VProduct />
      <VDetails />
      <VValues />
      <VCta />
      <VFooter />
      <VSticky />
    </>
  );
}
