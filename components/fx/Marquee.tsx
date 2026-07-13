"use client";

export default function Marquee({
  text = "VERNY",
  sub = "Trust Begins at the Detail",
  speed = 32,
}: {
  text?: string;
  sub?: string;
  speed?: number;
}) {
  const unit = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 34, paddingRight: 34 }}>
      <span className="serif" style={{ fontSize: "clamp(28px,4vw,56px)", color: "var(--navy)", letterSpacing: "0.14em" }}>{text}</span>
      <span style={{ color: "var(--gold)" }}>✦</span>
      <span className="serif" style={{ fontStyle: "italic", fontSize: "clamp(16px,2vw,26px)", color: "var(--ink-soft)" }}>{sub}</span>
      <span style={{ color: "var(--gold)" }}>✦</span>
    </span>
  );

  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "26px 0", background: "var(--paper)" }}>
      <div className="mq-track" style={{ animationDuration: `${speed}s` }}>
        <div className="mq-group">{unit}{unit}{unit}{unit}</div>
        <div className="mq-group" aria-hidden>{unit}{unit}{unit}{unit}</div>
      </div>
      <style>{`
        .mq-track { display: inline-flex; white-space: nowrap; animation-name: mq; animation-timing-function: linear; animation-iteration-count: infinite; }
        .mq-group { display: inline-flex; }
        @keyframes mq { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}
