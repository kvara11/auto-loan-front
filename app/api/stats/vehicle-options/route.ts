import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiKey = process.env.STAT_API_KEY;

  const res = await fetch(`${backendUrl}/api/stats/vehicle-options`, {
    headers: {
      "X-API-KEY": apiKey ?? "",
      Accept: "application/json",
      Cookie: request.headers.get("cookie") ?? "",
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}