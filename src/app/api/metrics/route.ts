import { NextResponse } from "next/server";
import { registry } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = await registry.metrics();
  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": registry.contentType },
  });
}
