"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { no: "01", label: "Socks", href: "/" },
  { no: "02", label: "Story", href: "/story" },
  { no: "03", label: "Details", href: "/details" },
  { no: "04", label: "Lookbook", href: "/lookbook" },
  { no: "05", label: "Instagram", href: "/instagram" },
  { no: "06", label: "Order", href: "/order" },
];

function Wordmark({ size = 26 }: { size?: number }) {
  return (
    <Link href="/" style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <img src="/brand/monogram-mark.webp" alt="" width={38} height={30} style={{ display: "block" }} />
      <span
        className="serif"
        style={{ fontSize: size, letterSpacing: "0.3em", textIndent: "0.3em", color: "var(--navy)", fontWeight: 500 }}
      >
        VERNY
      </span>
    </Link>
  );
}

export default function SideNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const menu = (onClick?: () => void) => (
    <nav style={{ display: "flex", flexDirection: "column" }}>
      {LINKS.map((l, i) => {
        const on = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 0",
              borderTop: i === 0 ? "1px solid var(--line)" : "none",
              borderBottom: "1px solid var(--line)",
              color: on ? "var(--gold)" : "var(--ink)",
              transition: "color .25s",
            }}
          >
            <span className="serif" style={{ fontSize: 12, color: on ? "var(--gold)" : "var(--ink-soft)", width: 20 }}>{l.no}</span>
            <span style={{ fontSize: 13.5, letterSpacing: "0.14em" }}>{l.label}</span>
            <span style={{ marginLeft: "auto", width: on ? 16 : 0, height: 1, background: "var(--gold)", transition: "width .3s" }} />
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* desktop fixed left nav */}
      <aside
        className="hide-mobile"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "var(--nav-w)",
          height: "100vh",
          borderRight: "1px solid var(--line)",
          background: "var(--paper)",
          padding: "40px 34px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Wordmark />
          <span
            style={{
              fontSize: 9.5,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "var(--ink-soft)",
              textAlign: "center",
              marginTop: 2,
            }}
          >
            Trust Begins at the Detail
          </span>
        </div>

        <div style={{ marginTop: "auto", marginBottom: "auto", paddingTop: 40 }}>{menu()}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 10.5, letterSpacing: "0.12em", color: "var(--ink-soft)" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ color: "var(--navy)", fontWeight: 500 }}>KR</span>
            <span>EN</span>
          </div>
          <Link href="/order" style={{ letterSpacing: "0.14em" }}>CS · 문의</Link>
          <span>㈜베러스 · VERNY</span>
        </div>
      </aside>

      {/* mobile top bar */}
      <header
        className="show-mobile-flex"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 58,
          display: "none",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--line)",
          zIndex: 60,
        }}
      >
        <Link href="/" className="serif" style={{ fontSize: 20, letterSpacing: "0.28em", textIndent: "0.28em", color: "var(--navy)", fontWeight: 500 }}>
          VERNY
        </Link>
        <button
          aria-label="menu"
          onClick={() => setOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, padding: 6 }}
        >
          <span style={{ width: 22, height: 1.5, background: "var(--navy)" }} />
          <span style={{ width: 22, height: 1.5, background: "var(--navy)" }} />
          <span style={{ width: 22, height: 1.5, background: "var(--navy)" }} />
        </button>
      </header>

      {/* mobile drawer */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(20,33,61,0.4)", zIndex: 70 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "76%",
              maxWidth: 320,
              height: "100%",
              background: "var(--paper)",
              padding: "34px 30px",
              display: "flex",
              flexDirection: "column",
              gap: 30,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Wordmark size={22} />
              <button
                aria-label="close"
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", fontSize: 24, color: "var(--navy)", cursor: "pointer", lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <div>{menu(() => setOpen(false))}</div>
            <div style={{ marginTop: "auto", fontSize: 11, letterSpacing: "0.12em", color: "var(--ink-soft)" }}>
              ㈜베러스 · VERNY<br />Trust Begins at the Detail
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .show-mobile-flex { display: flex !important; }
        }
      `}</style>
    </>
  );
}
