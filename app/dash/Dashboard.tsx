"use client";

import type { DashData } from "@/lib/dash/aggregate";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// 팔레트(다크)
const BG = "#0b0f1a";
const CARD = "#131a2b";
const BORDER = "#253052";
const TEXT = "#e6e9f0";
const MUTED = "#7d8bb0";
const ACCENT = "#3b82f6"; // 라인·주요 바
const SECONDARY = "#22c55e"; // 보조 시리즈
const FUNNEL_TO = "#1e3a8a"; // 퍼널 그라데이션 끝

const card: React.CSSProperties = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20 };
const tooltipStyle = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 };

const TABS: { key: string; label: string }[] = [
  { key: "today", label: "오늘" },
  { key: "7d", label: "7일" },
  { key: "30d", label: "30일" },
];

function n(v: number): string {
  return v.toLocaleString("ko-KR");
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 14 }}>{children}</div>;
}

function Empty() {
  return <div style={{ fontSize: 13, color: MUTED, padding: "24px 0", textAlign: "center" }}>아직 데이터가 없습니다</div>;
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: MUTED }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

export default function Dashboard({ data, range }: { data: DashData; range: string }) {
  const totalDevices = data.devices.reduce((s, d) => s + d.count, 0);
  const maxReferrer = data.referrers[0]?.count || 1;

  const stats = [
    { label: "오늘 방문자", value: data.today.visitors },
    { label: "페이지뷰", value: data.today.pageviews },
    { label: "세션", value: data.today.sessions },
    { label: "지금 접속", value: data.today.online, online: true },
  ];

  return (
    <main style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "system-ui, sans-serif", padding: "24px 16px 60px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 16 }}>
        {/* 헤더 */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.1em" }}>VERNY INSIGHT</div>
          <nav style={{ display: "flex", gap: 6 }}>
            {TABS.map((t) => {
              const active = t.key === range;
              return (
                <a
                  key={t.key}
                  href={`/dash?range=${t.key}`}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                    textDecoration: "none",
                    background: active ? ACCENT : "transparent",
                    color: active ? "#fff" : MUTED,
                    border: `1px solid ${active ? ACCENT : BORDER}`,
                  }}
                >
                  {t.label}
                </a>
              );
            })}
          </nav>
        </header>

        {/* ① 스탯 카드 4개 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: MUTED, marginBottom: 8 }}>
                {s.label}
                {s.online && s.value > 0 && <span style={{ width: 8, height: 8, borderRadius: "50%", background: SECONDARY, display: "inline-block" }} />}
              </div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{n(s.value)}</div>
            </div>
          ))}
        </div>

        {/* ② 방문 추이 (30일) */}
        <section style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>방문 추이 (30일)</div>
            <div style={{ display: "flex", gap: 14 }}>
              <LegendDot color={ACCENT} label="방문자" />
              <LegendDot color={SECONDARY} label="페이지뷰" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.daily} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" interval={4} tick={{ fill: MUTED, fontSize: 11 }} axisLine={{ stroke: BORDER }} tickLine={false} />
              <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#131a2b", border: "1px solid #253052" }} labelStyle={{ color: TEXT }} itemStyle={{ color: TEXT }} />
              <Line type="monotone" dataKey="visitors" name="방문자" stroke={ACCENT} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="pageviews" name="페이지뷰" stroke={SECONDARY} strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* ③ 오늘 시간대 (24h) */}
        <section style={card}>
          <SectionTitle>오늘 시간대</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.hourly} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" interval={3} tick={{ fill: MUTED, fontSize: 11 }} axisLine={{ stroke: BORDER }} tickLine={false} />
              <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#131a2b", border: "1px solid #253052" }} labelFormatter={(h) => `${h}시`} labelStyle={{ color: TEXT }} itemStyle={{ color: TEXT }} />
              <Bar dataKey="views" fill={ACCENT} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* ④ 페이지별 분석 */}
        <section style={card}>
          <SectionTitle>페이지별 분석</SectionTitle>
          {data.pages.length === 0 ? (
            <Empty />
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {data.pages.slice(0, 10).map((p) => (
                <div key={p.path} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.path}</div>
                  <div style={{ fontSize: 12, color: MUTED, width: 48, textAlign: "right", flexShrink: 0 }}>{n(p.views)}</div>
                  <div style={{ width: 120, height: 6, background: BORDER, borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
                    <div style={{ width: `${p.avgScroll}%`, height: "100%", background: ACCENT }} />
                  </div>
                  <div style={{ fontSize: 12, color: MUTED, width: 38, textAlign: "right", flexShrink: 0 }}>{p.avgScroll}%</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ⑤ 전환 퍼널 */}
        <section style={card}>
          <SectionTitle>전환 퍼널</SectionTitle>
          <div style={{ display: "grid", gap: 4 }}>
            {data.funnel.map((f, i) => {
              const prevCount = i > 0 ? data.funnel[i - 1].count : null;
              const stepRate = prevCount ? Math.round((f.count / prevCount) * 100) : i > 0 ? 0 : null;
              return (
                <div key={f.label}>
                  {i > 0 && stepRate !== null && <div style={{ fontSize: 11, color: MUTED, padding: "4px 0 4px 2px" }}>↓ {stepRate}%</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 170, flexShrink: 0, fontSize: 13, color: TEXT }}>{f.label}</div>
                    <div style={{ width: 48, flexShrink: 0, fontSize: 12, color: MUTED, textAlign: "right" }}>{n(f.count)}</div>
                    <div style={{ flex: 1, minWidth: 0, height: 18, background: BORDER, borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ width: `${f.rate}%`, height: "100%", borderRadius: 6, background: `linear-gradient(90deg, ${ACCENT}, ${FUNNEL_TO})` }} />
                    </div>
                    <div style={{ width: 40, flexShrink: 0, fontSize: 12, color: MUTED, textAlign: "right" }}>{f.rate}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ⑥ 방문자 여정 */}
        <section style={card}>
          <SectionTitle>방문자 여정</SectionTitle>
          {data.journeys.length === 0 ? (
            <Empty />
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {data.journeys.map((j) => {
                const time = new Date(j.start).toLocaleString("ko-KR", {
                  timeZone: "Asia/Seoul",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const devLabel = j.device === "mobile" ? "MO" : j.device === "desktop" ? "PC" : "-";
                return (
                  <div key={j.sid} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12 }}>
                    <div style={{ width: 92, flexShrink: 0, color: MUTED }}>{time}</div>
                    <div style={{ width: 26, flexShrink: 0, color: MUTED, fontWeight: 600 }}>{devLabel}</div>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
                      {j.steps.length === 0 && <span style={{ color: MUTED }}>-</span>}
                      {j.steps.map((s, idx) => {
                        const isOrder = s.label === "주문 제출";
                        const isStore = s.label === "스토어 클릭";
                        return (
                          <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <span style={{ color: isOrder ? SECONDARY : isStore ? ACCENT : TEXT, fontWeight: isOrder || isStore ? 600 : 400 }}>
                              {s.label}
                              {s.scroll !== null ? `(${s.scroll}%)` : ""}
                            </span>
                            {idx < j.steps.length - 1 && <span style={{ color: MUTED }}>→</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ⑦ 유입 경로 + 디바이스 */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <div style={card}>
            <SectionTitle>유입 경로</SectionTitle>
            {data.referrers.length === 0 ? (
              <Empty />
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {data.referrers.map((r, i) => (
                  <div key={r.source} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 16, flexShrink: 0, fontSize: 12, color: MUTED }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.source}</div>
                    <div style={{ width: 70, flexShrink: 0, height: 6, background: BORDER, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${(r.count / maxReferrer) * 100}%`, height: "100%", background: ACCENT }} />
                    </div>
                    <div style={{ width: 30, flexShrink: 0, fontSize: 12, color: MUTED, textAlign: "right" }}>{n(r.count)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={card}>
            <SectionTitle>디바이스</SectionTitle>
            {totalDevices === 0 ? (
              <Empty />
            ) : (
              <>
                <div style={{ position: "relative", height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.devices} dataKey="count" nameKey="device" innerRadius={50} outerRadius={70} strokeWidth={0}>
                        {data.devices.map((d, i) => (
                          <Cell key={i} fill={d.device === "mobile" ? ACCENT : d.device === "desktop" ? SECONDARY : MUTED} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: TEXT }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{n(totalDevices)}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>총 방문</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 8 }}>
                  {data.devices.map((d) => (
                    <LegendDot key={d.device} color={d.device === "mobile" ? ACCENT : d.device === "desktop" ? SECONDARY : MUTED} label={`${d.device} ${d.count}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
