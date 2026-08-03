import { NextRequest } from "next/server";
import { isBot, parseEvent } from "@/lib/analytics/validate";
import { insertEvent } from "@/lib/supabase";

// 고객사 Vercel(verny.co.kr)에 SUPABASE env 미설정이어도 수집이 동작하도록,
// env가 없으면 키를 보유한 배포로 이벤트를 그대로 전달한다.
// (저장소가 공개라 키 하드코딩은 불가 — 공개 URL 폴백만 둔다. env 설정 시 즉시 직접 적재로 전환.)
const TRACK_FALLBACK = "https://verny-beta.vercel.app/api/track";

// 방문 이벤트 수집 — 어떤 경우에도 204. 추적 실패가 사이트에 영향을 주지 않는다.
export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent");
    if (!isBot(ua)) {
      const body = await req.json().catch(() => null);
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        if (body) {
          await fetch(TRACK_FALLBACK, {
            method: "POST",
            headers: { "Content-Type": "application/json", "User-Agent": ua ?? "" },
            body: JSON.stringify(body),
          });
        }
      } else {
        const ev = parseEvent(body);
        if (ev) await insertEvent(ev);
      }
    }
  } catch (e) {
    console.error("track 수집 실패", e); // 응답은 그대로 204 — fire and forget
  }
  return new Response(null, { status: 204 });
}
