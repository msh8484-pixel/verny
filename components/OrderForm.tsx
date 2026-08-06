import { SHOP, EXT } from "@/data/shop";

// 주문 페이지 본문 — 판매가 안내 + 브랜드 스토리 + 스마트스토어 구매 연결.
// (자체 주문서는 2026-08-06 제거: 구매는 네이버 스마트스토어로 일원화)

export default function OrderForm() {
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
          <p className="pricing-note">※ 스마트스토어에서 <b>10개(세트) 이상</b> 구매하면 <b>03 대량가</b>가 자동 적용됩니다.</p>
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

        {/* 스마트스토어 구매 */}
        <section className="sec buy">
          <div className="buy-card">
            <div className="buy-kicker">SHOP NOW</div>
            <h2 className="buy-head">네이버 스마트스토어에서<br />구매하실 수 있습니다</h2>
            <p className="buy-sub">색상 · 수량 선택과 결제, 배송 조회까지 스토어에서 한 번에 진행됩니다.</p>
            <span className="buy-halo">
              <a className="buy-btn" href={SHOP.store} {...EXT}>
                스마트스토어에서 구매하기
                <svg className="buy-arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h13M13 6l6 6-6 6" />
                </svg>
              </a>
            </span>
            <p className="buy-note">네이버페이 · 카드 · 무통장입금 이용 가능</p>
          </div>
        </section>
      </div>

      <style>{vordCss}</style>
    </div>
  );
}

const vordCss = `
.vord{--navy:#17233f;--navy-2:#1f2f54;--navy-line:#2c3c62;--gold:#c1a05a;--gold-soft:#d7bd88;--gold-deep:#a9873f;--gold-bright:#f0c24d;--paper:#ffffff;--paper-2:#fbf8f2;--ink:#23262d;--muted:#8d887b;--muted-2:#a7a294;--line:#ece5d7;--line-2:#e0d7c4;--shadow:0 24px 60px -32px rgba(23,35,63,.45);--r:16px;color:var(--ink);word-break:keep-all;}
.vord *{box-sizing:border-box;}
.vord .vord-wrap{max-width:600px;margin:0 auto;padding:36px 22px 40px;}
.vord .sec{margin-bottom:34px;}
.vord .sec-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:18px;}
.vord .sec-kicker{font-size:11px;letter-spacing:.28em;color:var(--gold-deep);text-transform:uppercase;font-weight:500;}
.vord .sec-title{font-weight:700;font-size:31px;letter-spacing:.01em;color:var(--navy);}
.vord label.lb{display:block;font-size:13px;color:var(--muted);margin-bottom:7px;}
.vord label.lb .req{color:var(--gold-deep);}
.vord select.inp{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238d887b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px;}
.vord input.inp[readonly]{background:var(--paper-2);cursor:pointer;}
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

.vord .buy{margin-top:6px;}
.vord .buy-card{background:linear-gradient(160deg,#17233f 0%,#1f2f54 100%);border-radius:var(--r);padding:38px 26px 32px;text-align:center;box-shadow:var(--shadow);}
.vord .buy-kicker{font-size:11px;letter-spacing:.22em;color:var(--gold-soft);margin-bottom:12px;}
.vord .buy-head{font-size:21px;line-height:1.5;color:#fff;font-weight:700;margin:0 0 12px;}
.vord .buy-sub{font-size:13.5px;line-height:1.7;color:rgba(255,255,255,.62);margin:0 0 24px;}
.vord .buy-btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:9px;width:100%;max-width:340px;padding:17px 24px;border-radius:999px;background:linear-gradient(135deg,var(--gold-bright),var(--gold-deep));color:#17233f;font-size:15.5px;font-weight:700;letter-spacing:.02em;text-decoration:none;transition:transform .18s,box-shadow .18s;box-shadow:0 12px 30px -12px rgba(240,194,77,.6);animation:buyGlow 3.2s ease-in-out infinite;}
.vord .buy-btn:hover{transform:translateY(-2px);box-shadow:0 18px 38px -14px rgba(240,194,77,.85);animation-play-state:paused;}
/* 금색 광택이 주기적으로 훑고 지나감 */
.vord .buy-btn::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.6) 50%,transparent 62%);transform:translateX(-120%);animation:buyShine 3.2s ease-in-out infinite;}
.vord .buy-btn>*{position:relative;z-index:2;}
.vord .buy-arrow{transition:transform .18s;}
.vord .buy-btn:hover .buy-arrow{transform:translateX(3px);}
/* 버튼 뒤 은은한 후광 */
.vord .buy-halo{position:relative;display:inline-block;width:100%;}
.vord .buy-halo::before{content:"";position:absolute;left:50%;top:50%;width:min(100%,360px);height:64px;transform:translate(-50%,-50%);border-radius:999px;background:radial-gradient(ellipse at center,rgba(240,194,77,.32),transparent 70%);filter:blur(14px);animation:buyHalo 3.2s ease-in-out infinite;pointer-events:none;}
@keyframes buyShine{0%,55%{transform:translateX(-120%);}85%,100%{transform:translateX(120%);}}
@keyframes buyGlow{0%,100%{box-shadow:0 12px 30px -12px rgba(240,194,77,.55);}50%{box-shadow:0 16px 40px -12px rgba(240,194,77,.9);}}
@keyframes buyHalo{0%,100%{opacity:.5;}50%{opacity:1;}}
@media (prefers-reduced-motion:reduce){
  .vord .buy-btn,.vord .buy-btn::after,.vord .buy-halo::before{animation:none;}
  .vord .buy-btn::after{display:none;}
}
.vord .buy-note{font-size:11.5px;color:rgba(255,255,255,.45);margin:16px 0 0;letter-spacing:.02em;}
`;
