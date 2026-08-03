// 원본 이벤트 → 대시보드 데이터 집계. 전부 순수 함수, 시간은 KST(UTC+9) 기준.
import type { EventRow } from "@/lib/supabase";

export type DashData = {
  today: { visitors: number; pageviews: number; sessions: number; online: number };
  daily: { date: string; visitors: number; pageviews: number }[];
  hourly: { hour: number; views: number }[];
  pages: { path: string; views: number; avgScroll: number }[];
  funnel: { label: string; count: number; rate: number }[];
  journeys: { sid: string; device: string; start: string; steps: { label: string; scroll: number | null }[] }[];
  referrers: { source: string; count: number }[];
  devices: { device: string; count: number }[];
};

const KST_MS = 9 * 60 * 60 * 1000;
const PRODUCT_PATHS = new Set(["/socks", "/details", "/lookbook", "/viewer"]);

function kst(ts: string | Date): Date {
  return new Date(new Date(ts).getTime() + KST_MS);
}
function dayKey(ts: string | Date): string {
  return kst(ts).toISOString().slice(0, 10); // YYYY-MM-DD (KST)
}
function hourOf(ts: string): number {
  return kst(ts).getUTCHours();
}
function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function aggregate(events: EventRow[], now: Date, rangeDays: number): DashData {
  const todayKey = dayKey(now);
  const pv = events.filter((e) => e.type === "pageview");
  const todayEv = events.filter((e) => dayKey(e.ts) === todayKey);
  const todayPv = todayEv.filter((e) => e.type === "pageview");
  const online = uniq(
    events
      .filter((e) => {
        const diff = now.getTime() - new Date(e.ts).getTime();
        return diff >= 0 && diff < 5 * 60 * 1000;
      })
      .map((e) => e.vid)
  ).length;

  // 기간 필터 (오늘=1: 오늘 0시 KST부터)
  const rangeStart = new Date(kst(now).setUTCHours(0, 0, 0, 0) - (rangeDays - 1) * 86400000 - KST_MS);
  const ranged = events.filter((e) => new Date(e.ts) >= rangeStart);
  const rangedPv = ranged.filter((e) => e.type === "pageview");

  // 일별 30일 추이
  const daily: DashData["daily"] = [];
  for (let i = 29; i >= 0; i--) {
    const key = dayKey(new Date(now.getTime() - i * 86400000));
    const dayPv = pv.filter((e) => dayKey(e.ts) === key);
    daily.push({ date: key.slice(5).replace("-", "."), visitors: uniq(dayPv.map((e) => e.vid)).length, pageviews: dayPv.length });
  }

  // 오늘 시간대별
  const hourly = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    views: todayPv.filter((e) => hourOf(e.ts) === hour).length,
  }));

  // 스크롤 최댓값 (sid|path)별 — 여정은 기간 무관이므로 전체 이벤트 기준
  const scrollMaxAll = new Map<string, number>();
  for (const e of events) {
    if (e.type !== "scroll" || !e.value) continue;
    const k = `${e.sid}|${e.path}`;
    scrollMaxAll.set(k, Math.max(scrollMaxAll.get(k) ?? 0, Number(e.value)));
  }

  // 페이지별 조회수 + 평균 스크롤 — 기간 내 데이터만, 단일 패스 그룹핑
  const pathViews = new Map<string, number>();
  for (const e of rangedPv) pathViews.set(e.path, (pathViews.get(e.path) ?? 0) + 1);
  const scrollMaxRanged = new Map<string, { path: string; max: number }>();
  for (const e of ranged) {
    if (e.type !== "scroll" || !e.value) continue;
    const k = `${e.sid}|${e.path}`;
    const v = Number(e.value);
    const cur = scrollMaxRanged.get(k);
    if (!cur || v > cur.max) scrollMaxRanged.set(k, { path: e.path, max: v });
  }
  const depthByPath = new Map<string, { sum: number; n: number }>();
  for (const { path, max } of scrollMaxRanged.values()) {
    const d = depthByPath.get(path) ?? { sum: 0, n: 0 };
    d.sum += max;
    d.n += 1;
    depthByPath.set(path, d);
  }
  const pages = [...pathViews.entries()]
    .map(([path, views]) => {
      const d = depthByPath.get(path);
      return { path, views, avgScroll: d ? Math.round(d.sum / d.n) : 0 };
    })
    .sort((a, b) => b.views - a.views);

  // 퍼널 (기간 내 고유 방문자 기준)
  const vids = uniq(rangedPv.map((e) => e.vid));
  const productVids = uniq(rangedPv.filter((e) => PRODUCT_PATHS.has(e.path)).map((e) => e.vid));
  const interestVids = uniq(
    ranged.filter((e) => (e.type === "pageview" && e.path === "/order") || (e.type === "click" && e.value === "store")).map((e) => e.vid)
  );
  const orderVids = uniq(ranged.filter((e) => e.type === "click" && e.value === "order_submit").map((e) => e.vid));
  const base = vids.length || 1;
  const funnel = [
    { label: "사이트 방문", count: vids.length },
    { label: "제품 열람", count: productVids.length },
    { label: "주문 관심(주문폼·스토어)", count: interestVids.length },
    { label: "주문 제출", count: orderVids.length },
  ].map((f) => ({ ...f, rate: Math.round((f.count / base) * 100) }));

  // 방문자 여정 (최근 20세션, 최신순)
  const bySid = new Map<string, EventRow[]>();
  for (const e of events) {
    if (!bySid.has(e.sid)) bySid.set(e.sid, []);
    bySid.get(e.sid)!.push(e);
  }
  const journeys = [...bySid.values()]
    .map((list) => list.sort((a, b) => a.ts.localeCompare(b.ts)))
    .sort((a, b) => b[0].ts.localeCompare(a[0].ts))
    .slice(0, 20)
    .map((list) => ({
      sid: list[0].sid,
      device: list[0].device ?? "-",
      start: list[0].ts,
      steps: list
        .filter((e) => e.type === "pageview" || e.type === "click")
        .map((e) =>
          e.type === "click"
            ? { label: e.value === "order_submit" ? "주문 제출" : "스토어 클릭", scroll: null }
            : { label: e.path, scroll: scrollMaxAll.get(`${e.sid}|${e.path}`) ?? null }
        ),
    }));

  // 유입 경로 (외부 referrer의 호스트명)
  const refCount = new Map<string, number>();
  for (const e of rangedPv) {
    if (!e.referrer) continue;
    let host = e.referrer;
    try {
      host = new URL(e.referrer).hostname;
    } catch {
      /* 그대로 사용 */
    }
    refCount.set(host, (refCount.get(host) ?? 0) + 1);
  }
  const referrers = [...refCount.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 디바이스 (기간 내 고유 방문자 기준)
  const devMap = new Map<string, Set<string>>();
  for (const e of rangedPv) {
    const d = e.device ?? "unknown";
    if (!devMap.has(d)) devMap.set(d, new Set());
    devMap.get(d)!.add(e.vid);
  }
  const devices = [...devMap.entries()].map(([device, s]) => ({ device, count: s.size }));

  return {
    today: {
      visitors: uniq(todayPv.map((e) => e.vid)).length,
      pageviews: todayPv.length,
      sessions: uniq(todayPv.map((e) => e.sid)).length,
      online,
    },
    daily,
    hourly,
    pages,
    funnel,
    journeys,
    referrers,
    devices,
  };
}
