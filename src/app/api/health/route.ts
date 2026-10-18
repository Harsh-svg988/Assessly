import { NextResponse } from "next/server";

// Liveness probe target: process is up and able to serve a response.
// Deliberately does not touch Convex/Clerk/Stream — those are checked by /api/ready.
export async function GET() {
  return NextResponse.json({ status: "ok", uptime: process.uptime() });
}
