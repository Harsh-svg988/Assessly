export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@/lib/metrics");
  }
}

export async function onRequestError(
  err: unknown,
  request: { path: string; method: string },
) {
  console.error(
    JSON.stringify({
      level: "error",
      event: "unhandled_request_error",
      path: request.path,
      method: request.method,
      message: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    })
  );
}
