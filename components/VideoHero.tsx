"use client";

import { motion } from "framer-motion";

export default function VideoHero({
  src,
  poster,
  title,
  sub,
}: {
  src: string;
  poster: string;
  title: string;
  sub: string;
}) {
  return (
    <section style={{ position: "relative", height: "clamp(360px, 58vh, 620px)", overflow: "hidden", background: "var(--navy-deep)" }}>
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      >
        <source src={src} type="video/mp4" />
      </video>

      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,33,61,0.12) 0%, rgba(20,33,61,0.15) 45%, rgba(20,33,61,0.58) 100%)" }} />

      <div style={{ position: "absolute", left: "clamp(24px, 6vw, 96px)", bottom: "clamp(28px, 5vw, 56px)", color: "#fff" }}>
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <span className="eyebrow" style={{ color: "rgba(255,255,255,0.78)" }}>{sub}</span>
        </motion.div>
        <motion.h1
          className="serif"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontSize: "clamp(34px, 6vw, 72px)", fontWeight: 500, letterSpacing: "0.04em", marginTop: 6, lineHeight: 1 }}
        >
          {title}
        </motion.h1>
      </div>
    </section>
  );
}
