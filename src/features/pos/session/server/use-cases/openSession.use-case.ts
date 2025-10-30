/**
 * 🏪 Open Session Use-Case
 * ========================
 *
 * Wraps validation + persistence for opening a POS session.
 * Keeps the server action focused on HTTP concerns.
 */

import { CreatePOSSessionSchema } from "../../../schemas";
import * as queries from "../queries";
import { logger } from "@/shared/utils/logger";
import { createPOSError } from "../../../errors";
import { isAppError } from "@/shared/errors";
import { ZodError } from "zod";

export interface OpenSessionInput {
  userId: string;
  initialCash: number;
  notes?: string;
}

export async function openSessionUseCase(input: OpenSessionInput) {
  try {
    const validated = CreatePOSSessionSchema.parse(input);

    logger.info("POS Session Use-Case: opening session", {
      userId: validated.userId,
      initialCash: validated.initialCash,
    });

    const session = await queries.createSession(
      validated.userId,
      validated.initialCash,
      validated.notes
    );

    return session;
  } catch (error) {
    if (error instanceof ZodError) {
      throw createPOSError("SESSION_VALIDATION_FAILED", {
        hint: error.issues[0]?.message,
        context: { issues: error.issues },
      });
    }

    if (isAppError(error)) {
      throw error;
    }

    throw createPOSError("SESSION_OPEN_FAILED", {
      cause: error,
      context: { userId: input.userId },
    });
  }
}
