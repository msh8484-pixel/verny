// 대시보드 인증 — HMAC 서명 토큰을 httpOnly 쿠키에 담는다. DB 세션 없음.
import { createHmac, timingSafeEqual } from "crypto";

export const DASH_COOKIE = "vny_dash";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  return process.env.DASH_SECRET || "verny-dash-dev-secret";
}

function mac(exp: number): string {
  return createHmac("sha256", secret()).update(`dash.${exp}`).digest("hex");
}

export function signToken(now: number = Date.now()): string {
  const exp = now + WEEK_MS;
  return `${exp}.${mac(exp)}`;
}

export function verifyToken(token: string | undefined, now: number = Date.now()): boolean {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || exp < now) return false;
  const expect = mac(exp);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expect));
  } catch {
    return false;
  }
}

export function checkPassword(pw: string): boolean {
  return pw === (process.env.DASH_PASSWORD || "1234");
}
