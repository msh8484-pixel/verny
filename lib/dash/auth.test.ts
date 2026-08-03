import { describe, it, expect } from "vitest";
import { signToken, verifyToken, checkPassword } from "./auth";

describe("auth token", () => {
  it("서명한 토큰은 검증을 통과한다", () => {
    expect(verifyToken(signToken())).toBe(true);
  });
  it("만료된 토큰은 거부", () => {
    const past = Date.now() - 8 * 24 * 60 * 60 * 1000;
    expect(verifyToken(signToken(past))).toBe(false);
  });
  it("변조된 토큰은 거부", () => {
    const t = signToken();
    const [exp] = t.split(".");
    expect(verifyToken(`${exp}.${"0".repeat(64)}`)).toBe(false);
  });
  it("만료시각만 바꿔치기해도 거부", () => {
    const t = signToken();
    const mac = t.split(".")[1];
    expect(verifyToken(`${Date.now() + 999999999}.${mac}`)).toBe(false);
  });
  it("undefined/빈 문자열은 거부", () => {
    expect(verifyToken(undefined)).toBe(false);
    expect(verifyToken("")).toBe(false);
  });
});

describe("checkPassword", () => {
  it("기본 비밀번호 1234", () => {
    expect(checkPassword("1234")).toBe(true);
    expect(checkPassword("0000")).toBe(false);
  });
});
