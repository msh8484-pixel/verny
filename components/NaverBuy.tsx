import { SHOP, EXT } from "@/data/shop";

// 주문 페이지 상단 — 네이버 스마트스토어 즉시 구매 안내
export default function NaverBuy() {
  return (
    <section className="section-narrow" style={{ background: "var(--paper-2)", borderBottom: "1px solid var(--line)" }}>
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          border: "1px solid var(--line)",
          borderRadius: 3,
          background: "var(--paper)",
          padding: "clamp(28px,4vw,44px)",
          display: "flex",
          gap: "clamp(20px,4vw,48px)",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 280px" }}>
          <span className="eyebrow">Quick Order</span>
          <h2 className="serif" style={{ fontSize: "clamp(24px,3.2vw,34px)", fontWeight: 500, color: "var(--navy)", margin: "10px 0 10px" }}>
            네이버 스마트스토어
          </h2>
          <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "var(--ink-soft)" }}>
            세트·낱개 구분 없이 한 페이지에서 바로 구매하실 수 있습니다.<br />
            네이버페이 간편결제와 적립·리뷰 혜택을 그대로 이용하세요.
          </p>
        </div>
        <a href={SHOP.buy} {...EXT} className="btn btn-gold" style={{ flexShrink: 0 }}>
          네이버에서 구매하기
        </a>
      </div>
    </section>
  );
}
