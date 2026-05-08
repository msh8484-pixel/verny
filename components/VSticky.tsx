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
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99,
        transform: show ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundColor: "#0a1528",
        borderTop: "1px solid rgba(201,168,76,0.22)",
        padding: "12px 20px",
      }}
    >
      <div
        className="sticky-inner"
        style={{
          maxWidth: 1200, margin: "0 auto",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 600, color: "#C9A84C", letterSpacing: "0.12em", flexShrink: 0 }}>VERNY</span>
          <span className="hide-mobile" style={{ width: 1, height: 14, backgroundColor: "rgba(201,168,76,0.3)", display: "inline-block", flexShrink: 0 }} />
          <span className="hide-mobile" style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            프리미엄 드레스 양말
          </span>
        </div>
        <a
          href={NAVER_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            backgroundColor: "#C9A84C", color: "#0a1528",
            padding: "10px 24px", fontSize: 13, fontWeight: 800,
            letterSpacing: "0.06em", textDecoration: "none",
            borderRadius: 2, transition: "background 0.2s", whiteSpace: "nowrap", flexShrink: 0,
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#E2C97E"; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#C9A84C"; }}
        >
          네이버쇼핑 구매 →
        </a>
      </div>
    </div>
  );
}
