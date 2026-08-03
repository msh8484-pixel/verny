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
