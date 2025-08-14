/**
 * 🔄 CACHE INVALIDATION ENDPOINT
 * ==============================
 *
 * Endpoint dedicado para invalidar el cache de feature flags.
 * Se puede llamar desde el cliente después de cambiar flags.
 *
 * Created: 2025-01-29 - For immediate cache invalidation
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/core/auth/server/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admins pueden invalidar cache
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    // 🔄 FORCE CACHE INVALIDATION
    try {
      const { invalidateFeatureFlagsCache } = await import(
        "@/core/config/server-feature-flags"
      );
      await invalidateFeatureFlagsCache();

      console.log(
        `[FeatureFlags] Cache force-invalidated by ${session.user.email}`
      );

      return NextResponse.json({
        success: true,
        message: "Cache invalidated successfully",
        invalidatedBy: session.user.email,
        timestamp: new Date().toISOString(),
      });
    } catch (cacheError) {
      console.error(
        "[FeatureFlags] Force cache invalidation failed:",
        cacheError
      );
      return NextResponse.json(
        {
          success: false,
          error: "Cache invalidation failed",
          details:
            cacheError instanceof Error ? cacheError.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in cache invalidation endpoint:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
