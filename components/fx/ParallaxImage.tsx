"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ParallaxImage({
  src,
  alt,
  sizes,
  amount = 46,
  ratio = "4/5",
}: {
  src: string;
  alt: string;
  sizes?: string;
  amount?: number;
  ratio?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-amount, amount]);

  return (
    <div ref={ref} style={{ position: "relative", aspectRatio: ratio, overflow: "hidden", borderRadius: 2, background: "var(--paper-2)" }}>
      <motion.div style={{ position: "absolute", top: -amount, bottom: -amount, left: 0, right: 0, y }}>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <Image src={src} alt={alt} fill sizes={sizes} style={{ objectFit: "cover" }} />
        </div>
      </motion.div>
    </div>
  );
}
