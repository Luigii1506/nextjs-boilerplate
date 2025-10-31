import type { Headers } from "next/dist/server/web/spec-extension/fetch-event";
import { vi } from "vitest";

type HeadersRecord = Record<string, string | undefined>;

export const createHeaders = (values: HeadersRecord = {}) => {
  const data = new Map<string, string>();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined) {
      data.set(key.toLowerCase(), value);
    }
  });

  return {
    get: (name: string) => data.get(name.toLowerCase()) ?? null,
  } as unknown as Headers;
};

export const mockNextHeaders = (values: HeadersRecord = {}) => {
  const headers = createHeaders(values);
  vi.mock("next/headers", () => ({
    headers: async () => headers,
  }));

  return headers;
};
