import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DASH_COOKIE, verifyToken } from "@/lib/dash/auth";
import { fetchEventsSince } from "@/lib/supabase";
import { aggregate } from "@/lib/dash/aggregate";
import LoginForm from "./LoginForm";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

const RANGE_DAYS: Record<string, number> = { today: 1, "7d": 7, "30d": 30 };

// 고객사 Vercel(verny.co.kr)에 env 미설정이어도 대시보드가 동작하도록,
// env가 없으면 키를 보유한 배포로 넘긴다 (주문 웹훅 폴백과 같은 패턴).
const DASH_FALLBACK = "https://verny-beta.vercel.app/dash";

export default async function DashPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.DASH_SECRET) {
    redirect(DASH_FALLBACK);
  }
  const store = await cookies();
  if (!verifyToken(store.get(DASH_COOKIE)?.value)) return <LoginForm />;

  const { range } = await searchParams;
  const rangeKey = range && RANGE_DAYS[range] ? range : "30d";
  // 요청 시각 기준 집계 — force-dynamic 서버 컴포넌트라 렌더마다 새로 읽는 게 의도된 동작
  const now = new Date();
  // 추이 그래프가 항상 30일이므로 조회는 항상 30일치
  const since = new Date(now.getTime() - 30 * 86400000).toISOString();

  let error: string | null = null;
  let data = null;
  try {
    const events = await fetchEventsSince(since);
    data = aggregate(events, now, RANGE_DAYS[rangeKey]);
  } catch (e) {
    error = String(e);
  }

  if (!data) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0f1a", color: "#e5484d", fontFamily: "system-ui" }}>
        데이터를 불러오지 못했습니다. {error}
      </main>
    );
  }
  return <Dashboard data={data} range={rangeKey} />;
}
