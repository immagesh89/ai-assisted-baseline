import { vi } from "vitest";

export interface StubResponse {
  status?: number;
  body?: unknown;
}

// Shared test helper: stubs fetch for the endpoints the UI calls, keyed by
// "METHOD /path" (a bare path works too when a test only uses one method).
// Unstubbed requests answer 404 so an unplanned call fails loudly instead of
// quietly resolving to something the test didn't ask for.
export function stubFetch(
  routes: Record<
    string,
    StubResponse | (() => StubResponse | Promise<StubResponse>)
  >,
) {
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const method = (init?.method ?? "GET").toUpperCase();
      const path = String(input);
      const route = routes[`${method} ${path}`] ?? routes[path];

      if (route === undefined) {
        return jsonResponse({ detail: `No stub for ${method} ${path}` }, 404);
      }

      const resolved = typeof route === "function" ? await route() : route;

      return jsonResponse(resolved.body, resolved.status ?? 200);
    },
  );

  vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);

  return fetchMock;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}
