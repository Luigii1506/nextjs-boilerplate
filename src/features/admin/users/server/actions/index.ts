"use server";

// 👥 USERS SERVER ACTIONS
// ========================
// Next.js 15 Server Actions - Delgadas y coordinadoras (React 19 + Hexagonal Architecture)

import { revalidateTag } from "next/cache";
import { createUserService } from "../services/user.service";
import * as schemas from "../../schemas";
import * as validators from "../validators/user.validators";
import type { ActionResult, UserListResponse, User } from "../../types";

// 📊 GET ALL USERS (Enterprise Server Action)
export async function getAllUsersAction(
  limit: number = 10,
  offset: number = 0,
  searchValue?: string,
  searchField: "email" | "name" = "email"
): Promise<ActionResult<UserListResponse>> {
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

    return {
      success: true,
      data: result,
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
  try {
    const userData = schemas.parseCreateUserFormData(formData);

    // 🛡️ Session validation
    await validators.getValidatedSession();

    // 🏢 Business logic via service
    const userService = await createUserService();

    const newUser = await userService.createUser(userData);

    // 🔄 Cache invalidation
    revalidateTag("users");

    return {
      success: true,
      data: newUser,
      message: "Usuario creado exitosamente",
    };
  } catch (error) {
    console.error("❌ Error in createUserAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
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
  try {
    // 🔍 Validate and parse input
    const roleData = schemas.parseUpdateRoleFormData(formData);

    // 🛡️ Session validation
    await validators.getValidatedSession();

    // 🏢 Business logic via service
    const userService = await createUserService();
    const updatedUser = await userService.updateUserRole(
      roleData.userId,
      roleData.role
    );

    // 🔄 Cache invalidation
    revalidateTag("users");

    return {
      success: true,
      data: updatedUser,
      message: `User role updated to ${roleData.role} successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
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
  try {
    // 🔍 Validate and parse input
    const banData = schemas.parseBanUserFormData(formData);

    // 🛡️ Session validation
    await validators.getValidatedSession();

    // 🏢 Business logic via service
    const userService = await createUserService();
    const bannedUser = await userService.banUser(banData.id, banData.reason);

    // 🔄 Cache invalidation
    revalidateTag("users");

    return {
      success: true,
      data: bannedUser,
      message: "Usuario baneado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
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
