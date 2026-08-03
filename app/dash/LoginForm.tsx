"use client";

import { useState } from "react";

export default function LoginForm() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(false);
    const res = await fetch("/api/dash/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    }).catch(() => null);
    if (res?.ok) window.location.reload();
    else {
      setErr(true);
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0f1a", color: "#e6e9f0", fontFamily: "system-ui, sans-serif" }}>
      <form onSubmit={submit} style={{ background: "#131a2b", border: "1px solid #253052", borderRadius: 14, padding: "36px 32px", width: 300, display: "grid", gap: 14 }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#7d8bb0" }}>VERNY INSIGHT</div>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="비밀번호"
          style={{ background: "#0b0f1a", border: `1px solid ${err ? "#e5484d" : "#253052"}`, borderRadius: 8, padding: "10px 12px", color: "#e6e9f0", fontSize: 15, outline: "none" }}
        />
        {err && <div style={{ color: "#e5484d", fontSize: 12 }}>비밀번호가 올바르지 않습니다.</div>}
        <button type="submit" disabled={busy} style={{ background: "#3b82f6", border: 0, borderRadius: 8, padding: "10px 0", color: "#fff", fontSize: 14, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>
          {busy ? "확인 중…" : "들어가기"}
        </button>
      </form>
    </main>
  );
}
