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
      .fromTo(imgRef.current, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 1, ease: "power2.out" }, "<-1");
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
      {/* 배경 이미지 — 패키징 박스 우측 희미하게 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, #0a1528 45%, rgba(10,21,40,0.7) 70%, rgba(10,21,40,0.3) 100%)",
          zIndex: 1,
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/box-flat.png"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "55%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          opacity: 0.55,
        }}
      />

      {/* 좌측 텍스트 */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          padding: "0 40px",
          paddingTop: 72,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 60,
          alignItems: "center",
        }}
      >
        <div>
          {/* 브랜드 라인 */}
          <div
            ref={lineRef}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 36,
              transformOrigin: "left center",
            }}
          >
            <div style={{ width: 40, height: 1, backgroundColor: "#C9A84C" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.3em" }}>
              PREMIUM DRESS SOCKS
            </span>
          </div>

          <h1
            ref={titleRef}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(44px, 5vw, 80px)",
              fontWeight: 600,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              marginBottom: 28,
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
              fontSize: 15,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.85,
              maxWidth: 420,
              marginBottom: 48,
              opacity: 0,
            }}
          >
            면 70%, 나일론 25%, 폴리우레탄 5%.<br />
            립조직 8:2, 라이크라 커프밴드 6cm, 28cm.<br />
            단 하나의 디테일도 타협하지 않았습니다.
          </p>

          <div
            ref={ctaRef}
            style={{ display: "flex", alignItems: "center", gap: 16, opacity: 0, flexWrap: "wrap" }}
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
                padding: "16px 40px",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.1em",
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
                padding: "16px 28px",
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
            style={{ display: "flex", gap: 20, marginTop: 52, opacity: 0, flexWrap: "wrap" }}
          >
            {["MADE IN KOREA", "면 70% · 나일론 25%", "250~280mm"].map((b) => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 3, height: 3, backgroundColor: "#C9A84C", borderRadius: "50%" }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", fontWeight: 600 }}>
                  {b}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 우측 — 로고 행택 + 박스 이미지 */}
        <div
          ref={imgRef}
          style={{
            opacity: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
          className="hide-mobile"
        >
          <div style={{ position: "relative", width: 180, height: 180 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-hangtag.jpg"
              alt="VERNY 로고 행택"
              style={{
                width: 180,
                height: 180,
                objectFit: "cover",
                borderRadius: "50%",
                border: "1px solid rgba(201,168,76,0.3)",
                filter: "drop-shadow(0 8px 32px rgba(201,168,76,0.15))",
              }}
            />
            {/* 하단 디자인 파일 레이블 가리기 */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "80%",
              height: 28,
              backgroundColor: "#c8c3b8",
              borderRadius: "0 0 90px 90px",
            }} />
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", textAlign: "center" }}>
            Trust Begins at the Detail
          </p>
        </div>
      </div>

      {/* 스크롤 인디케이터 */}
      <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 2 }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em" }}>SCROLL</span>
        <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, rgba(201,168,76,0.5), transparent)", animation: "scrollPulse 2s ease-in-out infinite" }} />
        <style>{`@keyframes scrollPulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }`}</style>
      </div>
    </section>
  );
}
