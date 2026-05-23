/** @deprecated Use /api/v1/output/generate */
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const origin = new URL(request.url).origin;
  try {
    const res = await fetch(`${origin}/api/v1/output/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "generation_failed", message: "Could not generate document." },
      { status: 500 },
    );
  }
}
