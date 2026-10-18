import { NextResponse } from "next/server";
import { recordHttpRequest } from "@/lib/metrics";

export const dynamic = "force-dynamic";

const REQUIRED_ENV = [
  "NEXT_PUBLIC_CONVEX_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_STREAM_API_KEY",
  "STREAM_SECRET_KEY",
] as const;

// Readiness probe target: process is up AND the config needed to reach our
// external dependencies (Convex, Clerk, Stream) is present. Kept to a config
// check rather than live outbound calls so readiness doesn't flap on a
// transient third-party blip that doesn't actually affect served traffic.
export async function GET() {
  const start = Date.now();
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  const status = missing.length > 0 ? 503 : 200;

  recordHttpRequest("/api/ready", status, (Date.now() - start) / 1000);

  if (missing.length > 0) {
    return NextResponse.json(
      { status: "not-ready", missing },
      { status: 503 }
    );
  }

  return NextResponse.json({ status: "ready" });
}
