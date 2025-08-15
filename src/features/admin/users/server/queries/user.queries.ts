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

// 👤 Get user by ID
export const getUserById = async (userId: string) => {
  return prisma.user.findUnique({
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

// ✏️ Update user role
export const updateUserRole = async (userId: string, role: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
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
};

// 🗑️ Delete user by ID
export const deleteUserById = async (userId: string) => {
  return prisma.user.delete({
    where: { id: userId },
  });
};

// 🔄 Bulk update users role
export const bulkUpdateUsersRole = async (
  userIds: string[],
  newRole: string
) => {
  return prisma.user.updateMany({
    where: {
      id: { in: userIds },
    },
    data: {
      role: newRole,
    },
  });
};

// 📊 Get dashboard stats
export const getUserDashboardStats = async () => {
  const [totalUsers, activeUsers, bannedUsers, adminUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { banned: false } }),
    prisma.user.count({ where: { banned: true } }),
    prisma.user.count({ where: { role: { in: ["admin", "super_admin"] } } }),
  ]);

  return {
    totalUsers,
    activeUsers,
    bannedUsers,
    adminUsers,
  };
};

// 📅 Get users created in date range
export const getUsersInDateRange = async (startDate: Date, endDate: Date) => {
  return prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// 🔍 Search users by multiple fields
export const searchUsersAdvanced = async (params: {
  email?: string;
  name?: string;
  role?: string;
  banned?: boolean;
  limit?: number;
  offset?: number;
}) => {
  const { email, name, role, banned, limit = 10, offset = 0 } = params;

  const where: Prisma.UserWhereInput = {};

  if (email) {
    where.email = { contains: email, mode: "insensitive" };
  }

  if (name) {
    where.name = { contains: name, mode: "insensitive" };
  }

  if (role) {
    where.role = role;
  }

  if (banned !== undefined) {
    where.banned = banned;
  }

  return prisma.user.findMany({
    where,
    skip: offset,
    take: limit,
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
    orderBy: { createdAt: "desc" },
  });
};

// 👑 Get all super admins
export const getSuperAdmins = async () => {
  return prisma.user.findMany({
    where: { role: "super_admin" },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
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
