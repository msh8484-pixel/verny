// VERNY image library — generated lookbook / product / studio assets.
// Files live in public/lib/** (webp). All lookbook & foot shots are 4:5 (928x1152).
// Studio & product cuts are 4:5 as well. See agent-input/verny-lib for source PNGs.

export type Sock = "navy" | "charcoal" | "black";

export interface LookItem {
  src: string;
  alt: string;
  color?: Sock;
  tall?: boolean; // hint for masonry emphasis
}

// Street-style lookbook — multinational, suit & semi-formal, Instagram mood.
export const LOOKBOOK: LookItem[] = [
  { src: "/lib/lookbook/ss1-linen-navy.webp", alt: "리넨 세미정장, 네이비 삭스", color: "navy" },
  { src: "/lib/lookbook/sa1-black-navy.webp", alt: "네이비 수트 스트라이드", color: "navy" },
  { src: "/lib/lookbook/ss3-black-autumn.webp", alt: "그레이 더블브레스트, 가을 거리", color: "charcoal" },
  { src: "/lib/lookbook/sa2-asian-grey.webp", alt: "라이트 그레이 세미정장", color: "charcoal" },
  { src: "/lib/lookbook/ss5-tweed-gentleman.webp", alt: "트위드 쓰리피스, 올드타운", color: "navy" },
  { src: "/lib/lookbook/sa5-southasian-char.webp", alt: "차콜 쓰리피스, 시티 월", color: "black" },
  { src: "/lib/lookbook/ss8-cafe-reading.webp", alt: "카페 테라스, 다리 꼬고", color: "navy" },
  { src: "/lib/lookbook/ss2-asian-black.webp", alt: "블랙 수트, 모던 시티", color: "black" },
  { src: "/lib/lookbook/sa4-latino-beige.webp", alt: "베이지 세미정장, 스텝", color: "black" },
  { src: "/lib/lookbook/ss4-latino-bizcasual.webp", alt: "비즈니스 캐주얼, 카페 레일", color: "navy" },
  { src: "/lib/lookbook/ss6-charcoal-glass.webp", alt: "차콜 슬림 수트, 글래스 빌딩", color: "black" },
  { src: "/lib/lookbook/sa3-euro-navy.webp", alt: "더블브레스트 네이비, 크로스워크", color: "navy" },
  { src: "/lib/lookbook/lk1.webp", alt: "네이비 수트, 스톤 플라자", color: "navy" },
  { src: "/lib/lookbook/lk2.webp", alt: "그레이 더블브레스트, 컬럼", color: "black" },
  { src: "/lib/lookbook/lk3.webp", alt: "차콜 쓰리피스, 가로수길", color: "charcoal" },
  { src: "/lib/lookbook/lk4.webp", alt: "베이지 리넨 세미정장, 코트야드", color: "navy" },
  { src: "/lib/lookbook/lk5.webp", alt: "트위드 수트, 코블스톤", color: "navy" },
  { src: "/lib/lookbook/lk6.webp", alt: "블랙 슬림 수트, 콘크리트 월", color: "black" },
  { src: "/lib/lookbook/lk7.webp", alt: "네이비 블레이저, 벤치", color: "navy" },
  { src: "/lib/lookbook/lk8.webp", alt: "그레이 플란넬, 스톤 스텝", color: "charcoal" },
];

// Foot / shoe detail — various shoes and angles.
export const FOOT: LookItem[] = [
  { src: "/lib/foot/sd1-loafer-navy.webp", alt: "스웨이드 로퍼 + 네이비 삭스, 측면", color: "navy" },
  { src: "/lib/foot/sb2-topdown-black.webp", alt: "블랙 옥스포드 + 블랙 삭스, 오버헤드", color: "black" },
  { src: "/lib/foot/sb3-monk-charcoal.webp", alt: "더블몽크 + 차콜 삭스, 3/4", color: "charcoal" },
  { src: "/lib/foot/sb4-brogue-navy.webp", alt: "브로그 + 네이비 삭스, 매크로", color: "navy" },
  { src: "/lib/foot/sd2-front-derby.webp", alt: "더비 + 네이비 삭스, 정면", color: "navy" },
  { src: "/lib/foot/sb5-derby-navy.webp", alt: "더비 + 네이비 삭스, 스툴", color: "navy" },
  { src: "/lib/foot/sd3-back-heel.webp", alt: "옥스포드 + 블랙 삭스, 뒷굽", color: "black" },
  { src: "/lib/foot/sb6-motion-black.webp", alt: "더비 + 블랙 삭스, 보행", color: "black" },
  { src: "/lib/foot/fd1.webp", alt: "스웨이드 태슬로퍼 + 네이비", color: "navy" },
  { src: "/lib/foot/fd2.webp", alt: "홀컷 옥스포드 + 블랙", color: "black" },
  { src: "/lib/foot/fd3.webp", alt: "탠 더비 + 차콜, 3/4", color: "charcoal" },
  { src: "/lib/foot/fd4.webp", alt: "몽크스트랩 + 네이비, 매크로", color: "navy" },
  { src: "/lib/foot/fd5.webp", alt: "페니로퍼 + 차콜, 오버헤드", color: "charcoal" },
  { src: "/lib/foot/fd6.webp", alt: "더블몽크 + 블랙, 측면", color: "black" },
  { src: "/lib/foot/fd7.webp", alt: "스웨이드 로퍼 + 네이비, 체어", color: "navy" },
  { src: "/lib/foot/fd8.webp", alt: "브로그 + 차콜, 보행", color: "charcoal" },
];

// Product cuts — cool shell-white, no label.
export const PRODUCT: Record<Sock | "trio", { src: string; alt: string }> = {
  trio: { src: "/lib/product/pt-trio-cool.webp", alt: "3색 리브 정장 양말" },
  navy: { src: "/lib/product/pn-navy-cool.webp", alt: "딥 네이비 리브 정장 양말" },
  charcoal: { src: "/lib/product/pc-charcoal-cool.webp", alt: "차콜 리브 정장 양말" },
  black: { src: "/lib/product/pb-black-cool.webp", alt: "블랙 리브 정장 양말" },
};

export const STUDIO = {
  cool: { src: "/lib/studio/hero-cool.webp", alt: "VERNY 기프트 세트 — 박스 · 봉투 · 행택" },
  warm: { src: "/lib/studio/hero-warm.webp", alt: "VERNY 기프트 세트 — 박스 · 봉투 · 행택" },
};

// Real product spec (from product-label.png).
export const SPEC = {
  name: "신사 정장 양말",
  size: "FREE (250–280mm)",
  blend: "면 70 · 나일론 25 · 폴리우레탄 5",
  origin: "MADE IN KOREA",
  maker: "㈜베러스 (BETTERUS)",
  colors: ["black", "navy", "charcoal"] as Sock[],
};
