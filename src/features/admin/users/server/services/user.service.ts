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

    // Set role if different from default
    if (role !== "user") {
      await auth.api.setRole({
        body: {
          userId: result.user.id,
          role: role as "admin" | "user",
        },
        headers: await headers(),
      });
    }

    // Return formatted user using mapper
    return userMappers.betterAuthUserToUser(result.user, role);
  }

  // ✏️ Update user with business logic
  async updateUser(params: {
    userId: string;
    email?: string;
    name?: string;
    role?: "user" | "admin" | "super_admin";
  }): Promise<User> {
    const { userId, role } = params;

    // Validate business rules
    if (role) {
      await userValidators.validateRoleChange(
        this.options.currentUserId,
        this.options.currentUserRole,
        userId,
        role
      );
    }

    // Update role if provided
    if (role) {
      await auth.api.setRole({
        body: { userId, role: role as "admin" | "user" },
        headers: await headers(),
      });
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

    // Ban user using Better Auth
    await auth.api.banUser({
      body: { userId, banReason: reason },
      headers: await headers(),
    });

    // Get updated user
    const bannedUser = await userQueries.getUserById(userId);
    if (!bannedUser) {
      throw new Error("User not found after ban");
    }

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

    // Unban user using Better Auth
    await auth.api.unbanUser({
      body: { userId },
      headers: await headers(),
    });

    // Get updated user
    const unbannedUser = await userQueries.getUserById(userId);
    if (!unbannedUser) {
      throw new Error("User not found after unban");
    }

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("No autorizado");
  }

  return new UserService({
    currentUserId: session.user.id,
    currentUserRole: session.user.role as "user" | "admin" | "super_admin",
  });
};
