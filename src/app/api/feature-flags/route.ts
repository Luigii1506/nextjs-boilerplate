// 🎛️ API FEATURE FLAGS ADMIN
// ========================
// Endpoint para administrar feature flags dinámicamente

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/core/auth/server/auth";
import { featureFlagService } from "@/features/admin/feature-flags/server/services";

// 📊 GET - Obtener todas las feature flags
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admins pueden ver feature flags (verificar rol)
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    // Inicializar flags por defecto si no existen
    await featureFlagService.initializeDefaultFlags();

    // Obtener todas las feature flags de la base de datos
    const flags = await featureFlagService.getAllFeatureFlags();

    return NextResponse.json({
      success: true,
      flags: flags,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting feature flags:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// 🔧 PUT - Actualizar feature flags
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admins pueden modificar feature flags (verificar rol)
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { flagKey, enabled, name, description, rolloutPercentage } = body;

    // Validar entrada
    if (!flagKey) {
      return NextResponse.json(
        { error: "flagKey es requerido" },
        { status: 400 }
      );
    }

    // Actualizar en base de datos
    const updatedFlag = await featureFlagService.updateFlag(
      flagKey,
      { enabled, name, description, rolloutPercentage },
      session.user.id
    );

    // El schema se regenera automáticamente en el servicio si es necesario

    return NextResponse.json({
      success: true,
      flag: updatedFlag,
      updatedBy: session.user.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating feature flag:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// 🔄 POST - Actualizar múltiples feature flags
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admins pueden modificar feature flags (verificar rol)
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { flags } = body;

    // Validar entrada
    if (!flags || typeof flags !== "object") {
      return NextResponse.json(
        { error: "flags object es requerido" },
        { status: 400 }
      );
    }

    // Validar que todas las flags existen
    const { FEATURE_FLAGS } = await import("@/core/config/feature-flags");
    const invalidFlags = Object.keys(flags).filter(
      (flagName) => !(flagName in FEATURE_FLAGS)
    );

    if (invalidFlags.length > 0) {
      return NextResponse.json(
        { error: `Feature flags no válidas: ${invalidFlags.join(", ")}` },
        { status: 400 }
      );
    }

    // TODO: Guardar en base de datos
    // Por ahora solo retornamos confirmación
    console.log(`Feature flags actualizadas por ${session.user.email}:`, flags);

    return NextResponse.json({
      success: true,
      updatedFlags: flags,
      updatedBy: session.user.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating feature flags:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// 🔄 DELETE - Resetear feature flags a valores por defecto
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admins pueden resetear feature flags (verificar rol)
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    // TODO: Limpiar overrides de la base de datos
    console.log(`Feature flags reseteadas por ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: "Feature flags reseteadas a valores por defecto",
      resetBy: session.user.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error resetting feature flags:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
