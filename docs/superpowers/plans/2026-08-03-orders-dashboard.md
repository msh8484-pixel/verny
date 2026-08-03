# 베르니 대시보드 주문 관리 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사이트 주문폼 주문을 Supabase `orders`에 기록하고 `/dash`에 주문 탭(내역·매출 통계·상태 관리)을 추가한다.

**Architecture:** `/api/order`가 시트 웹훅 성공 후 비차단으로 DB 기록(env 없는 고객사 배포는 verny-beta의 `/api/order-log`로 전달 — track 폴백과 동일 패턴). `/dash/orders` 서버 페이지가 쿠키 인증 후 주문을 읽어 순수 집계 → 클라이언트 `OrdersView` 렌더. 상태 변경은 쿠키 검증 PATCH API.

**Tech Stack:** 기존 스택 그대로 — Next.js 16, PostgREST fetch 직접 호출, vitest, recharts, 다크 팔레트.

**설계서:** `docs/superpowers/specs/2026-08-03-orders-dashboard-design.md`

## Global Constraints

- 기존 주문 흐름(구글시트 웹훅 + 메일 2곳) 절대 불변 — DB 기록 실패가 주문 접수에 영향 금지 (try/catch + console.error).
- Supabase 키는 서버 전용. 공개 저장소이므로 코드에 키·시크릿 하드코딩 금지 — 폴백은 공개 URL만 (`https://verny-beta.vercel.app/...`).
- 상태값은 `new`(신규) | `paid`(입금확인) | `shipped`(발송완료)만. 화이트리스트 밖 전부 거부.
- 날짜·시각 집계는 KST(UTC+9). `now`는 파라미터.
- 상태 변경·주문 조회는 `vny_dash` 쿠키 `verifyToken` 통과 필수.
- 다크 팔레트(기존 Dashboard.tsx와 동일): 배경 #0b0f1a, 카드 #131a2b, 테두리 #253052, 본문 #e6e9f0, 보조 #7d8bb0, 강조 #3b82f6, 초록 #22c55e, 경고 #e5484d.
- 커밋 메시지 한국어 + `feat(orders):`/`fix:` 관례, 말미에 빈 줄 + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- **선행 조건(컨트롤러 담당):** `supabase/migrations/0002_orders.sql`을 pooler로 실행해 `orders` 테이블 생성. Task 2 검증 전 완료.

---

### Task 1: 주문 모델 — parseOrder + DB 헬퍼

**Files:**
- Create: `lib/orders.ts`
- Test: `lib/orders.test.ts`

**Interfaces:**
- Produces (후속 태스크 사용):

```ts
export type OrderStatus = "new" | "paid" | "shipped";
export type OrderRow = {
  ord_no: string; orderer_name: string; orderer_phone: string;
  recipient: string | null; recipient_phone: string | null; address: string | null;
  memo: string | null; items: string | null; qty: number | null; total: number | null;
  receipt: string | null; tier: string | null;
};
export type StoredOrder = OrderRow & { id: number; ts: string; status: OrderStatus; status_ts: string | null };
export function parseOrder(raw: unknown): OrderRow | null;
export function insertOrder(row: OrderRow): Promise<void>;
export function fetchOrders(sinceIso: string, limit?: number): Promise<StoredOrder[]>;  // 기본 200, ts desc
export function updateOrderStatus(id: number, status: OrderStatus): Promise<boolean>;
export const ORDER_STATUSES: readonly OrderStatus[];
```

- 입력은 주문폼 payload의 camelCase 키: `ordNo, ordererName, ordererPhone, recipient, recipientPhone, address, message, items, qty, total, receipt, tier`.

- [ ] **Step 1: 실패하는 테스트 작성**

`lib/orders.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseOrder } from "./orders";

const base = {
  ordNo: "VERNY-260803-1234",
  ordererName: "홍길동",
  ordererPhone: "010-1234-5678",
  recipient: "김수령",
  recipientPhone: "010-8765-4321",
  address: "(06236) 서울 강남구 테헤란로 1 101호",
  message: "문 앞에 놔주세요",
  items: "선물세트 x2",
  qty: 2,
  total: 59000,
  receipt: "세금계산서 (사업자 123-45-67890)",
  tier: "세트 채널가",
};

describe("parseOrder", () => {
  it("정상 주문을 스네이크케이스 행으로 변환한다", () => {
    expect(parseOrder(base)).toEqual({
      ord_no: "VERNY-260803-1234",
      orderer_name: "홍길동",
      orderer_phone: "010-1234-5678",
      recipient: "김수령",
      recipient_phone: "010-8765-4321",
      address: "(06236) 서울 강남구 테헤란로 1 101호",
      memo: "문 앞에 놔주세요",
      items: "선물세트 x2",
      qty: 2,
      total: 59000,
      receipt: "세금계산서 (사업자 123-45-67890)",
      tier: "세트 채널가",
    });
  });
  it("필수(주문번호·이름·연락처) 누락 시 null", () => {
    expect(parseOrder({ ...base, ordNo: "" })).toBeNull();
    expect(parseOrder({ ...base, ordererName: undefined })).toBeNull();
    expect(parseOrder({ ...base, ordererPhone: 1234 })).toBeNull();
  });
  it("선택 필드 누락은 null로 채운다", () => {
    const r = parseOrder({ ordNo: "V-1", ordererName: "a", ordererPhone: "b" });
    expect(r).toMatchObject({ recipient: null, memo: null, qty: null, total: null });
  });
  it("qty·total은 유한한 0 이상 숫자만, 아니면 null", () => {
    expect(parseOrder({ ...base, qty: -1 })?.qty).toBeNull();
    expect(parseOrder({ ...base, total: "많이" })?.total).toBeNull();
    expect(parseOrder({ ...base, total: Infinity })?.total).toBeNull();
    expect(parseOrder({ ...base, total: 1234.9 })?.total).toBe(1235);
  });
  it("과도한 길이는 절단한다 (address 300, memo·items 500, 나머지 문자열 200)", () => {
    const r = parseOrder({ ...base, address: "a".repeat(400), memo: "b".repeat(600), ordererName: "c".repeat(300) });
    expect(r?.address?.length).toBe(300);
    expect(r?.memo?.length).toBe(500);
    expect(r?.orderer_name.length).toBe(200);
  });
  it("객체가 아니면 null", () => {
    expect(parseOrder(null)).toBeNull();
    expect(parseOrder("x")).toBeNull();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run lib/orders.test.ts`
Expected: FAIL — `Cannot find module './orders'`

- [ ] **Step 3: 구현**

`lib/orders.ts`:

```ts
// 주문 기록 서버 헬퍼 — PostgREST 직접 호출, 서버 전용 (SERVICE_ROLE 키 사용).
export type OrderStatus = "new" | "paid" | "shipped";
export const ORDER_STATUSES = ["new", "paid", "shipped"] as const;

export type OrderRow = {
  ord_no: string; orderer_name: string; orderer_phone: string;
  recipient: string | null; recipient_phone: string | null; address: string | null;
  memo: string | null; items: string | null; qty: number | null; total: number | null;
  receipt: string | null; tier: string | null;
};
export type StoredOrder = OrderRow & { id: number; ts: string; status: OrderStatus; status_ts: string | null };

function str(v: unknown, max: number): string | null {
  return typeof v === "string" && v ? v.slice(0, max) : null;
}
function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.round(v) : null;
}

export function parseOrder(raw: unknown): OrderRow | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const ord_no = str(b.ordNo, 200);
  const orderer_name = str(b.ordererName, 200);
  const orderer_phone = str(b.ordererPhone, 200);
  if (!ord_no || !orderer_name || !orderer_phone) return null;
  return {
    ord_no, orderer_name, orderer_phone,
    recipient: str(b.recipient, 200),
    recipient_phone: str(b.recipientPhone, 200),
    address: str(b.address, 300),
    memo: str(b.message, 500),
    items: str(b.items, 500),
    qty: num(b.qty),
    total: num(b.total),
    receipt: str(b.receipt, 200),
    tier: str(b.tier, 200),
  };
}

function base() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE env 미설정");
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } };
}

export async function insertOrder(row: OrderRow): Promise<void> {
  const { url, headers } = base();
  const res = await fetch(`${url}/rest/v1/orders`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  if (!res.ok) console.error("insertOrder 실패", res.status, await res.text().catch(() => ""));
}

export async function fetchOrders(sinceIso: string, limit = 200): Promise<StoredOrder[]> {
  const { url, headers } = base();
  const res = await fetch(
    `${url}/rest/v1/orders?select=*&ts=gte.${encodeURIComponent(sinceIso)}&order=ts.desc&limit=${limit}`,
    { headers, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`orders 조회 실패 ${res.status}`);
  return (await res.json()) as StoredOrder[];
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<boolean> {
  const { url, headers } = base();
  const res = await fetch(`${url}/rest/v1/orders?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ status, status_ts: new Date().toISOString() }),
  });
  return res.ok;
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run lib/orders.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/orders.ts lib/orders.test.ts
git commit -m "feat(orders): 주문 검증·DB 헬퍼 (parseOrder + PostgREST)"
```

---

### Task 2: 마이그레이션 + 주문 기록 연동 + 폴백 수신 라우트

**Files:**
- Create: `supabase/migrations/0002_orders.sql` (내용은 설계서 §2 SQL 그대로)
- Modify: `app/api/order/route.ts` (웹훅 성공 후 기록 호출 추가)
- Create: `app/api/order-log/route.ts`

**Interfaces:**
- Consumes: Task 1의 `parseOrder`, `insertOrder`.
- Produces: `POST /api/order-log` — env 보유 배포(verny-beta)에서 주문 body를 받아 검증·적재, 항상 204.

- [ ] **Step 1: 마이그레이션 파일 생성**

`supabase/migrations/0002_orders.sql` — 설계서 §2의 SQL을 그대로 복사:

```sql
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  ord_no text not null,
  orderer_name text not null,
  orderer_phone text not null,
  recipient text,
  recipient_phone text,
  address text,
  memo text,
  items text,
  qty int,
  total int,
  receipt text,
  tier text,
  status text not null default 'new' check (status in ('new', 'paid', 'shipped')),
  status_ts timestamptz
);
create index if not exists orders_ts_idx on public.orders (ts desc);
alter table public.orders enable row level security;
```

**주의: 이 SQL의 DB 실행은 컨트롤러가 담당** — 구현자는 파일만 만들고, 검증 단계 전에 테이블 존재를 curl로 확인만 한다.

- [ ] **Step 2: 폴백 수신 라우트**

`app/api/order-log/route.ts`:

```ts
import { NextRequest } from "next/server";
import { parseOrder, insertOrder } from "@/lib/orders";

// env 없는 배포(verny.co.kr)가 주문 기록을 위임하는 수신 엔드포인트.
// /api/order 자체가 공개이므로 위험 동급 — 검증으로 쓰레기 행만 차단. 어떤 경우에도 204.
export async function POST(req: NextRequest) {
  try {
    const row = parseOrder(await req.json().catch(() => null));
    if (row) await insertOrder(row);
  } catch (e) {
    console.error("order-log 기록 실패", e);
  }
  return new Response(null, { status: 204 });
}
```

- [ ] **Step 3: /api/order에 기록 연결**

`app/api/order/route.ts` — 상단에 import·상수 추가:

```ts
import { parseOrder, insertOrder } from "@/lib/orders";

// 고객사 Vercel(env 미설정)에서는 키 보유 배포로 기록 위임 — track 폴백과 동일 패턴
const ORDER_LOG_FALLBACK = "https://verny-beta.vercel.app/api/order-log";

async function recordOrder(body: Record<string, unknown>) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await fetch(ORDER_LOG_FALLBACK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      const row = parseOrder(body);
      if (row) await insertOrder(row);
    }
  } catch (e) {
    console.error("주문 DB 기록 실패", e); // 주문 접수에는 영향 없음
  }
}
```

그리고 POST 핸들러의 성공 경로, `await sendOrderMails(body);` 바로 다음 줄에:

```ts
    await recordOrder(body);
```

- [ ] **Step 4: 검증 (선행: orders 테이블 생성 완료)**

dev 서버 기동 후:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/order-log \
  -H "Content-Type: application/json" \
  -d '{"ordNo":"VERNY-TEST-0001","ordererName":"테스트","ordererPhone":"010-0000-0000","total":1000,"qty":1,"items":"검증용"}'
```

Expected: `204`

```bash
source <(grep -E '^SUPABASE' .env.local | sed 's/^/export /')
curl -s "$SUPABASE_URL/rest/v1/orders?ord_no=eq.VERNY-TEST-0001&select=ord_no,orderer_name,total,status" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

Expected: `[{"ord_no":"VERNY-TEST-0001","orderer_name":"테스트","total":1000,"status":"new"}]`

깨진 body(필수 누락)도 204이되 적재 안 됨:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/order-log \
  -H "Content-Type: application/json" -d '{"foo":1}'
```

Expected: `204`, orders에 행 추가 없음.

테스트 행 삭제:

```bash
curl -s -X DELETE "$SUPABASE_URL/rest/v1/orders?ord_no=eq.VERNY-TEST-0001" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

`npm test`(기존 35 + 신규 전부)와 `npx tsc --noEmit`도 통과 확인.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0002_orders.sql app/api/order/route.ts app/api/order-log/route.ts
git commit -m "feat(orders): 주문 DB 기록 — /api/order 연동 + 폴백 수신 /api/order-log"
```

---

### Task 3: 주문 집계 모듈

**Files:**
- Create: `lib/dash/aggregate-orders.ts`
- Test: `lib/dash/aggregate-orders.test.ts`

**Interfaces:**
- Consumes: `StoredOrder` (Task 1).
- Produces:

```ts
export type OrdersData = {
  today: { count: number; sales: number };
  period: { count: number; sales: number; pendingCount: number };  // 입력 전체 기준
  dailySales: { date: string; sales: number }[];  // 항상 30개, date="MM.DD", KST
};
export function aggregateOrders(orders: StoredOrder[], now: Date): OrdersData;
```

- [ ] **Step 1: 실패하는 테스트 작성**

`lib/dash/aggregate-orders.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { aggregateOrders } from "./aggregate-orders";
import type { StoredOrder } from "@/lib/orders";

// 기준시각: KST 2026-08-03 15:00 (= UTC 06:00)
const NOW = new Date("2026-08-03T06:00:00Z");

function order(p: Partial<StoredOrder>): StoredOrder {
  return {
    id: 1, ts: "2026-08-03T05:00:00Z", ord_no: "V-1",
    orderer_name: "홍", orderer_phone: "010", recipient: null, recipient_phone: null,
    address: null, memo: null, items: null, qty: 1, total: 10000,
    receipt: null, tier: null, status: "new", status_ts: null, ...p,
  };
}

const orders: StoredOrder[] = [
  order({ id: 1, ts: "2026-08-03T05:00:00Z", total: 10000, status: "new" }),   // 오늘 KST 14시
  order({ id: 2, ts: "2026-08-03T01:00:00Z", total: 25000, status: "paid" }),  // 오늘 KST 10시
  order({ id: 3, ts: "2026-08-02T05:00:00Z", total: 30000, status: "shipped" }), // 어제
  order({ id: 4, ts: "2026-08-02T20:00:00Z", total: 5000, status: "new" }),    // KST로는 8/3 05시 → 오늘!
];

describe("aggregateOrders (KST)", () => {
  const d = aggregateOrders(orders, NOW);

  it("오늘: 3건 40,000원 (UTC 8/2 20시는 KST 8/3)", () => {
    expect(d.today).toEqual({ count: 3, sales: 40000 });
  });
  it("전체: 4건 70,000원, 미처리 2건", () => {
    expect(d.period).toEqual({ count: 4, sales: 70000, pendingCount: 2 });
  });
  it("일별 매출 30개, 오늘 40,000·어제 30,000", () => {
    expect(d.dailySales).toHaveLength(30);
    expect(d.dailySales[29]).toEqual({ date: "08.03", sales: 40000 });
    expect(d.dailySales[28]).toEqual({ date: "08.02", sales: 30000 });
  });
  it("total이 null인 주문은 매출 0으로 집계, 건수엔 포함", () => {
    const d2 = aggregateOrders([order({ total: null })], NOW);
    expect(d2.today).toEqual({ count: 1, sales: 0 });
  });
  it("빈 배열도 안전", () => {
    const d3 = aggregateOrders([], NOW);
    expect(d3.today).toEqual({ count: 0, sales: 0 });
    expect(d3.period.pendingCount).toBe(0);
    expect(d3.dailySales).toHaveLength(30);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run lib/dash/aggregate-orders.test.ts`
Expected: FAIL — `Cannot find module './aggregate-orders'`

- [ ] **Step 3: 구현**

`lib/dash/aggregate-orders.ts`:

```ts
// 주문 목록 → 대시보드 주문 통계. 순수 함수, KST(UTC+9) 기준.
import type { StoredOrder } from "@/lib/orders";

export type OrdersData = {
  today: { count: number; sales: number };
  period: { count: number; sales: number; pendingCount: number };
  dailySales: { date: string; sales: number }[];
};

const KST_MS = 9 * 60 * 60 * 1000;

function dayKey(ts: string | Date): string {
  return new Date(new Date(ts).getTime() + KST_MS).toISOString().slice(0, 10);
}

export function aggregateOrders(orders: StoredOrder[], now: Date): OrdersData {
  const todayKey = dayKey(now);
  const sum = (list: StoredOrder[]) => list.reduce((a, o) => a + (o.total ?? 0), 0);

  const todayOrders = orders.filter((o) => dayKey(o.ts) === todayKey);

  const dailySales: OrdersData["dailySales"] = [];
  for (let i = 29; i >= 0; i--) {
    const key = dayKey(new Date(now.getTime() - i * 86400000));
    dailySales.push({
      date: key.slice(5).replace("-", "."),
      sales: sum(orders.filter((o) => dayKey(o.ts) === key)),
    });
  }

  return {
    today: { count: todayOrders.length, sales: sum(todayOrders) },
    period: {
      count: orders.length,
      sales: sum(orders),
      pendingCount: orders.filter((o) => o.status === "new").length,
    },
    dailySales,
  };
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run lib/dash/aggregate-orders.test.ts`
Expected: PASS (5 tests). 이후 `npm test` 전체 통과 확인.

- [ ] **Step 5: Commit**

```bash
git add lib/dash/aggregate-orders.ts lib/dash/aggregate-orders.test.ts
git commit -m "feat(orders): 주문 집계 모듈 — 오늘·기간·일별 매출 (KST)"
```

---

### Task 4: 상태 변경 API

**Files:**
- Create: `app/api/dash/orders/route.ts`

**Interfaces:**
- Consumes: `verifyToken`·`DASH_COOKIE`(lib/dash/auth), `updateOrderStatus`·`ORDER_STATUSES`(Task 1).
- Produces: `PATCH /api/dash/orders` body `{ id: number, status: OrderStatus }` → 200 `{ok:true}` | 400 | 401 | 502.

- [ ] **Step 1: 구현**

`app/api/dash/orders/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { DASH_COOKIE, verifyToken } from "@/lib/dash/auth";
import { ORDER_STATUSES, updateOrderStatus, type OrderStatus } from "@/lib/orders";

// 주문 상태 변경 — 대시보드 로그인 쿠키 필수.
export async function PATCH(req: NextRequest) {
  if (!verifyToken(req.cookies.get(DASH_COOKIE)?.value)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const id = body && typeof body.id === "number" && Number.isInteger(body.id) ? body.id : null;
  const status = ORDER_STATUSES.includes(body?.status) ? (body.status as OrderStatus) : null;
  if (!id || !status) return NextResponse.json({ ok: false, error: "잘못된 요청" }, { status: 400 });

  const ok = await updateOrderStatus(id, status);
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ ok: false, error: "DB 갱신 실패" }, { status: 502 });
}
```

- [ ] **Step 2: 검증**

dev 서버에서 (orders 테이블에 Task 2 검증용 행을 다시 넣고 id 확인 후):

```bash
# 쿠키 없이 → 401
curl -s -o /dev/null -w "%{http_code}\n" -X PATCH http://localhost:3000/api/dash/orders \
  -H "Content-Type: application/json" -d '{"id":1,"status":"paid"}'
# 로그인 → 쿠키로 상태 변경 → 200
curl -s -c /tmp/ojar -X POST http://localhost:3000/api/dash/login -H "Content-Type: application/json" -d '{"password":"1234"}'
curl -s -b /tmp/ojar -X PATCH http://localhost:3000/api/dash/orders \
  -H "Content-Type: application/json" -d '{"id":<실제id>,"status":"paid"}'
# 이상한 상태값 → 400
curl -s -b /tmp/ojar -o /dev/null -w "%{http_code}\n" -X PATCH http://localhost:3000/api/dash/orders \
  -H "Content-Type: application/json" -d '{"id":1,"status":"hacked"}'
```

Expected: 401 → `{"ok":true}` (Supabase에서 status=paid·status_ts 갱신 확인) → 400. 검증 후 테스트 행 삭제.

- [ ] **Step 3: Commit**

```bash
git add app/api/dash/orders/route.ts
git commit -m "feat(orders): 상태 변경 API — 쿠키 인증 PATCH"
```

---

### Task 5: 대시보드 주문 화면 + 탭 내비

**Files:**
- Create: `app/dash/DashTabs.tsx`
- Modify: `app/dash/Dashboard.tsx` (헤더에 DashTabs 삽입)
- Create: `app/dash/orders/page.tsx`
- Create: `app/dash/orders/OrdersView.tsx`

**Interfaces:**
- Consumes: `fetchOrders`(Task 1), `aggregateOrders`·`OrdersData`(Task 3), `PATCH /api/dash/orders`(Task 4), `verifyToken`·`DASH_COOKIE`, `LoginForm`.
- Produces: `/dash/orders` 라우트 완성, `/dash` 헤더에 [통계]|[주문] 탭.

- [ ] **Step 1: 탭 컴포넌트**

`app/dash/DashTabs.tsx`:

```tsx
// 대시보드 상단 [통계]|[주문] 탭 — 서버·클라이언트 양쪽에서 쓰는 단순 링크.
const tab = (active: boolean): React.CSSProperties => ({
  padding: "7px 16px",
  borderRadius: 8,
  fontSize: 13,
  textDecoration: "none",
  color: active ? "#fff" : "#7d8bb0",
  background: active ? "#3b82f6" : "transparent",
  border: `1px solid ${active ? "#3b82f6" : "#253052"}`,
});

export default function DashTabs({ active }: { active: "stats" | "orders" }) {
  return (
    <nav style={{ display: "flex", gap: 8 }}>
      <a href="/dash" style={tab(active === "stats")}>통계</a>
      <a href="/dash/orders" style={tab(active === "orders")}>주문</a>
    </nav>
  );
}
```

- [ ] **Step 2: 기존 통계 화면 헤더에 탭 삽입**

`app/dash/Dashboard.tsx`: `import DashTabs from "./DashTabs";` 추가 후, 헤더의 `VERNY INSIGHT` 타이틀과 기간 탭 사이에 `<DashTabs active="stats" />`를 넣는다 (헤더가 flex row이므로 타이틀 바로 다음 자식으로 삽입, 기존 스타일 변경 없음).

- [ ] **Step 3: 주문 서버 페이지**

`app/dash/orders/page.tsx`:

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DASH_COOKIE, verifyToken } from "@/lib/dash/auth";
import { fetchOrders } from "@/lib/orders";
import { aggregateOrders } from "@/lib/dash/aggregate-orders";
import LoginForm from "../LoginForm";
import OrdersView from "./OrdersView";

export const dynamic = "force-dynamic";

// env 없는 배포(verny.co.kr)에서는 키 보유 배포로 넘긴다 — /dash와 동일 패턴.
const FALLBACK = "https://verny-beta.vercel.app/dash/orders";

export default async function OrdersPage() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.DASH_SECRET) {
    redirect(FALLBACK);
  }
  const store = await cookies();
  if (!verifyToken(store.get(DASH_COOKIE)?.value)) return <LoginForm />;

  const now = new Date();
  const since = new Date(now.getTime() - 30 * 86400000).toISOString();

  let error: string | null = null;
  let data = null;
  let orders = null;
  try {
    orders = await fetchOrders(since);
    data = aggregateOrders(orders, now);
  } catch (e) {
    error = String(e);
  }

  if (!data || !orders) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0f1a", color: "#e5484d", fontFamily: "system-ui" }}>
        주문을 불러오지 못했습니다. {error}
      </main>
    );
  }
  return <OrdersView data={data} orders={orders} />;
}
```

- [ ] **Step 4: 주문 화면 (클라이언트)**

`app/dash/orders/OrdersView.tsx` — `"use client"`. props `{ data: OrdersData; orders: StoredOrder[] }`. 기존 Dashboard.tsx의 팔레트·카드 스타일 상수를 동일하게 선언해 사용(파일 간 공유 없이 복제 허용 — 기존 관례). 구현 명세:

- **헤더**: 좌측 `VERNY INSIGHT` + `<DashTabs active="orders" />` (통계 화면과 같은 배치).
- **요약 카드 4** (grid `repeat(auto-fit, minmax(150px, 1fr))`): `오늘 주문 N건` / `오늘 매출`(₩ `toLocaleString("ko-KR")`) / `30일 매출` / `미처리 N건`(N>0이면 숫자를 경고색 #e5484d로).
- **매출 추이**: recharts `BarChart data={data.dailySales}` height 200, Bar dataKey="sales" fill #3b82f6 radius [4,4,0,0], XAxis dataKey="date" 5일 간격, Tooltip 다크 스타일(₩ 포맷).
- **상태 필터 탭**: 전체/신규/입금확인/발송완료 — `useState`로 클라이언트 필터. 각 탭에 건수 표시.
- **주문 테이블**: 행 = 시각(KST `MM.DD HH:mm`, `toLocaleString("ko-KR",{timeZone:"Asia/Seoul",...})`)·주문번호·주문자(연락처 함께 작은 글씨)·품목·수량·금액·상태 배지·액션 버튼. 좁은 화면은 테이블 컨테이너에 `overflowX:"auto"`.
- **상태 배지 색**: new=#e5484d "신규", paid=#3b82f6 "입금확인", shipped=#22c55e "발송완료".
- **상태 전환 버튼**: 다음 단계 버튼(신규행→"입금확인으로", 입금확인행→"발송완료로") + 이전 단계로 되돌리기 작은 버튼(발송완료→입금확인, 입금확인→신규). 클릭 시:

```tsx
async function changeStatus(id: number, status: OrderStatus) {
  setBusy(id);
  const res = await fetch("/api/dash/orders", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  }).catch(() => null);
  if (res?.ok) setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
  else alert("상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  setBusy(null);
}
```

  (`rows`는 `useState(orders)`로 초기화, busy 중 해당 행 버튼 disabled.)
- **빈 데이터**: 주문 0건이면 테이블 자리에 `아직 주문이 없습니다`.

- [ ] **Step 5: 검증**

dev 서버에서:

```bash
# 테스트 주문 2건 주입
curl -s -o /dev/null -X POST http://localhost:3000/api/order-log -H "Content-Type: application/json" \
  -d '{"ordNo":"VERNY-UI-0001","ordererName":"김테스트","ordererPhone":"010-1111-2222","total":59000,"qty":2,"items":"선물세트 x2"}'
curl -s -o /dev/null -X POST http://localhost:3000/api/order-log -H "Content-Type: application/json" \
  -d '{"ordNo":"VERNY-UI-0002","ordererName":"이확인","ordererPhone":"010-3333-4444","total":29000,"qty":1,"items":"낱개 x3"}'
# 로그인 쿠키로 화면 확인
curl -s -c /tmp/ojar -X POST http://localhost:3000/api/dash/login -H "Content-Type: application/json" -d '{"password":"1234"}' > /dev/null
curl -s -b /tmp/ojar http://localhost:3000/dash/orders | grep -oE "VERNY-UI-0001|미처리|주문" | sort -u
curl -s -b /tmp/ojar http://localhost:3000/dash | grep -c "주문"   # 통계 화면에 탭 노출
```

Expected: 주문 화면에 테스트 주문·미처리 카드 표시, 통계 화면에 [주문] 탭 ≥1. `npx tsc --noEmit`·`npm test`·`npm run lint` 통과. 검증 후 `ord_no=like.VERNY-UI-*` 행 삭제.

- [ ] **Step 6: Commit**

```bash
git add app/dash/DashTabs.tsx app/dash/Dashboard.tsx app/dash/orders/
git commit -m "feat(orders): 대시보드 주문 탭 — 내역·매출 추이·상태 관리"
```

---

### Task 6: 빌드·배포·실검증

**Files:** 없음 (검증만)

- [ ] **Step 1: 전체 검증**

```bash
npm test && npm run lint && npm run build
```

Expected: 테스트 전부 PASS(기존 29 + orders 6 + aggregate-orders 5 = 40), 린트 에러 0, 빌드 성공에 `ƒ /dash/orders` 표시.

- [ ] **Step 2: 배포**

```bash
git push origin main      # 고객사 Vercel 자동 배포 트리거
npx vercel --prod         # verny-beta 배포
```

- [ ] **Step 3: 프로덕션 검증**

```bash
D=https://verny-beta.vercel.app
# order-log 적재 확인 → 삭제
curl -s -o /dev/null -w "%{http_code}\n" -X POST $D/api/order-log -H "Content-Type: application/json" \
  -d '{"ordNo":"VERNY-PROD-0001","ordererName":"배포검증","ordererPhone":"010-0000-0000","total":1000}'
# → 204, Supabase에서 행 확인 후 삭제
# 대시보드
curl -s -c /tmp/pjar -X POST $D/api/dash/login -H "Content-Type: application/json" -d '{"password":"1234"}'
curl -s -b /tmp/pjar $D/dash/orders | grep -c "주문"       # ≥1
# 고객사 배포 리다이렉트 (자동 배포 완료 후)
curl -s -o /dev/null -w "%{http_code} → %{redirect_url}\n" https://www.verny.co.kr/dash/orders
# → 307 → https://verny-beta.vercel.app/dash/orders
```

- [ ] **Step 4: 실주문 흐름 확인 (수동)**

프로덕션 주문폼에서 테스트 주문 1건 제출 → 대시보드 주문 탭에 표시·상태 전환(신규→입금확인) 동작 확인 → Supabase에서 테스트 행 삭제. 구글시트·메일도 기존대로 수신되는지 함께 확인.

---

## Self-Review 결과

- 스펙 커버리지: §2 스키마→T2, §3 기록·폴백→T1·2, §4 상태 API→T4, §5 UI·탭→T5, §6 에러·보안→각 태스크(비차단·쿠키 검증·RLS), §7 테스트→T1·3 vitest + T2·4·5 curl + T6 프로덕션. 갭 없음.
- 타입 일관성: `OrderRow`/`StoredOrder`/`OrderStatus`/`ORDER_STATUSES`(T1) → T2·3·4·5 사용처 서명 일치. `OrdersData`(T3) → T5 props 일치.
- 플레이스홀더 없음. `<실제id>`는 검증 절차상 실행 시 결정되는 값으로 명시적 지시임.
