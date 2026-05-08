"use client";

import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const VSockViewer = lazy(() => import("./VSockViewer"));

const COLORS = [
  { id: "navy",     label: "다크네이비", ko: "목면 M9375",  pantone: "PANTONE cool gray 11C", hex: "#1B2D4F", img: "/sock-navy.png" },
  { id: "black",    label: "블랙",       ko: "목면 M6499",  pantone: "PANTONE 2336C",         hex: "#1a1a1a", img: "/sock-black.png" },
  { id: "charcoal", label: "차콜",       ko: "목면 M9612",  pantone: "PANTONE cool gray 11C", hex: "#5a5a5a", img: "/sock-charcoal.png" },
];

export default function VProduct() {
  const [activeColor, setActiveColor] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(textRef.current, { opacity: 0, x: 40 }, {
        opacity: 1, x: 0, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
      });
      gsap.fromTo(".spec-row", { opacity: 0, x: 16 }, {
        opacity: 1, x: 0, duration: 0.4, stagger: 0.06,
        scrollTrigger: { trigger: textRef.current, start: "top 80%", once: true },
      });
    });
    return () => ctx.revert();
  }, []);

  const c = COLORS[activeColor];

  return (
    <section
      id="product"
      ref={sectionRef}
      className="section-pad"
      style={{ backgroundColor: "#0f1e3a", padding: "80px 40px", overflow: "hidden" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.3em", marginBottom: 14 }}>THE PRODUCT</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(30px, 4vw, 56px)", fontWeight: 500, color: "#ffffff", lineHeight: 1.2 }}>
            세 가지 컬러,{" "}
            <em style={{ color: "#C9A84C", fontStyle: "italic" }}>하나의 기준</em>
          </h2>
        </div>

        <div
          className="grid-2-col"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}
        >
          {/* 3D 뷰어 */}
          <div>
            {/* 컬러 스와치 */}
            <div className="color-btns" style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {COLORS.map((col, i) => (
                <button
                  key={col.id}
                  onClick={() => setActiveColor(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
                    border: i === activeColor ? "1px solid #C9A84C" : "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 2,
                    background: i === activeColor ? "rgba(201,168,76,0.1)" : "transparent",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <div style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: col.hex, border: "1px solid rgba(255,255,255,0.25)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: i === activeColor ? "#C9A84C" : "rgba(255,255,255,0.45)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                    {col.label}
                  </span>
                </button>
              ))}
            </div>

            {/* 3D 캔버스 */}
            <div style={{
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 32px 70px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.12)",
              background: "radial-gradient(ellipse at 50% 40%, #1a2e50 0%, #060e1e 100%)",
            }}>
              <Suspense fallback={
                <div style={{ width: "100%", aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 28, height: 28, border: "2px solid rgba(201,168,76,0.3)", borderTop: "2px solid #C9A84C", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                </div>
              }>
                <VSockViewer imageSrc={c.img} />
              </Suspense>
            </div>

            {/* 팬톤 */}
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ width: 26, height: 26, backgroundColor: c.hex, borderRadius: 3, border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700, letterSpacing: "0.06em" }}>{c.label} — {c.ko}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>커프밴드 {c.pantone}</p>
              </div>
            </div>
          </div>

          {/* 스펙 */}
          <div ref={textRef} style={{ opacity: 0 }}>
            <p style={{ fontSize: 11, color: "rgba(201,168,76,0.7)", letterSpacing: "0.2em", marginBottom: 18, fontWeight: 700 }}>SPECIFICATIONS</p>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 500, color: "#ffffff", lineHeight: 1.25, marginBottom: 28 }}>
              모든 디테일이<br />
              <em style={{ color: "#C9A84C", fontStyle: "italic" }}>이유 있습니다</em>
            </h3>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { label: "조직",    value: "립 8:2 — 탄성·형태 유지 황금비율" },
                { label: "소재",    value: "면 70% · 나일론 25% · 폴리우레탄 5%" },
                { label: "커프밴드", value: "라이크라 6cm — 흘러내림 없음" },
                { label: "길이",    value: "28cm (드레스 최적 길이)" },
                { label: "사이즈",  value: "갑종 기준 250~280mm (워싱 포함)" },
                { label: "컬러",    value: "다크네이비 · 블랙 · 차콜" },
                { label: "커프",    value: `Pantone ${c.pantone.replace("PANTONE ", "")}` },
                { label: "제조국",  value: "MADE IN KOREA" },
                { label: "패키징",  value: "네이비 박스 · 골드 포일 로고" },
              ].map((spec) => (
                <div key={spec.label} className="spec-row" style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "12px 0", opacity: 0 }}>
                  <span className="spec-label" style={{ width: 80, fontSize: 11, color: "#C9A84C", fontWeight: 700, letterSpacing: "0.04em", flexShrink: 0 }}>{spec.label}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
