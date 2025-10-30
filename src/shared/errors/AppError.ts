import type { ActionErrorStage, ActionErrorSeverity } from "../types/api";

export interface AppErrorOptions {
  code: string;
  message: string;
  stage?: ActionErrorStage;
  status?: number;
  hint?: string;
  severity?: ActionErrorSeverity;
  context?: Record<string, unknown>;
  cause?: unknown;
}

export class AppError extends Error {
  readonly code: string;
  readonly stage?: ActionErrorStage;
  readonly status?: number;
  readonly hint?: string;
  readonly severity?: ActionErrorSeverity;
  readonly context?: Record<string, unknown>;
  readonly cause?: unknown;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = options.code;
    this.code = options.code;
    this.stage = options.stage;
    this.status = options.status;
    this.hint = options.hint;
    this.severity = options.severity;
    this.context = options.context;
    this.cause = options.cause;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      stage: this.stage,
      status: this.status,
      hint: this.hint,
      severity: this.severity,
      context: this.context,
    };
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function ensureAppError(
  error: unknown,
  fallback: AppErrorOptions
): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error
  ) {
    const generic = error as Partial<AppErrorOptions>;
    return new AppError({
      ...fallback,
      code: typeof generic.code === "string" ? generic.code : fallback.code,
      message:
        typeof generic.message === "string"
          ? generic.message
          : fallback.message,
      stage:
        typeof generic.stage === "string"
          ? (generic.stage as ActionErrorStage)
          : fallback.stage,
      hint:
        typeof generic.hint === "string" ? generic.hint : fallback.hint,
      severity:
        typeof generic.severity === "string"
          ? (generic.severity as ActionErrorSeverity)
          : fallback.severity,
      context:
        typeof generic.context === "object" && generic.context
          ? (generic.context as Record<string, unknown>)
          : fallback.context,
      cause: "cause" in generic ? generic.cause : fallback.cause,
      status:
        typeof generic.status === "number" ? generic.status : fallback.status,
    });
  }

  return new AppError({
    ...fallback,
    cause: error,
  });
}
