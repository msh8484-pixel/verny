"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipValueType } from "recharts";
import type { OrdersData } from "@/lib/dash/aggregate-orders";
import type { OrderStatus, StoredOrder } from "@/lib/orders";
import DashTabs from "../DashTabs";

// 팔레트(다크) — Dashboard.tsx와 동일 (파일 간 공유 없이 복제, 기존 관례)
const BG = "#0b0f1a";
const CARD = "#131a2b";
const BORDER = "#253052";
const TEXT = "#e6e9f0";
const MUTED = "#7d8bb0";
const ACCENT = "#3b82f6";
const WARNING = "#e5484d";

const card: React.CSSProperties = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20 };

const STATUS_LABEL: Record<OrderStatus, string> = { new: "신규", paid: "입금확인", shipped: "발송완료" };
const STATUS_COLOR: Record<OrderStatus, string> = { new: WARNING, paid: ACCENT, shipped: "#22c55e" };
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = { new: "paid", paid: "shipped" };
const PREV_STATUS: Partial<Record<OrderStatus, OrderStatus>> = { paid: "new", shipped: "paid" };
// 다음 단계 버튼 문구 — 조사(으로/로)가 명사 받침에 따라 갈리므로 고정 문자열로 관리.
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = { new: "입금확인으로", paid: "발송완료로" };

type Filter = "all" | OrderStatus;
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "new", label: "신규" },
  { key: "paid", label: "입금확인" },
  { key: "shipped", label: "발송완료" },
];

function won(v: number): string {
  return `₩${v.toLocaleString("ko-KR")}`;
}

function fmtTime(ts: string): string {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(ts));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("month")}.${get("day")} ${get("hour")}:${get("minute")}`;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const color = STATUS_COLOR[status];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color,
        background: `${color}22`,
        border: `1px solid ${color}55`,
        whiteSpace: "nowrap",
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function OrdersView({ data, orders }: { data: OrdersData; orders: StoredOrder[] }) {
  const [rows, setRows] = useState(orders);
  const [busy, setBusy] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  async function changeStatus(id: number, status: OrderStatus) {
    setBusy(id);
    const res = await fetch("/api/dash/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch(() => null);
    if (res?.ok) setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    else alert("상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    setBusy(null);
  }

  const counts: Record<Filter, number> = {
    all: rows.length,
    new: rows.filter((r) => r.status === "new").length,
    paid: rows.filter((r) => r.status === "paid").length,
    shipped: rows.filter((r) => r.status === "shipped").length,
  };
  const filteredRows = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  const summary = [
    { label: "오늘 주문", value: `${data.today.count.toLocaleString("ko-KR")}건` },
    { label: "오늘 매출", value: won(data.today.sales) },
    { label: "30일 매출", value: won(data.period.sales) },
    {
      label: "미처리",
      value: `${counts.new.toLocaleString("ko-KR")}건`,
      warn: counts.new > 0,
    },
  ];

  return (
    <main style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "system-ui, sans-serif", padding: "24px 16px 60px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 16 }}>
        {/* 헤더 */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.1em" }}>VERNY INSIGHT</div>
          <DashTabs active="orders" />
        </header>

        {/* 요약 카드 4개 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
          {summary.map((s) => (
            <div key={s.label} style={card}>
              <div style={{ fontSize: 13, color: MUTED, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: s.warn ? WARNING : TEXT }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* 매출 추이 */}
        <section style={card}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>매출 추이 (30일)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.dailySales} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" interval={4} tick={{ fill: MUTED, fontSize: 11 }} axisLine={{ stroke: BORDER }} tickLine={false} />
              <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: CARD, border: `1px solid ${BORDER}` }}
                labelStyle={{ color: TEXT }}
                itemStyle={{ color: TEXT }}
                formatter={(v: TooltipValueType | undefined) => [won(Number(Array.isArray(v) ? v[0] : v ?? 0)), "매출"]}
              />
              <Bar dataKey="sales" fill={ACCENT} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* 주문 목록 */}
        <section style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>주문 내역</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FILTERS.map((f) => {
                const active = f.key === filter;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      cursor: "pointer",
                      background: active ? ACCENT : "transparent",
                      color: active ? "#fff" : MUTED,
                      border: `1px solid ${active ? ACCENT : BORDER}`,
                    }}
                  >
                    {f.label} {counts[f.key]}
                  </button>
                );
              })}
            </div>
          </div>

          {rows.length === 0 ? (
            <div style={{ fontSize: 13, color: MUTED, padding: "24px 0", textAlign: "center" }}>아직 주문이 없습니다</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 720, borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ color: MUTED, textAlign: "left" }}>
                    <th style={{ padding: "8px 8px", fontWeight: 500, borderBottom: `1px solid ${BORDER}` }}>시각</th>
                    <th style={{ padding: "8px 8px", fontWeight: 500, borderBottom: `1px solid ${BORDER}` }}>주문번호</th>
                    <th style={{ padding: "8px 8px", fontWeight: 500, borderBottom: `1px solid ${BORDER}` }}>주문자</th>
                    <th style={{ padding: "8px 8px", fontWeight: 500, borderBottom: `1px solid ${BORDER}` }}>품목</th>
                    <th style={{ padding: "8px 8px", fontWeight: 500, borderBottom: `1px solid ${BORDER}`, textAlign: "right" }}>수량</th>
                    <th style={{ padding: "8px 8px", fontWeight: 500, borderBottom: `1px solid ${BORDER}`, textAlign: "right" }}>금액</th>
                    <th style={{ padding: "8px 8px", fontWeight: 500, borderBottom: `1px solid ${BORDER}` }}>상태</th>
                    <th style={{ padding: "8px 8px", fontWeight: 500, borderBottom: `1px solid ${BORDER}` }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: "24px 8px", color: MUTED, textAlign: "center" }}>
                        해당 상태의 주문이 없습니다
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((o) => {
                      const rowBusy = busy === o.id;
                      const next = NEXT_STATUS[o.status];
                      const prev = PREV_STATUS[o.status];
                      return (
                        <tr key={o.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                          <td style={{ padding: "10px 8px", color: MUTED, whiteSpace: "nowrap" }}>{fmtTime(o.ts)}</td>
                          <td style={{ padding: "10px 8px", whiteSpace: "nowrap" }}>{o.ord_no}</td>
                          <td style={{ padding: "10px 8px" }}>
                            <div>{o.orderer_name}</div>
                            <div style={{ fontSize: 11, color: MUTED }}>{o.orderer_phone}</div>
                          </td>
                          <td style={{ padding: "10px 8px", maxWidth: 220 }}>{o.items || "-"}</td>
                          <td style={{ padding: "10px 8px", textAlign: "right" }}>{o.qty ?? "-"}</td>
                          <td style={{ padding: "10px 8px", textAlign: "right", whiteSpace: "nowrap" }}>{o.total != null ? won(o.total) : "-"}</td>
                          <td style={{ padding: "10px 8px" }}>
                            <StatusBadge status={o.status} />
                          </td>
                          <td style={{ padding: "10px 8px" }}>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                              {next && (
                                <button
                                  onClick={() => changeStatus(o.id, next)}
                                  disabled={rowBusy}
                                  style={{
                                    padding: "5px 10px",
                                    borderRadius: 6,
                                    fontSize: 12,
                                    cursor: rowBusy ? "not-allowed" : "pointer",
                                    background: ACCENT,
                                    color: "#fff",
                                    border: 0,
                                    opacity: rowBusy ? 0.6 : 1,
                                  }}
                                >
                                  {NEXT_LABEL[o.status]}
                                </button>
                              )}
                              {prev && (
                                <button
                                  onClick={() => changeStatus(o.id, prev)}
                                  disabled={rowBusy}
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: 6,
                                    fontSize: 11,
                                    cursor: rowBusy ? "not-allowed" : "pointer",
                                    background: "transparent",
                                    color: MUTED,
                                    border: `1px solid ${BORDER}`,
                                    opacity: rowBusy ? 0.6 : 1,
                                  }}
                                >
                                  이전 단계로 되돌리기
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
