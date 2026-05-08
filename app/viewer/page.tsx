"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";

const VSockViewer = dynamic(() => import("@/components/VSockViewer"), { ssr: false });

const COLORS = [
  { id: "navy",     label: "다크네이비", hex: "#1B2D4F", img: "/sock-navy.png" },
  { id: "black",    label: "블랙",       hex: "#1a1a1a", img: "/sock-black.png" },
  { id: "charcoal", label: "차콜",       hex: "#5a5a5a", img: "/sock-charcoal.png" },
];

export default function ViewerPage() {
  const [active, setActive] = useState(0);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#060e1e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      {/* 상단 */}
      <p style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#C9A84C", letterSpacing: "0.2em", marginBottom: 8 }}>VERNY</p>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", marginBottom: 40 }}>3D VIEWER — 드래그로 돌려보세요</p>

      {/* 3D 캔버스 */}
      <div style={{ width: "100%", maxWidth: 420, background: "radial-gradient(ellipse at 50% 40%, #1a2e50 0%, #060e1e 100%)", borderRadius: 12, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.15)" }}>
        <Suspense fallback={
          <div style={{ width: "100%", aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 32, height: 32, border: "2px solid rgba(201,168,76,0.3)", borderTop: "2px solid #C9A84C", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        }>
          <VSockViewer imageSrc={COLORS[active].img} />
        </Suspense>
      </div>

      {/* 컬러 선택 */}
      <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
        {COLORS.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setActive(i)}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
              border: i === active ? "1px solid #C9A84C" : "1px solid rgba(255,255,255,0.12)",
              borderRadius: 2, background: i === active ? "rgba(201,168,76,0.1)" : "transparent",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: c.hex, border: "1px solid rgba(255,255,255,0.3)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: i === active ? "#C9A84C" : "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{c.label}</span>
          </button>
        ))}
      </div>

      {/* 돌아가기 */}
      <a href="/" style={{ marginTop: 40, fontSize: 11, color: "rgba(255,255,255,0.25)", textDecoration: "none", letterSpacing: "0.1em" }}>
        ← 홈으로
      </a>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
