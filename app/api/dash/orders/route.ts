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
