// 대시보드 상단 [통계]|[주문] 탭 — 서버·클라이언트 양쪽에서 쓰는 단순 링크.
const tab = (active: boolean): React.CSSProperties => ({
  padding: "7px 16px",
  borderRadius: 8,
  fontSize: 13,
  textDecoration: "none",
  color: active ? "#fff" : "#7d8bb0",
  background: active ? "#3b82f6" : "transparent",
  border: `1px solid ${active ? "#3b82f6" : "#253052"}`,
});

export default function DashTabs({ active }: { active: "stats" | "orders" }) {
  return (
    <nav style={{ display: "flex", gap: 8 }}>
      <a href="/dash" style={tab(active === "stats")}>통계</a>
      <a href="/dash/orders" style={tab(active === "orders")}>주문</a>
    </nav>
  );
}
