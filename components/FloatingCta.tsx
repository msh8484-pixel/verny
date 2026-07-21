"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { SHOP, EXT } from "@/data/shop";

export default function FloatingCta() {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 200, damping: 12 });
  const y = useSpring(my, { stiffness: 200, damping: 12 });

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function onMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
    if (ref.current) ref.current.style.background = "var(--navy)";
  }

  return (
    <motion.a
      ref={ref}
      href={SHOP.store}
      {...EXT}
      aria-label="구매하기"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      style={{
        position: "fixed",
        right: "clamp(16px, 3vw, 34px)",
        bottom: "clamp(16px, 3vw, 34px)",
        zIndex: 90,
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        padding: "14px 22px 14px 18px",
        background: "var(--navy)",
        color: "#fff",
        borderRadius: 999,
        boxShadow: "0 12px 34px rgba(20,33,61,0.30)",
        fontSize: 13.5,
        letterSpacing: "0.04em",
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
        x,
        y,
        transition: "opacity .4s, background .3s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gold)")}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
      </svg>
      구매하기
    </motion.a>
  );
}
