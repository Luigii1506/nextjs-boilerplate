#!/usr/bin/env npx tsx

/**
 * Script para convertir un usuario en super administrador
 * Ejecuta: npx tsx scripts/make-super-admin.ts
 */

import { prisma } from "@/core/database/prisma";

async function makeSuperAdmin() {
  try {
    console.log("🔍 Buscando usuarios en la base de datos...");

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (users.length === 0) {
      console.log(
        "❌ No hay usuarios en la base de datos. Primero registra un usuario."
      );
      return;
    }

    console.log("👥 Usuarios encontrados:");
    users.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.name} (${user.email}) - Rol: ${
          user.role || "user"
        }`
      );
    });

    // Opción 1: Hacer super admin al primer usuario
    const firstUser = users[0];

    if (firstUser.role === "super_admin") {
      console.log(`✅ ${firstUser.name} ya es super administrador.`);
    } else {
      await prisma.user.update({
        where: { id: firstUser.id },
        data: { role: "super_admin" },
      });

      console.log(
        `🎉 ${firstUser.name} (${firstUser.email}) ha sido convertido en SUPER ADMINISTRADOR.`
      );

      console.log("🔐 Permisos de super administrador incluyen:");
      console.log("  - ✅ Crear usuarios");
      console.log("  - ✅ Editar usuarios");
      console.log("  - ✅ Eliminar usuarios");
      console.log("  - ✅ Banear/desbanear usuarios");
      console.log("  - ✅ Cambiar roles de usuarios");
      console.log("  - ✅ Operaciones masivas");
    }

    // Mostrar todos los super administradores
    const superAdmins = await prisma.user.findMany({
      where: { role: "super_admin" },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log("\n👑 Super Administradores actuales:");
    if (superAdmins.length === 0) {
      console.log("  - Ninguno");
    } else {
      superAdmins.forEach((admin) => {
        console.log(`  - ${admin.name} (${admin.email})`);
      });
    }

    // Mostrar todos los administradores regulares
    const regularAdmins = await prisma.user.findMany({
      where: { role: "admin" },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log("\n🛡️ Administradores regulares:");
    if (regularAdmins.length === 0) {
      console.log("  - Ninguno");
    } else {
      regularAdmins.forEach((admin) => {
        console.log(`  - ${admin.name} (${admin.email})`);
      });
    }

    console.log(
      "\n💡 Nota: Solo los SUPER ADMINISTRADORES pueden eliminar usuarios."
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if called directly
if (require.main === module) {
  makeSuperAdmin()
    .then(() => {
      console.log("\n✅ Script completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Script fallido:", error);
      process.exit(1);
    });
}

export default makeSuperAdmin;

