"use server";

/**
 * 👥 USERS ENTERPRISE SERVER ACTIONS
 * ====================================
 *
 * Next.js 15 Server Actions con logging enterprise y performance tracking
 * React 19 + Hexagonal Architecture + Enterprise patterns
 *
 * Updated: 2025-01-17 - Enterprise patterns v2.0
 */

import { revalidateTag, revalidatePath } from "next/cache";
import { createUserService } from "../services/user.service";
import * as schemas from "../../schemas";
import * as validators from "../validators/user.validators";
import {
  usersServerActionLogger,
  usersSecurityLogger,
} from "../../utils/logger";
import { USERS_CACHE_TAGS } from "../../constants";
import type { ActionResult, UserListResponse, User } from "../../types";

// 📊 GET ALL USERS (Enterprise Server Action)
export async function getAllUsersAction(
  limit: number = 10,
  offset: number = 0,
  searchValue?: string,
  searchField: "email" | "name" = "email"
): Promise<ActionResult<UserListResponse>> {
  const requestId = `getAllUsers-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  usersServerActionLogger.debug("Get all users action started", {
    requestId,
    limit,
    offset,
    searchValue,
    searchField,
  });

  try {
    // 🔍 Validate input
    const searchParams = schemas.userSearchSchema.parse({
      limit,
      offset,
      searchValue,
      searchField,
    });

    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateUserListAccess(session.user.role);

    // 🏢 Business logic via service
    const userService = await createUserService();
    const result = await userService.getAllUsers(searchParams);

    usersServerActionLogger.debug("Users retrieved successfully", {
      requestId,
      userCount: result.users.length,
      totalUsers: result.pagination.total,
    });

    return {
      success: true,
      data: result,
      message: "Users retrieved successfully",
      timestamp: new Date().toISOString(),
      requestId,
    };
  } catch (error) {
    usersServerActionLogger.error("Get users failed", error, { requestId });

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
      timestamp: new Date().toISOString(),
      requestId,
    };
  }
}

// 👤 GET USER DETAILS (Enterprise Server Action)
export async function getUserDetailsAction(
  userId: string
): Promise<ActionResult<User>> {
  try {
    // 🔍 Validate input
    const userDetails = schemas.userDetailsSchema.parse({ userId });

    // 🛡️ Session validation
    await validators.getValidatedSession();

    // 🏢 Business logic via service
    const userService = await createUserService();
    const user = await userService.getUserDetails(userDetails.userId);

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

// 👤 CREATE USER (Enterprise Server Action)
export async function createUserAction(
  formData: FormData
): Promise<ActionResult<User>> {
  const requestId = `createUser-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    const userData = schemas.parseCreateUserFormData(formData);

    // 🛡️ Session validation
    const session = await validators.getValidatedSession();

    // 🔐 Security audit log (CRÍTICO)
    usersSecurityLogger.userOperation(
      "CREATE_USER",
      session.user.id,
      null,
      true, // Optimistic success
      {
        requestId,
        targetEmail: userData.email,
        targetRole: userData.role,
        currentUserRole: session.user.role,
      }
    );

    // 🏢 Business logic via service
    const userService = await createUserService();
    const newUser = await userService.createUser(userData);

    // 🔄 Cache invalidation
    revalidateTag(USERS_CACHE_TAGS.USERS);
    revalidateTag(USERS_CACHE_TAGS.USER_STATS);
    revalidatePath("/users");

    usersServerActionLogger.info("User created successfully", {
      requestId,
      userId: newUser.id,
      email: userData.email,
      role: userData.role,
    });

    return {
      success: true,
      data: newUser,
      message: "Usuario creado exitosamente",
      timestamp: new Date().toISOString(),
      requestId,
    };
  } catch (error) {
    usersServerActionLogger.error("Create user failed", error, { requestId });

    // 🔐 Security audit for failed attempt
    usersSecurityLogger.security("CREATE_USER_FAILED", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
      timestamp: new Date().toISOString(),
      requestId,
    };
  }
}

// ✏️ UPDATE USER (Enterprise Server Action)
export async function updateUserAction(
  formData: FormData
): Promise<ActionResult<User>> {
  try {
    // 🔍 Validate and parse input
    const updateData = schemas.parseUpdateUserFormData(formData);

    // 🛡️ Session validation
    await validators.getValidatedSession();

    // 🏢 Business logic via service
    const userService = await createUserService();
    const updatedUser = await userService.updateUser(updateData);

    // 🔄 Cache invalidation
    revalidateTag("users");

    return {
      success: true,
      data: updatedUser,
      message: "Usuario actualizado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
    };
  }
}

// 🎭 UPDATE USER ROLE (Enterprise Server Action)
export async function updateUserRoleAction(
  formData: FormData
): Promise<ActionResult<User>> {
  const requestId = `updateRole-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    // 🔍 Validate and parse input
    const roleData = schemas.parseUpdateRoleFormData(formData);

    // 🛡️ Session validation
    const session = await validators.getValidatedSession();

    // Get current user to log role change
    const userService = await createUserService();
    const currentUser = await userService.getUserDetails(roleData.userId);
    const previousRole = currentUser.role;

    // 🔐 CRITICAL SECURITY AUDIT - Role changes are HIGH security events
    usersSecurityLogger.roleChange(
      session.user.id,
      roleData.userId,
      previousRole,
      roleData.role,
      {
        requestId,
        currentUserRole: session.user.role,
      }
    );

    // 🏢 Business logic via service
    const updatedUser = await userService.updateUserRole(
      roleData.userId,
      roleData.role
    );

    // 🔄 Cache invalidation
    revalidateTag(USERS_CACHE_TAGS.USERS);
    revalidateTag(USERS_CACHE_TAGS.USER_STATS);
    revalidateTag(USERS_CACHE_TAGS.USER_PERMISSIONS);
    revalidatePath("/users");

    usersServerActionLogger.info("User role updated successfully", {
      requestId,
      userId: roleData.userId,
      fromRole: previousRole,
      toRole: roleData.role,
      adminId: session.user.id,
    });

    return {
      success: true,
      data: updatedUser,
      message: `User role updated from ${previousRole} to ${roleData.role} successfully`,
      timestamp: new Date().toISOString(),
      requestId,
    };
  } catch (error) {
    usersServerActionLogger.error("Update user role failed", error, {
      requestId,
    });

    // 🔐 Security audit for failed role change attempt (CRÍTICO)
    usersSecurityLogger.security("ROLE_CHANGE_FAILED", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
      timestamp: new Date().toISOString(),
      requestId,
    };
  }
}

// 🗑️ DELETE USER (Enterprise Server Action)
export async function deleteUserAction(
  formData: FormData
): Promise<ActionResult<void>> {
  try {
    // 🔍 Validate and parse input
    const deleteData = schemas.parseDeleteUserFormData(formData);

    // 🛡️ Session validation
    await validators.getValidatedSession();

    // 🏢 Business logic via service
    const userService = await createUserService();
    await userService.deleteUser(deleteData.userId);

    // 🔄 Cache invalidation
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

// 🚫 BAN USER (Enterprise Server Action)
export async function banUserAction(
  formData: FormData
): Promise<ActionResult<User>> {
  const requestId = `banUser-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    // 🔍 Validate and parse input
    const banData = schemas.parseBanUserFormData(formData);

    // 🛡️ Session validation
    const session = await validators.getValidatedSession();

    // 🔐 CRITICAL SECURITY AUDIT - User banning
    usersSecurityLogger.banOperation(
      session.user.id,
      banData.id,
      "BAN",
      banData.reason,
      {
        requestId,
        currentUserRole: session.user.role,
      }
    );

    // 🏢 Business logic via service
    const userService = await createUserService();
    const bannedUser = await userService.banUser(banData.id, banData.reason);

    // 🔄 Cache invalidation
    revalidateTag(USERS_CACHE_TAGS.USERS);
    revalidateTag(USERS_CACHE_TAGS.USER_STATS);
    revalidatePath("/users");

    usersServerActionLogger.info("User banned successfully", {
      requestId,
      userId: banData.id,
      reason: banData.reason,
      adminId: session.user.id,
    });

    return {
      success: true,
      data: bannedUser,
      message: "Usuario baneado exitosamente",
      timestamp: new Date().toISOString(),
      requestId,
    };
  } catch (error) {
    usersServerActionLogger.error("Ban user failed", error, { requestId });

    // 🔐 Security audit for failed ban attempt (CRÍTICO)
    usersSecurityLogger.security("BAN_USER_FAILED", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
      timestamp: new Date().toISOString(),
      requestId,
    };
  }
}

// ✅ UNBAN USER (Enterprise Server Action)
export async function unbanUserAction(
  formData: FormData
): Promise<ActionResult<User>> {
  try {
    // 🔍 Validate and parse input
    const unbanData = schemas.parseUnbanUserFormData(formData);

    // 🛡️ Session validation
    await validators.getValidatedSession();

    // 🏢 Business logic via service
    const userService = await createUserService();
    const unbannedUser = await userService.unbanUser(unbanData.id);

    // 🔄 Cache invalidation
    revalidateTag("users");

    return {
      success: true,
      data: unbannedUser,
      message: "Usuario desbaneado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
    };
  }
}

// 🔄 BULK UPDATE USERS (Enterprise Server Action)
export async function bulkUpdateUsersAction(
  formData: FormData
): Promise<ActionResult<{ updatedCount: number }>> {
  try {
    // 🔍 Validate and parse input
    const bulkData = schemas.parseBulkUpdateFormData(formData);

    // 🛡️ Session validation
    await validators.getValidatedSession();

    // 🏢 Business logic via service
    const userService = await createUserService();
    const result = await userService.bulkUpdateUsers(
      bulkData.userIds,
      bulkData.newRole
    );

    // 🔄 Cache invalidation
    revalidateTag("users");

    return {
      success: true,
      data: result,
      message: `${result.updatedCount} users updated successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
    };
  }
}
