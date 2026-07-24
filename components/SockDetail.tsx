"use client";

import Image from "next/image";
import { SHOP, EXT } from "@/data/shop";
import Reveal from "./Reveal";

// 세 색상 공통 구조 — 양말마다 동일하게 표기
const FEATS: [string, string][] = [
  ["립 8:2 조직", "종일 흘러내리지 않는 밀착"],
  ["6cm 커프밴드", "혈류 방해 없는 적정 압박"],
  ["면 80% 혼방", "하루 종일 뽀송한 감촉"],
];

const COLORS = [
  {
    no: "01",
    label: "Deep Navy",
    dot: "#22304f",
    img: "/lib/socks/u-navy.webp",
    note: "어떤 슈트에도 어울리는 기본.",
    pantone: "Cool Gray 11C",
  },
  {
    no: "02",
    label: "Charcoal",
    dot: "#484b50",
    img: "/lib/socks/u-charcoal2.webp",
    note: "그레이·브라운 슈트와 자연스럽게.",
    pantone: "Cool Gray 11C",
  },
  {
    no: "03",
    label: "Black",
    dot: "#1c1c1e",
    img: "/lib/socks/u-black.webp",
    note: "가장 격식 있는 자리, 포멀웨어에.",
    pantone: "2336C",
  },
];

const SPEC = [
  { k: "SIZE", v: "FREE 250–280" },
  { k: "LENGTH", v: "28cm 드레스" },
  { k: "ORIGIN", v: "Made in Korea" },
  { k: "SET", v: "3 pairs" },
];

export default function SockDetail() {
  return (
    <>
      {/* 3 컬러 */}
      <section id="product" className="section" style={{ background: "var(--paper)" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "clamp(48px,6vw,80px)" }}>
            <span className="eyebrow">The Socks</span>
            <h2 className="serif" style={{ fontSize: "clamp(30px,4.4vw,52px)", fontWeight: 500, color: "var(--navy)", margin: "10px 0 0" }}>
              Three Colors
            </h2>
          </div>
        </Reveal>

        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: "clamp(48px,7vw,110px)" }}>
          {COLORS.map((c, i) => (
            <Reveal key={c.label} delay={0.05}>
              <div className={`sock-row grid-2${i % 2 === 1 ? " rev" : ""}`} style={{ gap: "clamp(28px,5vw,72px)", alignItems: "center" }}>
                <div className="sock-img" style={{ position: "relative", aspectRatio: "4/5", background: "#ffffff", border: "1px solid var(--line)", borderRadius: 2, overflow: "hidden" }}>
                  <Image src={c.img} alt={c.label} fill sizes="(max-width: 900px) 90vw, 45vw" style={{ objectFit: "cover" }} />
                </div>

                <div>
                  <span className="serif" style={{ fontSize: 13, letterSpacing: "0.24em", color: "var(--gold)" }}>{c.no}</span>
                  <h3 className="serif" style={{ fontSize: "clamp(26px,3.4vw,40px)", fontWeight: 500, color: "var(--navy)", margin: "8px 0 12px" }}>
                    {c.label}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)", marginBottom: 20 }}>{c.note}</p>

                  {/* 특징 3줄 — 양말마다 동일 표기 */}
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    {FEATS.map(([t, d]) => (
                      <li key={t} style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink)" }}>
                        <b style={{ color: "var(--navy)", fontWeight: 600 }}>{t}</b>
                        <span style={{ color: "var(--ink-soft)" }}> — {d}</span>
                      </li>
                    ))}
                  </ul>

                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ width: 15, height: 15, borderRadius: 3, background: c.dot, border: "1px solid var(--line)" }} />
                    <span style={{ fontSize: 11, letterSpacing: "0.06em", color: "var(--ink-soft)" }}>Pantone {c.pantone}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 공통 스펙 + 구매 */}
      <section className="section" style={{ background: "var(--paper-2)", paddingTop: "clamp(48px,6vw,90px)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(28px,6vw,72px)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "26px 0" }}>
            {SPEC.map((s) => (
              <div key={s.k} style={{ minWidth: 120 }}>
                <div style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "var(--gold)", marginBottom: 6 }}>{s.k}</div>
                <div style={{ fontSize: 14, color: "var(--ink)" }}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 30 }}>
            <a href={SHOP.socks} {...EXT} className="btn btn-gold">Shop</a>
            <a href="/viewer" className="btn btn-ghost">3D 보기</a>
          </div>
        </div>
      </section>

      <style>{`
        @media (min-width: 901px) {
          .sock-row.rev .sock-img { order: 2; }
        }
      `}</style>
    </>
  );
}
