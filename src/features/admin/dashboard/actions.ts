"use server";

import { revalidatePath } from "next/cache";
import { User, UserStats } from "@/shared/types/user";
import { ActionResult } from "@/features/admin/users/types";

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
    // TODO: Implementar lógica real de estadísticas
    // Por ahora, datos mock para demostración
    const stats: UserStats = {
      total: 156,
      active: 142,
      banned: 8,
      admins: 6,
    };

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
    // TODO: Implementar lógica real de usuarios recientes
    // Por ahora, datos mock para demostración
    const recentUsers: User[] = [
      {
        id: "1",
        name: "Juan Pérez",
        email: "juan@example.com",
        emailVerified: true,
        role: "user" as const,
        image: null,
        createdAt: "2024-01-15T00:00:00Z",
        updatedAt: "2024-01-17T00:00:00Z",
        lastLogin: "2024-01-17T10:30:00Z",
        banned: false,
      },
      {
        id: "2",
        name: "María García",
        email: "maria@example.com",
        emailVerified: true,
        role: "admin" as const,
        image: null,
        createdAt: "2024-01-14T00:00:00Z",
        updatedAt: "2024-01-17T00:00:00Z",
        lastLogin: "2024-01-17T09:15:00Z",
        banned: false,
      },
      {
        id: "3",
        name: "Carlos López",
        email: "carlos@example.com",
        emailVerified: true,
        role: "user" as const,
        image: null,
        createdAt: "2024-01-13T00:00:00Z",
        updatedAt: "2024-01-16T00:00:00Z",
        lastLogin: "2024-01-16T14:20:00Z",
        banned: false,
      },
    ].slice(0, limit);

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
