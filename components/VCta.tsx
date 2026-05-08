"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const NAVER_URL = "#"; // TODO: 네이버 스마트스토어 URL

export default function VCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(innerRef.current, { opacity: 0, y: 36 }, {
        opacity: 1, y: 0, duration: 0.9,
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pad"
      style={{ backgroundColor: "#F9F6EF", padding: "80px 40px" }}
    >
      <div ref={innerRef} style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", opacity: 0 }}>
        {/* 장식 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 32 }}>
          <div style={{ height: 1, width: 48, backgroundColor: "#C9A84C", opacity: 0.5 }} />
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "#C9A84C", letterSpacing: "0.15em" }}>VERNY</span>
          <div style={{ height: 1, width: 48, backgroundColor: "#C9A84C", opacity: 0.5 }} />
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.3em", marginBottom: 16 }}>PURCHASE</p>

        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 500, color: "#0a1528", lineHeight: 1.2, marginBottom: 18 }}>
          지금 VERNY를<br />만나보세요
        </h2>

        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.85, marginBottom: 40 }}>
          드레스의 완성은 발끝에서 결정됩니다.<br />
          VERNY 드레스 양말로 마지막 디테일을 완성하세요.
        </p>

        <a
          href={NAVER_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            backgroundColor: "#0a1528", color: "#C9A84C",
            padding: "18px 48px", fontSize: 14, fontWeight: 800,
            letterSpacing: "0.08em", textDecoration: "none", borderRadius: 2,
            transition: "all 0.25s", marginBottom: 12, width: "100%", maxWidth: 380,
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#C9A84C"; e.currentTarget.style.color = "#0a1528"; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#0a1528"; e.currentTarget.style.color = "#C9A84C"; }}
        >
          네이버쇼핑에서 구매하기 →
        </a>

        <p style={{ fontSize: 11, color: "rgba(0,0,0,0.28)", marginBottom: 40 }}>
          * 클릭 시 네이버 스마트스토어로 이동합니다
        </p>

        {/* 신뢰 배지 */}
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          {["국내 생산", "프리미엄 패키징", "네이버페이 결제", "교환·반품 안내"].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 12, color: "#C9A84C", fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 12, color: "#888" }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
