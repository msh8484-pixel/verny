"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const COLORS = [
  { id: "navy",     label: "다크네이비", hex: "#1B2D4F", img: "/sock-navy-views.webp" },
  { id: "charcoal", label: "차콜",       hex: "#5a5a5a", img: "/sock-charcoal-views.webp" },
  { id: "black",    label: "블랙",       hex: "#1a1a1a", img: "/sock-black-views.webp" },
];

const ANGLES = ["정면", "측면", "발바닥 정면", "발바닥 측면"];

function ViewerContent() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState(() => {
    const colorId = searchParams.get("color");
    const idx = COLORS.findIndex((c) => c.id === colorId);
    return idx >= 0 ? idx : 0;
  });
  const [zoom, setZoom] = useState<number | null>(null);

  const c = COLORS[active];

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#060e1e",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 20px 60px",
    }}>
      {/* 헤더 */}
      <p style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "#C9A84C", letterSpacing: "0.2em", marginBottom: 6 }}>VERNY</p>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", marginBottom: 36 }}>PRODUCT VIEWER — 앵글을 눌러 확대하세요</p>

      {/* 4분할 뷰 */}
      <div style={{
        width: "100%",
        maxWidth: 600,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.15)",
        background: "#0a1528",
        position: "relative",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={c.img}
          alt={`VERNY ${c.label} 드레스 양말 4앵글`}
          style={{ width: "100%", display: "block", transition: "opacity 0.25s" }}
          key={c.id}
        />

        {/* 4분할 클릭 레이어 */}
        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}>
          {ANGLES.map((angle, i) => (
            <button
              key={i}
              onClick={() => setZoom(zoom === i ? null : i)}
              style={{
                background: zoom === i ? "rgba(201,168,76,0.08)" : "transparent",
                border: zoom === i ? "1px solid rgba(201,168,76,0.5)" : "1px solid transparent",
                cursor: "zoom-in",
                transition: "all 0.2s",
              }}
              title={angle}
            />
          ))}
        </div>

        {/* 앵글 라벨 */}
        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", pointerEvents: "none" }}>
          {ANGLES.map((angle, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-end", padding: "0 10px 8px" }}>
              <span style={{ fontSize: 9, color: zoom === i ? "#C9A84C" : "rgba(255,255,255,0.2)", letterSpacing: "0.08em", fontWeight: 600, transition: "color 0.2s" }}>
                {angle}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 줌 모달 */}
      {zoom !== null && (
        <div
          onClick={() => setZoom(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <div style={{ width: "min(92vw, 500px)", borderRadius: 8, overflow: "hidden", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.img}
              alt=""
              style={{
                width: "200%",
                display: "block",
                marginLeft: zoom % 2 === 0 ? "0%" : "-100%",
                marginTop: zoom < 2 ? "0%" : "-100%",
                transform: "scale(1)",
              }}
            />
            <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center" }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>{ANGLES[zoom]} — 탭하면 닫힘</span>
            </div>
          </div>
        </div>
      )}

      {/* 컬러 선택 */}
      <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap", justifyContent: "center" }}>
        {COLORS.map((col, i) => (
          <button
            key={col.id}
            onClick={() => { setActive(i); setZoom(null); }}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
              border: i === active ? "1px solid #C9A84C" : "1px solid rgba(255,255,255,0.12)",
              borderRadius: 2, background: i === active ? "rgba(201,168,76,0.1)" : "transparent",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: col.hex, border: "1px solid rgba(255,255,255,0.3)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: i === active ? "#C9A84C" : "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{col.label}</span>
          </button>
        ))}
      </div>

      {/* 스펙 */}
      <div style={{ marginTop: 28, padding: "16px 20px", border: "1px solid rgba(201,168,76,0.1)", borderRadius: 6, width: "100%", maxWidth: 600 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          {[["소재", "면 80% · 폴리에스터 14% · 라이크라 3% · 나일론 3%"], ["조직", "립 8:2 구조"], ["사이즈", "250~280mm"], ["생산", "MADE IN KOREA"]].map(([k, v]) => (
            <div key={k}>
              <p style={{ fontSize: 9, color: "#C9A84C", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 3 }}>{k}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      <Link href="/" style={{ marginTop: 36, fontSize: 11, color: "rgba(255,255,255,0.25)", textDecoration: "none", letterSpacing: "0.1em" }}>
        ← 홈으로
      </Link>
    </div>
  );
}

export default function ViewerPage() {
  return (
    <Suspense fallback={null}>
      <ViewerContent />
    </Suspense>
  );
}
