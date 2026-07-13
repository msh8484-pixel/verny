"use client";

import { useState } from "react";
import Image from "next/image";
import { type Sock } from "@/data/lookbook";
import Reveal from "./Reveal";

const COLORS: { key: Sock; label: string; dot: string; img: string }[] = [
  { key: "navy", label: "Deep Navy", dot: "#22304f", img: "/lib/socks/u-navy.webp" },
  { key: "charcoal", label: "Charcoal", dot: "#484b50", img: "/lib/socks/u-charcoal2.webp" },
  { key: "black", label: "Black", dot: "#1c1c1e", img: "/lib/socks/u-black.webp" },
];

export default function Showcase() {
  const [color, setColor] = useState<Sock>("navy");
  const active = COLORS.find((c) => c.key === color)!;

  return (
    <section id="product" className="section" style={{ background: "var(--paper)" }}>
      <div className="grid-2" style={{ gap: "clamp(32px,5vw,90px)", alignItems: "center", maxWidth: 1120, margin: "0 auto" }}>
        <Reveal>
          <div style={{ position: "relative", aspectRatio: "4/5", background: "#ffffff", border: "1px solid var(--line)", borderRadius: 2, overflow: "hidden" }}>
            <Image
              key={active.img}
              src={active.img}
              alt={active.label}
              fill
              sizes="(max-width: 900px) 90vw, 45vw"
              style={{ objectFit: "cover", animation: "fade .5s ease" }}
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div>
            <span className="eyebrow">The Socks</span>
            <h2 className="serif" style={{ fontSize: "clamp(30px,4.4vw,52px)", fontWeight: 500, color: "var(--navy)", margin: "10px 0 26px" }}>
              {active.label}
            </h2>

            <div style={{ display: "flex", gap: 8, marginBottom: 34 }}>
              {COLORS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setColor(c.key)}
                  aria-label={c.label}
                  style={{ width: 84, display: "flex", flexDirection: "column", alignItems: "center", gap: 9, background: "none", border: "none", cursor: "pointer" }}
                >
                  <span
                    style={{
                      width: 30, height: 30, borderRadius: "50%", background: c.dot,
                      outline: color === c.key ? "1px solid var(--gold)" : "1px solid var(--line)",
                      outlineOffset: 3, transition: "outline-color .2s",
                    }}
                  />
                  <span style={{ fontSize: 10.5, letterSpacing: "0.08em", whiteSpace: "nowrap", color: color === c.key ? "var(--navy)" : "var(--ink-soft)" }}>{c.label}</span>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 30, marginBottom: 34, fontSize: 12, color: "var(--ink-soft)", letterSpacing: "0.04em" }}>
              <div><div style={{ color: "var(--navy)" }}>SIZE</div>FREE 250–280</div>
              <div><div style={{ color: "var(--navy)" }}>ORIGIN</div>Made in Korea</div>
              <div><div style={{ color: "var(--navy)" }}>SET</div>3 pairs</div>
            </div>

            <a href="/order" className="btn">Shop</a>
          </div>
        </Reveal>
      </div>

      <style>{`@keyframes fade { from { opacity: .3 } to { opacity: 1 } }`}</style>
    </section>
  );
}
