"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DETAILS = [
  {
    num: "01", title: "흘러내리지 않는 구조", en: "RIB 8:2 STRUCTURE",
    desc: "리브 8, 플레인 2의 황금비율. 착용 내내 발목 라인을 완벽히 유지합니다. 회의실부터 퇴근길까지 단 한 번도 올려 당기지 않아도 됩니다.",
    img: "/sock-spec.webp", imgPos: "top center",
  },
  {
    num: "02", title: "6cm 라이크라 커프밴드", en: "LYCRA CUFF BAND",
    desc: "라이크라 혼방 소재의 6cm 커프밴드. 적절한 압박으로 밀착하되 혈액순환을 방해하지 않습니다. 면 70%의 천연 감촉과 함께 8시간 이상 제자리를 지킵니다.",
    img: "/socks-3color.webp", imgPos: "center 20%",
  },
  {
    num: "03", title: "선물이 되는 패키징", en: "PREMIUM PACKAGING",
    desc: "네이비 박스에 골드 포일 로고. 개인 사용부터 비즈니스 선물까지 — VERNY는 상자를 열기 전부터 신뢰를 전달합니다.",
    img: "/box-hero.jpg", imgPos: "center center",
  },
];

export default function VDetails() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".detail-card", { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.9, stagger: 0.18, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%", once: true },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pad"
      style={{ backgroundColor: "#F9F6EF", padding: "80px 40px", overflow: "hidden" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.3em", marginBottom: 14 }}>THE DETAILS</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 3.5vw, 52px)", fontWeight: 500, color: "#0a1528", lineHeight: 1.2 }}>
            디테일이 신뢰가 됩니다
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {DETAILS.map((d, i) => (
            <div
              key={d.num}
              className="detail-card grid-2-col"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", opacity: 0, overflow: "hidden", borderRadius: 6, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
            >
              {/* 이미지 */}
              <div
                className="detail-img"
                style={{ order: i % 2 === 0 ? 0 : 1, minHeight: 300, position: "relative", overflow: "hidden" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.img}
                  alt={d.title}
                  loading="lazy"
                  decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: d.imgPos, display: "block", transition: "transform 0.5s ease" }}
                  onMouseOver={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)"; }}
                  onMouseOut={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                />
                <div style={{ position: "absolute", top: 16, left: 16, fontFamily: "var(--font-serif)", fontSize: 64, fontWeight: 700, color: "rgba(255,255,255,0.1)", lineHeight: 1, pointerEvents: "none" }}>
                  {d.num}
                </div>
              </div>

              {/* 텍스트 */}
              <div
                className="detail-text"
                style={{
                  order: i % 2 === 0 ? 1 : 0,
                  padding: "56px 48px",
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  backgroundColor: i % 2 === 0 ? "#ffffff" : "#0a1528",
                }}
              >
                <p style={{ fontSize: 10, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.3em", marginBottom: 18 }}>{d.en}</p>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(22px, 2.5vw, 34px)", fontWeight: 500, color: i % 2 === 0 ? "#0a1528" : "#ffffff", lineHeight: 1.3, marginBottom: 18 }}>
                  {d.title}
                </h3>
                <div style={{ width: 28, height: 2, backgroundColor: "#C9A84C", marginBottom: 20 }} />
                <p style={{ fontSize: 14, color: i % 2 === 0 ? "#555" : "rgba(255,255,255,0.55)", lineHeight: 1.9 }}>{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
