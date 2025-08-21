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

// 📊 Transform dashboard stats from Prisma to UserStats
export const mapDashboardStats = (stats: {
  total: number;
  active: number;
  banned: number;
  admins: number;
  activePercentage: number;
  adminPercentage: number;
}) => {
  return {
    total: stats.total,
    active: stats.active,
    banned: stats.banned,
    admins: stats.admins,
    activePercentage: stats.activePercentage,
    adminPercentage: stats.adminPercentage,
  };
};

// 👥 Transform recent users from Prisma to User array with lastLogin
export const mapRecentUsers = (
  users: Array<{
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image: string | null;
    role: string | null;
    createdAt: Date;
    updatedAt: Date;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Date | null;
    sessions: Array<{ createdAt: Date }>;
  }>
): User[] => {
  return users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    role: (user.role as "user" | "admin" | "super_admin") || "user",
    status: user.banned ? "banned" : "active",
    image: user.image,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLogin: user.sessions[0]?.createdAt.toISOString() || undefined,
    banned: user.banned || false,
    banReason: user.banReason,
    banExpires: user.banExpires?.toISOString() || null,
  }));
};
