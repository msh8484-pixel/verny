import { NextRequest, NextResponse } from "next/server";

// 신청서 제출 → Google Apps Script 웹앱으로 전달(구글시트 기록 + 메일 발송).
// 웹앱 URL은 서버 환경변수 ORDER_WEBHOOK_URL 에만 둔다(클라이언트 비노출·CORS 회피).
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
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
