import { NextRequest, NextResponse } from "next/server";
import { DASH_COOKIE, checkPassword, signToken } from "@/lib/dash/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !checkPassword(String(body.password ?? ""))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(DASH_COOKIE, signToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
