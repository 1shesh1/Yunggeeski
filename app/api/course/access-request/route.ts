import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/env";
import { normalizeCourseEmail, isValidEmailFormat } from "@/lib/courseEmail";
import { getMaxCourseTierForPurchaserEmail } from "@/lib/coursePurchaser";
import { signCourseMagicToken } from "@/lib/courseJwt";
import { sendCourseAccessMagicLinkEmail } from "@/lib/email";
import { isCourseAccessRateLimited } from "@/lib/courseAccessRateLimit";
import { MOCK_MODE } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const raw = typeof body.email === "string" ? body.email : "";
    if (!isValidEmailFormat(raw)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    const email = normalizeCourseEmail(raw);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
    const rateKey = `${ip}:${email}`;
    if (isCourseAccessRateLimited(rateKey)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const maxTier = await getMaxCourseTierForPurchaserEmail(email);
    if (!maxTier) {
      return NextResponse.json({
        ok: true,
        message: "If that email has a purchase, you will receive a link shortly.",
      });
    }

    const token = await signCourseMagicToken(email, maxTier);
    const base = getBaseUrl();
    const verifyUrl = `${base}/api/course/verify?token=${encodeURIComponent(token)}`;

    if (MOCK_MODE) {
      console.info("[course/access-request] MOCK_MODE magic link (would email):", verifyUrl);
      return NextResponse.json({
        ok: true,
        message: "If that email has a purchase, you will receive a link shortly.",
        mockMagicLink: verifyUrl,
      });
    }

    const sent = await sendCourseAccessMagicLinkEmail({ to: email, magicLinkUrl: verifyUrl });
    if (!sent.ok) {
      console.error("[course/access-request] email failed", sent.error);
      return NextResponse.json({ error: "Could not send email. Try again later." }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      message: "If that email has a purchase, you will receive a link shortly.",
    });
  } catch (e) {
    console.error("[course/access-request]", e);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
