// 클라이언트 전용 추적 헬퍼. 실패해도 절대 throw 하지 않는다.
const VID_KEY = "vny_vid";
const SID_KEY = "vny_sid";
const SID_TS_KEY = "vny_sid_ts";
const SESSION_MS = 30 * 60 * 1000; // 30분 무활동 시 새 세션

function enabled(): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.pathname.startsWith("/dash")) return false;
  if (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_TRACK_DEV !== "1") return false;
  return true;
}

function getVid(): string {
  let v = localStorage.getItem(VID_KEY);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(VID_KEY, v);
  }
  return v;
}

function getSid(): string {
  const now = Date.now();
  const last = Number(sessionStorage.getItem(SID_TS_KEY) || 0);
  let s = sessionStorage.getItem(SID_KEY);
  if (!s || now - last > SESSION_MS) {
    s = crypto.randomUUID();
    sessionStorage.setItem(SID_KEY, s);
  }
  sessionStorage.setItem(SID_TS_KEY, String(now));
  return s;
}

function device(): "mobile" | "desktop" {
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

export function track(
  type: "pageview" | "scroll" | "click",
  data: { path?: string; value?: string; referrer?: string } = {}
): void {
  if (!enabled()) return;
  try {
    const payload = JSON.stringify({
      type,
      path: data.path ?? window.location.pathname,
      vid: getVid(),
      sid: getSid(),
      value: data.value,
      referrer: data.referrer,
      device: device(),
    });
    const blob = new Blob([payload], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/track", blob)) {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // 무시
  }
}
