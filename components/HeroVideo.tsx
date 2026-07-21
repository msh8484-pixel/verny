"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SHOP, EXT } from "@/data/shop";

export default function HeroVideo() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const vidScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      id="hero"
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 560,
        overflow: "hidden",
        background: "var(--navy-deep)",
      }}
    >
      <motion.video
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-ad.jpg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: vidScale,
        }}
      >
        <source src="/hero-ad.mp4" type="video/mp4" />
      </motion.video>

      {/* legibility gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(20,33,61,0.28) 0%, rgba(20,33,61,0.05) 40%, rgba(20,33,61,0.55) 100%)",
        }}
      />

      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 24px",
          color: "#fff",
          y: contentY,
          opacity: contentOpacity,
        }}
      >
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.34em" }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow" style={{ color: "rgba(255,255,255,0.72)" }}>
            Premium Dress Socks
          </span>
        </motion.div>

        <motion.h1
          className="serif"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: "clamp(52px, 9vw, 128px)",
            fontWeight: 500,
            letterSpacing: "0.28em",
            textIndent: "0.28em",
            margin: "18px 0 10px",
            lineHeight: 1,
          }}
        >
          VERNY
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="serif"
          style={{
            fontSize: "clamp(15px, 2vw, 22px)",
            fontStyle: "italic",
            letterSpacing: "0.04em",
            color: "rgba(255,255,255,0.9)",
          }}
        >
          Trust Begins at the Detail
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="cta-row"
          style={{ display: "flex", gap: 14, marginTop: 36, flexWrap: "wrap", justifyContent: "center" }}
        >
          <a href={SHOP.store} {...EXT} className="btn btn-gold">Shop</a>
          <a
            href="#product"
            className="btn"
            style={{ background: "transparent", borderColor: "rgba(255,255,255,0.6)", color: "#fff" }}
          >
            Explore
          </a>
        </motion.div>
      </motion.div>

      {/* scroll cue */}
      <div
        style={{
          position: "absolute",
          bottom: 26,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        <span style={{ fontSize: 9.5, letterSpacing: "0.3em", textTransform: "uppercase" }}>Scroll</span>
        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 1, height: 40, background: "linear-gradient(var(--gold-light), transparent)" }}
        />
      </div>
    </section>
  );
}
