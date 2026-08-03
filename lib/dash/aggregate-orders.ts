// 주문 목록 → 대시보드 주문 통계. 순수 함수, KST(UTC+9) 기준.
import type { StoredOrder } from "@/lib/orders";

export type OrdersData = {
  today: { count: number; sales: number };
  period: { count: number; sales: number; pendingCount: number };
  dailySales: { date: string; sales: number }[];
};

const KST_MS = 9 * 60 * 60 * 1000;

function dayKey(ts: string | Date): string {
  return new Date(new Date(ts).getTime() + KST_MS).toISOString().slice(0, 10);
}

export function aggregateOrders(orders: StoredOrder[], now: Date): OrdersData {
  const todayKey = dayKey(now);
  const sum = (list: StoredOrder[]) => list.reduce((a, o) => a + (o.total ?? 0), 0);

  const todayOrders = orders.filter((o) => dayKey(o.ts) === todayKey);

  const dailySales: OrdersData["dailySales"] = [];
  for (let i = 29; i >= 0; i--) {
    const key = dayKey(new Date(now.getTime() - i * 86400000));
    dailySales.push({
      date: key.slice(5).replace("-", "."),
      sales: sum(orders.filter((o) => dayKey(o.ts) === key)),
    });
  }

  return {
    today: { count: todayOrders.length, sales: sum(todayOrders) },
    period: {
      count: orders.length,
      sales: sum(orders),
      pendingCount: orders.filter((o) => o.status === "new").length,
    },
    dailySales,
  };
}
