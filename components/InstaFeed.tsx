"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { EXT, INSTAGRAM_URL } from "@/data/shop";

type Post = {
  src: string;
  handle: string;
  place: string;
  likes: string;
  liked: boolean;
  caption: string;
  comments: number;
  reply: { user: string; text: string };
};

const POSTS: Post[] = [
  { src: "/lib/ig/post1.webp", handle: "jinwoo.fit", place: "Seongsu", likes: "1,204", liked: true,
    caption: "카페에서 잠깐 ☕", comments: 38, reply: { user: "seongsu.daily", text: "네이비 색감 진짜 좋네요" } },
  { src: "/lib/ig/lb2.webp", handle: "flannel.day", place: "Seoul", likes: "1,067", liked: true,
    caption: "그레이 플란넬", comments: 21, reply: { user: "gent.log", text: "오프화이트 삭스도 궁금" } },
  { src: "/lib/ig/new2.webp", handle: "class.fit", place: "Euljiro", likes: "1,332", liked: true,
    caption: "블랙 미니멀 🖤", comments: 29, reply: { user: "ootd.kim", text: "정장에 딱" } },
  { src: "/lib/ig/a2.webp", handle: "seongsu.daily", place: "Seongsu", likes: "864", liked: false,
    caption: "차콜 데일리룩", comments: 24, reply: { user: "minjae.style", text: "차콜 색감 예술이네요" } },
  { src: "/lib/ig/new4.webp", handle: "art.mood", place: "Hannam", likes: "1,576", liked: true,
    caption: "전시 보러 🖼️", comments: 27, reply: { user: "gent.log", text: "핏 좋으시네요" } },
  { src: "/lib/ig/post2.webp", handle: "gent.log", place: "Ikseon", likes: "1,033", liked: true,
    caption: "계단에 걸터앉아", comments: 22, reply: { user: "class.fit", text: "발끝까지 완벽" } },
  { src: "/lib/ig/new1.webp", handle: "daily.hs", place: "Seoul", likes: "712", liked: false,
    caption: "커피 한 잔 ☕", comments: 14, reply: { user: "river.mood", text: "편해보여요" } },
  { src: "/lib/ig/a3.webp", handle: "minjae.style", place: "Gangnam", likes: "2,051", liked: true,
    caption: "네이비 골지 데일리", comments: 31, reply: { user: "han.weekend", text: "어디 제품이에요??" } },
  { src: "/lib/ig/lb3.webp", handle: "casual.k", place: "Yeonnam", likes: "934", liked: false,
    caption: "치노에 몽크스트랩", comments: 18, reply: { user: "footnote.kr", text: "네이비 삭스 포인트 굿" } },
  { src: "/lib/ig/lb1.webp", handle: "footnote.kr", place: "Seoul", likes: "1,442", liked: true,
    caption: "오늘의 발끝 👞", comments: 30, reply: { user: "minjae.style", text: "핏 미쳤다" } },
  { src: "/lib/ig/post4.webp", handle: "style.log", place: "Seoul", likes: "1,270", liked: true,
    caption: "블랙은 진리", comments: 33, reply: { user: "today_fit", text: "이거 어디서 사나요!" } },
  { src: "/lib/ig/lb5.webp", handle: "autumn.fit", place: "Seoul Forest", likes: "876", liked: false,
    caption: "코듀로이 데일리", comments: 15, reply: { user: "weekend.mood", text: "색 조합 좋아요" } },
  { src: "/lib/ig/a4.webp", handle: "weekend.mood", place: "Seoul Forest", likes: "588", liked: false,
    caption: "산책 나온 김에", comments: 10, reply: { user: "jinwoo.fit", text: "편해보여요" } },
  { src: "/lib/ig/new9.webp", handle: "river.mood", place: "Han River", likes: "1,489", liked: true,
    caption: "한강 나들이 🌊", comments: 26, reply: { user: "quiet.walk", text: "날씨 좋다" } },
  { src: "/lib/ig/a5.webp", handle: "dinner.look", place: "Hannam", likes: "996", liked: true,
    caption: "약속엔 클래식하게", comments: 28, reply: { user: "jinwoo.fit", text: "선물용으로 최고" } },
  { src: "/lib/ig/lb4.webp", handle: "lounge.fit", place: "Seoul", likes: "1,150", liked: true,
    caption: "소파에 앉아 한 컷", comments: 19, reply: { user: "classic.fit", text: "탠 더비 좋네요" } },
  { src: "/lib/ig/new5.webp", handle: "stay.look", place: "Hotel", likes: "918", liked: false,
    caption: "라운지에서", comments: 16, reply: { user: "dinner.look", text: "블랙 재구매 각" } },
  { src: "/lib/ig/post5.webp", handle: "quiet.walk", place: "Seongsu", likes: "533", liked: false,
    caption: "바람 쐬러", comments: 9, reply: { user: "hannam.fit", text: "핏 좋다" } },
  { src: "/lib/ig/new7.webp", handle: "hannam.fit", place: "Hannam", likes: "1,104", liked: true,
    caption: "골목 산책", comments: 20, reply: { user: "seongsu.daily", text: "차콜 데일리로 최고" } },
  { src: "/lib/ig/post8.webp", handle: "moodgrey", place: "Studio", likes: "743", liked: true,
    caption: "빛 좋은 날 ☀️", comments: 19, reply: { user: "stay.look", text: "촉감 좋더라구요 👍" } },
  { src: "/lib/ig/lb6.webp", handle: "classic.fit", place: "Jung-gu", likes: "1,388", liked: true,
    caption: "핀스트라이프엔 브라운", comments: 26, reply: { user: "class.fit", text: "정석이네요" } },
  { src: "/lib/ig/a7.webp", handle: "book.mood", place: "Hannam", likes: "905", liked: false,
    caption: "창가에서", comments: 15, reply: { user: "seongsu.daily", text: "분위기 좋다" } },
  { src: "/lib/ig/lb7.webp", handle: "mono.fit", place: "Seoul", likes: "1,205", liked: true,
    caption: "올블랙 마무리", comments: 22, reply: { user: "art.mood", text: "깔끔하다" } },
  { src: "/lib/ig/post11.webp", handle: "seoul.gentleman", place: "Yongsan", likes: "3,127", liked: true,
    caption: "루프탑에서", comments: 53, reply: { user: "today_fit", text: "촉감 좋더라구요 👍" } },
  { src: "/lib/ig/post12.webp", handle: "today_fit", place: "Hotel", likes: "1,020", liked: false,
    caption: "로비에서 잠깐", comments: 17, reply: { user: "dinner.look", text: "선물용으로 최고" } },
];

function Icon({ d, fill = "none" }: { d: string; fill?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const HEART = "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z";
const COMMENT = "M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z";
const SEND = "M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z";
const BOOKMARK = "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z";

function Card({ p }: { p: Post }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 4, overflow: "hidden" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px" }}>
        <span
          style={{
            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
            background: "var(--navy)", color: "var(--gold-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-serif)", fontSize: 13,
          }}
        >
          V
        </span>
        <div style={{ lineHeight: 1.25, flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>{p.handle}</div>
          <div style={{ fontSize: 10.5, color: "var(--ink-soft)" }}>{p.place}</div>
        </div>
        <span style={{ color: "var(--ink-soft)", fontSize: 18, letterSpacing: 1 }}>⋯</span>
      </div>

      {/* image */}
      <div style={{ position: "relative", aspectRatio: "1/1", background: "var(--paper-2)" }}>
        <Image src={p.src} alt={p.handle} fill sizes="(max-width:900px) 90vw, 340px" style={{ objectFit: "cover" }} />
      </div>

      {/* actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 12px 6px", color: "var(--ink)" }}>
        <span style={{ color: p.liked ? "#e0245e" : "var(--ink)" }}>
          <Icon d={HEART} fill={p.liked ? "#e0245e" : "none"} />
        </span>
        <Icon d={COMMENT} />
        <Icon d={SEND} />
        <span style={{ marginLeft: "auto" }}><Icon d={BOOKMARK} /></span>
      </div>

      {/* text */}
      <div style={{ padding: "0 12px 14px", fontSize: 12.5, lineHeight: 1.55 }}>
        <div style={{ fontWeight: 600, marginBottom: 5 }}>좋아요 {p.likes}개</div>
        <div>
          <span style={{ fontWeight: 600 }}>{p.handle}</span> <span style={{ color: "var(--ink)" }}>{p.caption}</span>
        </div>
        <div style={{ color: "var(--ink-soft)", margin: "5px 0" }}>댓글 {p.comments}개 모두 보기</div>
        <div>
          <span style={{ fontWeight: 600 }}>{p.reply.user}</span> <span>{p.reply.text}</span>
        </div>
      </div>
    </div>
  );
}

export default function InstaFeed() {
  return (
    <section id="instagram" className="section" style={{ background: "var(--paper-2)", borderTop: "1px solid var(--line)" }}>
      <Reveal>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <span className="eyebrow">As Worn</span>
          <h2 className="serif" style={{ fontSize: "clamp(24px,3.2vw,38px)", fontWeight: 500, color: "var(--navy)", marginTop: 8, letterSpacing: "0.04em" }}>
            @verny.official
          </h2>
        </div>
      </Reveal>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
          maxWidth: 1040,
          margin: "0 auto",
        }}
      >
        {POSTS.map((p, i) => (
          <Reveal key={p.src} delay={(i % 3) * 0.06}>
            <Card p={p} />
          </Reveal>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 40 }}>
        <a href={INSTAGRAM_URL} {...EXT} className="btn btn-ghost" style={{ padding: "13px 30px" }}>Follow</a>
      </div>
    </section>
  );
}
