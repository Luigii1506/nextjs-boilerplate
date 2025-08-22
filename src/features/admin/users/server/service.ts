import { auth } from "@/core/auth/server";
import { headers } from "next/headers";
import { prisma } from "@/core/database/prisma";
import { createAuditServiceWithHeaders } from "@/features/audit/server";
import * as userQueries from "./queries";
import * as userValidators from "./validators";
import { ValidationError } from "./validators";
import * as userMappers from "./mappers";
import type { User } from "../types";

// 🏢 USER SERVICE
// ===============
// Lógica de negocio para gestión de usuarios - Orquesta queries y validaciones

export interface UserListResult {
  users: User[];
  pagination: {
    total: number;
    hasMore: boolean;
  };
}

export interface UserServiceOptions {
  currentUserId: string;
  currentUserRole: "user" | "admin" | "super_admin";
}

export class UserService {
  constructor(private options: UserServiceOptions) {}

  // 📊 Get all users with business logic
  async getAllUsers(params: {
    limit: number;
    offset: number;
    searchValue?: string;
    searchField: "email" | "name";
  }): Promise<UserListResult> {
    const { limit, offset, searchValue, searchField } = params;

    // Build search condition
    const searchCondition = userQueries.buildUserSearchCondition(
      searchValue,
      searchField
    );

    // Execute queries in parallel
    const [users, totalCount] = await Promise.all([
      userQueries.getUsersWithPagination({
        where: searchCondition,
        skip: offset,
        take: limit,
      }),
      userQueries.getUsersCount(searchCondition),
    ]);

    // Transform data to domain model using mapper
    const transformedUsers = userMappers.prismaUsersToUsers(users);

    return userMappers.usersToUserListResponse(
      transformedUsers,
      totalCount,
      users.length === limit
    );
  }

  // 👤 Get user details with permission check
  async getUserDetails(userId: string): Promise<User> {
    // Validate permissions
    await userValidators.validateUserAccess(
      this.options.currentUserId,
      this.options.currentUserRole,
      userId
    );

    const user = await userQueries.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return userMappers.prismaUserToUser(user);
  }

  // 👤 Create user with business logic
  async createUser(userData: {
    email: string;
    name: string;
    password: string;
    role: "user" | "admin" | "super_admin";
  }): Promise<User> {
    const { email, name, password, role } = userData;

    // Validate business rules
    await userValidators.validateCreateUser(
      this.options.currentUserRole,
      role,
      email
    );

    // Create user using Better Auth
    const result = await auth.api.signUpEmail({
      body: { email, name, password },
      headers: await headers(),
    });

    if (!result.user) {
      throw new Error("Error creando usuario");
    }

    // Set role if different from default - Use Prisma directly
    if (role !== "user") {
      try {
        // 🏢 SERVICE: Use Prisma directly for role assignment (escritura)
        await prisma.user.update({
          where: { id: result.user.id },
          data: { role },
        });
      } catch (roleError) {
        throw new Error(
          `Error setting role: ${
            roleError instanceof Error ? roleError.message : "Unknown error"
          }`
        );
      }
    }

    // Verify final role by getting user from database
    const finalUser = await userQueries.getUserById(result.user.id);

    // 📊 AUDIT: Log user creation ONLY for admin/super_admin roles (security-critical)
    if (role === "admin" || role === "super_admin") {
      try {
        const { service: auditService, requestInfo } =
          await createAuditServiceWithHeaders();
        await auditService.createAuditEvent(
          {
            action: "create",
            resource: "user",
            resourceId: result.user.id,
            resourceName: name,
            description: `Usuario ${name} creado con rol privilegiado ${role}`,
            severity: "high", // Privileged user creation is high severity
            metadata: {
              email,
              role,
              createdBy: this.options.currentUserId,
              source: "admin_panel",
              privileged: true,
            },
          },
          requestInfo
        );
      } catch (auditError) {
        console.error(
          "Error logging privileged user creation audit:",
          auditError
        );
      }
    }

    // Return formatted user using mapper with the actual role from database
    return userMappers.betterAuthUserToUser(
      result.user,
      (finalUser?.role as "user" | "admin" | "super_admin") || role
    );
  }

  // ✏️ Update user with business logic
  async updateUser(params: {
    userId: string;
    email?: string;
    name?: string;
    role?: "user" | "admin" | "super_admin";
  }): Promise<User> {
    const { userId, email, name, role } = params;

    // Get current user data for audit comparison
    const currentUser = await userQueries.getUserById(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    // 🛡️ Validate permissions for user access
    await userValidators.validateUserAccess(
      this.options.currentUserId,
      this.options.currentUserRole,
      userId
    );

    // Track changes for audit
    const changes: Array<{
      field: string;
      fieldLabel: string;
      oldValue: string;
      newValue: string;
    }> = [];

    // 🎭 Handle role changes separately (only if role is actually changing)
    if (role && currentUser.role !== role) {
      await userValidators.validateRoleChange(
        this.options.currentUserId,
        this.options.currentUserRole,
        userId,
        role
      );

      // Track role change for audit
      changes.push({
        field: "role",
        fieldLabel: "Rol",
        oldValue: currentUser.role || "user",
        newValue: role,
      });

      // Update role via Better Auth
      await auth.api.setRole({
        body: { userId, role: role as "admin" | "user" },
        headers: await headers(),
      });
    }

    // 📝 Update basic user data (email, name) if provided
    if (email || name) {
      const updateData: { email?: string; name?: string } = {};

      if (email !== undefined && email !== currentUser.email) {
        updateData.email = email;
        changes.push({
          field: "email",
          fieldLabel: "Email",
          oldValue: currentUser.email,
          newValue: email,
        });
      }

      if (name !== undefined && name !== currentUser.name) {
        updateData.name = name;
        changes.push({
          field: "name",
          fieldLabel: "Nombre",
          oldValue: currentUser.name || "",
          newValue: name,
        });
      }

      // Only update if there are actual changes
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: updateData,
        });
      }
    }

    // Get updated user
    const updatedUser = await userQueries.getUserById(userId);
    if (!updatedUser) {
      throw new Error("User not found after update");
    }

    // 📊 AUDIT: Log ONLY role changes (security-critical)
    const roleChanges = changes.filter((c) => c.field === "role");
    if (roleChanges.length > 0) {
      try {
        const { service: auditService, requestInfo } =
          await createAuditServiceWithHeaders();
        await auditService.createAuditEvent(
          {
            action: "role_change",
            resource: "user",
            resourceId: userId,
            resourceName: updatedUser.name || updatedUser.email,
            description: `Rol de usuario ${
              updatedUser.name || updatedUser.email
            } cambiado`,
            severity: "critical", // Role changes are always critical
            metadata: {
              updatedBy: this.options.currentUserId,
              previousRole: roleChanges[0].oldValue,
              newRole: roleChanges[0].newValue,
              source: "admin_panel",
            },
            changes: roleChanges,
          },
          requestInfo
        );
      } catch (auditError) {
        console.error("Error logging role change audit:", auditError);
      }
    }

    return userMappers.prismaUserToUser(updatedUser);
  }

  // 🎭 Update user role with business logic
  async updateUserRole(
    userId: string,
    newRole: "user" | "admin" | "super_admin"
  ): Promise<User> {
    // Get current user data for audit comparison
    const currentUser = await userQueries.getUserById(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    const previousRole = currentUser.role || "user";

    // Validate business rules
    await userValidators.validateRoleChange(
      this.options.currentUserId,
      this.options.currentUserRole,
      userId,
      newRole
    );

    // 🏢 SERVICE: Use Prisma directly for role update (escritura)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        banned: true,
        banReason: true,
        banExpires: true,
      },
    });

    // 📊 AUDIT: Log role change (CRITICAL security event)
    try {
      const { service: auditService, requestInfo } =
        await createAuditServiceWithHeaders();
      await auditService.createAuditEvent(
        {
          action: "role_change",
          resource: "user",
          resourceId: userId,
          resourceName: updatedUser.name || updatedUser.email,
          description: `Rol cambiado de ${previousRole} a ${newRole}`,
          severity: "critical", // Role changes are always critical
          metadata: {
            changedBy: this.options.currentUserId,
            previousRole,
            newRole,
            source: "admin_panel",
          },
          changes: [
            {
              field: "role",
              fieldLabel: "Rol del Usuario",
              oldValue: previousRole,
              newValue: newRole,
            },
          ],
        },
        requestInfo
      );
    } catch (auditError) {
      console.error("Error logging role change audit:", auditError);
    }

    return userMappers.roleUpdateResultToUser(updatedUser);
  }

  // 🗑️ Delete user with business logic
  async deleteUser(userId: string): Promise<void> {
    try {
      // 1. Obtener usuario actual (quien ejecuta la acción)
      const currentUserData = await userQueries.getUserById(
        this.options.currentUserId
      );
      if (!currentUserData) {
        throw new ValidationError("Usuario actual no encontrado");
      }

      // 2. Obtener usuario a eliminar
      const targetUserData = await userQueries.getUserById(userId);
      if (!targetUserData) {
        throw new ValidationError("Usuario a eliminar no encontrado");
      }

      // 3. Mapear a tipos de dominio
      const currentUser = userMappers.prismaUserToUser(currentUserData);
      const targetUser = userMappers.prismaUserToUser(targetUserData);

      // 4. Validar permisos y reglas de negocio
      await userValidators.validateUserDeletion(
        currentUser,
        targetUser,
        userId
      );

      // 5. Ejecutar eliminación - 🏢 SERVICE: Use Prisma directly (escritura)
      await prisma.user.delete({
        where: { id: userId },
      });

      // 6. 📊 AUDIT: Log user deletion (CRITICAL security event)
      try {
        const { service: auditService, requestInfo } =
          await createAuditServiceWithHeaders();
        await auditService.createAuditEvent(
          {
            action: "delete",
            resource: "user",
            resourceId: userId,
            resourceName: targetUser.name || targetUser.email,
            description: `Usuario ${
              targetUser.name || targetUser.email
            } eliminado permanentemente`,
            severity: "critical", // User deletion is always critical
            metadata: {
              deletedBy: this.options.currentUserId,
              userEmail: targetUser.email,
              userRole: targetUser.role,
              source: "admin_panel",
              recoverable: false,
            },
          },
          requestInfo
        );
      } catch (auditError) {
        console.error("Error logging user deletion audit:", auditError);
      }

      console.log(`User ${targetUser.email} deleted by ${currentUser.email}`);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      console.error("Error deleting user:", error);
      throw new ValidationError("Error interno al eliminar usuario");
    }
  }

  // 🚫 Ban user with business logic
  async banUser(userId: string, reason: string): Promise<User> {
    // Get current user data for audit
    const currentUser = await userQueries.getUserById(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Validate business rules
    await userValidators.validateUserBan(
      this.options.currentUserId,
      this.options.currentUserRole,
      userId
    );

    // 🏢 SERVICE: Ban user directly in database (escritura)
    const bannedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        banned: true,
        banReason: reason,
        banExpires: undefined, // Could be set based on business rules
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
      },
    });

    // 📊 AUDIT: Log user ban ONLY if not already banned (avoid duplicate events)
    if (!currentUser.banned) {
      try {
        const { service: auditService, requestInfo } =
          await createAuditServiceWithHeaders();
        await auditService.createAuditEvent(
          {
            action: "ban",
            resource: "user",
            resourceId: userId,
            resourceName: bannedUser.name || bannedUser.email,
            description: `Usuario ${
              bannedUser.name || bannedUser.email
            } baneado: ${reason}`,
            severity: "high", // User banning is high severity
            metadata: {
              bannedBy: this.options.currentUserId,
              reason,
              source: "admin_panel",
              userRole: currentUser.role,
            },
          },
          requestInfo
        );
      } catch (auditError) {
        console.error("Error logging user ban audit:", auditError);
      }
    }

    return userMappers.banUserResultToUser(bannedUser);
  }

  // ✅ Unban user with business logic
  async unbanUser(userId: string): Promise<User> {
    // Get current user data for audit
    const currentUser = await userQueries.getUserById(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Validate business rules
    await userValidators.validateUserUnban(
      this.options.currentUserId,
      this.options.currentUserRole,
      userId
    );

    // 🏢 SERVICE: Unban user directly in database (escritura)
    const unbannedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        banned: false,
        banReason: null,
        banExpires: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
      },
    });

    // 📊 AUDIT: Log user unban ONLY if actually banned (avoid unnecessary events)
    if (currentUser.banned) {
      try {
        const { service: auditService, requestInfo } =
          await createAuditServiceWithHeaders();
        await auditService.createAuditEvent(
          {
            action: "unban",
            resource: "user",
            resourceId: userId,
            resourceName: unbannedUser.name || unbannedUser.email,
            description: `Usuario ${
              unbannedUser.name || unbannedUser.email
            } desbaneado`,
            severity: "medium", // User unbanning is medium severity
            metadata: {
              unbannedBy: this.options.currentUserId,
              previousReason: currentUser.banReason || "",
              source: "admin_panel",
              userRole: currentUser.role,
            },
          },
          requestInfo
        );
      } catch (auditError) {
        console.error("Error logging user unban audit:", auditError);
      }
    }

    return userMappers.unbanUserResultToUser(unbannedUser);
  }

  // 🔄 Bulk update users with business logic
  async bulkUpdateUsers(
    userIds: string[],
    newRole: "user" | "admin" | "super_admin"
  ): Promise<{ updatedCount: number }> {
    // Get current users data for audit comparison
    const currentUsers = await Promise.all(
      userIds.map((id) => userQueries.getUserById(id))
    );
    const validUsers = currentUsers.filter((user) => user !== null);

    // Validate business rules for bulk operations
    await userValidators.validateBulkRoleChange(
      this.options.currentUserId,
      this.options.currentUserRole,
      userIds,
      newRole
    );

    // 🏢 SERVICE: Bulk update users role directly (escritura)
    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: {
        role: newRole,
      },
    });

    // 📊 AUDIT: Log ONLY summary for bulk operations (avoid spam)
    if (result.count > 0) {
      try {
        const { service: auditService, requestInfo } =
          await createAuditServiceWithHeaders();

        // Log single summary event for bulk operation (more efficient)
        const affectedUsers = validUsers.filter(
          (user) => user && user.role !== newRole
        );
        await auditService.createAuditEvent(
          {
            action: "role_change",
            resource: "user",
            resourceId: "bulk_operation",
            resourceName: "Operación Masiva de Roles",
            description: `Actualización masiva: ${result.count} usuarios cambiados a rol ${newRole}`,
            severity: "critical", // Bulk role changes are always critical
            metadata: {
              changedBy: this.options.currentUserId,
              newRole,
              userCount: result.count,
              affectedUserIds: affectedUsers.map((u) => u?.id).filter(Boolean),
              source: "admin_panel",
              operationType: "bulk_role_change",
            },
          },
          requestInfo
        );
      } catch (auditError) {
        console.error("Error logging bulk update audit:", auditError);
      }
    }

    return userMappers.bulkUpdateResultToResponse(result);
  }
}

// 🏭 Factory function to create UserService with session
export const createUserService = async (): Promise<UserService> => {
  // Use the same session validation logic as validators
  const session = await userValidators.getValidatedSession();

  return new UserService({
    currentUserId: session.user.id,
    currentUserRole: session.user.role,
  });
};
