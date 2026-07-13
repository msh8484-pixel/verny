"use client";

import { STUDIO } from "@/data/lookbook";
import Reveal from "./Reveal";
import ParallaxImage from "./fx/ParallaxImage";

const SPECS = ["Cotton 70 · Nylon 25 · PU 5", "Free 250–280 mm", "3 pairs · Gift box", "Made in Korea"];

export default function Story() {
  return (
    <section
      id="story"
      className="section"
      style={{ background: "var(--paper-2)", borderTop: "1px solid var(--line)" }}
    >
      <div className="grid-2" style={{ gap: "clamp(40px,6vw,110px)", alignItems: "center", maxWidth: 1180, margin: "0 auto" }}>
        <Reveal>
          <ParallaxImage src={STUDIO.cool.src} alt={STUDIO.cool.alt} sizes="(max-width: 900px) 90vw, 48vw" />
        </Reveal>

        <Reveal delay={0.1}>
          <div>
            <span className="eyebrow">The Gift Set</span>
            <p
              className="serif"
              style={{ fontStyle: "italic", fontSize: "clamp(26px,3.4vw,40px)", color: "var(--navy)", lineHeight: 1.25, margin: "16px 0 34px" }}
            >
              Trust Begins<br />at the Detail
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SPECS.map((s) => (
                <span key={s} style={{ fontSize: 12, letterSpacing: "0.1em", color: "var(--ink-soft)", textTransform: "uppercase" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
