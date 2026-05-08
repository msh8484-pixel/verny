"use client";

import { useEffect, useState } from "react";

const NAVER_URL = "#"; // TODO: 네이버 스마트스토어 URL

export default function VNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        transition: "background 0.4s ease, border-color 0.4s ease",
        backgroundColor: scrolled ? "rgba(10,21,40,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(201,168,76,0.18)" : "1px solid transparent",
      }}
    >
      <div
        style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 20px",
          height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        {/* 로고 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 600, color: "#C9A84C", letterSpacing: "0.18em" }}>
            VERNY
          </span>
          <span className="hide-mobile" style={{ width: 1, height: 16, backgroundColor: "rgba(201,168,76,0.35)", display: "inline-block" }} />
          <span className="hide-mobile" style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}>
            Premium Socks
          </span>
        </div>

        {/* 태그라인 — 데스크탑만 */}
        <span
          className="hide-mobile"
          style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontStyle: "italic", fontFamily: "var(--font-serif)" }}
        >
          Trust Begins at the Detail
        </span>

        {/* CTA */}
        <a
          href={NAVER_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 18px",
            border: "1px solid rgba(201,168,76,0.55)",
            borderRadius: 2, fontSize: 12, fontWeight: 700,
            color: "#C9A84C", textDecoration: "none",
            letterSpacing: "0.06em", transition: "all 0.2s", whiteSpace: "nowrap",
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#C9A84C"; e.currentTarget.style.color = "#0a1528"; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#C9A84C"; }}
        >
          구매하기
        </a>
      </div>
    </header>
  );
}
