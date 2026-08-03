import { describe, it, expect } from "vitest";
import { aggregateOrders } from "./aggregate-orders";
import type { StoredOrder } from "@/lib/orders";

// 기준시각: KST 2026-08-03 15:00 (= UTC 06:00)
const NOW = new Date("2026-08-03T06:00:00Z");

function order(p: Partial<StoredOrder>): StoredOrder {
  return {
    id: 1, ts: "2026-08-03T05:00:00Z", ord_no: "V-1",
    orderer_name: "홍", orderer_phone: "010", recipient: null, recipient_phone: null,
    address: null, memo: null, items: null, qty: 1, total: 10000,
    receipt: null, tier: null, status: "new", status_ts: null, ...p,
  };
}

const orders: StoredOrder[] = [
  order({ id: 1, ts: "2026-08-03T05:00:00Z", total: 10000, status: "new" }),   // 오늘 KST 14시
  order({ id: 2, ts: "2026-08-03T01:00:00Z", total: 25000, status: "paid" }),  // 오늘 KST 10시
  order({ id: 3, ts: "2026-08-02T05:00:00Z", total: 30000, status: "shipped" }), // 어제
  order({ id: 4, ts: "2026-08-02T20:00:00Z", total: 5000, status: "new" }),    // KST로는 8/3 05시 → 오늘!
];

describe("aggregateOrders (KST)", () => {
  const d = aggregateOrders(orders, NOW);

  it("오늘: 3건 40,000원 (UTC 8/2 20시는 KST 8/3)", () => {
    expect(d.today).toEqual({ count: 3, sales: 40000 });
  });
  it("전체: 4건 70,000원, 미처리 2건", () => {
    expect(d.period).toEqual({ count: 4, sales: 70000, pendingCount: 2 });
  });
  it("일별 매출 30개, 오늘 40,000·어제 30,000", () => {
    expect(d.dailySales).toHaveLength(30);
    expect(d.dailySales[29]).toEqual({ date: "08.03", sales: 40000 });
    expect(d.dailySales[28]).toEqual({ date: "08.02", sales: 30000 });
  });
  it("total이 null인 주문은 매출 0으로 집계, 건수엔 포함", () => {
    const d2 = aggregateOrders([order({ total: null })], NOW);
    expect(d2.today).toEqual({ count: 1, sales: 0 });
  });
  it("빈 배열도 안전", () => {
    const d3 = aggregateOrders([], NOW);
    expect(d3.today).toEqual({ count: 0, sales: 0 });
    expect(d3.period.pendingCount).toBe(0);
    expect(d3.dailySales).toHaveLength(30);
  });
});
