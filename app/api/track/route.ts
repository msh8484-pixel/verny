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
  } catch (e) {
    console.error("track 수집 실패", e); // 응답은 그대로 204 — fire and forget
  }
  return new Response(null, { status: 204 });
}
