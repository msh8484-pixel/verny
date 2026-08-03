import { NextRequest, NextResponse } from "next/server";
import { parseOrder, insertOrder } from "@/lib/orders";

// 주문 제출 → ① Google Apps Script 웹앱(구글시트 기록) + ② 알림 메일 2곳 동시 발송.
// 웹앱 URL은 서버 환경변수 ORDER_WEBHOOK_URL 에만 둔다(클라이언트 비노출·CORS 회피).
// 메일은 FormSubmit(무계정) 서버측 호출 — 시트 웹훅과 독립적으로 동작한다.

const ORDER_MAILS = ["verny260701@gmail.com", "heegeun84@gmail.com"];

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

// 주문 접수 웹앱(구글시트 기록) URL. 환경변수 ORDER_WEBHOOK_URL 이 있으면 그걸 우선 사용하고,
// 없으면 이 기본값을 사용한다(고객 Vercel에 env 미설정이어도 동작하도록). env 설정 시 즉시 override.
const WEBHOOK_FALLBACK =
  "https://script.google.com/macros/s/AKfycbw8W1TK4qs-DR1mTzkwT_gX9-14SM4-tgFt77wa59E7oV-jzb6BlPpiPhz-R-QsQo1Ghw/exec";

async function sendOrderMails(body: Record<string, unknown>) {
  const subject = `[VERNY 주문] ${body.ordererName ?? ""} · ${body.total ?? ""}`;
  const detail =
    typeof body.detail === "string" && body.detail
      ? body.detail
      : JSON.stringify(body, null, 2);
  const results = await Promise.allSettled(
    ORDER_MAILS.map(async (to) => {
      const res = await fetch(`https://formsubmit.co/ajax/${to}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // FormSubmit은 Origin/Referer 없는 요청을 거부한다 — 서버 호출에도 필수
          Origin: "https://verny-beta.vercel.app",
          Referer: "https://verny-beta.vercel.app/order",
        },
        body: JSON.stringify({ _subject: subject, 주문내용: detail }),
      });
      const j = await res.json().catch(() => null);
      console.log("order mail", to, res.status, JSON.stringify(j));
    })
  );
  return results;
}
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.ordererName || !body.ordererPhone) {
    return NextResponse.json({ error: "이름과 연락처는 필수입니다." }, { status: 400 });
  }

  const url = process.env.ORDER_WEBHOOK_URL || WEBHOOK_FALLBACK;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, at: new Date().toISOString() }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "접수 서버 오류(" + res.status + ")" }, { status: 502 });
    }
    // 시트 기록 성공 → 알림 메일 발송(실패해도 주문 접수는 유지)
    await sendOrderMails(body);
    await recordOrder(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
