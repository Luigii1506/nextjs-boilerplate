import { AppError, ensureAppError, isAppError } from "./AppError";
import type { ActionError, ActionErrorStage, ActionResult } from "../types/api";

const FALLBACK_ERROR: ActionError = {
  code: "UNEXPECTED_ERROR",
  message: "Ocurrió un error inesperado. Intenta nuevamente.",
  stage: "unknown",
  severity: "high",
};

export function normalizeToAppError(
  error: unknown,
  fallback?: Partial<ActionError> & { code: string }
): AppError {
  if (isAppError(error)) {
    return error;
  }

  const fallbackOptions = {
    code: fallback?.code ?? FALLBACK_ERROR.code,
    message: fallback?.message ?? FALLBACK_ERROR.message,
    stage: fallback?.stage ?? FALLBACK_ERROR.stage,
    severity: fallback?.severity ?? FALLBACK_ERROR.severity,
    hint: fallback?.hint,
    context: fallback?.context,
  };

  return ensureAppError(error, fallbackOptions);
}

export function mapErrorToActionResult<T>(
  error: unknown,
  fallback?: Partial<ActionError> & { code: string }
): ActionResult<T> {
  const appError = normalizeToAppError(error, fallback);

  return {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      hint: appError.hint,
      context: appError.context,
      stage: appError.stage,
      severity: appError.severity,
      status: appError.status,
    },
  };
}

export function extractActionErrorMessage(
  error: ActionResult<unknown>["error"],
  fallback: string
): string {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  return error.message ?? fallback;
}

export function getActionErrorStage(
  error: ActionResult<unknown>["error"]
): ActionErrorStage | undefined {
  if (!error || typeof error === "string") {
    return undefined;
  }

  return error.stage;
}
