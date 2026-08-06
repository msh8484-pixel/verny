import { describe, it, expect } from "vitest";
import { aggregate } from "./aggregate";
import type { EventRow } from "@/lib/supabase";

// 테스트 기준시각: KST 2026-08-03 15:00 (= UTC 06:00)
const NOW = new Date("2026-08-03T06:00:00Z");
const V1 = "11111111-1111-1111-1111-111111111111";
const V2 = "22222222-2222-2222-2222-222222222222";
const S1 = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const S2 = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

function ev(p: Partial<EventRow>): EventRow {
  return { ts: "2026-08-03T05:00:00Z", type: "pageview", path: "/", vid: V1, sid: S1, value: null, referrer: null, device: "mobile", ...p };
}

const events: EventRow[] = [
  // V1/S1: 오늘 메인 → socks(75%) → order → 제출. 유입 google.
  ev({ ts: "2026-08-03T05:00:00Z", path: "/", referrer: "https://www.google.com/" }),
  ev({ ts: "2026-08-03T05:01:00Z", type: "scroll", path: "/", value: "100" }),
  ev({ ts: "2026-08-03T05:02:00Z", path: "/socks" }),
  ev({ ts: "2026-08-03T05:03:00Z", type: "scroll", path: "/socks", value: "75" }),
  ev({ ts: "2026-08-03T05:04:00Z", path: "/order" }),
  ev({ ts: "2026-08-03T05:05:00Z", type: "click", path: "/order", value: "order_submit" }),
  // V2/S2: 오늘, 최근 5분 이내(실시간), 메인만 보고 스토어 클릭. desktop.
  ev({ ts: "2026-08-03T05:58:00Z", path: "/", vid: V2, sid: S2, device: "desktop" }),
  ev({ ts: "2026-08-03T05:59:00Z", type: "click", path: "/", value: "store", vid: V2, sid: S2, device: "desktop" }),
  // V2: 어제 방문 (오늘 아님)
  ev({ ts: "2026-08-02T05:00:00Z", path: "/story", vid: V2, sid: "cccccccc-cccc-cccc-cccc-cccccccccccc", device: "desktop" }),
];

describe("aggregate (KST 기준)", () => {
  const d = aggregate(events, NOW, 30);

  it("오늘 요약: 방문자 2, 페이지뷰 4, 세션 2, 실시간 1", () => {
    expect(d.today).toEqual({ visitors: 2, pageviews: 4, sessions: 2, online: 1 });
  });
  it("일별 추이는 30개, 오늘 항목에 방문자 2", () => {
    expect(d.daily).toHaveLength(30);
    expect(d.daily[29]).toEqual({ date: "08.03", visitors: 2, pageviews: 4 });
    expect(d.daily[28]).toEqual({ date: "08.02", visitors: 1, pageviews: 1 });
  });
  it("시간대: KST 14시에 4뷰(05:58 UTC 포함), 15시는 0", () => {
    expect(d.hourly).toHaveLength(24);
    expect(d.hourly[14].views).toBe(4); // 05:00~05:58 UTC = 전부 KST 14시대
    expect(d.hourly[15]).toEqual({ hour: 15, views: 0 });
  });
  it("페이지: 메인 스크롤 100, socks 75", () => {
    const main = d.pages.find((p) => p.path === "/");
    expect(main?.views).toBe(2);
    expect(main?.avgScroll).toBe(100); // 스크롤 이벤트 있는 세션만 평균
    expect(d.pages.find((p) => p.path === "/socks")?.avgScroll).toBe(75);
  });
  it("퍼널: 방문2 → 제품열람1 → 구매안내1 → 스토어클릭1", () => {
    expect(d.funnel.map((f) => f.label)).toEqual(["사이트 방문", "제품 열람", "구매 안내 열람", "스토어 클릭"]);
    expect(d.funnel.map((f) => f.count)).toEqual([2, 1, 1, 1]);
    expect(d.funnel[0].rate).toBe(100);
    expect(d.funnel[3].rate).toBe(50);
  });
  it("여정: 최신 세션이 먼저, V2 여정에 스토어 클릭 스텝 포함", () => {
    expect(d.journeys[0].sid).toBe(S2);
    expect(d.journeys[0].steps.map((s) => s.label)).toEqual(["/", "스토어 클릭"]);
    expect(d.journeys[1].steps[0]).toEqual({ label: "/", scroll: 100 });
  });
  it("유입: google 1건", () => {
    expect(d.referrers[0]).toEqual({ source: "www.google.com", count: 1 });
  });
  it("디바이스: mobile 1, desktop 1 (방문자 기준)", () => {
    expect(d.devices).toContainEqual({ device: "mobile", count: 1 });
    expect(d.devices).toContainEqual({ device: "desktop", count: 1 });
  });
  it("rangeDays=1이면 어제 /story는 pages에서 빠진다", () => {
    const t = aggregate(events, NOW, 1);
    expect(t.pages.find((p) => p.path === "/story")).toBeUndefined();
  });
  it("rangeDays=1이어도 여정의 스크롤은 기간 밖 데이터를 유지한다", () => {
    const withScroll = [
      ...events,
      ev({ ts: "2026-08-02T05:01:00Z", type: "scroll", path: "/story", value: "50", vid: V2, sid: "cccccccc-cccc-cccc-cccc-cccccccccccc", device: "desktop" }),
    ];
    const t = aggregate(withScroll, NOW, 1);
    const j = t.journeys.find((x) => x.sid === "cccccccc-cccc-cccc-cccc-cccccccccccc");
    expect(j?.steps[0]).toEqual({ label: "/story", scroll: 50 });
  });
});
