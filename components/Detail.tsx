"use client";

import Image from "next/image";
import { FOOT } from "@/data/lookbook";
import Reveal from "./Reveal";
import TiltCard from "./fx/TiltCard";

export default function Detail() {
  return (
    <section id="detail" className="section" style={{ background: "var(--paper)", borderTop: "1px solid var(--line)" }}>
      <Reveal>
        <h2 className="serif" style={{ fontSize: "clamp(26px,3.6vw,44px)", fontWeight: 500, color: "var(--navy)", textAlign: "center", marginBottom: 46, letterSpacing: "0.02em" }}>
          Details
        </h2>
      </Reveal>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {FOOT.map((f, i) => (
          <Reveal key={f.src} delay={(i % 4) * 0.06}>
            <TiltCard className="tile" max={8} style={{ position: "relative", aspectRatio: "4/5", overflow: "hidden", borderRadius: 2 }}>
              <Image src={f.src} alt={f.alt} fill sizes="(max-width:900px) 45vw, 22vw" style={{ objectFit: "cover" }} className="tile-img" />
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <style>{`
        .tile-img { transition: transform .7s cubic-bezier(.22,1,.36,1); }
        .tile:hover .tile-img { transform: scale(1.06); }
      `}</style>
    </section>
  );
}
