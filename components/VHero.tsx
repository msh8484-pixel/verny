"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const NAVER_URL = "#"; // TODO: 네이버 스마트스토어 URL

export default function VHero() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(lineRef.current, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power3.out" })
      .fromTo(titleRef.current, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.5")
      .fromTo(subRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.4")
      .fromTo(ctaRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")
      .fromTo(badgesRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.2")
      .fromTo(imgRef.current, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 1, ease: "power2.out" }, "<-0.8");
  }, []);

  return (
    <section
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a1528",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 배경 이미지 */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #0a1528 45%, rgba(10,21,40,0.75) 70%, rgba(10,21,40,0.4) 100%)", zIndex: 1 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/box-flat.webp"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        style={{ position: "absolute", right: 0, top: 0, width: "55%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.5 }}
      />

      {/* 콘텐츠 */}
      <div
        className="hero-grid section-pad"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          padding: "0 40px",
          paddingTop: 80,
          paddingBottom: 80,
          gap: 48,
          alignItems: "center",
        }}
      >
        {/* 텍스트 */}
        <div>
          <div
            ref={lineRef}
            style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, transformOrigin: "left center" }}
          >
            <div style={{ width: 36, height: 1, backgroundColor: "#C9A84C", flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.25em", whiteSpace: "nowrap" }}>
              PREMIUM DRESS SOCKS
            </span>
          </div>

          <h1
            ref={titleRef}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(40px, 5vw, 80px)",
              fontWeight: 600,
              color: "#ffffff",
              lineHeight: 1.1,
              marginBottom: 24,
              opacity: 0,
            }}
          >
            Trust<br />
            Begins<br />
            <em style={{ color: "#C9A84C", fontStyle: "italic" }}>at the Detail</em>
          </h1>

          <p
            ref={subRef}
            style={{
              fontSize: "clamp(13px, 2vw, 15px)",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.9,
              maxWidth: 400,
              marginBottom: 40,
              opacity: 0,
            }}
          >
            면 70%, 나일론 25%, 폴리우레탄 5%.<br />
            립조직 8:2, 라이크라 커프밴드 6cm, 28cm.<br />
            단 하나의 디테일도 타협하지 않았습니다.
          </p>

          <div
            ref={ctaRef}
            className="cta-btns"
            style={{ display: "flex", alignItems: "center", gap: 14, opacity: 0, flexWrap: "wrap" }}
          >
            <a
              href={NAVER_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: "#C9A84C",
                color: "#0a1528",
                padding: "15px 36px",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textDecoration: "none",
                borderRadius: 2,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#E2C97E"; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#C9A84C"; }}
            >
              네이버쇼핑에서 구매하기 →
            </a>
            <button
              onClick={() => document.getElementById("product")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.6)",
                padding: "15px 26px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                borderRadius: 2,
                transition: "all 0.2s",
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; e.currentTarget.style.color = "#fff"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
            >
              제품 보기
            </button>
          </div>

          <div
            ref={badgesRef}
            style={{ display: "flex", gap: 20, marginTop: 44, opacity: 0, flexWrap: "wrap" }}
          >
            {["MADE IN KOREA", "면 70% · 나일론 25%", "250~280mm"].map((b) => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 3, height: 3, backgroundColor: "#C9A84C", borderRadius: "50%", flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 600 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 로고 행택 — 모바일에서 숨김 */}
        <div
          ref={imgRef}
          className="hide-mobile"
          style={{ opacity: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-hangtag.webp"
            alt="VERNY 로고 행택"
            loading="lazy"
            decoding="async"
            style={{ width: 260, height: 260, objectFit: "cover", objectPosition: "center 15%", borderRadius: "50%", border: "1px solid rgba(201,168,76,0.3)", filter: "drop-shadow(0 8px 32px rgba(201,168,76,0.15))" }}
          />
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.18em", textAlign: "center", fontStyle: "italic", fontFamily: "var(--font-serif)" }}>
            Trust Begins at the Detail
          </p>
        </div>
      </div>

      {/* 스크롤 인디케이터 */}
      <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 2 }}>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em" }}>SCROLL</span>
        <div style={{ width: 1, height: 36, background: "linear-gradient(to bottom, rgba(201,168,76,0.5), transparent)", animation: "sp 2s ease-in-out infinite" }} />
        <style>{`@keyframes sp { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
      </div>
    </section>
  );
}
