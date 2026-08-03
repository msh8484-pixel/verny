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
