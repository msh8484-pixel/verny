# 베르니 방문자 통계 대시보드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 방문자 이벤트(페이지뷰·스크롤 깊이·전환 클릭)를 Supabase에 수집하고, 푸터 5클릭 + 비밀번호로 진입하는 숨겨진 `/dash` 대시보드에서 통계를 그래프로 보여준다.

**Architecture:** 클라이언트 `<Tracker/>`가 이벤트를 `POST /api/track`으로 전송 → 서버가 검증 후 Supabase `events` 테이블에 REST로 INSERT. `/dash`는 서버 컴포넌트가 쿠키 인증 확인 후 Supabase에서 원본 이벤트를 페이지 단위로 읽어 순수 함수로 집계, Recharts 클라이언트 컴포넌트에 전달해 렌더.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Supabase REST(PostgREST, supabase-js 미사용 — `fetch` 직접 호출), Recharts, vitest(순수 로직 테스트), Node `crypto`(HMAC 쿠키 토큰).

**설계서:** `docs/superpowers/specs/2026-08-03-analytics-dashboard-design.md`

## Global Constraints

- Next.js 16 — API가 학습 데이터와 다를 수 있음. 의심되면 `node_modules/next/dist/docs/` 확인. `cookies()`는 **async**, page의 `searchParams`는 **Promise**.
- 서버 환경변수(로컬 `.env.local` + Vercel Production 등록 완료): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Task 4에서 추가: `DASH_PASSWORD`(기본 `1234`), `DASH_SECRET`.
- Supabase 키는 **서버 코드에서만** 사용. 클라이언트 번들에 절대 노출 금지 (`NEXT_PUBLIC_` 접두사 금지).
- 추적 실패가 사이트 UX에 영향을 주면 안 됨: `/api/track`은 항상 204, 클라이언트는 try/catch + sendBeacon.
- 수집 제외: `/dash` 경로, 봇 UA, 개발 환경(단 `NEXT_PUBLIC_TRACK_DEV=1`이면 dev에서도 수집 — 검증용).
- 대시보드 경로 `/dash`는 noindex. robots.txt에 `/dash`를 **적지 않는다**(경로 노출 방지 — 스펙의 "robots 차단"은 meta noindex로 갈음, 링크가 없어 크롤러가 발견할 수 없음).
- 스타일은 기존 코드 관례대로 인라인 style 객체 사용. 대시보드는 사이트와 무관한 다크 팔레트.
- 커밋 메시지는 기존 저장소 관례(한국어, `feat:`/`fix:`/`chore:` 접두사) 유지.
- **선행 조건:** Supabase에 `events` 테이블 필요 — `supabase/migrations/0001_events.sql`을 Supabase SQL Editor에서 실행(사용자 액션). Task 2 검증 전까지 완료돼 있어야 함.

---

### Task 1: 테스트 러너 + 이벤트 검증 모듈

**Files:**
- Modify: `package.json` (vitest devDep + test 스크립트)
- Create: `lib/analytics/validate.ts`
- Test: `lib/analytics/validate.test.ts`

**Interfaces:**
- Produces: `parseEvent(raw: unknown): TrackEvent | null`, `isBot(ua: string | null): boolean`, `type TrackEvent = { type: "pageview"|"scroll"|"click"; path: string; vid: string; sid: string; value: string | null; referrer: string | null; device: string | null }` — Task 2가 사용.

- [ ] **Step 1: vitest 설치 + 스크립트**

```bash
npm i -D vitest
```

`package.json`의 `scripts`에 추가: `"test": "vitest run"`

- [ ] **Step 2: 실패하는 테스트 작성**

`lib/analytics/validate.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseEvent, isBot } from "./validate";

const VID = "11111111-2222-3333-4444-555555555555";
const SID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const base = { type: "pageview", path: "/socks", vid: VID, sid: SID };

describe("parseEvent", () => {
  it("정상 pageview를 통과시킨다", () => {
    const ev = parseEvent({ ...base, referrer: "https://google.com", device: "mobile" });
    expect(ev).toMatchObject({ type: "pageview", path: "/socks", vid: VID, sid: SID, device: "mobile" });
  });
  it("알 수 없는 type은 거부", () => {
    expect(parseEvent({ ...base, type: "hack" })).toBeNull();
  });
  it("path가 /로 시작하지 않으면 거부", () => {
    expect(parseEvent({ ...base, path: "javascript:alert(1)" })).toBeNull();
  });
  it("/dash 경로는 거부", () => {
    expect(parseEvent({ ...base, path: "/dash" })).toBeNull();
  });
  it("vid가 UUID가 아니면 거부", () => {
    expect(parseEvent({ ...base, vid: "abc" })).toBeNull();
  });
  it("scroll은 25/50/75/100만 허용", () => {
    expect(parseEvent({ ...base, type: "scroll", value: "50" })?.value).toBe("50");
    expect(parseEvent({ ...base, type: "scroll", value: "33" })).toBeNull();
  });
  it("click은 store/order_submit만 허용", () => {
    expect(parseEvent({ ...base, type: "click", value: "order_submit" })?.value).toBe("order_submit");
    expect(parseEvent({ ...base, type: "click", value: "xss" })).toBeNull();
  });
  it("device가 이상하면 null로 정규화", () => {
    expect(parseEvent({ ...base, device: "toaster" })?.device).toBeNull();
  });
  it("긴 referrer는 300자로 자른다", () => {
    const ev = parseEvent({ ...base, referrer: "r".repeat(500) });
    expect(ev?.referrer?.length).toBe(300);
  });
  it("객체가 아니면 거부", () => {
    expect(parseEvent(null)).toBeNull();
    expect(parseEvent("x")).toBeNull();
  });
});

describe("isBot", () => {
  it("Googlebot을 잡는다", () => {
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
  });
  it("일반 브라우저는 통과", () => {
    expect(isBot("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(false);
  });
  it("null은 봇 아님", () => {
    expect(isBot(null)).toBe(false);
  });
});
```

- [ ] **Step 3: 실패 확인**

Run: `npx vitest run lib/analytics/validate.test.ts`
Expected: FAIL — `Cannot find module './validate'`

- [ ] **Step 4: 구현**

`lib/analytics/validate.ts`:

```ts
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
```

- [ ] **Step 5: 통과 확인**

Run: `npx vitest run lib/analytics/validate.test.ts`
Expected: PASS (13 tests)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/analytics/validate.ts lib/analytics/validate.test.ts
git commit -m "feat(analytics): 이벤트 검증 모듈 + vitest 테스트 환경"
```

---

### Task 2: Supabase 서버 헬퍼 + 수집 API

**Files:**
- Create: `lib/supabase.ts`
- Create: `app/api/track/route.ts`

**Interfaces:**
- Consumes: Task 1의 `parseEvent`, `isBot`.
- Produces: `insertEvent(row: TrackEvent): Promise<void>`, `fetchEventsSince(sinceIso: string): Promise<EventRow[]>`, `type EventRow = TrackEvent & { ts: string }` — Task 5·6이 사용.

- [ ] **Step 1: Supabase 헬퍼 구현**

`lib/supabase.ts`:

```ts
// Supabase PostgREST 직접 호출 — supabase-js 의존성 없이 서버 전용으로 사용.
// SERVICE_ROLE 키는 RLS를 우회하므로 이 파일을 클라이언트에서 import 하면 안 된다.
import type { TrackEvent } from "@/lib/analytics/validate";

export type EventRow = TrackEvent & { ts: string };

const PAGE = 1000; // PostgREST 기본 최대 행 수
const MAX_ROWS = 50000; // 대시보드 조회 상한(안전장치)

function base() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE env 미설정");
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } };
}

export async function insertEvent(row: TrackEvent): Promise<void> {
  const { url, headers } = base();
  await fetch(`${url}/rest/v1/events`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
}

export async function fetchEventsSince(sinceIso: string): Promise<EventRow[]> {
  const { url, headers } = base();
  const out: EventRow[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const res = await fetch(
      `${url}/rest/v1/events?select=ts,type,path,vid,sid,value,referrer,device&ts=gte.${encodeURIComponent(sinceIso)}&order=ts.asc`,
      { headers: { ...headers, Range: `${from}-${from + PAGE - 1}` }, cache: "no-store" }
    );
    if (!res.ok) throw new Error(`Supabase 조회 실패 ${res.status}`);
    const rows = (await res.json()) as EventRow[];
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}
```

- [ ] **Step 2: 수집 라우트 구현**

`app/api/track/route.ts`:

```ts
import { NextRequest } from "next/server";
import { isBot, parseEvent } from "@/lib/analytics/validate";
import { insertEvent } from "@/lib/supabase";

// 방문 이벤트 수집 — 어떤 경우에도 204. 추적 실패가 사이트에 영향을 주지 않는다.
export async function POST(req: NextRequest) {
  try {
    if (!isBot(req.headers.get("user-agent"))) {
      const ev = parseEvent(await req.json().catch(() => null));
      if (ev) await insertEvent(ev);
    }
  } catch {
    // 무시 — fire and forget
  }
  return new Response(null, { status: 204 });
}
```

- [ ] **Step 3: 실서버 검증 (선행: events 테이블 생성 완료)**

```bash
npm run dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '{"type":"pageview","path":"/test-plan","vid":"11111111-2222-3333-4444-555555555555","sid":"aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee","device":"desktop"}'
```

Expected: `204`

Supabase에 실제 적재됐는지 확인:

```bash
source <(grep -E '^SUPABASE' .env.local | sed 's/^/export /')
curl -s "$SUPABASE_URL/rest/v1/events?path=eq./test-plan&select=type,path,device" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

Expected: `[{"type":"pageview","path":"/test-plan","device":"desktop"}]`

테스트 행 삭제:

```bash
curl -s -X DELETE "$SUPABASE_URL/rest/v1/events?path=eq./test-plan" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

- [ ] **Step 4: 봇 차단 확인**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" -H "User-Agent: Googlebot/2.1" \
  -d '{"type":"pageview","path":"/bot-test","vid":"11111111-2222-3333-4444-555555555555","sid":"aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"}'
```

Expected: `204`, 그리고 위 조회 방법으로 `/bot-test` 행이 **없어야** 함.

- [ ] **Step 5: Commit**

```bash
git add lib/supabase.ts app/api/track/route.ts
git commit -m "feat(analytics): 수집 API /api/track + Supabase 서버 헬퍼"
```

---

### Task 3: 클라이언트 추적 — Tracker + 전환 이벤트

**Files:**
- Create: `lib/track.ts`
- Create: `components/Tracker.tsx`
- Modify: `app/layout.tsx` (`<FloatingCta />` 아래에 `<Tracker />` 추가)
- Modify: `components/OrderForm.tsx:156` (제출 성공 시 track 호출 1줄)

**Interfaces:**
- Consumes: `/api/track` (Task 2), `STORE_URL` (`data/shop.ts`).
- Produces: `track(type: "pageview"|"scroll"|"click", data?: { path?: string; value?: string; referrer?: string }): void` — OrderForm 등 어디서든 호출 가능한 전역 헬퍼.

- [ ] **Step 1: 전송 헬퍼 구현**

`lib/track.ts`:

```ts
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
```

- [ ] **Step 2: Tracker 컴포넌트 구현**

`components/Tracker.tsx`:

```tsx
"use client";

// 보이지 않는 방문 추적기 — 페이지뷰·스크롤 깊이·스마트스토어 클릭을 수집한다.
// 스크롤은 같은 (세션, 경로)에 여러 번 전송될 수 있고, 대시보드 집계에서 최댓값을 쓴다.
import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";
import { STORE_URL } from "@/data/shop";

export default function Tracker() {
  const pathname = usePathname();
  const maxScroll = useRef(0);
  const prevPath = useRef<string | null>(null);

  const flushScroll = useCallback((path: string, reset: boolean) => {
    const p = maxScroll.current;
    const bucket = p >= 100 ? "100" : p >= 75 ? "75" : p >= 50 ? "50" : p >= 25 ? "25" : null;
    if (bucket) track("scroll", { path, value: bucket });
    if (reset) maxScroll.current = 0;
  }, []);

  // 라우트 전환: 이전 페이지 스크롤 플러시 → 새 페이지뷰
  useEffect(() => {
    if (pathname.startsWith("/dash")) return;
    if (prevPath.current && prevPath.current !== pathname) flushScroll(prevPath.current, true);
    const external =
      prevPath.current === null && document.referrer && !document.referrer.includes(window.location.hostname);
    track("pageview", { path: pathname, referrer: external ? document.referrer : undefined });
    prevPath.current = pathname;
  }, [pathname, flushScroll]);

  // 스크롤 최대 도달률 추적 + 탭 이탈 시 플러시
  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const pct = total <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / total) * 100));
      if (pct > maxScroll.current) maxScroll.current = pct;
    }
    function onVisibility() {
      if (document.visibilityState === "hidden" && prevPath.current) flushScroll(prevPath.current, false);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [flushScroll]);

  // 스마트스토어 링크 클릭 감지 (문서 위임 — 기존 컴포넌트 수정 불필요)
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null;
      if (a && a.href.startsWith(STORE_URL)) track("click", { value: "store" });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
```

- [ ] **Step 3: 레이아웃에 삽입**

`app/layout.tsx` — import 추가 후 `<FloatingCta />` 아래에:

```tsx
import Tracker from "@/components/Tracker";
// ... body 내부:
        <FloatingCta />
        <Tracker />
```

- [ ] **Step 4: 주문 제출 전환 이벤트**

`components/OrderForm.tsx` 상단 import에 `import { track } from "@/lib/track";` 추가, 156행 성공 분기 수정:

```tsx
      if (res.ok && j?.ok) { setDone({ ordNo, total }); track("click", { value: "order_submit" }); }
```

- [ ] **Step 5: dev 수동 검증**

```bash
NEXT_PUBLIC_TRACK_DEV=1 npm run dev
```

브라우저에서 `http://localhost:3000` 접속 → 스크롤 끝까지 → `/socks` 이동 → 스토어 버튼 클릭. Supabase 조회(Task 2 Step 3의 curl)로 확인:
Expected: `pageview /` + `scroll / value=100` + `pageview /socks` + `click value=store` 행이 존재. 검증 후 해당 vid 행 삭제:

```bash
curl -s -X DELETE "$SUPABASE_URL/rest/v1/events?vid=eq.<브라우저 localStorage의 vny_vid 값>" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

- [ ] **Step 6: Commit**

```bash
git add lib/track.ts components/Tracker.tsx app/layout.tsx components/OrderForm.tsx
git commit -m "feat(analytics): 클라이언트 추적 — 페이지뷰·스크롤 깊이·전환 클릭"
```

---

### Task 4: 대시보드 인증 — 토큰·로그인 API·로그인 화면

**Files:**
- Create: `lib/dash/auth.ts`
- Test: `lib/dash/auth.test.ts`
- Create: `app/api/dash/login/route.ts`
- Create: `app/dash/LoginForm.tsx`
- Modify: `.env.local` + Vercel env (`DASH_PASSWORD`, `DASH_SECRET`)

**Interfaces:**
- Produces: `signToken(now?: number): string`, `verifyToken(token: string | undefined, now?: number): boolean`, `checkPassword(pw: string): boolean`, 쿠키 이름 `"vny_dash"` — Task 5·6이 사용. `LoginForm`(기본 export, props 없음) — Task 6이 사용.

- [ ] **Step 1: 실패하는 테스트 작성**

`lib/dash/auth.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { signToken, verifyToken, checkPassword } from "./auth";

describe("auth token", () => {
  it("서명한 토큰은 검증을 통과한다", () => {
    expect(verifyToken(signToken())).toBe(true);
  });
  it("만료된 토큰은 거부", () => {
    const past = Date.now() - 8 * 24 * 60 * 60 * 1000;
    expect(verifyToken(signToken(past))).toBe(false);
  });
  it("변조된 토큰은 거부", () => {
    const t = signToken();
    const [exp] = t.split(".");
    expect(verifyToken(`${exp}.${"0".repeat(64)}`)).toBe(false);
  });
  it("만료시각만 바꿔치기해도 거부", () => {
    const t = signToken();
    const mac = t.split(".")[1];
    expect(verifyToken(`${Date.now() + 999999999}.${mac}`)).toBe(false);
  });
  it("undefined/빈 문자열은 거부", () => {
    expect(verifyToken(undefined)).toBe(false);
    expect(verifyToken("")).toBe(false);
  });
});

describe("checkPassword", () => {
  it("기본 비밀번호 1234", () => {
    expect(checkPassword("1234")).toBe(true);
    expect(checkPassword("0000")).toBe(false);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run lib/dash/auth.test.ts`
Expected: FAIL — `Cannot find module './auth'`

- [ ] **Step 3: 구현**

`lib/dash/auth.ts`:

```ts
// 대시보드 인증 — HMAC 서명 토큰을 httpOnly 쿠키에 담는다. DB 세션 없음.
import { createHmac, timingSafeEqual } from "crypto";

export const DASH_COOKIE = "vny_dash";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  return process.env.DASH_SECRET || "verny-dash-dev-secret";
}

function mac(exp: number): string {
  return createHmac("sha256", secret()).update(`dash.${exp}`).digest("hex");
}

export function signToken(now: number = Date.now()): string {
  const exp = now + WEEK_MS;
  return `${exp}.${mac(exp)}`;
}

export function verifyToken(token: string | undefined, now: number = Date.now()): boolean {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || exp < now) return false;
  const expect = mac(exp);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expect));
  } catch {
    return false;
  }
}

export function checkPassword(pw: string): boolean {
  return pw === (process.env.DASH_PASSWORD || "1234");
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run lib/dash/auth.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: 로그인 라우트**

`app/api/dash/login/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { DASH_COOKIE, checkPassword, signToken } from "@/lib/dash/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !checkPassword(String(body.password ?? ""))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(DASH_COOKIE, signToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
```

- [ ] **Step 6: 로그인 화면**

`app/dash/LoginForm.tsx`:

```tsx
"use client";

import { useState } from "react";

export default function LoginForm() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(false);
    const res = await fetch("/api/dash/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    }).catch(() => null);
    if (res?.ok) window.location.reload();
    else {
      setErr(true);
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0f1a", color: "#e6e9f0", fontFamily: "system-ui, sans-serif" }}>
      <form onSubmit={submit} style={{ background: "#131a2b", border: "1px solid #253052", borderRadius: 14, padding: "36px 32px", width: 300, display: "grid", gap: 14 }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#7d8bb0" }}>VERNY INSIGHT</div>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="비밀번호"
          style={{ background: "#0b0f1a", border: `1px solid ${err ? "#e5484d" : "#253052"}`, borderRadius: 8, padding: "10px 12px", color: "#e6e9f0", fontSize: 15, outline: "none" }}
        />
        {err && <div style={{ color: "#e5484d", fontSize: 12 }}>비밀번호가 올바르지 않습니다.</div>}
        <button type="submit" disabled={busy} style={{ background: "#3b82f6", border: 0, borderRadius: 8, padding: "10px 0", color: "#fff", fontSize: 14, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>
          {busy ? "확인 중…" : "들어가기"}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 7: 환경변수 등록**

`.env.local`에 추가 (DASH_SECRET은 실제 생성한 랜덤값 사용):

```bash
openssl rand -hex 32   # 출력값을 DASH_SECRET로
```

```
DASH_PASSWORD=1234
DASH_SECRET=<위 출력값>
```

Vercel 등록:

```bash
printf '1234' | npx vercel env add DASH_PASSWORD production
printf '<위 출력값>' | npx vercel env add DASH_SECRET production
```

- [ ] **Step 8: Commit**

```bash
git add lib/dash/auth.ts lib/dash/auth.test.ts app/api/dash/login/route.ts app/dash/LoginForm.tsx
git commit -m "feat(dash): 비밀번호 인증 — HMAC 쿠키 토큰 + 로그인 화면"
```

---

### Task 5: 통계 집계 모듈

**Files:**
- Create: `lib/dash/aggregate.ts`
- Test: `lib/dash/aggregate.test.ts`

**Interfaces:**
- Consumes: `EventRow` (Task 2).
- Produces: `aggregate(events: EventRow[], now: Date, rangeDays: number): DashData` 및 `DashData` 타입 — Task 6이 사용. 모든 날짜·시각 집계는 **KST(UTC+9)** 기준.

```ts
export type DashData = {
  today: { visitors: number; pageviews: number; sessions: number; online: number };
  daily: { date: string; visitors: number; pageviews: number }[]; // 항상 30일, date="MM.DD"
  hourly: { hour: number; views: number }[];                      // 오늘 0~23시
  pages: { path: string; views: number; avgScroll: number }[];    // rangeDays 필터
  funnel: { label: string; count: number; rate: number }[];       // rangeDays 필터
  journeys: { sid: string; device: string; start: string; steps: { label: string; scroll: number | null }[] }[]; // 최근 20세션
  referrers: { source: string; count: number }[];                 // rangeDays 필터
  devices: { device: string; count: number }[];                   // rangeDays 필터
};
```

- [ ] **Step 1: 실패하는 테스트 작성**

`lib/dash/aggregate.test.ts`:

```ts
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
  it("시간대: KST 14시에 3뷰, 어제 것은 미포함", () => {
    expect(d.hourly).toHaveLength(24);
    expect(d.hourly[14].views).toBe(3); // 05:00~05:04 UTC = 14시 KST
    expect(d.hourly[15]).toEqual({ hour: 15, views: 1 }); // 05:58 UTC (V2 pageview)
  });
  it("페이지: 메인 스크롤 100, socks 75", () => {
    const main = d.pages.find((p) => p.path === "/");
    expect(main?.views).toBe(2);
    expect(main?.avgScroll).toBe(100); // 스크롤 이벤트 있는 세션만 평균
    expect(d.pages.find((p) => p.path === "/socks")?.avgScroll).toBe(75);
  });
  it("퍼널: 방문2 → 제품열람1 → 주문관심2 → 제출1", () => {
    expect(d.funnel.map((f) => f.count)).toEqual([2, 1, 2, 1]);
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
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run lib/dash/aggregate.test.ts`
Expected: FAIL — `Cannot find module './aggregate'`

- [ ] **Step 3: 구현**

`lib/dash/aggregate.ts`:

```ts
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
    events.filter((e) => now.getTime() - new Date(e.ts).getTime() < 5 * 60 * 1000).map((e) => e.vid)
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

  // 페이지별 조회수 + 평균 스크롤(세션·경로별 최댓값의 평균)
  const scrollMax = new Map<string, number>(); // `${sid}|${path}` -> max bucket
  for (const e of ranged) {
    if (e.type !== "scroll" || !e.value) continue;
    const k = `${e.sid}|${e.path}`;
    scrollMax.set(k, Math.max(scrollMax.get(k) ?? 0, Number(e.value)));
  }
  const pages = uniq(rangedPv.map((e) => e.path))
    .map((path) => {
      const depths = [...scrollMax.entries()].filter(([k]) => k.endsWith(`|${path}`)).map(([, v]) => v);
      return {
        path,
        views: rangedPv.filter((e) => e.path === path).length,
        avgScroll: depths.length ? Math.round(depths.reduce((a, b) => a + b, 0) / depths.length) : 0,
      };
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
            : { label: e.path, scroll: scrollMax.get(`${e.sid}|${e.path}`) ?? null }
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
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run lib/dash/aggregate.test.ts`
Expected: PASS (10 tests). 실패 시 구현(특히 KST 경계·rangeStart 계산)을 테스트 기대값에 맞춰 수정.

- [ ] **Step 5: 전체 테스트**

Run: `npm test`
Expected: PASS (validate 13 + auth 6 + aggregate 10)

- [ ] **Step 6: Commit**

```bash
git add lib/dash/aggregate.ts lib/dash/aggregate.test.ts
git commit -m "feat(dash): 통계 집계 모듈 — 오늘·추이·퍼널·여정·유입 (KST)"
```

---

### Task 6: 대시보드 페이지 + 차트 UI

**Files:**
- Modify: `package.json` (recharts)
- Create: `app/dash/layout.tsx`
- Create: `app/dash/page.tsx`
- Create: `app/dash/Dashboard.tsx`

**Interfaces:**
- Consumes: `verifyToken`·`DASH_COOKIE`(Task 4), `LoginForm`(Task 4), `fetchEventsSince`(Task 2), `aggregate`·`DashData`(Task 5).
- Produces: `/dash` 라우트 완성.

**주의:** 차트 코드를 쓰기 전에 `dataviz` 스킬을 로드해 색·형태 가이드를 따를 것.

- [ ] **Step 1: recharts 설치**

```bash
npm i recharts
```

- [ ] **Step 2: noindex 레이아웃**

`app/dash/layout.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VERNY INSIGHT",
  robots: { index: false, follow: false },
};

export default function DashLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Step 3: 서버 페이지**

`app/dash/page.tsx`:

```tsx
import { cookies } from "next/headers";
import { DASH_COOKIE, verifyToken } from "@/lib/dash/auth";
import { fetchEventsSince } from "@/lib/supabase";
import { aggregate } from "@/lib/dash/aggregate";
import LoginForm from "./LoginForm";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

const RANGE_DAYS: Record<string, number> = { today: 1, "7d": 7, "30d": 30 };

export default async function DashPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const store = await cookies();
  if (!verifyToken(store.get(DASH_COOKIE)?.value)) return <LoginForm />;

  const { range } = await searchParams;
  const rangeKey = range && RANGE_DAYS[range] ? range : "30d";
  // 추이 그래프가 항상 30일이므로 조회는 항상 30일치
  const since = new Date(Date.now() - 30 * 86400000).toISOString();

  let error: string | null = null;
  let data = null;
  try {
    const events = await fetchEventsSince(since);
    data = aggregate(events, new Date(), RANGE_DAYS[rangeKey]);
  } catch (e) {
    error = String(e);
  }

  if (!data) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0f1a", color: "#e5484d", fontFamily: "system-ui" }}>
        데이터를 불러오지 못했습니다. {error}
      </main>
    );
  }
  return <Dashboard data={data} range={rangeKey} />;
}
```

- [ ] **Step 4: 대시보드 UI**

`app/dash/Dashboard.tsx` — 클라이언트 컴포넌트. 구현 지침(코드가 길어 구조로 명세, **아래 명세의 모든 섹션·팔레트·컴포넌트를 정확히 구현**):

```tsx
"use client";
// props: { data: DashData; range: string }
// recharts import: LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
//                  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
```

- **팔레트(다크):** 배경 `#0b0f1a`, 카드 `#131a2b`, 테두리 `#253052`, 본문 `#e6e9f0`, 보조 `#7d8bb0`, 강조(라인·주요바) `#3b82f6`, 보조 시리즈 `#22c55e`, 퍼널 그라데이션 `#3b82f6 → #1e3a8a`, 경고 `#e5484d`. 폰트 `system-ui`.
- **헤더:** 좌측 `VERNY INSIGHT` + 우측 기간 탭 3개(`오늘`/`7일`/`30일`) — `<a href="/dash?range=today">` 형식 링크, 현재 탭은 강조색 배경.
- **① 스탯 카드 4개** (grid 4열, 모바일 2열): `오늘 방문자`(data.today.visitors), `페이지뷰`(pageviews), `세션`(sessions), `지금 접속`(online — 값>0이면 초록 점 표시). 숫자는 32px bold.
- **② 방문 추이(30일):** `ResponsiveContainer` height 260 + `LineChart data={data.daily}` — Line 2개: visitors(강조색, strokeWidth 2), pageviews(보조 시리즈, 점선 `strokeDasharray="4 4"`). XAxis dataKey="date"(5일 간격 tick), Tooltip 다크 스타일(`contentStyle={{ background: "#131a2b", border: "1px solid #253052" }}`).
- **③ 오늘 시간대(24h):** `BarChart data={data.hourly}` height 200, Bar dataKey="views" fill 강조색 radius `[4,4,0,0]`, XAxis dataKey="hour".
- **④ 페이지별 분석:** 테이블형 리스트. 각 행 = 경로 + 조회수 + 스크롤 게이지(폭 120px 바탕 `#253052`, 채움 강조색, `width: avgScroll%`) + `avgScroll%` 텍스트. data.pages 상위 10개.
- **⑤ 전환 퍼널:** data.funnel을 세로로. 각 단계 = 라벨 + count + 가로 막대(폭 `rate%`, 그라데이션) + `rate%`. 단계 사이 이전 단계 대비 전환율을 작은 회색 텍스트로 (`↓ 50%`).
- **⑥ 방문자 여정:** data.journeys 리스트. 각 행 = 시작 시각(KST `MM.DD HH:mm`, `new Date(start).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })`) + 디바이스 아이콘(📱/🖥️ 대신 텍스트 `MO`/`PC`) + 스텝 체인: 각 스텝 `label(scroll%)`, `→`로 연결, `주문 제출` 스텝은 초록 강조, `스토어 클릭`은 파랑 강조.
- **⑦ 유입 경로 + 디바이스:** 2열 grid. 좌: data.referrers 순위 리스트(소스 + count 바). 우: `PieChart` + `Pie data={data.devices} dataKey="count" nameKey="device" innerRadius={50} outerRadius={70}` 도넛, Cell 색 mobile=강조색·desktop=보조 시리즈, 중앙에 합계.
- **빈 데이터:** 이벤트가 하나도 없으면 각 섹션에 `아직 데이터가 없습니다` 표시(차트 crash 방지 — daily 등은 항상 배열이므로 recharts는 빈 값도 안전).
- 전체 레이아웃: `max-width 1100px` 중앙, 카드 grid `gap 16`, 카드 공통 스타일 `{ background:"#131a2b", border:"1px solid #253052", borderRadius:14, padding:20 }`.

- [ ] **Step 5: dev 검증**

```bash
NEXT_PUBLIC_TRACK_DEV=1 npm run dev
```

1. `http://localhost:3000/dash` → 로그인 화면. 틀린 비번 `0000` → 에러 표시. `1234` → 대시보드.
2. 다른 탭에서 사이트 돌아다니기(메인→socks 스크롤→order) → `/dash` 새로고침 → 수치·여정에 반영 확인.
3. 기간 탭 3개 전환 동작 확인.
Expected: 위 전부 정상, 콘솔 에러 없음.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json app/dash/
git commit -m "feat(dash): 통계 대시보드 UI — 추이·시간대·페이지·퍼널·여정 차트"
```

---

### Task 7: 푸터 숨김 진입

**Files:**
- Create: `components/FooterSecret.tsx`
- Modify: `components/SiteFooter.tsx:41-43` (© 라인을 FooterSecret으로 감싼다)

**Interfaces:**
- Consumes: 없음. Produces: 없음(UI 동작만).

- [ ] **Step 1: 클릭 카운터 컴포넌트**

`components/FooterSecret.tsx`:

```tsx
"use client";

// © 문구를 3초 안에 5번 클릭하면 /dash로 이동. 시각적 힌트 없음.
import { useRef } from "react";
import { useRouter } from "next/navigation";

export default function FooterSecret({ children }: { children: React.ReactNode }) {
  const clicks = useRef<number[]>([]);
  const router = useRouter();

  function onClick() {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 3000), now];
    if (clicks.current.length >= 5) {
      clicks.current = [];
      router.push("/dash");
    }
  }

  return (
    <span onClick={onClick} style={{ userSelect: "none" }}>
      {children}
    </span>
  );
}
```

- [ ] **Step 2: 푸터 적용**

`components/SiteFooter.tsx` — import 추가 후 41~43행의 © div 내용을 감싼다:

```tsx
import FooterSecret from "@/components/FooterSecret";
// ...
      <div style={{ maxWidth: 1160, margin: "44px auto 0", paddingTop: 22, borderTop: "1px solid var(--line)", fontSize: 11, color: "var(--ink-soft)" }}>
        <FooterSecret>© {new Date().getFullYear()} BETTERUS · VERNY. All rights reserved.</FooterSecret>
      </div>
```

- [ ] **Step 3: dev 검증**

메인 페이지 푸터 © 문구 5번 빠르게 클릭 → `/dash` 이동 확인. 4번 클릭 후 4초 대기 → 이동 안 함 확인.
Expected: 둘 다 정상.

- [ ] **Step 4: Commit**

```bash
git add components/FooterSecret.tsx components/SiteFooter.tsx
git commit -m "feat(dash): 푸터 © 5클릭 숨김 진입"
```

---

### Task 8: 빌드·배포·실검증

**Files:** 없음 (검증만)

- [ ] **Step 1: 전체 테스트 + 린트 + 빌드**

```bash
npm test && npm run lint && npm run build
```

Expected: 테스트 29개 PASS, 린트 에러 0, 빌드 성공. `/dash`가 정적으로 프리렌더되지 않고 dynamic으로 표시되는지 빌드 출력에서 확인(`ƒ /dash`).

- [ ] **Step 2: 배포**

```bash
npx vercel --prod
```

Expected: 배포 성공, 프로덕션 URL 출력.

- [ ] **Step 3: 프로덕션 실검증**

1. 프로덕션 사이트 접속(일반 브라우저) → 몇 페이지 이동 + 스크롤.
2. `https://<도메인>/dash` → 비번 `1234` → 방금 방문이 수치·여정에 보이는지 확인.
3. 모바일(실기기)에서 접속 → 대시보드 디바이스 비율에 mobile 반영 확인.
4. 시크릿 창에서 `/dash` 직접 접속 → 로그인 화면(쿠키 없이 데이터 접근 불가) 확인.
Expected: 전부 정상.

- [ ] **Step 4: 최종 커밋·푸시**

```bash
git push origin main
```

---

## Self-Review 결과

- 스펙 커버리지: 수집(§4→T1·2·3), API(§5→T2), 스키마(§6→선행조건+기존 마이그레이션 파일), 대시보드 7섹션(§7→T5·6), 숨김 진입·인증(§8→T4·7), 에러·성능(§9→T2 204·T6 에러화면·recharts는 /dash에서만 로드), 테스트(§10→각 태스크 검증 스텝+T8). 갭 없음.
- robots.txt는 스펙과 달리 생성하지 않음 — `/dash` 경로 노출 방지 목적, Global Constraints에 근거 명시.
- 타입 일관성: `TrackEvent`(T1) ⊂ `EventRow`(T2) → `aggregate`(T5) → `Dashboard props`(T6) 서명 일치 확인.
