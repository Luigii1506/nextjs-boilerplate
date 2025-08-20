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

// 📝 Update user basic data (email, name)
export const updateUserBasicData = async (
  userId: string,
  data: { email?: string; name?: string }
) => {
  const updateData: { email?: string; name?: string } = {};

  if (data.email !== undefined) {
    updateData.email = data.email;
  }

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
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

// 🚫 Ban user directly in database
export const banUser = async (
  userId: string,
  banReason: string,
  banExpires?: Date
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      banned: true,
      banReason,
      banExpires,
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
};

// ✅ Unban user directly in database
export const unbanUser = async (userId: string) => {
  return prisma.user.update({
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
};
