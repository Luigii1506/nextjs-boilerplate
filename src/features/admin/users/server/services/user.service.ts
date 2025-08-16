import { auth } from "@/core/auth/server";
import { headers } from "next/headers";
import * as userQueries from "../queries/user.queries";
import * as userValidators from "../validators/user.validators";
import * as userMappers from "../mappers";
import type { User } from "../../types";

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

    console.log("🚀 Creating user with data:", {
      email,
      name,
      role,
      currentUserRole: this.options.currentUserRole,
    });

    // Validate business rules
    await userValidators.validateCreateUser(
      this.options.currentUserRole,
      role,
      email
    );

    console.log("✅ Validation passed");

    // Create user using Better Auth
    const result = await auth.api.signUpEmail({
      body: { email, name, password },
      headers: await headers(),
    });

    if (!result.user) {
      throw new Error("Error creando usuario");
    }

    console.log("✅ User created in Better Auth:", {
      userId: result.user.id,
      email: result.user.email,
    });

    // Set role if different from default - Use Prisma for ALL roles
    if (role !== "user") {
      console.log(`🎭 Setting role to: ${role}`);

      try {
        // Use Prisma directly for ALL role assignments (more reliable)
        console.log(
          "🔧 Using Prisma for role assignment (bypassing Better Auth limitations)"
        );
        await userQueries.updateUserRole(result.user.id, role);
        console.log(`✅ Role '${role}' set via Prisma`);
      } catch (roleError) {
        console.error("❌ Error setting role:", {
          error: roleError instanceof Error ? roleError.message : roleError,
          targetRole: role,
          userId: result.user.id,
        });
        // Don't throw here - let's see if we can still return the user
      }
    }

    // Verify final role by getting user from database
    const finalUser = await userQueries.getUserById(result.user.id);
    console.log("🔍 Final user data:", {
      userId: finalUser?.id,
      finalRole: finalUser?.role,
      requestedRole: role,
    });

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

    // 🛡️ Validate permissions for user access
    await userValidators.validateUserAccess(
      this.options.currentUserId,
      this.options.currentUserRole,
      userId
    );

    // 🎭 Handle role changes separately (only if role is actually changing)
    if (role) {
      // Get current user to compare roles
      const currentUser = await userQueries.getUserById(userId);
      if (!currentUser) {
        throw new Error("User not found");
      }

      // Only validate and update if role is actually changing
      if (currentUser.role !== role) {
        await userValidators.validateRoleChange(
          this.options.currentUserId,
          this.options.currentUserRole,
          userId,
          role
        );

        // Update role via Better Auth
        await auth.api.setRole({
          body: { userId, role: role as "admin" | "user" },
          headers: await headers(),
        });
      }
    }

    // 📝 Update basic user data (email, name) if provided
    // This allows users to update their own basic info
    if (email || name) {
      // Use direct database update for basic fields
      await userQueries.updateUserBasicData(userId, { email, name });
    }

    // Get updated user
    const updatedUser = await userQueries.getUserById(userId);
    if (!updatedUser) {
      throw new Error("User not found after update");
    }

    return userMappers.prismaUserToUser(updatedUser);
  }

  // 🎭 Update user role with business logic
  async updateUserRole(
    userId: string,
    newRole: "user" | "admin" | "super_admin"
  ): Promise<User> {
    // Validate business rules
    await userValidators.validateRoleChange(
      this.options.currentUserId,
      this.options.currentUserRole,
      userId,
      newRole
    );

    const updatedUser = await userQueries.updateUserRole(userId, newRole);

    return userMappers.roleUpdateResultToUser(updatedUser);
  }

  // 🗑️ Delete user with business logic
  async deleteUser(userId: string): Promise<void> {
    // Validate business rules
    await userValidators.validateUserDeletion(
      this.options.currentUserId,
      this.options.currentUserRole,
      userId
    );

    await userQueries.deleteUserById(userId);
  }

  // 🚫 Ban user with business logic
  async banUser(userId: string, reason: string): Promise<User> {
    // Validate business rules
    await userValidators.validateUserBan(
      this.options.currentUserId,
      this.options.currentUserRole,
      userId
    );

    // Ban user directly in database (bypass Better Auth API)
    const bannedUser = await userQueries.banUser(userId, reason);

    return userMappers.banUserResultToUser(bannedUser);
  }

  // ✅ Unban user with business logic
  async unbanUser(userId: string): Promise<User> {
    // Validate business rules
    await userValidators.validateUserUnban(
      this.options.currentUserId,
      this.options.currentUserRole,
      userId
    );

    // Unban user directly in database (bypass Better Auth API)
    const unbannedUser = await userQueries.unbanUser(userId);

    return userMappers.unbanUserResultToUser(unbannedUser);
  }

  // 🔄 Bulk update users with business logic
  async bulkUpdateUsers(
    userIds: string[],
    newRole: "user" | "admin" | "super_admin"
  ): Promise<{ updatedCount: number }> {
    // Validate business rules for bulk operations
    await userValidators.validateBulkRoleChange(
      this.options.currentUserId,
      this.options.currentUserRole,
      userIds,
      newRole
    );

    const result = await userQueries.bulkUpdateUsersRole(userIds, newRole);

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
