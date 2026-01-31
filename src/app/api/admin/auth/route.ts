import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  if (!process.env.ADMIN_DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }

  if (password !== process.env.ADMIN_DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}



