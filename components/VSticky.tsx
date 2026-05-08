"use client";

import { useEffect, useState } from "react";

const NAVER_URL = "#"; // TODO: 네이버 스마트스토어 URL

export default function VSticky() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99,
        transform: show ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundColor: "#0a1528",
        borderTop: "1px solid rgba(201,168,76,0.25)",
        padding: "14px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              fontWeight: 600,
              color: "#C9A84C",
              letterSpacing: "0.12em",
            }}
          >
            VERNY
          </span>
          <span style={{ width: 1, height: 16, backgroundColor: "rgba(201,168,76,0.3)", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>
            프리미엄 드레스 양말
          </span>
        </div>
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
            padding: "10px 28px",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textDecoration: "none",
            borderRadius: 2,
            transition: "background 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#E2C97E"; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#C9A84C"; }}
        >
          네이버쇼핑에서 구매하기 →
        </a>
      </div>
    </div>
  );
}
