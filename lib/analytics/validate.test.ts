import { describe, it, expect } from "vitest";
import { parseEvent, isBot } from "./validate";

const VID = "11111111-2222-3333-4444-555555555555";
const SID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const base = { type: "pageview", path: "/socks", vid: VID, sid: SID };

describe("parseEvent", () => {
  it("정상 pageview를 통과시킨다", () => {
    const ev = parseEvent({ ...base, referrer: "https://google.com", device: "mobile" });
    expect(ev).toMatchObject({ type: "pageview", path: "/socks", vid: VID, sid: SID, device: "mobile" });
  });
  it("알 수 없는 type은 거부", () => {
    expect(parseEvent({ ...base, type: "hack" })).toBeNull();
  });
  it("path가 /로 시작하지 않으면 거부", () => {
    expect(parseEvent({ ...base, path: "javascript:alert(1)" })).toBeNull();
  });
  it("/dash 경로는 거부", () => {
    expect(parseEvent({ ...base, path: "/dash" })).toBeNull();
  });
  it("vid가 UUID가 아니면 거부", () => {
    expect(parseEvent({ ...base, vid: "abc" })).toBeNull();
  });
  it("scroll은 25/50/75/100만 허용", () => {
    expect(parseEvent({ ...base, type: "scroll", value: "50" })?.value).toBe("50");
    expect(parseEvent({ ...base, type: "scroll", value: "33" })).toBeNull();
  });
  it("click은 store/order_submit만 허용", () => {
    expect(parseEvent({ ...base, type: "click", value: "order_submit" })?.value).toBe("order_submit");
    expect(parseEvent({ ...base, type: "click", value: "xss" })).toBeNull();
  });
  it("device가 이상하면 null로 정규화", () => {
    expect(parseEvent({ ...base, device: "toaster" })?.device).toBeNull();
  });
  it("긴 referrer는 300자로 자른다", () => {
    const ev = parseEvent({ ...base, referrer: "r".repeat(500) });
    expect(ev?.referrer?.length).toBe(300);
  });
  it("객체가 아니면 거부", () => {
    expect(parseEvent(null)).toBeNull();
    expect(parseEvent("x")).toBeNull();
  });
});

describe("isBot", () => {
  it("Googlebot을 잡는다", () => {
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
  });
  it("일반 브라우저는 통과", () => {
    expect(isBot("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(false);
  });
  it("null은 봇 아님", () => {
    expect(isBot(null)).toBe(false);
  });
});
