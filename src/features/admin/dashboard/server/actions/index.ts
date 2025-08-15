"use server";

import { getServerSession } from "@/core/auth/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * 🏠 DASHBOARD SERVER ACTIONS
 * ==========================
 * Enterprise-grade Server Actions para Dashboard Admin
 *
 * Features:
 * - React 19 useActionState compatible
 * - Cache invalidation optimizada
 * - Error handling robusto
 * - Session validation
 * - Hexagonal architecture compliant
 *
 * Created: 2025-01-29 - Dashboard Enterprise Implementation
 */

// 📊 Result interfaces
interface DashboardActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
  timestamp: string;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  adminUsers: number;
  recentActivity: {
    registrations: number;
    logins: number;
    verifications: number;
  };
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
}

/**
 * 📊 GET DASHBOARD STATS - Enterprise Server Action
 * Obtiene estadísticas del dashboard con caché optimizado
 */
export async function getDashboardStatsServerAction(): Promise<DashboardActionResult> {
  const timestamp = new Date().toISOString();

  try {
    // 🔐 Verificar sesión de admin
    const session = await getServerSession();

    if (!session?.user) {
      redirect("/login");
    }

    // 🛡️ Verificar que sea admin
    const userRole = session.user.role;
    if (!userRole || !["admin", "super_admin"].includes(userRole)) {
      return {
        success: false,
        error: "No tienes permisos de administrador",
        message: "Acceso denegado",
        timestamp,
      };
    }

    // 🗄️ Simular obtención de stats (aquí iría tu lógica real)
    // TODO: Implementar con tu adapter específico cuando esté disponible
    const stats: DashboardStats = {
      totalUsers: 150, // Simulado - implementar con prisma/adapter
      activeUsers: 135,
      bannedUsers: 5,
      adminUsers: 10,
      recentActivity: {
        registrations: 12,
        logins: 89,
        verifications: 45,
      },
    };

    // ✅ Cache invalidation
    revalidateTag("dashboard-stats");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: stats,
      message: "Estadísticas obtenidas exitosamente",
      timestamp,
    };
  } catch (error) {
    console.error("[Dashboard] Error getting stats:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
      message: "Error obteniendo estadísticas",
      timestamp,
    };
  }
}

/**
 * 👥 GET RECENT USERS - Enterprise Server Action
 * Obtiene usuarios recientes para el dashboard
 */
export async function getRecentUsersServerAction(
  limit: number = 5
): Promise<DashboardActionResult> {
  const timestamp = new Date().toISOString();

  try {
    // 🔐 Verificar sesión de admin
    const session = await getServerSession();

    if (!session?.user) {
      redirect("/login");
    }

    // 🛡️ Verificar que sea admin
    const userRole = session.user.role;
    if (!userRole || !["admin", "super_admin"].includes(userRole)) {
      return {
        success: false,
        error: "No tienes permisos de administrador",
        message: "Acceso denegado",
        timestamp,
      };
    }

    // 🗄️ Simular obtención de usuarios recientes
    // TODO: Implementar con tu adapter específico
    const recentUsers: RecentUser[] = [
      {
        id: "1",
        name: "Juan Pérez",
        email: "juan@example.com",
        role: "user",
        status: "active",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      },
      // Más usuarios simulados...
    ];

    // ✅ Cache invalidation
    revalidateTag("recent-users");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: recentUsers.slice(0, limit),
      message: `${recentUsers.length} usuarios recientes obtenidos`,
      timestamp,
    };
  } catch (error) {
    console.error("[Dashboard] Error getting recent users:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
      message: "Error obteniendo usuarios recientes",
      timestamp,
    };
  }
}

/**
 * 🔄 REFRESH DASHBOARD - Enterprise Server Action
 * Refresca todos los datos del dashboard
 */
export async function refreshDashboardServerAction(): Promise<DashboardActionResult> {
  const timestamp = new Date().toISOString();

  try {
    // 🔐 Verificar sesión de admin
    const session = await getServerSession();

    if (!session?.user) {
      redirect("/login");
    }

    // 🛡️ Verificar que sea admin
    const userRole = session.user.role;
    if (!userRole || !["admin", "super_admin"].includes(userRole)) {
      return {
        success: false,
        error: "No tienes permisos de administrador",
        message: "Acceso denegado",
        timestamp,
      };
    }

    // ✅ Invalidar todas las cachés del dashboard
    revalidateTag("dashboard-stats");
    revalidateTag("recent-users");
    revalidateTag("feature-flags");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: null,
      message: "Dashboard actualizado exitosamente",
      timestamp,
    };
  } catch (error) {
    console.error("[Dashboard] Error refreshing:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
      message: "Error actualizando dashboard",
      timestamp,
    };
  }
}

// ========================
// 🎯 LEGACY COMPATIBILITY - Will be deprecated
// ========================
// Para mantener compatibilidad con código existente

export const getDashboardStats = getDashboardStatsServerAction;
export const getRecentUsers = getRecentUsersServerAction;
export const refreshDashboard = refreshDashboardServerAction;
