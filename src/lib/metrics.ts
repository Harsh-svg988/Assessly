import client from "prom-client";

// A Next.js server process can reload modules (dev HMR) which would try to
// register the same metric twice and throw. Stash the registry on `global`
// so re-evaluation reuses it instead of recreating it.
type MetricsGlobal = typeof globalThis & {
  __assesslyRegistry?: client.Registry;
  __assesslyMetrics?: {
    httpRequestsTotal: client.Counter<string>;
    httpRequestDurationSeconds: client.Histogram<string>;
    externalDependencyDurationSeconds: client.Histogram<string>;
  };
};

const g = globalThis as MetricsGlobal;

export const registry =
  g.__assesslyRegistry ??
  (() => {
    const r = new client.Registry();
    client.collectDefaultMetrics({ register: r, prefix: "assessly_" });
    return r;
  })();
g.__assesslyRegistry = registry;

export const metrics =
  g.__assesslyMetrics ??
  {
    httpRequestsTotal: new client.Counter({
      name: "assessly_http_requests_total",
      help: "Total HTTP requests handled, by route and status code",
      labelNames: ["route", "status"],
      registers: [registry],
    }),
    httpRequestDurationSeconds: new client.Histogram({
      name: "assessly_http_request_duration_seconds",
      help: "HTTP request duration in seconds, by route",
      labelNames: ["route"],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
      registers: [registry],
    }),
    externalDependencyDurationSeconds: new client.Histogram({
      name: "assessly_external_dependency_duration_seconds",
      help: "Latency of calls to external dependencies (Clerk, Convex, Stream)",
      labelNames: ["dependency", "operation", "status"],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
      registers: [registry],
    }),
  };
g.__assesslyMetrics = metrics;

export async function timeExternalCall<T>(
  dependency: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const end = metrics.externalDependencyDurationSeconds.startTimer({
    dependency,
    operation,
  });
  try {
    const result = await fn();
    end({ status: "success" });
    return result;
  } catch (err) {
    end({ status: "error" });
    throw err;
  }
}

export function recordHttpRequest(route: string, status: number, durationSeconds: number) {
  metrics.httpRequestsTotal.inc({ route, status: String(status) });
  metrics.httpRequestDurationSeconds.observe({ route }, durationSeconds);
}
