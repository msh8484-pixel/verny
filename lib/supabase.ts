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
