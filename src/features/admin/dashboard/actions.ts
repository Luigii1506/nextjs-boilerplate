"use server";

import { revalidatePath } from "next/cache";
import { User, UserStats } from "@/shared/types/user";
import { ActionResult } from "@/features/admin/users/types";
import * as userQueries from "@/features/admin/users/server/queries";
import * as userMappers from "@/features/admin/users/server/mappers";

/**
 * 📊 DASHBOARD SERVER ACTIONS
 *
 * Server Actions para el módulo simple de dashboard.
 * Maneja estadísticas, usuarios recientes y actualización de datos.
 */

// 📊 Obtener estadísticas del dashboard
export async function getDashboardStatsAction(): Promise<
  ActionResult<UserStats>
> {
  try {
    // 📊 Obtener estadísticas reales de la base de datos
    const rawStats = await userQueries.getDashboardStats();

    // 🔄 Transformar datos usando mapper
    const stats = userMappers.mapDashboardStats(rawStats);

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      error: "Error al obtener estadísticas del dashboard",
    };
  }
}

// 👥 Obtener usuarios recientes
export async function getRecentUsersAction(
  limit: number = 5
): Promise<ActionResult<User[]>> {
  try {
    // 👥 Obtener usuarios recientes reales de la base de datos
    const rawRecentUsers = await userQueries.getRecentUsers(limit);

    // 🔄 Transformar datos usando mapper
    const recentUsers = userMappers.mapRecentUsers(rawRecentUsers);

    return {
      success: true,
      data: recentUsers,
    };
  } catch (error) {
    console.error("Error fetching recent users:", error);
    return {
      success: false,
      error: "Error al obtener usuarios recientes",
    };
  }
}

// 🔄 Actualizar datos del dashboard
export async function refreshDashboardAction(): Promise<ActionResult<void>> {
  try {
    // Simular tiempo de actualización
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Revalidar la página del dashboard
    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Error refreshing dashboard:", error);
    return {
      success: false,
      error: "Error al actualizar el dashboard",
    };
  }
}

// 📈 Obtener datos de actividad (para gráficos)
export async function getDashboardActivityAction(): Promise<
  ActionResult<Record<string, unknown>>
> {
  try {
    // TODO: Implementar lógica real de actividad
    const activityData = {
      registrations: { value: 67, trend: "+12%" },
      logins: { value: 83, trend: "+8%" },
      verifications: { value: 50, trend: "-2%" },
    };

    return {
      success: true,
      data: activityData,
    };
  } catch (error) {
    console.error("Error fetching dashboard activity:", error);
    return {
      success: false,
      error: "Error al obtener datos de actividad",
    };
  }
}
