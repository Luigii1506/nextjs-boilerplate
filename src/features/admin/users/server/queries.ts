import { prisma } from "@/core/database/prisma";
import { Prisma } from "@prisma/client";

// 🗃️ USER QUERIES
// ================
// Consultas específicas de Prisma para usuarios - Solo acceso a datos

// 🔍 User search condition builder
export const buildUserSearchCondition = (
  searchValue?: string,
  searchField: "email" | "name" = "email"
): Prisma.UserWhereInput => {
  if (!searchValue) return {};

  return {
    OR: [
      searchField === "email"
        ? {
            email: {
              contains: searchValue,
              mode: "insensitive" as const,
            },
          }
        : {
            name: { contains: searchValue, mode: "insensitive" as const },
          },
    ],
  };
};

// 📊 Get users with pagination
export const getUsersWithPagination = async (params: {
  where?: Prisma.UserWhereInput;
  skip?: number;
  take?: number;
  orderBy?: Prisma.UserOrderByWithRelationInput;
}) => {
  const {
    where = {},
    skip = 0,
    take = 10,
    orderBy = { createdAt: "desc" },
  } = params;

  return prisma.user.findMany({
    where,
    skip,
    take,
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
    orderBy,
  });
};

// 📈 Get users count
export const getUsersCount = async (where?: Prisma.UserWhereInput) => {
  return prisma.user.count({ where: where || {} });
};

// 📊 Count users by role
export const countUsersByRole = async (role: string) => {
  return prisma.user.count({
    where: { role },
  });
};

// 👤 Get user by ID
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      banned: true,
      banReason: true,
      banExpires: true,
    },
  });

  if (!user) return null;

  // Ensure role has a default value
  return {
    ...user,
    role: user.role || "user", // Default to "user" if role is null
  };
};

// 📧 Get user by email
export const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// 🏥 Check if user exists
export const userExists = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  return !!user;
};

// 📧 Check if email exists
export const emailExists = async (email: string, excludeUserId?: string) => {
  const where: Prisma.UserWhereInput = { email };

  if (excludeUserId) {
    where.id = { not: excludeUserId };
  }

  const user = await prisma.user.findFirst({
    where,
    select: { id: true },
  });

  return !!user;
};

// 📊 Get dashboard statistics
export const getDashboardStats = async () => {
  const [total, active, banned, admins] = await Promise.all([
    // Total users
    prisma.user.count(),

    // Active users (not banned)
    prisma.user.count({
      where: {
        OR: [{ banned: false }, { banned: null }],
      },
    }),

    // Banned users
    prisma.user.count({
      where: { banned: true },
    }),

    // Admin users (admin + super_admin)
    prisma.user.count({
      where: {
        role: {
          in: ["admin", "super_admin"],
        },
      },
    }),
  ]);

  return {
    total,
    active,
    banned,
    admins,
    activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    adminPercentage: total > 0 ? Math.round((admins / total) * 100) : 0,
  };
};

// 👥 Get recent users with sessions info
export const getRecentUsers = async (limit: number = 5) => {
  return prisma.user.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
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
      sessions: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          createdAt: true,
        },
      },
    },
  });
};
