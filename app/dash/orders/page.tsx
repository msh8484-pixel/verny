import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DASH_COOKIE, verifyToken } from "@/lib/dash/auth";
import { fetchOrders } from "@/lib/orders";
import { aggregateOrders } from "@/lib/dash/aggregate-orders";
import LoginForm from "../LoginForm";
import OrdersView from "./OrdersView";

export const dynamic = "force-dynamic";

// env 없는 배포(verny.co.kr)에서는 키 보유 배포로 넘긴다 — /dash와 동일 패턴.
const FALLBACK = "https://verny-beta.vercel.app/dash/orders";

export default async function OrdersPage() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.DASH_SECRET) {
    redirect(FALLBACK);
  }
  const store = await cookies();
  if (!verifyToken(store.get(DASH_COOKIE)?.value)) return <LoginForm />;

  const now = new Date();
  const since = new Date(now.getTime() - 30 * 86400000).toISOString();

  let error: string | null = null;
  let data = null;
  let orders = null;
  try {
    orders = await fetchOrders(since);
    data = aggregateOrders(orders, now);
  } catch (e) {
    error = String(e);
  }

  if (!data || !orders) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0f1a", color: "#e5484d", fontFamily: "system-ui" }}>
        주문을 불러오지 못했습니다. {error}
      </main>
    );
  }
  return <OrdersView data={data} orders={orders} />;
}
