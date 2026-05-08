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
      // 3D 스크롤 드리븐 회전 — 스크롤 내릴수록 소켓이 앞으로 나오는 느낌
      gsap.fromTo(sockImgRef.current,
        { rotateY: 25, scale: 0.92, opacity: 0 },
        {
          rotateY: 0, scale: 1, opacity: 1, duration: 1.2, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
        }
      );

      // 텍스트 슬라이드
      gsap.fromTo(textRef.current, { opacity: 0, x: 50 }, {
        opacity: 1, x: 0, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
      });

      // 스크롤 중 부유 효과
      gsap.to(floatRef.current, {
        y: -18,
        duration: 2.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // 스펙 아이템 순차 등장
      gsap.fromTo(".spec-row", { opacity: 0, x: 20 }, {
        opacity: 1, x: 0, duration: 0.4, stagger: 0.07,
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
      style={{
        backgroundColor: "#0f1e3a",
        padding: "120px 40px",
        overflow: "hidden",
        perspective: "1200px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* 섹션 헤더 */}
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.3em", marginBottom: 16 }}>
            THE PRODUCT
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(34px, 4vw, 56px)",
              fontWeight: 500,
              color: "#ffffff",
              lineHeight: 1.2,
            }}
          >
            세 가지 컬러,{" "}
            <em style={{ color: "#C9A84C", fontStyle: "italic" }}>하나의 기준</em>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: 80,
            alignItems: "center",
          }}
          className="grid-2-col"
        >
          {/* 3D 제품 이미지 영역 */}
          <div
            ref={sockImgRef}
            style={{
              opacity: 0,
              transformStyle: "preserve-3d",
              perspective: "1000px",
            }}
          >
            {/* 컬러 셀렉터 */}
            <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
              {COLORS.map((col, i) => (
                <button
                  key={col.id}
                  onClick={() => setActiveColor(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 16px",
                    border: i === activeColor ? "1px solid #C9A84C" : "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 2,
                    background: i === activeColor ? "rgba(201,168,76,0.1)" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: col.hex,
                      border: "1px solid rgba(255,255,255,0.25)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: i === activeColor ? "#C9A84C" : "rgba(255,255,255,0.45)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {col.label}
                  </span>
                </button>
              ))}
            </div>

            {/* 3D 이미지 카드 — 부유 애니메이션 */}
            <div
              ref={floatRef}
              style={{
                transformStyle: "preserve-3d",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.12)",
                position: "relative",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/socks-3color.png"
                alt="VERNY 드레스 양말 3종"
                style={{
                  width: "100%",
                  display: "block",
                  transition: "filter 0.4s ease",
                  filter: activeColor === 0
                    ? "none"
                    : activeColor === 1
                    ? "saturate(0.1) brightness(0.7)"
                    : "saturate(0.3) brightness(0.85) sepia(0.2)",
                }}
              />
              {/* 컬러 오버레이 힌트 */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(ellipse at 50% 30%, ${c.hex}22 0%, transparent 70%)`,
                  mixBlendMode: "overlay",
                  transition: "all 0.4s",
                  pointerEvents: "none",
                }}
              />
              {/* 골드 하이라이트 라인 */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: "linear-gradient(to right, transparent, #C9A84C, transparent)",
                }}
              />
            </div>

            {/* 팬톤 컬러 표시 */}
            <div
              style={{
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: 4,
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  backgroundColor: c.hex,
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.15)",
                  flexShrink: 0,
                }}
              />
              <div>
                <p style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700, letterSpacing: "0.08em" }}>
                  {c.label} — {c.ko}
                </p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                  커프밴드 {c.pantone}
                </p>
              </div>
            </div>
          </div>

          {/* 스펙 */}
          <div ref={textRef} style={{ opacity: 0 }}>
            <p style={{ fontSize: 11, color: "rgba(201,168,76,0.7)", letterSpacing: "0.2em", marginBottom: 20, fontWeight: 700 }}>
              SPECIFICATIONS
            </p>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(26px, 3vw, 42px)",
                fontWeight: 500,
                color: "#ffffff",
                lineHeight: 1.25,
                marginBottom: 32,
              }}
            >
              모든 디테일이<br />
              <em style={{ color: "#C9A84C", fontStyle: "italic" }}>이유 있습니다</em>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { label: "조직 구조", value: "립 8:2 — 탄성·형태 유지 황금비율" },
                { label: "소재 구성", value: "면 70% · 나일론 25% · 폴리우레탄 5%" },
                { label: "커프밴드", value: "라이크라 6cm — 흘러내림 없음" },
                { label: "양말 길이", value: "28cm (드레스 최적 길이)" },
                { label: "사이즈", value: "갑종 기준 250~280mm (워싱 포함)" },
                { label: "컬러", value: "다크네이비 · 블랙 · 차콜" },
                { label: "커프 컬러", value: `Pantone ${c.pantone.replace("PANTONE ", "")}` },
                { label: "제조국", value: "MADE IN KOREA" },
                { label: "패키징", value: "네이비 박스 · 골드 포일 로고" },
              ].map((spec) => (
                <div
                  key={spec.label}
                  className="spec-row"
                  style={{
                    display: "flex",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    padding: "13px 0",
                    opacity: 0,
                  }}
                >
                  <span style={{ width: 120, fontSize: 11, color: "#C9A84C", fontWeight: 700, letterSpacing: "0.05em", flexShrink: 0 }}>
                    {spec.label}
                  </span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
