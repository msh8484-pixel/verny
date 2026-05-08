"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const NAVER_URL = "#"; // TODO: 네이버 스마트스토어 URL

const TRUST_ITEMS = [
  { icon: "✓", label: "국내 생산" },
  { icon: "✓", label: "프리미엄 패키징 포함" },
  { icon: "✓", label: "네이버페이 안전결제" },
  { icon: "✓", label: "교환·반품 안내" },
];

export default function VCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(innerRef.current, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.9,
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        backgroundColor: "#F9F6EF",
        padding: "120px 40px",
        overflow: "hidden",
      }}
    >
      <div
        ref={innerRef}
        style={{
          maxWidth: 680,
          margin: "0 auto",
          textAlign: "center",
          opacity: 0,
        }}
      >
        {/* 상단 장식 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            marginBottom: 40,
          }}
        >
          <div style={{ height: 1, width: 60, backgroundColor: "#C9A84C", opacity: 0.5 }} />
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              color: "#C9A84C",
              letterSpacing: "0.15em",
            }}
          >
            VERNY
          </span>
          <div style={{ height: 1, width: 60, backgroundColor: "#C9A84C", opacity: 0.5 }} />
        </div>

        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#C9A84C",
            letterSpacing: "0.3em",
            marginBottom: 20,
            textTransform: "uppercase",
          }}
        >
          Purchase
        </p>

        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 500,
            color: "#0a1528",
            lineHeight: 1.2,
            marginBottom: 20,
          }}
        >
          지금 VERNY를<br />만나보세요
        </h2>

        <p style={{ fontSize: 15, color: "#666", lineHeight: 1.8, marginBottom: 48 }}>
          드레스의 완성은 발끝에서 결정됩니다.<br />
          VERNY 드레스 양말로 마지막 디테일을 완성하세요.
        </p>

        {/* 메인 CTA */}
        <a
          href={NAVER_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: "#0a1528",
            color: "#C9A84C",
            padding: "20px 52px",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textDecoration: "none",
            borderRadius: 2,
            transition: "all 0.25s",
            marginBottom: 16,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#C9A84C";
            e.currentTarget.style.color = "#0a1528";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#0a1528";
            e.currentTarget.style.color = "#C9A84C";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor"/>
          </svg>
          네이버쇼핑에서 구매하기
        </a>
        <p style={{ fontSize: 11, color: "rgba(0,0,0,0.3)", marginBottom: 52 }}>
          * 클릭 시 네이버 스마트스토어로 이동합니다
        </p>

        {/* 신뢰 아이콘 */}
        <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {TRUST_ITEMS.map((t) => (
            <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#C9A84C", fontWeight: 700 }}>{t.icon}</span>
              <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
