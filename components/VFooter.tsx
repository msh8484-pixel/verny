const NAVER_URL = "#"; // TODO: 네이버 스마트스토어 URL

export default function VFooter() {
  return (
    <footer
      style={{
        backgroundColor: "#060e1e",
        borderTop: "1px solid rgba(201,168,76,0.1)",
        padding: "48px 20px 28px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap", gap: 24 }}>
          <div>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 600, color: "#C9A84C", letterSpacing: "0.18em", marginBottom: 6 }}>
              VERNY
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", fontStyle: "italic", fontFamily: "var(--font-serif)" }}>
              Trust Begins at the Detail
            </p>
          </div>

          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 12 }}>구매</p>
              <a href={NAVER_URL} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", display: "block" }}
                onMouseOver={(e) => { e.currentTarget.style.color = "#C9A84C"; }}
                onMouseOut={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
              >
                네이버 스마트스토어
              </a>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.15em", marginBottom: 12 }}>SNS</p>
              <a href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", display: "block" }}
                onMouseOver={(e) => { e.currentTarget.style.color = "#C9A84C"; }}
                onMouseOut={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.18)" }}>© 2025 VERNY. All rights reserved.</p>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="#" style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", textDecoration: "none" }}>이용약관</a>
            <a href="#" style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", textDecoration: "none" }}>개인정보처리방침</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
