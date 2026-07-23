"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const COLORS = [
  { id: "navy", label: "다크네이비", ko: "목면 M9375", pantone: "PANTONE cool gray 11C", hex: "#1B2D4F" },
  { id: "black", label: "블랙", ko: "목면 M6499", pantone: "PANTONE 2336C", hex: "#1a1a1a" },
  { id: "charcoal", label: "차콜", ko: "목면 M9612", pantone: "PANTONE cool gray 11C", hex: "#5a5a5a" },
];

export default function VProduct() {
  const [activeColor, setActiveColor] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const sockImgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(sockImgRef.current,
        { rotateY: 20, scale: 0.94, opacity: 0 },
        { rotateY: 0, scale: 1, opacity: 1, duration: 1.2, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true } }
      );
      gsap.fromTo(textRef.current, { opacity: 0, x: 40 }, {
        opacity: 1, x: 0, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
      });
      gsap.to(floatRef.current, { y: -14, duration: 2.5, ease: "sine.inOut", repeat: -1, yoyo: true });
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
      style={{ backgroundColor: "#0f1e3a", padding: "80px 40px", overflow: "hidden", perspective: "1200px" }}
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
          style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 60, alignItems: "center" }}
        >
          {/* 3D 이미지 */}
          <div ref={sockImgRef} style={{ opacity: 0, transformStyle: "preserve-3d", perspective: "1000px" }}>
            {/* 컬러 스와치 + 3D 보기 버튼 */}
            <div
              className="color-btns"
              style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}
            >
              {COLORS.map((col, i) => (
                <button
                  key={col.id}
                  onClick={() => setActiveColor(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
                    border: i === activeColor ? "1px solid #C9A84C" : "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 2, background: i === activeColor ? "rgba(201,168,76,0.1)" : "transparent",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <div style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: col.hex, border: "1px solid rgba(255,255,255,0.25)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: i === activeColor ? "#C9A84C" : "rgba(255,255,255,0.45)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                    {col.label}
                  </span>
                </button>
              ))}
              <a
                href={`/viewer?color=${COLORS[activeColor].id}`}
                style={{
                  marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 14px", border: "1px solid rgba(201,168,76,0.4)", borderRadius: 2,
                  textDecoration: "none", background: "transparent", transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.08)"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700, letterSpacing: "0.06em" }}>3D 보기 →</span>
              </a>
            </div>

            {/* 이미지 카드 — 부유 */}
            <div
              ref={floatRef}
              style={{
                transformStyle: "preserve-3d",
                borderRadius: 6,
                overflow: "hidden",
                boxShadow: "0 32px 70px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.12)",
                position: "relative",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/socks-3color.webp"
                alt="VERNY 드레스 양말 3종"
                style={{ width: "100%", display: "block" }}
              />
              {/* 컬럼 클릭 영역 */}
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  onClick={() => setActiveColor(i)}
                  style={{
                    position: "absolute", top: 0, bottom: 0,
                    left: `${i * 33.33}%`, width: "33.34%",
                    backgroundColor: "rgba(0,0,0,0.55)",
                    opacity: activeColor === i ? 0 : 1,
                    transition: "opacity 0.35s ease",
                    cursor: "pointer",
                  }}
                />
              ))}
              {/* 선택된 컬러 골드 하이라이트 테두리 */}
              <div
                style={{
                  position: "absolute", top: 0, bottom: 0,
                  left: `${activeColor * 33.33}%`, width: "33.34%",
                  border: "2px solid rgba(201,168,76,0.7)",
                  boxShadow: "inset 0 0 20px rgba(201,168,76,0.12)",
                  transition: "left 0.35s cubic-bezier(0.4,0,0.2,1)",
                  pointerEvents: "none",
                  borderRadius: 2,
                }}
              />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(to right, transparent, #C9A84C, transparent)", pointerEvents: "none" }} />
            </div>

            {/* 팬톤 표시 */}
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
                { label: "조직", value: "립 8:2 — 탄성·형태 유지 황금비율" },
                { label: "소재", value: "면 80% · 폴리에스터 14% · 라이크라 3% · 나일론 3%" },
                { label: "커프밴드", value: "라이크라 6cm — 흘러내림 없음" },
                { label: "길이", value: "28cm (드레스 최적 길이)" },
                { label: "사이즈", value: "갑종 기준 250~280mm (워싱 포함)" },
                { label: "컬러", value: "다크네이비 · 블랙 · 차콜" },
                { label: "커프", value: `Pantone ${c.pantone.replace("PANTONE ", "")}` },
                { label: "제조국", value: "MADE IN KOREA" },
                { label: "패키징", value: "네이비 박스 · 골드 포일 로고" },
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
    </section>
  );
}
