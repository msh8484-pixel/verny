// /api/track 입력 검증 — 화이트리스트 밖의 값은 전부 거부한다.
export type TrackEvent = {
  type: "pageview" | "scroll" | "click";
  path: string;
  vid: string;
  sid: string;
  value: string | null;
  referrer: string | null;
  device: string | null;
};

const TYPES = new Set(["pageview", "scroll", "click"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SCROLL_VALUES = new Set(["25", "50", "75", "100"]);
const CLICK_VALUES = new Set(["store", "order_submit"]);
const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse/i;

export function isBot(ua: string | null): boolean {
  return !!ua && BOT_RE.test(ua);
}

export function parseEvent(raw: unknown): TrackEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const type = typeof b.type === "string" ? b.type : "";
  const path = typeof b.path === "string" ? b.path : "";
  const vid = typeof b.vid === "string" ? b.vid : "";
  const sid = typeof b.sid === "string" ? b.sid : "";
  if (!TYPES.has(type)) return null;
  if (!path.startsWith("/") || path.length > 200 || path.startsWith("/dash")) return null;
  if (!UUID_RE.test(vid) || !UUID_RE.test(sid)) return null;

  let value: string | null = null;
  if (type === "scroll") {
    if (!SCROLL_VALUES.has(String(b.value))) return null;
    value = String(b.value);
  } else if (type === "click") {
    if (!CLICK_VALUES.has(String(b.value))) return null;
    value = String(b.value);
  }
  const referrer = typeof b.referrer === "string" && b.referrer ? b.referrer.slice(0, 300) : null;
  const device = b.device === "mobile" || b.device === "desktop" ? (b.device as string) : null;
  return { type: type as TrackEvent["type"], path, vid, sid, value, referrer, device };
}
