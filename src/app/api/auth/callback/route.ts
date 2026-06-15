import { NextRequest, NextResponse } from "next/server";
import { getTokensFromCode } from "@/lib/google-drive";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  try {
    const tokens = await getTokensFromCode(code);
    const response = NextResponse.redirect(new URL("/", request.url));

    response.cookies.set("access_token", tokens.access_token || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600,
      sameSite: "lax",
    });

    if (tokens.refresh_token) {
      response.cookies.set("refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });
    }

    return response;
  } catch {
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
