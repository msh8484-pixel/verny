"use client";

import { useState } from "react";
import Image from "next/image";
import { type Sock } from "@/data/lookbook";
import { SHOP, EXT } from "@/data/shop";
import Reveal from "./Reveal";

const COLORS: { key: Sock; label: string; dot: string; img: string; pantone: string }[] = [
  { key: "navy", label: "Deep Navy", dot: "#22304f", img: "/sock-navy.webp", pantone: "Cool Gray 11C" },
  { key: "charcoal", label: "Charcoal", dot: "#484b50", img: "/sock-charcoal.webp", pantone: "Cool Gray 11C" },
  { key: "black", label: "Black", dot: "#1c1c1e", img: "/sock-black.webp", pantone: "2336C" },
];

const SPECS: { label: string; value: string }[] = [
  { label: "조직", value: "립 8:2 — 탄성·형태 유지 황금비율" },
  { label: "소재", value: "면 80% · 폴리에스터 14% · 라이크라 3% · 나일론 3%" },
  { label: "커프밴드", value: "라이크라 6cm — 흘러내림 없음" },
  { label: "길이", value: "28cm — 드레스 최적 길이" },
  { label: "사이즈", value: "FREE 250–280mm (워싱 포함)" },
  { label: "컬러", value: "딥네이비 · 차콜 · 블랙" },
  { label: "제조국", value: "Made in Korea" },
  { label: "패키징", value: "네이비 박스 · 골드 포일 로고" },
];

export default function SockDetail() {
  const [color, setColor] = useState<Sock>("navy");
  const active = COLORS.find((c) => c.key === color)!;

  return (
    <>
      {/* 제품 · 스펙 */}
      <section id="product" className="section" style={{ background: "var(--paper)" }}>
        <div className="grid-2" style={{ gap: "clamp(32px,5vw,90px)", alignItems: "center", maxWidth: 1120, margin: "0 auto" }}>
          <Reveal>
            <div style={{ position: "relative", aspectRatio: "4/5", background: "var(--paper-2)", border: "1px solid var(--line)", borderRadius: 2, overflow: "hidden" }}>
              <Image
                key={active.img}
                src={active.img}
                alt={active.label}
                fill
                sizes="(max-width: 900px) 90vw, 45vw"
                style={{ objectFit: "cover", animation: "fade .5s ease" }}
              />
              <div style={{ position: "absolute", left: 14, bottom: 14, display: "flex", alignItems: "center", gap: 9, padding: "8px 12px", background: "rgba(255,255,255,0.86)", borderRadius: 2, backdropFilter: "blur(6px)" }}>
                <span style={{ width: 18, height: 18, borderRadius: 3, background: active.dot, border: "1px solid var(--line)" }} />
                <span style={{ fontSize: 10.5, letterSpacing: "0.06em", color: "var(--navy)" }}>커프밴드 Pantone {active.pantone}</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div>
              <span className="eyebrow">The Socks</span>
              <h2 className="serif" style={{ fontSize: "clamp(30px,4.4vw,52px)", fontWeight: 500, color: "var(--navy)", margin: "10px 0 8px" }}>
                {active.label}
              </h2>
              <p style={{ fontSize: 13.5, color: "var(--ink-soft)", letterSpacing: "0.02em", marginBottom: 26 }}>
                디테일 하나까지 이유가 있는, 신사의 정장 양말.
              </p>

              {/* 컬러 선택 */}
              <div style={{ display: "flex", gap: 8, marginBottom: 30 }}>
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

              {/* 스펙 표 */}
              <div style={{ borderTop: "1px solid var(--line)", marginBottom: 30 }}>
                {SPECS.map((s) => (
                  <div key={s.label} style={{ display: "flex", gap: 16, padding: "11px 0", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ width: 68, flexShrink: 0, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: "var(--gold)" }}>{s.label}</span>
                    <span style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink)" }}>{s.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <a href={SHOP.socks} {...EXT} className="btn btn-gold">Shop</a>
                <a href={`/viewer?color=${active.key}`} className="btn btn-ghost">3D 보기</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 구조 디테일 — 큰 스펙 컷 */}
      <section className="section" style={{ background: "var(--paper-2)", paddingTop: 0 }}>
        <Reveal>
          <figure style={{ maxWidth: 1120, margin: "0 auto" }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 2, overflow: "hidden", border: "1px solid var(--line)" }}>
              <Image
                src="/sock-spec.webp"
                alt="VERNY 양말 구조 — 립 8:2 조직과 6cm 커프밴드"
                fill
                sizes="(max-width: 1120px) 92vw, 1120px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <figcaption style={{ marginTop: 18, display: "flex", gap: "clamp(20px,4vw,54px)", flexWrap: "wrap", fontSize: 12.5, color: "var(--ink-soft)", letterSpacing: "0.02em" }}>
              <span><b style={{ color: "var(--navy)", fontWeight: 600 }}>립 8:2 조직</b> — 종일 흘러내리지 않는 밀착</span>
              <span><b style={{ color: "var(--navy)", fontWeight: 600 }}>6cm 커프밴드</b> — 혈류 방해 없는 적정 압박</span>
              <span><b style={{ color: "var(--navy)", fontWeight: 600 }}>면 80%</b> — 하루 종일 뽀송한 감촉</span>
            </figcaption>
          </figure>
        </Reveal>
      </section>

      <style>{`@keyframes fade { from { opacity: .3 } to { opacity: 1 } }`}</style>
    </>
  );
}
