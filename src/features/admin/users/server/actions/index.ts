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

  usersServerActionLogger.timeStart(`Get Users ${requestId}`);
  usersServerActionLogger.info("Get all users action started", {
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

    usersServerActionLogger.debug("Input validated", {
      requestId,
      searchParams,
    });

    // 🛡️ Session validation
    const session = await validators.getValidatedSession();
    validators.validateUserListAccess(session.user.role);

    usersServerActionLogger.debug("Session validated", {
      requestId,
      userId: session.user.id,
      userRole: session.user.role,
    });

    // 🏢 Business logic via service
    const userService = await createUserService();
    const startTime = Date.now();
    const result = await userService.getAllUsers(searchParams);
    const queryDuration = Date.now() - startTime;

    usersServerActionLogger.query(
      "getAllUsers",
      queryDuration,
      result.users.length,
      {
        requestId,
        limit: searchParams.limit,
        offset: searchParams.offset,
      }
    );

    usersServerActionLogger.timeEnd(`Get Users ${requestId}`);
    usersServerActionLogger.info("Users retrieved successfully", {
      requestId,
      userCount: result.users.length,
      totalUsers: result.pagination.total,
      queryDuration,
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
    usersServerActionLogger.timeEnd(`Get Users ${requestId}`);

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

  usersServerActionLogger.timeStart(`Create User ${requestId}`);
  usersServerActionLogger.info("Create user action started", { requestId });

  try {
    const userData = schemas.parseCreateUserFormData(formData);

    usersServerActionLogger.debug("Create user data validated", {
      requestId,
      email: userData.email,
      role: userData.role,
      // Password is NOT logged for security
    });

    // 🛡️ Session validation
    const session = await validators.getValidatedSession();

    usersServerActionLogger.debug("Session validated for user creation", {
      requestId,
      adminId: session.user.id,
      adminRole: session.user.role,
    });

    // 🔐 Security audit log
    usersSecurityLogger.userOperation(
      "CREATE_USER",
      session.user.id,
      null,
      true, // Optimistic success
      {
        requestId,
        targetEmail: userData.email,
        targetRole: userData.role,
        adminRole: session.user.role,
      }
    );

    // 🏢 Business logic via service
    const userService = await createUserService();
    const startTime = Date.now();
    const newUser = await userService.createUser(userData);
    const operationDuration = Date.now() - startTime;

    usersServerActionLogger.performance("createUser", operationDuration, {
      requestId,
      userId: newUser.id,
      operationType: "USER_CREATION",
    });

    // 🔄 Cache invalidation with enterprise logging
    revalidateTag(USERS_CACHE_TAGS.USERS);
    revalidateTag(USERS_CACHE_TAGS.USER_STATS);
    revalidatePath("/users");

    usersServerActionLogger.cache("SET", USERS_CACHE_TAGS.USERS, {
      requestId,
      action: "INVALIDATE_AFTER_CREATE",
    });

    usersServerActionLogger.timeEnd(`Create User ${requestId}`);
    usersServerActionLogger.info("User created successfully", {
      requestId,
      userId: newUser.id,
      email: userData.email,
      role: userData.role,
      operationDuration,
    });

    // 📊 Analytics event
    usersServerActionLogger.analytics("user_created", {
      requestId,
      userId: newUser.id,
      role: userData.role,
      adminId: session.user.id,
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
    usersServerActionLogger.timeEnd(`Create User ${requestId}`);

    // 🔐 Security audit for failed attempt
    try {
      const userData = schemas.parseCreateUserFormData(formData);
      usersSecurityLogger.securityEvent(
        "CREATE_USER_FAILED",
        {
          requestId,
          targetEmail: userData.email,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "MEDIUM"
      );
    } catch {
      // If we can't parse form data, just log the failure
      usersSecurityLogger.securityEvent(
        "CREATE_USER_PARSE_FAILED",
        {
          requestId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "HIGH"
      );
    }

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

  usersServerActionLogger.timeStart(`Update Role ${requestId}`);
  usersServerActionLogger.info("Update user role action started", {
    requestId,
  });

  try {
    // 🔍 Validate and parse input
    const roleData = schemas.parseUpdateRoleFormData(formData);

    usersServerActionLogger.debug("Role change data validated", {
      requestId,
      userId: roleData.userId,
      newRole: roleData.role,
    });

    // 🛡️ Session validation
    const session = await validators.getValidatedSession();

    // Get current user to log role change
    const userService = await createUserService();
    const currentUser = await userService.getUserDetails(roleData.userId);
    const previousRole = currentUser.role;

    usersServerActionLogger.debug("Session validated for role change", {
      requestId,
      adminId: session.user.id,
      adminRole: session.user.role,
      targetUserId: roleData.userId,
      fromRole: previousRole,
      toRole: roleData.role,
    });

    // 🔐 CRITICAL SECURITY AUDIT - Role changes are HIGH security events
    usersSecurityLogger.roleChange(
      session.user.id,
      roleData.userId,
      previousRole,
      roleData.role,
      {
        requestId,
        adminRole: session.user.role,
        ipAddress: "TODO", // Would come from headers
        userAgent: "TODO", // Would come from headers
      }
    );

    // 🏢 Business logic via service
    const startTime = Date.now();
    const updatedUser = await userService.updateUserRole(
      roleData.userId,
      roleData.role
    );
    const operationDuration = Date.now() - startTime;

    usersServerActionLogger.performance("updateUserRole", operationDuration, {
      requestId,
      userId: roleData.userId,
      operationType: "ROLE_CHANGE",
      fromRole: previousRole,
      toRole: roleData.role,
    });

    // 🔄 Cache invalidation with enterprise logging
    revalidateTag(USERS_CACHE_TAGS.USERS);
    revalidateTag(USERS_CACHE_TAGS.USER_STATS);
    revalidateTag(USERS_CACHE_TAGS.USER_PERMISSIONS); // Important for role changes
    revalidatePath("/users");

    usersServerActionLogger.cache("SET", USERS_CACHE_TAGS.USERS, {
      requestId,
      action: "INVALIDATE_AFTER_ROLE_CHANGE",
    });

    usersServerActionLogger.timeEnd(`Update Role ${requestId}`);
    usersServerActionLogger.info("User role updated successfully", {
      requestId,
      userId: roleData.userId,
      fromRole: previousRole,
      toRole: roleData.role,
      adminId: session.user.id,
      operationDuration,
    });

    // 📊 Critical analytics event for role changes
    usersServerActionLogger.analytics("role_changed", {
      requestId,
      userId: roleData.userId,
      fromRole: previousRole,
      toRole: roleData.role,
      adminId: session.user.id,
      adminRole: session.user.role,
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
    usersServerActionLogger.timeEnd(`Update Role ${requestId}`);

    // 🔐 Security audit for failed role change attempt
    try {
      const roleData = schemas.parseUpdateRoleFormData(formData);
      const session = await validators.getValidatedSession();

      usersSecurityLogger.securityEvent(
        "ROLE_CHANGE_FAILED",
        {
          requestId,
          adminId: session.user.id,
          targetUserId: roleData.userId,
          attemptedRole: roleData.role,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "HIGH"
      );
    } catch {
      usersSecurityLogger.securityEvent(
        "ROLE_CHANGE_CRITICAL_FAILURE",
        {
          requestId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "CRITICAL"
      );
    }

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

  usersServerActionLogger.timeStart(`Ban User ${requestId}`);
  usersServerActionLogger.info("Ban user action started", { requestId });

  try {
    // 🔍 Validate and parse input
    const banData = schemas.parseBanUserFormData(formData);

    usersServerActionLogger.debug("Ban user data validated", {
      requestId,
      userId: banData.id,
      reason: banData.reason,
    });

    // 🛡️ Session validation
    const session = await validators.getValidatedSession();

    usersServerActionLogger.debug("Session validated for user ban", {
      requestId,
      adminId: session.user.id,
      adminRole: session.user.role,
      targetUserId: banData.id,
    });

    // 🔐 CRITICAL SECURITY AUDIT - User banning
    usersSecurityLogger.banOperation(
      session.user.id,
      banData.id,
      "BAN",
      banData.reason,
      {
        requestId,
        adminRole: session.user.role,
        ipAddress: "TODO", // Would come from headers
        userAgent: "TODO", // Would come from headers
      }
    );

    // 🏢 Business logic via service
    const userService = await createUserService();
    const startTime = Date.now();
    const bannedUser = await userService.banUser(banData.id, banData.reason);
    const operationDuration = Date.now() - startTime;

    usersServerActionLogger.performance("banUser", operationDuration, {
      requestId,
      userId: banData.id,
      operationType: "USER_BAN",
    });

    // 🔄 Cache invalidation with enterprise logging
    revalidateTag(USERS_CACHE_TAGS.USERS);
    revalidateTag(USERS_CACHE_TAGS.USER_STATS);
    revalidatePath("/users");

    usersServerActionLogger.cache("SET", USERS_CACHE_TAGS.USERS, {
      requestId,
      action: "INVALIDATE_AFTER_BAN",
    });

    usersServerActionLogger.timeEnd(`Ban User ${requestId}`);
    usersServerActionLogger.info("User banned successfully", {
      requestId,
      userId: banData.id,
      reason: banData.reason,
      adminId: session.user.id,
      operationDuration,
    });

    // 📊 Security analytics event
    usersServerActionLogger.analytics("user_banned", {
      requestId,
      userId: banData.id,
      reason: banData.reason,
      adminId: session.user.id,
      adminRole: session.user.role,
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
    usersServerActionLogger.timeEnd(`Ban User ${requestId}`);

    // 🔐 Security audit for failed ban attempt
    try {
      const banData = schemas.parseBanUserFormData(formData);
      const session = await validators.getValidatedSession();

      usersSecurityLogger.securityEvent(
        "BAN_USER_FAILED",
        {
          requestId,
          adminId: session.user.id,
          targetUserId: banData.id,
          reason: banData.reason,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "HIGH"
      );
    } catch {
      usersSecurityLogger.securityEvent(
        "BAN_USER_CRITICAL_FAILURE",
        {
          requestId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "CRITICAL"
      );
    }

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
