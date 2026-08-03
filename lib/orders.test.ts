import { describe, it, expect } from "vitest";
import { parseOrder } from "./orders";

const base = {
  ordNo: "VERNY-260803-1234",
  ordererName: "홍길동",
  ordererPhone: "010-1234-5678",
  recipient: "김수령",
  recipientPhone: "010-8765-4321",
  address: "(06236) 서울 강남구 테헤란로 1 101호",
  message: "문 앞에 놔주세요",
  items: "선물세트 x2",
  qty: 2,
  total: 59000,
  receipt: "세금계산서 (사업자 123-45-67890)",
  tier: "세트 채널가",
};

describe("parseOrder", () => {
  it("정상 주문을 스네이크케이스 행으로 변환한다", () => {
    expect(parseOrder(base)).toEqual({
      ord_no: "VERNY-260803-1234",
      orderer_name: "홍길동",
      orderer_phone: "010-1234-5678",
      recipient: "김수령",
      recipient_phone: "010-8765-4321",
      address: "(06236) 서울 강남구 테헤란로 1 101호",
      memo: "문 앞에 놔주세요",
      items: "선물세트 x2",
      qty: 2,
      total: 59000,
      receipt: "세금계산서 (사업자 123-45-67890)",
      tier: "세트 채널가",
    });
  });
  it("필수(주문번호·이름·연락처) 누락 시 null", () => {
    expect(parseOrder({ ...base, ordNo: "" })).toBeNull();
    expect(parseOrder({ ...base, ordererName: undefined })).toBeNull();
    expect(parseOrder({ ...base, ordererPhone: 1234 })).toBeNull();
  });
  it("선택 필드 누락은 null로 채운다", () => {
    const r = parseOrder({ ordNo: "V-1", ordererName: "a", ordererPhone: "b" });
    expect(r).toMatchObject({ recipient: null, memo: null, qty: null, total: null });
  });
  it("qty·total은 유한한 0 이상 숫자만, 아니면 null", () => {
    expect(parseOrder({ ...base, qty: -1 })?.qty).toBeNull();
    expect(parseOrder({ ...base, total: "많이" })?.total).toBeNull();
    expect(parseOrder({ ...base, total: Infinity })?.total).toBeNull();
    expect(parseOrder({ ...base, total: 1234.9 })?.total).toBe(1235);
  });
  it("과도한 길이는 절단한다 (address 300, memo·items 500, 나머지 문자열 200)", () => {
    const r = parseOrder({ ...base, address: "a".repeat(400), message: "b".repeat(600), ordererName: "c".repeat(300) });
    expect(r?.address?.length).toBe(300);
    expect(r?.memo?.length).toBe(500);
    expect(r?.orderer_name.length).toBe(200);
  });
  it("객체가 아니면 null", () => {
    expect(parseOrder(null)).toBeNull();
    expect(parseOrder("x")).toBeNull();
  });
});
