const NAVER_URL = "#"; // TODO: 네이버 스마트스토어 URL

export default function VFooter() {
  return (
    <footer
      style={{
        backgroundColor: "#060e1e",
        borderTop: "1px solid rgba(201,168,76,0.12)",
        padding: "56px 40px 32px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* 상단 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48, flexWrap: "wrap", gap: 32 }}>
          {/* 브랜드 */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 32,
                fontWeight: 600,
                color: "#C9A84C",
                letterSpacing: "0.18em",
                marginBottom: 8,
              }}
            >
              VERNY
            </p>
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.15em",
                fontStyle: "italic",
                fontFamily: "var(--font-serif)",
              }}
            >
              Trust Begins at the Detail
            </p>
          </div>

          {/* 링크 */}
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 16 }}>구매</p>
              <a
                href={NAVER_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none", display: "block", marginBottom: 8 }}
                onMouseOver={(e) => { e.currentTarget.style.color = "#C9A84C"; }}
                onMouseOut={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
              >
                네이버 스마트스토어
              </a>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 16 }}>SNS</p>
              <a
                href="#"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none", display: "block", marginBottom: 8 }}
                onMouseOver={(e) => { e.currentTarget.style.color = "#C9A84C"; }}
                onMouseOut={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            © 2025 VERNY. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            <a href="#" style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>이용약관</a>
            <a href="#" style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>개인정보처리방침</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
