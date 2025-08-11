import "server-only";
import { FEATURE_FLAGS, type FeatureFlag } from "@/core/config/feature-flags";

type FlagsRecord = Record<FeatureFlag, boolean>;

const TRUE_VALUES = new Set(["1", "true", "on", "yes", "enable", "enabled"]);
const FALSE_VALUES = new Set([
  "0",
  "false",
  "off",
  "no",
  "disable",
  "disabled",
]);

function readEnvOverride(flag: FeatureFlag): boolean | null {
  const key = `FF_${flag.toUpperCase()}`; // ej. FF_FILEUPLOAD=true
  const val = process.env[key];
  if (val == null) return null;
  const norm = String(val).trim().toLowerCase();
  if (TRUE_VALUES.has(norm)) return true;
  if (FALSE_VALUES.has(norm)) return false;
  return null;
}

/**
 * Flag final con prioridad:
 * 1) ENV: FF_<FLAG>=true/false
 * 2) (Opcional) DB override (user/rol/global)
 * 3) Defaults de FEATURE_FLAGS
 */
export async function isFeatureEnabled(
  flag: FeatureFlag,
  opts?: { userId?: string; role?: string }
): Promise<boolean> {
  // 1) ENV
  const env = readEnvOverride(flag);
  if (env !== null) return env;

  // 2) DB (descomentarlo cuando tengas tabla)
  // const db = await readDbOverride(flag, opts);
  // if (db !== null) return db;

  // 3) Defaults
  return FEATURE_FLAGS[flag];
}

export async function getAllFeatureFlags(opts?: {
  userId?: string;
  role?: string;
}): Promise<FlagsRecord> {
  const out = {} as FlagsRecord;
  (Object.keys(FEATURE_FLAGS) as FeatureFlag[]).forEach(
    (f) => (out[f] = FEATURE_FLAGS[f])
  );
  // Aplica overrides respetando prioridad (ENV/DB)
  for (const flag of Object.keys(out) as FeatureFlag[]) {
    out[flag] = await isFeatureEnabled(flag, opts);
  }
  return out;
}

/** Guard para usar en server pages/layouts */
export async function ensureFeatureEnabled(
  flag: FeatureFlag,
  behavior: { notFound?: boolean; redirectTo?: string } = { notFound: true }
) {
  const ok = await isFeatureEnabled(flag);
  if (ok) return;

  if (behavior.redirectTo) {
    const { redirect } = await import("next/navigation");
    redirect(behavior.redirectTo);
  }
  if (behavior.notFound ?? true) {
    const { notFound } = await import("next/navigation");
    notFound();
  }
}

/* ===== Opcional: proveedor DB (descomenta cuando tengas tabla) ===== */
// async function readDbOverride(
//   flag: FeatureFlag,
//   opts?: { userId?: string; role?: string }
// ): Promise<boolean | null> {
//   // Ejemplo de esquema sugerido:
//
//   // model FeatureFlagOverride {
//   //   id        String   @id @default(cuid())
//   //   flag      String   @unique
//   //   value     Boolean
//   //   userId    String?  // null = global
//   //   role      String?  // null = sin target de rol
//   //   updatedAt DateTime @updatedAt
//   // }
//
//   // const { prisma } = await import("@/server/db/client");
//   // const row = await prisma.featureFlagOverride.findFirst({
//   //   where: {
//   //     flag,
//   //     OR: [
//   //       { userId: opts?.userId ?? undefined },
//   //       { role: opts?.role ?? undefined },
//   //       { userId: null, role: null },
//   //     ],
//   //   },
//   //   orderBy: [{ userId: "desc" }, { role: "desc" }], // user > role > global
//   // });
//   // return row ? row.value : null;
//
//   return null;
// }
