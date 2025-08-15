import type { User, UserListResponse } from "../../types";

// 🔄 USER MAPPERS
// ===============
// Transformaciones de datos entre capas (Prisma <-> Domain <-> API)

// 📊 Prisma User to Domain User
export const prismaUserToUser = (prismaUser: {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean | null;
  image: string | null;
  role: string | null;
  createdAt: Date;
  updatedAt: Date;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
}): User => {
  return {
    id: prismaUser.id,
    email: prismaUser.email,
    name: prismaUser.name,
    emailVerified: prismaUser.emailVerified || false,
    role: (prismaUser.role || "user") as "user" | "admin" | "super_admin",
    status: prismaUser.banned ? "banned" : "active",
    image: prismaUser.image,
    createdAt: prismaUser.createdAt.toISOString(),
    updatedAt: prismaUser.updatedAt.toISOString(),
    banned: prismaUser.banned || false,
    banReason: prismaUser.banReason,
    banExpires: prismaUser.banExpires?.toISOString() || null,
  };
};

// 📋 Array of Prisma Users to Domain Users
export const prismaUsersToUsers = (
  prismaUsers: Array<{
    id: string;
    email: string;
    name: string;
    emailVerified: boolean | null;
    image: string | null;
    role: string | null;
    createdAt: Date;
    updatedAt: Date;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Date | null;
  }>
): User[] => {
  return prismaUsers.map(prismaUserToUser);
};

// 🏗️ Better Auth User to Domain User (for user creation)
export const betterAuthUserToUser = (
  betterAuthUser: {
    id: string;
    email: string;
    name: string;
    emailVerified?: boolean | null;
    image?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
  },
  role: "user" | "admin" | "super_admin" = "user"
): User => {
  return {
    id: betterAuthUser.id,
    email: betterAuthUser.email,
    name: betterAuthUser.name,
    emailVerified: betterAuthUser.emailVerified || false,
    role: role,
    status: "active",
    image: betterAuthUser.image || null,
    createdAt:
      typeof betterAuthUser.createdAt === "string"
        ? betterAuthUser.createdAt
        : betterAuthUser.createdAt.toISOString(),
    updatedAt:
      typeof betterAuthUser.updatedAt === "string"
        ? betterAuthUser.updatedAt
        : betterAuthUser.updatedAt.toISOString(),
    banned: false,
    banReason: null,
    banExpires: null,
  };
};

// 📊 Users with Pagination to API Response
export const usersToUserListResponse = (
  users: User[],
  total: number,
  hasMore: boolean
): UserListResponse => {
  return {
    users,
    pagination: {
      total,
      hasMore,
    },
  };
};

// 🎯 User Role Update Result Mapper
export const roleUpdateResultToUser = (updateResult: {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean | null;
  image: string | null;
  role: string | null;
  createdAt: Date;
  updatedAt: Date;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
}): User => {
  return prismaUserToUser(updateResult);
};

// 🚫 Ban User Result Mapper
export const banUserResultToUser = (prismaUser: {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean | null;
  image: string | null;
  role: string | null;
  createdAt: Date;
  updatedAt: Date;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
}): User => {
  // Override status to ensure it's "banned"
  const mappedUser = prismaUserToUser(prismaUser);
  return {
    ...mappedUser,
    status: "banned",
    banned: true,
  };
};

// ✅ Unban User Result Mapper
export const unbanUserResultToUser = (prismaUser: {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean | null;
  image: string | null;
  role: string | null;
  createdAt: Date;
  updatedAt: Date;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
}): User => {
  // Override status to ensure it's "active"
  const mappedUser = prismaUserToUser(prismaUser);
  return {
    ...mappedUser,
    status: "active",
    banned: false,
    banReason: null,
    banExpires: null,
  };
};

// 📊 Bulk Update Result Mapper
export const bulkUpdateResultToResponse = (updateResult: {
  count: number;
}): { updatedCount: number } => {
  return {
    updatedCount: updateResult.count,
  };
};

// 🎯 User Details Mapper (same as main mapper, but explicit for clarity)
export const prismaUserToUserDetails = prismaUserToUser;

// 📈 User Stats Mapper (if needed for dashboard)
export const rawStatsToUserStats = (rawStats: {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  adminUsers: number;
}) => {
  return {
    totalUsers: rawStats.totalUsers,
    activeUsers: rawStats.activeUsers,
    bannedUsers: rawStats.bannedUsers,
    adminUsers: rawStats.adminUsers,
    userGrowthRate:
      rawStats.totalUsers > 0
        ? ((rawStats.activeUsers / rawStats.totalUsers) * 100).toFixed(1)
        : "0",
    adminPercentage:
      rawStats.totalUsers > 0
        ? ((rawStats.adminUsers / rawStats.totalUsers) * 100).toFixed(1)
        : "0",
  };
};

// 🔍 Search Results Mapper
export const searchResultsToUsers = (
  searchResults: Array<{
    id: string;
    email: string;
    name: string;
    emailVerified: boolean | null;
    image: string | null;
    role: string | null;
    createdAt: Date;
    updatedAt: Date;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Date | null;
  }>
): User[] => {
  return prismaUsersToUsers(searchResults);
};

// 🎨 API Response Mappers (if we need different formats for different endpoints)

// Minimal User Info (for dropdowns, etc.)
export const userToMinimalUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// Public User Info (no sensitive data)
export const userToPublicUser = (user: User) => ({
  id: user.id,
  name: user.name,
  image: user.image,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
});

// Admin User Info (full details)
export const userToAdminUser = (user: User): User => user;

// 🔄 Form Data to Domain Objects

// Create User Form to Domain
export const createUserFormToData = (formData: {
  email: string;
  name: string;
  password: string;
  role: "user" | "admin" | "super_admin";
}) => ({
  email: formData.email.toLowerCase().trim(),
  name: formData.name.trim(),
  password: formData.password,
  role: formData.role,
});

// Update User Form to Domain
export const updateUserFormToData = (formData: {
  userId: string;
  email?: string;
  name?: string;
  role?: "user" | "admin" | "super_admin";
}) => ({
  userId: formData.userId,
  email: formData.email?.toLowerCase().trim(),
  name: formData.name?.trim(),
  role: formData.role,
});

// Ban User Form to Domain
export const banUserFormToData = (formData: {
  id: string;
  reason: string;
}) => ({
  userId: formData.id,
  reason: formData.reason.trim(),
});

// 📊 Error Response Mappers
export const errorToActionResult = (error: Error) => ({
  success: false as const,
  error: error.message,
});

export const successToActionResult = <T>(data: T, message?: string) => ({
  success: true as const,
  data,
  message,
});

// 🎯 Validation Error to User-Friendly Message
export const validationErrorToMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Map common Prisma errors to user-friendly messages
    if (error.message.includes("Unique constraint")) {
      return "Este email ya está en uso";
    }
    if (error.message.includes("Foreign key constraint")) {
      return "No se puede eliminar este usuario porque tiene datos relacionados";
    }
    if (error.message.includes("Record to delete does not exist")) {
      return "El usuario no fue encontrado";
    }
    return error.message;
  }
  return "Error interno del servidor";
};
