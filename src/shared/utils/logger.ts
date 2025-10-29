/**
 * 🌐 Structured Logger
 * =====================
 *
 * Minimal structured logger shared across the app.
 * Outputs consistent JSON (level, message, timestamp, metadata).
 *
 * @module shared/utils/logger
 * @version 1.0.0
 */

type LogLevel = "debug" | "info" | "warn" | "error";

type LogMetadata = Record<string, unknown>;

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const configuredLevel = normalizeLogLevel(
  process.env.LOG_LEVEL || process.env.NEXT_PUBLIC_LOG_LEVEL || "info"
);

function normalizeLogLevel(level: string): LogLevel {
  const normalized = level.toLowerCase().trim();
  return (["debug", "info", "warn", "error"] as LogLevel[]).includes(
    normalized as LogLevel
  )
    ? (normalized as LogLevel)
    : "info";
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[configuredLevel];
}

function sanitize(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) => [
        key,
        sanitize(val),
      ])
    );
  }

  return value;
}

function buildPayload(
  level: LogLevel,
  message: string,
  metadata?: LogMetadata
) {
  const base = {
    level,
    timestamp: new Date().toISOString(),
    message,
  };

  if (!metadata || Object.keys(metadata).length === 0) {
    return base;
  }

  return {
    ...base,
    ...sanitize(metadata),
  };
}

function log(level: LogLevel, message: string, metadata?: LogMetadata) {
  if (!shouldLog(level)) {
    return;
  }

  const payload = buildPayload(level, message, metadata);

  const serialized =
    typeof payload === "string" ? payload : JSON.stringify(payload);

  switch (level) {
    case "debug":
      console.debug(serialized);
      break;
    case "info":
      console.info(serialized);
      break;
    case "warn":
      console.warn(serialized);
      break;
    case "error":
    default:
      console.error(serialized);
      break;
  }
}

export const logger = {
  debug(message: string, metadata?: LogMetadata) {
    log("debug", message, metadata);
  },
  info(message: string, metadata?: LogMetadata) {
    log("info", message, metadata);
  },
  warn(message: string, metadata?: LogMetadata) {
    log("warn", message, metadata);
  },
  error(message: string, metadata?: LogMetadata) {
    log("error", message, metadata);
  },
};

export type { LogLevel, LogMetadata };
