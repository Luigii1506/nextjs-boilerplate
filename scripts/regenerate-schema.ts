#!/usr/bin/env tsx
// 🏗️ SCHEMA REGENERATION SCRIPT
// =============================
// Script para regenerar schema.prisma basado en feature flags activos

import { PrismaClient } from "@prisma/client";
import { regenerateSchema } from "../src/core/database/schema-builder";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function getEnabledFlags(): Promise<string[]> {
  const prisma = new PrismaClient();

  try {
    const flags = await prisma.featureFlag.findMany({
      where: { enabled: true },
      select: { key: true },
    });

    return flags.map((flag) => flag.key);
  } catch (error) {
    console.error("Error getting enabled flags:", error);
    // Fallback a flags por defecto si falla
    return ["fileUpload"];
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  try {
    console.log("🏗️  Regenerating Prisma schema from feature flags...");

    // 1. Obtener flags activos
    const enabledFlags = await getEnabledFlags();
    console.log("🎛️  Enabled flags:", enabledFlags);

    // 2. Regenerar schema
    await regenerateSchema(enabledFlags);

    // 3. Regenerar cliente de Prisma
    console.log("🔄 Regenerating Prisma client...");
    await execAsync("npx prisma generate");

    // 4. Opcional: Aplicar cambios a la base de datos
    const shouldPush = process.argv.includes("--push");
    if (shouldPush) {
      console.log("📊 Pushing changes to database...");
      await execAsync("npx prisma db push");
    }

    console.log("✅ Schema regeneration completed!");

    if (!shouldPush) {
      console.log("\n💡 Tip: Use --push to apply changes to database");
      console.log("   npx tsx scripts/regenerate-schema.ts --push");
    }
  } catch (error) {
    console.error("❌ Error regenerating schema:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
