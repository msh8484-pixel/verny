import { NextRequest, NextResponse } from "next/server";

// 주문 제출 → ① Google Apps Script 웹앱(구글시트 기록) + ② 알림 메일 2곳 동시 발송.
// 웹앱 URL은 서버 환경변수 ORDER_WEBHOOK_URL 에만 둔다(클라이언트 비노출·CORS 회피).
// 메일은 FormSubmit(무계정) 서버측 호출 — 시트 웹훅과 독립적으로 동작한다.

const ORDER_MAILS = ["verny260701@gmail.com", "heegeun84@gmail.com"];

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
        headers: { "Content-Type": "application/json", Accept: "application/json" },
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

  const url = process.env.ORDER_WEBHOOK_URL;
  if (!url) {
    // 아직 웹앱 URL 미설정 — 접수는 실패로 안내(설정 후 정상 동작)
    return NextResponse.json(
      { error: "주문 접수처가 아직 설정되지 않았습니다. 잠시 후 다시 시도해주세요." },
      { status: 503 }
    );
  }

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
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
