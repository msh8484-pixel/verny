"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function VValues() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(quoteRef.current, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: quoteRef.current, start: "top 80%", once: true },
      });
      gsap.fromTo(imgRef.current, { opacity: 0, scale: 0.96 }, {
        opacity: 1, scale: 1, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: imgRef.current, start: "top 75%", once: true },
      });
      gsap.fromTo(".value-item", { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 60%", once: true },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pad"
      style={{ backgroundColor: "#0a1528", padding: "80px 40px", overflow: "hidden" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* 인용구 + 사진 2열 */}
        <div
          className="grid-2-col"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", marginBottom: 72 }}
        >
          <div ref={quoteRef} style={{ opacity: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.3em", marginBottom: 28 }}>BRAND PHILOSOPHY</p>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(20px, 2.5vw, 34px)",
                fontWeight: 400, fontStyle: "italic", color: "#ffffff", lineHeight: 1.6,
                borderLeft: "3px solid #C9A84C", paddingLeft: 28, marginBottom: 32,
              }}
            >
              "우리는 양말 한 켤레를 만들면서<br />
              <span style={{ color: "#C9A84C" }}>타협이라는 단어를 삭제했습니다.</span>"
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.9 }}>
              VERNY는 눈에 띄는 로고 대신 소재와 구조로 말합니다.
              신사 정장의 마지막 디테일을 완성하는 브랜드입니다.
            </p>
          </div>

          <div ref={imgRef} style={{ opacity: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/box-stack.jpg"
              alt="VERNY 패키징"
              loading="lazy"
              decoding="async"
              style={{ width: "100%", borderRadius: 6, boxShadow: "0 20px 50px rgba(0,0,0,0.4)", display: "block" }}
            />
          </div>
        </div>

        {/* 가치 카드 3개 */}
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderTop: "1px solid rgba(201,168,76,0.15)" }}
          className="grid-3-col"
        >
          {[
            { img: "/product-label.webp", title: "국내 봉제 생산", desc: "국내 검증된 봉제 공장, MADE IN KOREA. 소재 구성을 라벨에 정직하게 표기합니다." },
            { img: "/shopping-bag.webp", title: "정직한 사이즈", desc: "갑종 기준 250~280mm, 워싱 수축까지 적용된 실착용 사이즈입니다." },
            { img: "/gift-set.webp", title: "패키징도 제품입니다", desc: "네이비 박스와 골드 포일 로고. 선물용으로도 완벽한 VERNY 경험." },
          ].map((v, i) => (
            <div
              key={v.title}
              className="value-item value-card"
              style={{
                padding: "36px 28px", opacity: 0,
                borderRight: i < 2 ? "1px solid rgba(201,168,76,0.1)" : "none",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.img} alt={v.title}
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 4, marginBottom: 20, opacity: 0.85 }}
              />
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 500, color: "#ffffff", marginBottom: 10 }}>{v.title}</h4>
              <div style={{ width: 20, height: 1, backgroundColor: "#C9A84C", marginBottom: 12 }} />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
