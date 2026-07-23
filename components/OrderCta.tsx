"use client";

import { PRODUCT } from "@/data/lookbook";
import { SHOP, EXT } from "@/data/shop";
import Reveal from "./Reveal";
import ParallaxImage from "./fx/ParallaxImage";

export default function OrderCta() {
  return (
    <section id="order" className="section" style={{ background: "var(--paper)", borderTop: "1px solid var(--line)" }}>
      <div className="grid-2" style={{ gap: "clamp(40px,6vw,110px)", alignItems: "center", maxWidth: 1120, margin: "0 auto" }}>
        <Reveal delay={0.1}>
          <div style={{ order: 1 }}>
            <span className="eyebrow">Shop</span>
            <h2 className="serif" style={{ fontSize: "clamp(30px,4.4vw,52px)", fontWeight: 500, lineHeight: 1.12, margin: "12px 0 18px", color: "var(--navy)" }}>
              Order
            </h2>
            <div style={{ display: "flex", gap: 26, margin: "24px 0 36px", alignItems: "baseline" }}>
              <div>
                <div className="serif" style={{ fontSize: 36, color: "var(--navy)" }}>26,900<span style={{ fontSize: 15 }}> 원</span></div>
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)", letterSpacing: "0.06em" }}>선물세트 · 3 pairs</div>
              </div>
              <div style={{ width: 1, height: 40, background: "var(--line)" }} />
              <div>
                <div className="serif" style={{ fontSize: 36, color: "var(--navy)" }}>6,900<span style={{ fontSize: 15 }}> 원</span></div>
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)", letterSpacing: "0.06em" }}>낱개 · per pair</div>
              </div>
            </div>

            <div className="cta-row" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href={SHOP.giftSet} {...EXT} className="btn btn-gold">선물세트 구매</a>
              <a href={SHOP.socks} {...EXT} className="btn btn-ghost">낱개 구매</a>
            </div>
            <a href="/order" style={{ display: "inline-block", marginTop: 16, fontSize: 12.5, letterSpacing: "0.08em", color: "var(--ink-soft)", borderBottom: "1px solid var(--line)", paddingBottom: 2 }}>
              세금계산서·단체주문 문의 →
            </a>
          </div>
        </Reveal>

        <Reveal>
          <div style={{ order: 0 }}>
            <ParallaxImage src="/lib/socks/trio.webp" alt={PRODUCT.trio.alt} sizes="(max-width:900px) 90vw, 44vw" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
