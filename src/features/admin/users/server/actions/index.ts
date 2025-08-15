"use server";

// 👥 USERS SERVER ACTIONS
// =======================
// Next.js 15 Server Actions para administración de usuarios

import { auth } from "@/core/auth/server/auth";
import { headers } from "next/headers";
import { revalidateTag } from "next/cache";

// 🎯 Resultado de acciones
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 📊 GET ALL USERS (replaces GET /api/users)
export async function getAllUsersAction(
  limit: number = 10,
  offset: number = 0,
  searchValue?: string,
  searchField: "email" | "name" = "email"
): Promise<ActionResult<unknown>> {
  try {
    // 🛡️ Auth check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    // Solo admins pueden ver usuarios
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      throw new Error("Permisos insuficientes");
    }

    // Get users from auth API
    const users = await auth.api.listUsers({
      query: {
        limit,
        offset,
        ...(searchValue && {
          searchValue,
          searchField,
          searchOperator: "contains" as const,
        }),
      },
    });

    // Get total count
    const totalResult = await auth.api.listUsers({
      query: { limit: 1000, offset: 0 }, // Large limit to get total count
    });

    return {
      success: true,
      data: {
        users: users.users,
        pagination: {
          total: totalResult.users.length,
          hasMore: users.users.length === limit,
        },
      },
      message: "Users retrieved successfully",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
    };
  }
}

// 🔧 UPDATE USER ROLE (replaces PUT/PATCH /api/users)
export async function updateUserRoleAction(
  formData: FormData
): Promise<ActionResult<unknown>> {
  try {
    // 🛡️ Auth check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      throw new Error("Permisos insuficientes");
    }

    // Extract form data
    const userId = formData.get("userId") as string;
    const newRole = formData.get("role") as string;

    if (!userId || !newRole) {
      throw new Error("User ID and role are required");
    }

    // Validate role
    const validRoles = ["user", "admin", "super_admin"];
    if (!validRoles.includes(newRole)) {
      throw new Error("Invalid role specified");
    }

    // Super admin protection - only super_admin can create/modify super_admin
    if (newRole === "super_admin" && session.user.role !== "super_admin") {
      throw new Error("Only super admins can assign super admin role");
    }

    // Cannot demote yourself
    if (userId === session.user.id) {
      throw new Error("Cannot modify your own role");
    }

    // Update user role (using your existing script logic)
    const { prisma } = await import("@/core/database/prisma");

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 🔄 Invalidate cache
    revalidateTag("users");

    return {
      success: true,
      data: updatedUser,
      message: `User role updated to ${newRole} successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
    };
  }
}

// 🗑️ DELETE USER (replaces DELETE /api/users)
export async function deleteUserAction(
  formData: FormData
): Promise<ActionResult<void>> {
  try {
    // 🛡️ Auth check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "super_admin") {
      throw new Error("Only super admins can delete users");
    }

    const userId = formData.get("userId") as string;

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Cannot delete yourself
    if (userId === session.user.id) {
      throw new Error("Cannot delete your own account");
    }

    // Delete user
    const { prisma } = await import("@/core/database/prisma");

    await prisma.user.delete({
      where: { id: userId },
    });

    // 🔄 Invalidate cache
    revalidateTag("users");

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
    };
  }
}

// 📋 GET USER DETAILS (replaces GET /api/users/[id])
export async function getUserDetailsAction(
  userId: string
): Promise<ActionResult<unknown>> {
  try {
    // 🛡️ Auth check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    // Users can see their own details, admins can see all
    if (
      session.user.id !== userId &&
      session.user.role !== "admin" &&
      session.user.role !== "super_admin"
    ) {
      throw new Error("Permisos insuficientes");
    }

    // Get user details
    const { prisma } = await import("@/core/database/prisma");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        // Add any other fields you want to expose
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      success: true,
      data: user,
      message: "User details retrieved successfully",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
    };
  }
}

// 🔄 BULK OPERATIONS
export async function bulkUpdateUsersAction(
  formData: FormData
): Promise<ActionResult<{ updatedCount: number }>> {
  try {
    // 🛡️ Auth check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      throw new Error("Permisos insuficientes");
    }

    const userIds = formData.getAll("userIds") as string[];
    const newRole = formData.get("newRole") as string;

    if (!userIds.length || !newRole) {
      throw new Error("User IDs and new role are required");
    }

    // Validate role
    const validRoles = ["user", "admin", "super_admin"];
    if (!validRoles.includes(newRole)) {
      throw new Error("Invalid role specified");
    }

    // Super admin protection
    if (newRole === "super_admin" && session.user.role !== "super_admin") {
      throw new Error("Only super admins can assign super admin role");
    }

    // Cannot modify yourself
    if (userIds.includes(session.user.id)) {
      throw new Error("Cannot modify your own role");
    }

    // Bulk update
    const { prisma } = await import("@/core/database/prisma");

    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: {
        role: newRole,
      },
    });

    // 🔄 Invalidate cache
    revalidateTag("users");

    return {
      success: true,
      data: { updatedCount: result.count },
      message: `${result.count} users updated successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
    };
  }
}
