"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { STORE_URL } from "@/data/shop";

// vorder 디자인을 사이트 컴포넌트로 이식.
// 제출 → /api/order (구글시트 + 메일 유지). 가격 = 채널가/대량가(10개↑) 자동할인 + 무료배송.
// 스플래시/자체 히어로/자체 푸터 제거(사이트 Shell + VideoHero + SiteFooter 사용).

const PRICE = {
  ch: { set: 26900, single: 6900, bag: 2000 },
  bulk: { set: 22900, single: 5900, bag: 2000 },
};
const BULK_MIN = 10;
const SHIP_FEE = 3000;
const BANK = { name: "신한", acct: "100-036-765551", holder: "(주)베러스" };
const won = (n: number) => n.toLocaleString("ko-KR") + "원";

type Qty = { set: number; black: number; navy: number; charcoal: number; bag: number };

declare global {
  interface Window { daum?: { Postcode: new (o: unknown) => { open: () => void } } }
}

export default function OrderForm() {
  const [qty, setQty] = useState<Qty>({ set: 0, black: 0, navy: 0, charcoal: 0, bag: 0 });
  const [ordName, setOrdName] = useState("");
  const [ordTel, setOrdTel] = useState("");
  const [same, setSame] = useState(false);
  const [rcpName, setRcpName] = useState("");
  const [rcpTel, setRcpTel] = useState("");
  const [zip, setZip] = useState("");
  const [road, setRoad] = useState("");
  const [detail, setDetail] = useState("");
  const [memo, setMemo] = useState("");
  const [proof, setProof] = useState("none");
  const [cashNo, setCashNo] = useState("");
  const [taxBiz, setTaxBiz] = useState("");
  const [taxName, setTaxName] = useState("");
  const [taxEmail, setTaxEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [bad, setBad] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<null | { ordNo: string; total: number }>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);

  const badCls = (k: string) => "inp" + (bad[k] ? " bad" : "");
  const clearBad = (k: string) => setBad((p) => (p[k] ? (() => { const n = { ...p }; delete n[k]; return n; })() : p));

  // 다음 우편번호 스크립트 로드
  useEffect(() => {
    if (document.getElementById("daum-postcode")) return;
    const s = document.createElement("script");
    s.id = "daum-postcode";
    s.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const singles = qty.black + qty.navy + qty.charcoal;
  const units = qty.set + singles;
  const setBulk = qty.set >= BULK_MIN;
  const singleBulk = singles >= BULK_MIN;
  const anyBulk = setBulk || singleBulk;
  const setUnit = setBulk ? PRICE.bulk.set : PRICE.ch.set;
  const singleUnit = singleBulk ? PRICE.bulk.single : PRICE.ch.single;
  const goods = qty.set * setUnit + singles * singleUnit + qty.bag * PRICE.bulk.bag;
  const ship = units === 0 ? 0 : anyBulk ? 0 : SHIP_FEE;
  const total = goods + ship;

  const step = (k: keyof Qty, d: number) => setQty((q) => ({ ...q, [k]: Math.max(0, q[k] + d) }));
  const setQ = (k: keyof Qty, v: number) => setQty((q) => ({ ...q, [k]: Math.max(0, Math.min(9999, v || 0)) }));

  function openAddr() {
    if (!window.daum?.Postcode) { setErr("주소 검색을 불러오는 중입니다. 잠시 후 다시 시도해주세요."); return; }
    new window.daum.Postcode({
      oncomplete: (data: { zonecode: string; roadAddress?: string; jibunAddress?: string }) => {
        setZip(data.zonecode);
        setRoad(data.roadAddress || data.jibunAddress || "");
        clearBad("addr");
        // 주소 채워지면 상세주소 입력칸으로 자동 이동
        setTimeout(() => detailRef.current?.focus(), 60);
      },
    }).open();
  }

  const itemsText = useMemo(() => {
    const it: string[] = [];
    if (qty.set) it.push(`선물세트 ${qty.set}세트 (개당 ${won(setUnit)})`);
    const cp: string[] = [];
    if (qty.black) cp.push(`블랙 ${qty.black}`);
    if (qty.navy) cp.push(`딥네이비 ${qty.navy}`);
    if (qty.charcoal) cp.push(`차콜 ${qty.charcoal}`);
    if (singles) it.push(`낱개 ${singles}족 [${cp.join(", ")}] (족당 ${won(singleUnit)})`);
    if (qty.bag) it.push(`고급 쇼핑백 ${qty.bag}개 (개당 ${won(PRICE.bulk.bag)})`);
    return it.join("\n");
  }, [qty, setUnit, singleUnit, singles]);

  async function submit() {
    setErr("");
    if (units === 0) { setErr("상품을 먼저 담아주세요."); return; }

    // 필수 항목 검증 — 누락/형식 오류 시 해당 칸 표시 후 제출 차단
    const b: Record<string, boolean> = {};
    if (!ordName.trim()) b.ordName = true;
    if (!validTel(ordTel)) b.ordTel = true;
    if (!same) {
      if (!rcpName.trim()) b.rcpName = true;
      if (!validTel(rcpTel)) b.rcpTel = true;
    }
    if (!zip.trim() || !road.trim()) b.addr = true;
    if (!detail.trim()) b.detail = true;
    if (proof === "cash" && !cashNo.trim()) b.cashNo = true;
    if (proof === "tax") {
      if (!taxBiz.trim()) b.taxBiz = true;
      if (!taxName.trim()) b.taxName = true;
      if (!validEmail(taxEmail)) b.taxEmail = true;
    }
    if (Object.keys(b).length) {
      setBad(b);
      setErr("빨간 테두리로 표시된 필수 항목을 확인해주세요.");
      setTimeout(() => {
        const el = formRef.current?.querySelector<HTMLElement>(".inp.bad, .addr-row.bad .inp");
        if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus({ preventScroll: true }); }
      }, 40);
      return;
    }
    setBad({});
    const rN = same ? ordName : rcpName, rT = same ? ordTel : rcpTel;

    const proofMap: Record<string, string> = { none: "선택 안 함", cash: "현금영수증", tax: "세금계산서" };
    let pd = "";
    if (proof === "cash") pd = ` (${cashNo || "번호 미기재"})`;
    if (proof === "tax") pd = ` (사업자 ${taxBiz || "-"} / ${taxName || "-"} / ${taxEmail || "-"})`;
    const receipt = proofMap[proof] + pd;
    const address = [zip ? `(${zip})` : "", road, detail].filter(Boolean).join(" ");
    const ordNo = "VERNY-" + ymd() + "-" + String(Math.floor(1000 + Math.random() * 9000));
    const tier = [qty.set ? `세트 ${setBulk ? "대량가" : "채널가"}` : "", singles ? `낱개 ${singleBulk ? "대량가" : "채널가"}` : ""].filter(Boolean).join(" · ") || "-";

    setBusy(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ordererName: ordName, ordererPhone: ordTel,
          recipient: rN, recipientPhone: rT,
          address, zip, message: memo || "-",
          items: itemsText, qty: units, total,
          receipt, receiptInfo: receipt,
          ordNo, tier, goods, ship,
          bank: `${BANK.name} ${BANK.acct} (${BANK.holder})`,
        }),
      });
      const j = await res.json().catch(() => null);
      if (res.ok && j?.ok) setDone({ ordNo, total });
      else setErr("주문 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } catch {
      setErr("네트워크 오류로 접수하지 못했습니다.");
    } finally { setBusy(false); }
  }

  function reset() {
    setQty({ set: 0, black: 0, navy: 0, charcoal: 0, bag: 0 });
    setOrdName(""); setOrdTel(""); setSame(false); setRcpName(""); setRcpTel("");
    setZip(""); setRoad(""); setDetail(""); setMemo(""); setProof("none");
    setCashNo(""); setTaxBiz(""); setTaxName(""); setTaxEmail(""); setDone(null);
    setErr(""); setBad({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const stepProps = (k: keyof Qty, aria: string) => ({
    value: qty[k], aria,
    onDec: () => step(k, -1), onInc: () => step(k, 1), onSet: (v: number) => setQ(k, v),
  });

  return (
    <div className="vord">
      <div className="vord-wrap">
        {/* 판매가 안내 */}
        <section className="sec pricing">
          <div className="sec-head"><div><div className="sec-kicker">Price Guide</div><h2 className="sec-title">판매가 안내</h2></div></div>
          <div className="ptier"><div className="pt-side"><div className="pt-num">01</div><div className="pt-label">온라인 판매가</div></div>
            <div className="pt-rows">
              <div className="pt-row"><span>양말 개당</span><b>9,900<em>원</em></b></div>
              <div className="pt-row"><span>선물세트 <small>(쇼핑백 포함)</small></span><b>37,900<em>원</em></b></div>
            </div></div>
          <div className="ptier"><div className="pt-side"><div className="pt-num">02</div><div className="pt-label">폐쇄몰 판매가</div></div>
            <div className="pt-rows">
              <div className="pt-row"><span>양말 개당</span><b>6,900<em>원</em></b></div>
              <div className="pt-row"><span>선물세트 <small>(쇼핑백 별도구매)</small></span><b>26,900<em>원</em></b></div>
              <div className="pt-note"><span>※ 고급 쇼핑백</span><b>2,000원</b></div>
            </div></div>
          <div className="ptier best"><div className="pt-side"><div className="pt-num">03</div><div className="pt-label">10개 또는<br />10세트 이상 구매시</div></div>
            <div className="pt-rows">
              <div className="pt-row"><span>양말 개당</span><b>5,900<em>원</em></b></div>
              <div className="pt-row"><span>선물세트 <small>(쇼핑백 별도구매)</small></span><b>22,900<em>원</em></b></div>
              <div className="pt-note"><span>※ 고급 쇼핑백</span><b>2,000원</b></div>
            </div></div>
          <p className="pricing-note">※ 아래 주문서에서 <b>10개(세트) 이상</b> 담으면 <b>03 대량가</b>가 자동 적용됩니다.</p>
        </section>

        {/* 브랜드 스토리 */}
        <section className="sec story">
          <div className="story-kicker">BRAND STORY</div>
          <h2 className="story-head">매일 아침, 망설임 없이 선택할 수 있는<br />단 하나의 디테일</h2>
          <p className="story-intro"><b>지난 15년간 수많은 기업의 리스크를 관리해 온 비즈니스맨</b>으로서 늘 아쉬웠던 것은, 하루를 온전히 지탱해 줄 <b>&lsquo;기본에 충실한 양말&rsquo;의 부재</b>였습니다. 바쁜 아침 고민 없이 완벽한 핏을 연출하기 위해, <b>VERNY를 직접 설계하고 만들었습니다.</b></p>
          <div className="story-photo"><img src="/vorder/story.jpg?v=2" alt="VERNY 라이프스타일" /></div>
          <div className="story-plabel">타협하지 않은 <b>4가지 원칙</b></div>
          <div className="principles">
            {[
              ["01", "하루 종일 쾌적한 80% 코마사", "프리미엄 면 80%를 아낌없이 사용하여 땀을 빠르게 흡수하고, 장시간 구두를 신어도 발이 겉돌지 않는 안정적인 착화감을 제공합니다."],
              ["02", "맨살을 허락하지 않는 완벽한 기장", "다리를 꼬거나 의자에 깊숙이 앉았을 때도 맨살이 절대 노출되지 않도록, 비즈니스 매너에 입각한 최적의 종아리 높이로 설계되었습니다."],
              ["03", "피로감 없이, 흘러내림 없는 라이크라", "최고급 라이크라 소재를 배합하여, 종아리를 조이는 피로감 없이 하루 종일 흘러내리지 않는 탄탄한 고정력을 유지합니다."],
              ["04", "세탁 후에도 변함없는 핏과 복원력", "원단을 넉넉하고 밀도 있게 편직하여, 잦은 세탁과 건조 후에도 수축을 최소화하고 처음 신었을 때의 탄력을 그대로 유지합니다."],
            ].map(([n, t, d]) => (
              <div className="principle" key={n}><span className="pnum">{n}</span><div className="ptext"><span className="pt-title">{t}</span><p>{d}</p></div></div>
            ))}
          </div>
          <p className="story-close">시선이 잘 닿지 않는 곳의 디테일이 <b>전체의 품격</b>을 결정합니다.<br />VERNY는 변치 않는 신뢰를 <b className="gold">발끝에서부터</b> 증명합니다.</p>
        </section>

        {/* 상품 선택 */}
        <section className="sec">
          <div className="sec-head"><div><div className="sec-kicker">Select</div><h2 className="sec-title">상품 선택</h2></div><div className="sec-step">01 / 02</div></div>

          <article className={"product" + (qty.set > 0 ? " active" : "")}>
            <div className="p-top">
              <img className="p-thumb" src="/vorder/hero-set.jpg" alt="선물세트" />
              <div className="p-info">
                <div className="p-name">VERNY 선물세트</div>
                <div className="p-desc">3족 구성 · 블랙 · 딥네이비 · 차콜 <b>각 1족</b><br /><span className="hl">수입 밍크지</span> 네이비 기프트 박스 포함<br /><span style={{ color: "var(--gold-deep)", fontWeight: 600 }}>※ 쇼핑백 별도구매</span></div>
                <div className="p-price"><span className="now">{setUnit.toLocaleString()}<span className="won">원</span></span>{setBulk && <span className="was">{PRICE.ch.set.toLocaleString()}원</span>}{setBulk && <span className="tag">대량가</span>}</div>
                <div className={"deal" + (setBulk ? " on" : "")}><span className="star">{setBulk ? "✓" : "★"}</span> {setBulk ? <>세트당 <b>{PRICE.bulk.set.toLocaleString()}원</b> 자동 할인 적용중</> : <>10세트 이상 구매시 세트당 <b>{PRICE.bulk.set.toLocaleString()}원</b>으로 자동 할인</>}</div>
              </div>
            </div>
            <div className="p-foot"><Stepper {...stepProps("set", "선물세트 수량")} /><div className={"p-line" + (qty.set === 0 ? " zero" : "")}>{won(qty.set * setUnit)}</div></div>
          </article>

          <article className={"product" + (singles > 0 ? " active" : "")}>
            <div className="p-top">
              <img className="p-thumb" src="/vorder/sock-single.jpg" alt="낱개 양말" />
              <div className="p-info">
                <div className="p-name">낱개 양말</div>
                <div className="p-desc">Made in Korea · 색상별 수량 선택</div>
                <div className="p-price"><span className="now">{singleUnit.toLocaleString()}<span className="won">원</span></span>{singleBulk && <span className="was">{PRICE.ch.single.toLocaleString()}원</span>}{singleBulk && <span className="tag">대량가</span>}<span style={{ fontSize: 11, color: "var(--muted)" }}>/ 족</span></div>
                <div className={"deal" + (singleBulk ? " on" : "")}><span className="star">{singleBulk ? "✓" : "★"}</span> {singleBulk ? <>개당 <b>{PRICE.bulk.single.toLocaleString()}원</b> 자동 할인 적용중</> : <>10개 이상 구매시 개당 <b>{PRICE.bulk.single.toLocaleString()}원</b>으로 자동 할인</>}</div>
              </div>
            </div>
            <div className="colors">
              {([["black", "블랙", "BLACK", "sw-black"], ["navy", "딥네이비", "DEEP NAVY", "sw-navy"], ["charcoal", "차콜", "CHARCOAL", "sw-charcoal"]] as const).map(([k, ko, en, sw]) => (
                <div className="crow" key={k}><span className={"swatch " + sw}></span><span className="cn">{ko} <small>{en}</small></span><Stepper {...stepProps(k, `${ko} 수량`)} /></div>
              ))}
            </div>
            <div className="p-foot"><div className="lbl">{singles}족 선택</div><div className={"p-line" + (singles === 0 ? " zero" : "")}>{won(singles * singleUnit)}</div></div>
          </article>

          <article className={"product" + (qty.bag > 0 ? " active" : "")}>
            <div className="p-top">
              <img className="p-thumb" src="/vorder/bag.jpg" alt="고급 쇼핑백" />
              <div className="p-info">
                <div className="p-name">고급 쇼핑백</div>
                <div className="p-desc"><span className="hl">수입 밍크지</span>로 만들어 촉감과 색감이 매우 고급스럽습니다</div>
                <div className="p-price"><span className="now">2,000<span className="won">원</span></span><span style={{ fontSize: 11, color: "var(--muted)" }}>/ 개</span></div>
              </div>
            </div>
            <div className="p-foot"><Stepper {...stepProps("bag", "쇼핑백 수량")} /><div className={"p-line" + (qty.bag === 0 ? " zero" : "")}>{won(qty.bag * PRICE.bulk.bag)}</div></div>
          </article>
        </section>

        {/* 요약 */}
        <section className="sec">
          <div className="summary">
            <div className={"sm-badge" + (units === 0 || !anyBulk ? " plain" : "")}>{units === 0 ? "상품을 담아주세요" : anyBulk ? "✦ 대량가 적용 · 무료배송" : "채널가 적용"}</div>
            <div className="sm-row"><span>상품 금액</span><b>{won(goods)}</b></div>
            <div className={"sm-row" + (units > 0 && ship === 0 ? " free" : "")}><span>배송비</span><b>{units === 0 ? "—" : ship === 0 ? "무료" : won(ship)}</b></div>
            <div className="sm-div"></div>
            <div className="sm-total"><span className="l">총 결제금액</span><span className="v">{total.toLocaleString()}<span className="won">원</span></span></div>
            {units > 0 && !anyBulk && <div className="sm-nudge">세트 또는 낱개 <b>10개 이상</b> 시 대량가 · 무료배송</div>}
          </div>
        </section>

        {/* 주문·배송 정보 */}
        <section className="sec" ref={formRef}>
          <div className="sec-head"><div><div className="sec-kicker">Delivery</div><h2 className="sec-title">주문 · 배송 정보</h2></div><div className="sec-step">02 / 02</div></div>

          <div className="field row">
            <div><label className="lb">주문자 <span className="req">*</span></label><input className={badCls("ordName")} value={ordName} onChange={(e) => { setOrdName(e.target.value); clearBad("ordName"); }} placeholder="이름" /></div>
            <div><label className="lb">주문자 연락처 <span className="req">*</span></label><input className={badCls("ordTel")} value={ordTel} onChange={(e) => { setOrdTel(e.target.value); clearBad("ordTel"); }} inputMode="tel" placeholder="010-0000-0000" /></div>
          </div>

          <label className="same-check"><input type="checkbox" checked={same} onChange={(e) => setSame(e.target.checked)} /> 수취인이 주문자와 동일합니다</label>

          {!same && (
            <div className="field row">
              <div><label className="lb">수취인 <span className="req">*</span></label><input className={badCls("rcpName")} value={rcpName} onChange={(e) => { setRcpName(e.target.value); clearBad("rcpName"); }} placeholder="받는 분" /></div>
              <div><label className="lb">수취인 연락처 <span className="req">*</span></label><input className={badCls("rcpTel")} value={rcpTel} onChange={(e) => { setRcpTel(e.target.value); clearBad("rcpTel"); }} inputMode="tel" placeholder="010-0000-0000" /></div>
            </div>
          )}

          <div className="field"><label className="lb">배송지 주소 <span className="req">*</span></label>
            <div className={"addr-row" + (bad.addr ? " bad" : "")}>
              <input className={badCls("addr")} value={zip} placeholder="우편번호" readOnly onClick={openAddr} style={{ flex: 1 }} />
              <button type="button" className="addr-btn" onClick={openAddr}>주소 검색</button>
            </div>
            <input className={badCls("addr")} value={road} placeholder="주소 검색 버튼을 눌러주세요" readOnly onClick={openAddr} style={{ marginTop: 10 }} />
            <input ref={detailRef} className={badCls("detail")} value={detail} onChange={(e) => { setDetail(e.target.value); clearBad("detail"); }} placeholder="상세주소 (동·호수 등)" style={{ marginTop: 10 }} />
          </div>

          <div className="field"><label className="lb">배송 요청사항</label><input className="inp" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예: 부재 시 문 앞, 배송 전 연락 등" /></div>

          <div className="field"><label className="lb">증빙 서류</label>
            <select className="inp" value={proof} onChange={(e) => setProof(e.target.value)}>
              <option value="none">선택 안 함</option><option value="cash">현금영수증</option><option value="tax">세금계산서</option>
            </select>
          </div>
          {proof === "cash" && <div className="field"><label className="lb">현금영수증 발급 번호 <span className="req">*</span></label><input className={badCls("cashNo")} value={cashNo} onChange={(e) => { setCashNo(e.target.value); clearBad("cashNo"); }} inputMode="numeric" placeholder="휴대폰번호 또는 사업자번호" /></div>}
          {proof === "tax" && <div className="field"><label className="lb">세금계산서 정보 <span className="req">*</span></label>
            <input className={badCls("taxBiz")} value={taxBiz} onChange={(e) => { setTaxBiz(e.target.value); clearBad("taxBiz"); }} placeholder="사업자등록번호" inputMode="numeric" style={{ marginBottom: 10 }} />
            <input className={badCls("taxName")} value={taxName} onChange={(e) => { setTaxName(e.target.value); clearBad("taxName"); }} placeholder="상호 / 대표자" style={{ marginBottom: 10 }} />
            <input className={badCls("taxEmail")} value={taxEmail} onChange={(e) => { setTaxEmail(e.target.value); clearBad("taxEmail"); }} placeholder="계산서 수신 이메일" inputMode="email" />
          </div>}

          {err && <p style={{ color: "#c0392b", fontSize: 13, margin: "6px 0 12px" }}>{err}</p>}

          <button className="submit" disabled={busy || units === 0} onClick={submit}>
            {busy ? "주문 접수 중…" : units === 0 ? "상품을 먼저 담아주세요" : <><span className="amt">{total.toLocaleString()}원</span> · 주문 접수하기</>}
          </button>
          <p className="agree">버튼을 누르면 주문 내역이 담당자에게 전달되고, 입금 계좌가 안내됩니다.<br /><b className="pay-hi">결제 · 무통장 입금 또는 카드(네이버 쇼핑)</b></p>
          <div className="pay-alt">
            <div className="pay-alt-div"><span>또는</span></div>
            <a className="naver-btn" href={STORE_URL} target="_blank" rel="noopener noreferrer">
              <span className="nb-ico">N</span><span className="nb-txt">카드 결제 · <b>네이버 쇼핑</b>에서 주문</span><span className="nb-arrow">›</span>
            </a>
            <p className="pay-alt-note">무통장 입금이 번거로우시면 네이버페이·카드로 간편하게 결제하세요.</p>
          </div>

          {/* 무통장 계좌 카드 */}
          <div className="acct-card">
            <div className="acct-label">무통장 입금 계좌</div>
            <div className="acct-no">신한 <b>100-036-765551</b></div>
            <div className="acct-holder">예금주 · (주)베러스</div>
          </div>
        </section>
      </div>

      {/* 완료 오버레이 */}
      {done && (
        <div className="done show" onClick={reset}>
          <div className="done-card" onClick={(e) => e.stopPropagation()}>
            <div className="done-check">✓</div>
            <h3>주문이 접수되었습니다</h3>
            <div className="ord-no">주문번호 · <b>{done.ordNo}</b></div>
            <div className="pay-box">
              <div className="pay-amt"><span className="l">입금하실 금액</span><span className="v">{won(done.total)}</span></div>
              <div className="pay-bank">신한은행</div>
              <div className="pay-acct"><div className="a"><b>100-036-765551</b><small>예금주 · (주)베러스</small></div></div>
            </div>
            <div className="pay-note"><b>입금 안내</b><br />· 입금자명을 <b>주문자명과 동일</b>하게 입금해 주세요.<br />· 입금 확인 후 순차 발송됩니다.<br />· 현금영수증 · 세금계산서 발행 가능합니다.</div>
            <button className="done-close" onClick={reset}>확인 · 새 주문</button>
          </div>
        </div>
      )}

      <style>{vordCss}</style>
    </div>
  );
}

function Stepper({ value, aria, onDec, onInc, onSet }: { value: number; aria: string; onDec: () => void; onInc: () => void; onSet: (v: number) => void }) {
  return (
    <div className="stepper">
      <button type="button" onClick={onDec} aria-label="수량 감소">−</button>
      <input type="number" inputMode="numeric" min={0} value={value} aria-label={aria}
        onChange={(e) => onSet(parseInt(e.target.value))} />
      <button type="button" onClick={onInc} aria-label="수량 증가">+</button>
    </div>
  );
}

function ymd() { const d = new Date(); return `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`; }
function validTel(v: string) { return /^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(v.replace(/\s/g, "")); }
function validEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

// vorder CSS — 사이트와 충돌 방지 위해 .vord 하위로 스코프 (전역 리셋/자체 hero·foot·splash 제외).
const vordCss = `
.vord{--navy:#17233f;--navy-2:#1f2f54;--navy-line:#2c3c62;--gold:#c1a05a;--gold-soft:#d7bd88;--gold-deep:#a9873f;--gold-bright:#f0c24d;--paper:#ffffff;--paper-2:#fbf8f2;--ink:#23262d;--muted:#8d887b;--muted-2:#a7a294;--line:#ece5d7;--line-2:#e0d7c4;--shadow:0 24px 60px -32px rgba(23,35,63,.45);--r:16px;color:var(--ink);word-break:keep-all;}
.vord *{box-sizing:border-box;}
.vord .vord-wrap{max-width:600px;margin:0 auto;padding:36px 22px 40px;}
.vord .sec{margin-bottom:34px;}
.vord .sec-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:18px;}
.vord .sec-kicker{font-size:11px;letter-spacing:.28em;color:var(--gold-deep);text-transform:uppercase;font-weight:500;}
.vord .sec-title{font-weight:700;font-size:31px;letter-spacing:.01em;color:var(--navy);}
.vord .sec-step{font-size:15px;color:var(--muted-2);letter-spacing:.1em;}
.vord .product{border:1px solid var(--line);border-radius:var(--r);padding:16px;margin-bottom:14px;background:var(--paper);transition:border-color .25s,box-shadow .25s;}
.vord .product.active{border-color:var(--gold-soft);box-shadow:0 14px 30px -22px rgba(193,160,90,.7);}
.vord .p-top{display:flex;gap:14px;}
.vord .p-thumb{width:84px;height:84px;border-radius:12px;object-fit:cover;flex-shrink:0;background:var(--paper-2);border:1px solid var(--line);}
.vord .p-info{flex:1;min-width:0;}
.vord .p-name{font-weight:700;font-size:18px;letter-spacing:-.01em;}
.vord .p-desc{font-size:13.5px;color:#6d6a5e;margin-top:3px;line-height:1.6;}
.vord .p-desc b{color:var(--navy);font-weight:700;}
.vord .p-price{margin-top:9px;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;}
.vord .p-price .now{font-weight:700;font-size:28px;color:var(--navy);}
.vord .p-price .now .won{font-size:14px;font-weight:400;color:var(--muted);margin-left:1px;}
.vord .p-price .tag{font-size:11px;letter-spacing:.08em;color:var(--gold-deep);border:1px solid var(--line-2);border-radius:6px;padding:3px 9px;font-weight:600;}
.vord .p-price .was{font-size:14px;color:var(--muted-2);text-decoration:line-through;}
.vord .stepper{display:inline-flex;align-items:center;border:1px solid var(--line-2);border-radius:11px;overflow:hidden;background:var(--paper);}
.vord .stepper button{width:46px;height:48px;border:none;background:var(--paper-2);font-size:23px;color:var(--navy);cursor:pointer;line-height:1;}
.vord .stepper button:active{background:var(--line);}
.vord .stepper input{width:60px;height:48px;border:none;text-align:center;font-size:19px;font-weight:700;background:#fff;-moz-appearance:textfield;}
.vord .stepper input::-webkit-outer-spin-button,.vord .stepper input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
.vord .stepper input:focus{outline:none;}
.vord .p-foot{display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:14px;border-top:1px dashed var(--line);}
.vord .p-foot .lbl{font-size:13.5px;color:var(--muted);}
.vord .p-line{font-weight:700;font-size:21px;color:var(--navy);}
.vord .p-line.zero{color:var(--muted-2);}
.vord .colors{margin-top:14px;display:flex;flex-direction:column;gap:13px;}
.vord .crow{display:flex;align-items:center;gap:13px;}
.vord .swatch{width:30px;height:30px;border-radius:50%;flex-shrink:0;border:1px solid rgba(0,0,0,.12);}
.vord .sw-black{background:#1c1c1e;}.vord .sw-navy{background:#1f2b48;}.vord .sw-charcoal{background:#3b3f45;}
.vord .crow .cn{flex:1;font-size:16.5px;font-weight:500;}
.vord .crow .cn small{display:block;font-size:11.5px;color:var(--muted-2);letter-spacing:.06em;}
.vord .deal{margin-top:10px;font-size:12px;font-weight:600;color:var(--gold-deep);line-height:1.45;}
.vord .deal .star{color:var(--gold);margin-right:4px;}
.vord .deal b{font-weight:800;color:var(--navy);}
.vord .deal.on{display:inline-block;background:linear-gradient(135deg,var(--gold),var(--gold-deep));color:#fff;padding:6px 13px;border-radius:9px;font-weight:700;box-shadow:0 9px 18px -10px rgba(169,135,63,.9);}
.vord .deal.on .star,.vord .deal.on b{color:#fff;}
.vord .hl{background:linear-gradient(180deg,transparent 52%,rgba(193,160,90,.35) 52%);padding:0 3px;font-weight:700;color:var(--navy);}
.vord .summary{background:linear-gradient(180deg,var(--navy),var(--navy-2));color:#fff;border-radius:var(--r);padding:22px 20px;box-shadow:var(--shadow);}
.vord .sm-badge{display:inline-flex;align-items:center;gap:7px;font-size:13px;letter-spacing:.1em;color:var(--navy);background:var(--gold-soft);border-radius:999px;padding:8px 16px;font-weight:500;margin-bottom:16px;}
.vord .sm-badge.plain{background:transparent;color:var(--gold-soft);border:1px solid var(--navy-line);}
.vord .sm-row{display:flex;justify-content:space-between;font-size:15.5px;color:rgba(255,255,255,.78);padding:8px 0;}
.vord .sm-row b{color:#fff;font-weight:400;}
.vord .sm-row.free b{color:var(--gold-soft);font-weight:700;}
.vord .sm-div{height:1px;background:var(--navy-line);margin:12px 0;}
.vord .sm-total{display:flex;justify-content:space-between;align-items:baseline;}
.vord .sm-total .l{font-size:14.5px;color:rgba(255,255,255,.8);}
.vord .sm-total .v{font-weight:700;font-size:42px;color:#fff;}
.vord .sm-total .v .won{font-size:16px;font-weight:400;margin-left:2px;color:var(--gold-soft);}
.vord .sm-nudge{margin-top:14px;font-size:13.5px;color:var(--gold-soft);background:rgba(193,160,90,.12);border:1px solid rgba(193,160,90,.28);border-radius:10px;padding:12px;text-align:center;line-height:1.5;}
.vord .field{margin-bottom:14px;}
.vord .field.row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.vord label.lb{display:block;font-size:13px;color:var(--muted);margin-bottom:7px;}
.vord label.lb .req{color:var(--gold-deep);}
.vord .inp{width:100%;background:var(--paper-2);border:1px solid var(--line-2);border-radius:11px;padding:14px 15px;font-size:16px;transition:border-color .2s,background .2s;}
.vord .inp:focus{outline:none;border-color:var(--gold);background:#fff;}
.vord .inp.bad{border-color:#d64541;background:#fff6f5;}
.vord .inp.bad:focus{border-color:#d64541;}
.vord select.inp{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238d887b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px;}
.vord input.inp[readonly]{background:var(--paper-2);cursor:pointer;}
.vord .same-check{display:flex;align-items:center;gap:9px;font-size:13px;color:var(--muted);cursor:pointer;margin:-4px 0 14px;user-select:none;}
.vord .same-check input{width:18px;height:18px;accent-color:var(--navy);}
.vord .addr-row{display:flex;gap:10px;}
.vord .addr-btn{flex-shrink:0;border:none;background:linear-gradient(135deg,var(--navy-2),var(--navy));color:#fff;font-weight:600;font-size:14px;padding:0 22px;border-radius:11px;cursor:pointer;white-space:nowrap;}
.vord .submit{width:100%;border:none;cursor:pointer;padding:21px;border-radius:14px;font-size:18px;font-weight:500;color:#fff;background:linear-gradient(135deg,var(--navy-2),var(--navy));box-shadow:0 18px 40px -18px rgba(23,35,63,.8);transition:transform .15s,opacity .2s;}
.vord .submit:active{transform:translateY(2px);}
.vord .submit[disabled]{opacity:.5;cursor:not-allowed;}
.vord .submit .amt{font-weight:700;}
.vord .agree{font-size:12px;color:#6d6a5e;text-align:center;margin-top:13px;line-height:1.6;}
.vord .pay-hi{color:var(--gold-deep);font-weight:700;}
.vord .pay-alt{margin-top:18px;}
.vord .pay-alt-div{display:flex;align-items:center;gap:12px;color:var(--muted-2);font-size:12px;margin-bottom:14px;}
.vord .pay-alt-div::before,.vord .pay-alt-div::after{content:"";flex:1;height:1px;background:var(--line);}
.vord .naver-btn{display:flex;align-items:center;gap:11px;width:100%;text-decoration:none;background:#fff;border:1.5px solid var(--navy);border-radius:14px;padding:16px 18px;box-shadow:0 10px 24px -18px rgba(23,35,63,.55);}
.vord .nb-ico{width:27px;height:27px;flex-shrink:0;border-radius:7px;background:#03c75a;color:#fff;font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center;}
.vord .nb-txt{flex:1;font-size:15px;color:var(--navy);font-weight:500;}
.vord .nb-txt b{font-weight:700;}
.vord .nb-arrow{color:var(--muted-2);font-size:20px;font-weight:700;}
.vord .pay-alt-note{font-size:12.5px;color:var(--gold-deep);font-weight:600;text-align:center;margin-top:11px;line-height:1.6;}
.vord .acct-card{max-width:360px;margin:26px auto 0;background:linear-gradient(155deg,rgba(215,189,136,.20),rgba(193,160,90,.07));border:1.5px solid var(--gold);border-radius:18px;padding:22px 20px;text-align:center;box-shadow:0 16px 34px -18px rgba(193,160,90,.65);}
.vord .acct-label{font-size:11.5px;letter-spacing:.22em;color:var(--gold-deep);text-transform:uppercase;font-weight:600;margin-bottom:11px;}
.vord .acct-no{font-size:26px;font-weight:800;color:var(--navy);}
.vord .acct-no b{color:var(--gold-deep);font-weight:800;}
.vord .acct-holder{font-size:12.5px;color:var(--muted);margin-top:7px;}
.vord .pricing{border-bottom:1px solid var(--line);padding-bottom:30px;}
.vord .ptier{background:linear-gradient(160deg,#1c2c4e,#141f38);border:1px solid rgba(230,201,138,.22);border-radius:16px;padding:18px;margin-bottom:14px;display:flex;gap:15px;}
.vord .ptier.best{border:1.6px solid var(--gold);box-shadow:0 18px 36px -18px rgba(193,160,90,.5);}
.vord .pt-side{flex-shrink:0;width:82px;text-align:center;border-right:1px solid rgba(255,255,255,.12);padding-right:14px;display:flex;flex-direction:column;justify-content:center;gap:8px;}
.vord .pt-num{font-weight:800;font-size:30px;color:var(--gold-soft);line-height:1;}
.vord .ptier.best .pt-num{color:#f0c24d;}
.vord .pt-label{font-size:11.5px;color:rgba(255,255,255,.72);font-weight:600;line-height:1.4;}
.vord .pt-rows{flex:1;display:flex;flex-direction:column;justify-content:center;gap:11px;min-width:0;}
.vord .pt-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px;}
.vord .pt-row>span{font-size:14px;color:rgba(255,255,255,.9);font-weight:500;}
.vord .pt-row>span small{color:rgba(255,255,255,.5);font-size:11px;font-weight:400;}
.vord .pt-row>b{font-weight:800;font-size:22px;color:var(--gold-soft);white-space:nowrap;}
.vord .pt-row>b em{font-style:normal;font-size:13px;font-weight:500;margin-left:1px;color:rgba(230,201,138,.85);}
.vord .ptier.best .pt-row>b{color:#f0c24d;}
.vord .pt-note{display:flex;justify-content:space-between;align-items:center;font-size:11.5px;color:rgba(255,255,255,.62);background:rgba(255,255,255,.06);border-radius:8px;padding:7px 11px;margin-top:2px;}
.vord .pt-note b{color:var(--gold-soft);font-weight:700;}
.vord .pricing-note{text-align:center;font-size:12.5px;color:var(--muted);margin-top:16px;line-height:1.6;}
.vord .pricing-note b{color:var(--gold-deep);font-weight:700;}
.vord .story{border-bottom:1px solid var(--line);padding-bottom:32px;}
.vord .story-kicker{font-size:11px;letter-spacing:.3em;color:var(--gold-deep);text-transform:uppercase;font-weight:600;text-align:center;margin-bottom:14px;}
.vord .story-head{font-size:23px;font-weight:700;line-height:1.42;color:var(--navy);text-align:center;letter-spacing:-.01em;margin-bottom:18px;}
.vord .story-intro{font-size:14px;line-height:1.85;color:#5f5b51;text-align:center;margin:0 auto 24px;max-width:450px;}
.vord .story-intro b{color:var(--navy);font-weight:700;}
.vord .story-photo{border-radius:16px;overflow:hidden;margin:4px 0 28px;box-shadow:0 22px 46px -24px rgba(23,35,63,.6);}
.vord .story-photo img{width:100%;display:block;}
.vord .story-plabel{text-align:center;font-size:14px;color:var(--navy);font-weight:500;margin-bottom:22px;}
.vord .story-plabel b{font-weight:800;}
.vord .story-plabel::before{content:"";display:block;width:30px;height:1px;background:var(--gold);margin:0 auto 16px;}
.vord .principles{display:flex;flex-direction:column;gap:18px;margin-bottom:26px;}
.vord .principle{display:flex;gap:15px;align-items:flex-start;}
.vord .pnum{font-size:21px;font-weight:800;color:var(--gold);line-height:1.05;flex-shrink:0;width:32px;}
.vord .ptext .pt-title{display:block;font-size:15.5px;color:var(--navy);font-weight:700;margin-bottom:5px;line-height:1.45;}
.vord .ptext p{font-size:13px;line-height:1.72;color:#6d6a5e;}
.vord .story-close{text-align:center;font-size:13px;line-height:1.75;color:#fff;font-weight:500;background:linear-gradient(160deg,var(--navy-2),var(--navy));border-radius:18px;padding:22px 15px;box-shadow:0 24px 46px -22px rgba(23,35,63,.75);}
.vord .story-close b{color:#fff;font-weight:800;}
.vord .story-close b.gold{color:var(--gold-bright);}
.vord .done{position:fixed;inset:0;z-index:120;background:rgba(15,22,40,.72);backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center;}
.vord .done-card{background:var(--paper);width:100%;max-width:600px;border-radius:24px 24px 0 0;padding:32px 24px 34px;max-height:92vh;overflow-y:auto;}
.vord .done-check{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--gold-soft),var(--gold));display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:#fff;font-size:26px;}
.vord .done h3{text-align:center;font-weight:700;font-size:26px;color:var(--navy);}
.vord .ord-no{text-align:center;font-size:13px;color:var(--muted);margin-top:6px;}
.vord .ord-no b{color:var(--gold-deep);font-weight:500;}
.vord .pay-box{background:var(--navy);color:#fff;border-radius:16px;padding:20px;margin:22px 0 14px;}
.vord .pay-amt{display:flex;justify-content:space-between;align-items:baseline;padding-bottom:14px;border-bottom:1px solid var(--navy-line);margin-bottom:14px;}
.vord .pay-amt .l{font-size:13px;color:rgba(255,255,255,.75);}
.vord .pay-amt .v{font-weight:700;font-size:28px;color:var(--gold-soft);}
.vord .pay-bank{font-size:12px;color:rgba(255,255,255,.65);letter-spacing:.14em;text-transform:uppercase;margin-bottom:5px;}
.vord .pay-acct .a b{font-weight:500;}
.vord .pay-acct .a small{display:block;font-size:12px;color:rgba(255,255,255,.6);margin-top:2px;}
.vord .pay-note{font-size:12px;color:var(--muted);line-height:1.7;background:var(--paper-2);border:1px solid var(--line);border-radius:12px;padding:14px;}
.vord .pay-note b{color:var(--navy);font-weight:500;}
.vord .done-close{width:100%;border:1px solid var(--line-2);background:var(--paper-2);color:var(--navy);border-radius:12px;padding:15px;font-size:14px;font-weight:500;cursor:pointer;margin-top:16px;}
@media(max-width:400px){.vord .field.row{grid-template-columns:1fr;}}
`;
