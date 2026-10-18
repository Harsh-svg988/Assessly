import { NextResponse } from "next/server";
import { recordHttpRequest } from "@/lib/metrics";

export const dynamic = "force-dynamic";

// Liveness probe target: process is up and able to serve a response.
// Deliberately does not touch Convex/Clerk/Stream — those are checked by /api/ready.
export async function GET() {
  const start = Date.now();
  const body = { status: "ok", uptime: process.uptime() };
  recordHttpRequest("/api/health", 200, (Date.now() - start) / 1000);
  return NextResponse.json(body);
}
