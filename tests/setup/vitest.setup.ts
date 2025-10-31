import { afterEach, beforeEach, vi } from "vitest";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";

// Mock logger to suppress console output during tests
vi.mock("@/shared/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});
