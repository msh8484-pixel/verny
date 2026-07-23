"use client";

import { useState } from "react";
import { SHOP, EXT } from "@/data/shop";

type Qty = { set: number; navy: number; charcoal: number; black: number; bag: number };
const PRICE = { set: 26900, single: 6900, bag: 2000 };

const inputStyle: React.CSSProperties = {
  width: "100%", border: "none", borderBottom: "1px solid var(--line)",
  padding: "10px 2px", fontFamily: "var(--font-body)", fontSize: 14,
  fontWeight: 300, background: "none", color: "var(--ink)", outline: "none",
};
const labelHead: React.CSSProperties = { fontSize: 12, color: "#555", marginBottom: 8 };
const req = <span style={{ color: "var(--gold)" }}> *</span>;

function Stepper({ value, onChange, label, price }: { value: number; onChange: (v: number) => void; label: string; price: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
      <div>
        <div style={{ fontSize: 14, color: "var(--ink)" }}>{label}</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 2 }}>{price.toLocaleString()}원</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)", borderRadius: 2, height: 34 }}>
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} style={{ width: 32, height: "100%", border: "none", background: "none", fontSize: 16, cursor: "pointer", color: "var(--ink)" }}>−</button>
        <span style={{ width: 34, textAlign: "center", fontSize: 13, borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)", lineHeight: "32px" }}>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} style={{ width: 32, height: "100%", border: "none", background: "none", fontSize: 16, cursor: "pointer", color: "var(--ink)" }}>+</button>
      </div>
    </div>
  );
}

export default function OrderForm() {
  const [qty, setQty] = useState<Qty>({ set: 0, navy: 0, charcoal: 0, black: 0, bag: 0 });
  const [ordererName, setOrdererName] = useState("");
  const [ordererPhone, setOrdererPhone] = useState("");
  const [sameAsOrderer, setSameAsOrderer] = useState(true);
  const [recipient, setRecipient] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState("안 함");
  const [receiptInfo, setReceiptInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const totalQty = qty.set + qty.navy + qty.charcoal + qty.black + qty.bag;
  const total =
    qty.set * PRICE.set +
    (qty.navy + qty.charcoal + qty.black) * PRICE.single +
    qty.bag * PRICE.bag;

  const items = [
    qty.set && `선물세트 ${qty.set}`,
    qty.navy && `낱개(네이비) ${qty.navy}`,
    qty.charcoal && `낱개(차콜) ${qty.charcoal}`,
    qty.black && `낱개(블랙) ${qty.black}`,
    qty.bag && `쇼핑백 ${qty.bag}`,
  ].filter(Boolean).join(" · ");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!ordererName.trim() || !ordererPhone.trim()) return setErr("주문자와 연락처를 입력해주세요.");
    if (total === 0) return setErr("상품을 1개 이상 선택해주세요.");
    const rName = sameAsOrderer ? ordererName : recipient;
    const rPhone = sameAsOrderer ? ordererPhone : recipientPhone;
    if (!rName.trim() || !rPhone.trim()) return setErr("수취인 정보를 입력해주세요.");
    if (!address.trim()) return setErr("배송지 주소를 입력해주세요.");
    setBusy(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ordererName, ordererPhone,
          recipient: rName, recipientPhone: rPhone,
          address, zip, message,
          items, qty: totalQty, total,
          receipt, receiptInfo,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error ?? "접수에 실패했습니다."); return; }
      setDone(true);
    } catch {
      setErr("네트워크 오류로 접수하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section className="section" style={{ background: "var(--paper)", textAlign: "center" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <span className="eyebrow">Received</span>
          <h2 className="serif" style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 500, color: "var(--navy)", margin: "12px 0 16px" }}>신청이 접수되었습니다</h2>
          <p style={{ color: "var(--ink-soft)", lineHeight: 1.9, fontSize: 14.5 }}>
            담당자가 확인 후 연락드리겠습니다. 빠른 구매는 네이버 스마트스토어에서도 가능합니다.
          </p>
          <a href={SHOP.store} {...EXT} className="btn" style={{ marginTop: 26 }}>네이버 스마트스토어</a>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ background: "var(--paper)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span className="eyebrow">Order Form</span>
          <h2 className="serif" style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 500, color: "var(--navy)", marginTop: 10 }}>양말 신청서</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginTop: 12, lineHeight: 1.7 }}>
            직접 주문·단체 주문·세금계산서가 필요하시면 아래로 신청해주세요.<br />일반 구매는 네이버 스마트스토어가 더 빠릅니다.
          </p>
        </div>

        <form onSubmit={submit}>
          {/* 상품 */}
          <div style={{ marginBottom: 34 }}>
            <div className="eyebrow eyebrow-ink" style={{ marginBottom: 6 }}>상품 선택</div>
            <Stepper label="선물세트 · 3켤레(블랙·네이비·차콜)" price={PRICE.set} value={qty.set} onChange={(v) => setQty({ ...qty, set: v })} />
            <Stepper label="낱개 · 네이비" price={PRICE.single} value={qty.navy} onChange={(v) => setQty({ ...qty, navy: v })} />
            <Stepper label="낱개 · 차콜" price={PRICE.single} value={qty.charcoal} onChange={(v) => setQty({ ...qty, charcoal: v })} />
            <Stepper label="낱개 · 블랙" price={PRICE.single} value={qty.black} onChange={(v) => setQty({ ...qty, black: v })} />
            <Stepper label="고급 쇼핑백" price={PRICE.bag} value={qty.bag} onChange={(v) => setQty({ ...qty, bag: v })} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 16 }}>
              <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>합계 · 총 {totalQty}개</span>
              <span className="serif" style={{ fontSize: 26, color: "var(--navy)" }}>{total.toLocaleString()}<span style={{ fontSize: 13 }}> 원</span></span>
            </div>
          </div>

          {/* 주문자 */}
          <div className="eyebrow eyebrow-ink" style={{ marginBottom: 14 }}>주문자</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px 30px", marginBottom: 24 }}>
            <label><div style={labelHead}>주문자{req}</div>
              <input style={inputStyle} value={ordererName} onChange={(e) => setOrdererName(e.target.value)} placeholder="이름" /></label>
            <label><div style={labelHead}>주문자 연락처{req}</div>
              <input style={inputStyle} value={ordererPhone} onChange={(e) => setOrdererPhone(e.target.value)} placeholder="010-0000-0000" inputMode="tel" /></label>
          </div>

          {/* 수취인 */}
          <div className="eyebrow eyebrow-ink" style={{ marginBottom: 12 }}>받는 분 (수취인)</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-soft)", marginBottom: 16, cursor: "pointer" }}>
            <input type="checkbox" checked={sameAsOrderer} onChange={(e) => setSameAsOrderer(e.target.checked)} />
            주문자와 동일
          </label>
          {!sameAsOrderer && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px 30px", marginBottom: 24 }}>
              <label><div style={labelHead}>수취인명{req}</div>
                <input style={inputStyle} value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="받는 분 이름" /></label>
              <label><div style={labelHead}>수취인 연락처{req}</div>
                <input style={inputStyle} value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="010-0000-0000" inputMode="tel" /></label>
            </div>
          )}

          {/* 배송지 */}
          <div className="eyebrow eyebrow-ink" style={{ marginBottom: 14 }}>배송지</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: "22px 30px", marginBottom: 30 }}>
            <label><div style={labelHead}>주소{req}</div>
              <input style={inputStyle} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="도로명 주소 + 상세 주소" /></label>
            <label><div style={labelHead}>우편번호</div>
              <input style={inputStyle} value={zip} onChange={(e) => setZip(e.target.value)} placeholder="00000" inputMode="numeric" /></label>
            <label style={{ gridColumn: "1 / -1" }}><div style={labelHead}>배송 메세지</div>
              <input style={inputStyle} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="예) 부재 시 경비실에 맡겨주세요" /></label>
          </div>

          {/* 증빙 */}
          <div style={{ marginBottom: 30 }}>
            <div style={labelHead}>증빙 서류</div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {["안 함", "현금영수증", "세금계산서"].map((o) => (
                <label key={o} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: receipt === o ? "var(--ink)" : "var(--ink-soft)", cursor: "pointer" }}>
                  <input type="radio" name="receipt" checked={receipt === o} onChange={() => setReceipt(o)} />
                  {o}
                </label>
              ))}
            </div>
            {receipt !== "안 함" && (
              <input style={{ ...inputStyle, marginTop: 14 }} value={receiptInfo} onChange={(e) => setReceiptInfo(e.target.value)}
                placeholder={receipt === "현금영수증" ? "현금영수증 발급 번호(휴대폰/사업자)" : "사업자등록번호 · 상호 · 대표자 · 이메일"} />
            )}
          </div>

          {err && <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 14 }}>{err}</p>}

          <button type="submit" disabled={busy} className="btn btn-gold" style={{ width: "100%", height: 54, opacity: busy ? 0.6 : 1 }}>
            {busy ? "접수 중…" : "신청서 제출"}
          </button>
          <p style={{ fontSize: 11.5, color: "var(--ink-soft)", textAlign: "center", marginTop: 14, lineHeight: 1.7 }}>
            제출하면 담당자에게 전달되고 확인 후 연락드립니다.<br />결제(무통장/카드)는 확인 연락 시 안내됩니다.
          </p>
        </form>
      </div>
    </section>
  );
}
