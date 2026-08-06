import { SHOP, EXT, INSTAGRAM_URL } from "@/data/shop";
import FooterSecret from "@/components/FooterSecret";

export default function SiteFooter() {
  return (
    <footer style={{ background: "var(--paper-2)", color: "var(--ink-soft)", padding: "60px clamp(24px,6vw,96px)", borderTop: "1px solid var(--line)" }}>
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          gap: 40,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="serif" style={{ fontSize: 28, letterSpacing: "0.3em", textIndent: "0.3em", color: "var(--navy)", fontWeight: 500 }}>
            VERNY
          </div>
          <p className="serif" style={{ fontStyle: "italic", color: "var(--gold)", fontSize: 14, marginTop: 8 }}>
            Trust Begins at the Detail
          </p>
        </div>

        <div style={{ display: "flex", gap: 56, flexWrap: "wrap", fontSize: 12.5, letterSpacing: "0.04em" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            <span style={{ color: "var(--gold)", letterSpacing: "0.14em", fontSize: 11 }}>SHOP</span>
            <a href={SHOP.store} {...EXT}>네이버 스마트스토어</a>
            <a href="/order">세금계산서·단체 문의</a>
            <a href={INSTAGRAM_URL} {...EXT}>인스타그램</a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11, lineHeight: 1.7 }}>
            <span style={{ color: "var(--gold)", letterSpacing: "0.14em", fontSize: 11 }}>COMPANY</span>
            <span>㈜베러스 · VERNY</span>
            <span>서울 금천구 가산디지털2로 98, 2동 110호</span>
            <span>Made in Korea</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: "44px auto 0", paddingTop: 22, borderTop: "1px solid var(--line)", fontSize: 11, color: "var(--ink-soft)" }}>
        <FooterSecret>© {new Date().getFullYear()} BETTERUS · VERNY. All rights reserved.</FooterSecret>
      </div>
    </footer>
  );
}
