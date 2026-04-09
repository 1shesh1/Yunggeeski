import { NextRequest, NextResponse } from "next/server";
import { getAdminSecret } from "@/lib/env";
import { setAdminCookie } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  const secret = getAdminSecret();
  if (!secret) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password.trim() : "";
  if (password !== secret) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setAdminCookie(response);
  return response;
}
