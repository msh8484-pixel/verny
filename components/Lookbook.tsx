"use client";

import Image from "next/image";
import { LOOKBOOK } from "@/data/lookbook";
import Reveal from "./Reveal";
import TiltCard from "./fx/TiltCard";

export default function Lookbook() {
  return (
    <section id="lookbook" className="section" style={{ background: "var(--paper-2)", borderTop: "1px solid var(--line)" }}>
      <Reveal>
        <h2 className="serif" style={{ fontSize: "clamp(26px,3.6vw,44px)", fontWeight: 500, color: "var(--navy)", textAlign: "center", marginBottom: 52, letterSpacing: "0.02em" }}>
          Lookbook
        </h2>
      </Reveal>

      <div
        style={{
          columnGap: 14,
          columnWidth: 280,
          maxWidth: 1240,
          margin: "0 auto",
        }}
      >
        {LOOKBOOK.map((l, i) => (
          <Reveal key={l.src} delay={(i % 3) * 0.05} style={{ breakInside: "avoid", marginBottom: 14 }}>
            <TiltCard className="lb-tile" max={6} style={{ position: "relative", overflow: "hidden", borderRadius: 2, background: "var(--paper-2)" }}>
              <Image
                src={l.src}
                alt={l.alt}
                width={928}
                height={1152}
                sizes="(max-width:900px) 45vw, 300px"
                style={{ width: "100%", height: "auto", display: "block" }}
                className="lb-img"
              />
              <div className="lb-cap">{l.alt}</div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <style>{`
        .lb-img { transition: transform .8s cubic-bezier(.22,1,.36,1); }
        .lb-tile:hover .lb-img { transform: scale(1.05); }
        .lb-cap {
          position: absolute; left: 0; right: 0; bottom: 0;
          padding: 26px 16px 14px; color: #fff; font-size: 11px; letter-spacing: 0.06em;
          background: linear-gradient(transparent, rgba(20,33,61,0.72));
          opacity: 0; transform: translateY(8px); transition: opacity .4s, transform .4s;
        }
        .lb-tile:hover .lb-cap { opacity: 1; transform: translateY(0); }
      `}</style>
    </section>
  );
}
