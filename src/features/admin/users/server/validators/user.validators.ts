import * as userQueries from "../queries/user.queries";
import { getServerSession } from "@/core/auth/server";

// 🛡️ USER BUSINESS VALIDATORS
// ============================
// Validaciones de reglas de negocio específicas para usuarios

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// 🔐 Auth validation
export const validateUserAuthentication = (
  userId?: string | null,
  userRole?: string | null
) => {
  if (!userId) {
    throw new ValidationError("No autorizado");
  }

  if (!userRole) {
    throw new ValidationError("Rol de usuario no válido");
  }
};

// 👥 Admin permissions validation
export const validateAdminPermissions = (userRole: string) => {
  if (userRole !== "admin" && userRole !== "super_admin") {
    throw new ValidationError("Permisos insuficientes");
  }
};

// 👑 Super admin permissions validation
export const validateSuperAdminPermissions = (userRole: string) => {
  if (userRole !== "super_admin") {
    throw new ValidationError(
      "Solo super administradores pueden realizar esta acción"
    );
  }
};

// 👤 User access validation
export const validateUserAccess = async (
  currentUserId: string,
  currentUserRole: string,
  targetUserId: string
) => {
  // Users can access their own data, admins can access all
  if (
    currentUserId !== targetUserId &&
    currentUserRole !== "admin" &&
    currentUserRole !== "super_admin"
  ) {
    throw new ValidationError(
      "Permisos insuficientes para acceder a este usuario"
    );
  }
};

// 🎭 Role change validation
export const validateRoleChange = async (
  currentUserId: string,
  currentUserRole: string,
  targetUserId: string,
  newRole: string
) => {
  // Validate permissions
  validateAdminPermissions(currentUserRole);

  // Super admin protection - only super_admin can create/modify super_admin
  if (newRole === "super_admin" && currentUserRole !== "super_admin") {
    throw new ValidationError(
      "Solo super administradores pueden asignar rol de super admin"
    );
  }

  // Cannot modify yourself
  if (targetUserId === currentUserId) {
    throw new ValidationError("No puedes modificar tu propio rol");
  }

  // Check if target user exists
  const userExists = await userQueries.userExists(targetUserId);
  if (!userExists) {
    throw new ValidationError("Usuario no encontrado");
  }

  // Validate role value
  const validRoles = ["user", "admin", "super_admin"];
  if (!validRoles.includes(newRole)) {
    throw new ValidationError("Rol no válido");
  }
};

// 👤 User creation validation
export const validateCreateUser = async (
  currentUserRole: string,
  newUserRole: string,
  email: string
) => {
  // Validate permissions
  validateAdminPermissions(currentUserRole);

  // Super admin protection
  if (newUserRole === "super_admin" && currentUserRole !== "super_admin") {
    throw new ValidationError(
      "Solo super administradores pueden crear super admins"
    );
  }

  // Check if email already exists
  const emailInUse = await userQueries.emailExists(email);
  if (emailInUse) {
    throw new ValidationError("El email ya está en uso");
  }

  // Validate role
  const validRoles = ["user", "admin", "super_admin"];
  if (!validRoles.includes(newUserRole)) {
    throw new ValidationError("Rol no válido");
  }
};

// 🗑️ User deletion validation
export const validateUserDeletion = async (
  currentUserId: string,
  currentUserRole: string,
  targetUserId: string
) => {
  // Only super admins can delete users
  validateSuperAdminPermissions(currentUserRole);

  // Cannot delete yourself
  if (targetUserId === currentUserId) {
    throw new ValidationError("No puedes eliminar tu propia cuenta");
  }

  // Check if target user exists
  const userExists = await userQueries.userExists(targetUserId);
  if (!userExists) {
    throw new ValidationError("Usuario no encontrado");
  }
};

// 🚫 User ban validation
export const validateUserBan = async (
  currentUserId: string,
  currentUserRole: string,
  targetUserId: string
) => {
  // Validate admin permissions
  validateAdminPermissions(currentUserRole);

  // Cannot ban yourself
  if (targetUserId === currentUserId) {
    throw new ValidationError("No puedes banearte a ti mismo");
  }

  // Check if target user exists
  const targetUser = await userQueries.getUserById(targetUserId);
  if (!targetUser) {
    throw new ValidationError("Usuario no encontrado");
  }

  // Cannot ban super admin (unless you are super admin)
  if (targetUser.role === "super_admin" && currentUserRole !== "super_admin") {
    throw new ValidationError(
      "Solo super administradores pueden banear otros super admins"
    );
  }

  // Check if user is already banned
  if (targetUser.banned) {
    throw new ValidationError("El usuario ya está baneado");
  }
};

// ✅ User unban validation
export const validateUserUnban = async (
  currentUserId: string,
  currentUserRole: string,
  targetUserId: string
) => {
  // Validate admin permissions
  validateAdminPermissions(currentUserRole);

  // Check if target user exists
  const targetUser = await userQueries.getUserById(targetUserId);
  if (!targetUser) {
    throw new ValidationError("Usuario no encontrado");
  }

  // Check if user is actually banned
  if (!targetUser.banned) {
    throw new ValidationError("El usuario no está baneado");
  }
};

// 🔄 Bulk role change validation
export const validateBulkRoleChange = async (
  currentUserId: string,
  currentUserRole: string,
  targetUserIds: string[],
  newRole: string
) => {
  // Validate permissions
  validateAdminPermissions(currentUserRole);

  // Validate minimum selection
  if (!targetUserIds.length) {
    throw new ValidationError("Debes seleccionar al menos un usuario");
  }

  // Super admin protection
  if (newRole === "super_admin" && currentUserRole !== "super_admin") {
    throw new ValidationError(
      "Solo super administradores pueden asignar rol de super admin"
    );
  }

  // Cannot modify yourself
  if (targetUserIds.includes(currentUserId)) {
    throw new ValidationError(
      "No puedes modificar tu propio rol en una operación masiva"
    );
  }

  // Validate role
  const validRoles = ["user", "admin", "super_admin"];
  if (!validRoles.includes(newRole)) {
    throw new ValidationError("Rol no válido");
  }

  // Check if all users exist
  for (const userId of targetUserIds) {
    const userExists = await userQueries.userExists(userId);
    if (!userExists) {
      throw new ValidationError(`Usuario ${userId} no encontrado`);
    }
  }
};

// 📊 User listing validation
export const validateUserListAccess = (currentUserRole: string) => {
  validateAdminPermissions(currentUserRole);
};

// 🔍 Search parameters validation
export const validateSearchParameters = (params: {
  limit?: number;
  offset?: number;
  searchField?: string;
}) => {
  const { limit = 10, offset = 0, searchField = "email" } = params;

  if (limit < 1 || limit > 100) {
    throw new ValidationError("El límite debe estar entre 1 y 100");
  }

  if (offset < 0) {
    throw new ValidationError("El offset debe ser mayor o igual a 0");
  }

  const validSearchFields = ["email", "name"];
  if (!validSearchFields.includes(searchField)) {
    throw new ValidationError("Campo de búsqueda no válido");
  }
};

// 🎯 Role hierarchy validation
export const validateRoleHierarchy = (
  currentUserRole: string,
  targetRole: string
) => {
  const roleHierarchy = {
    super_admin: 3,
    admin: 2,
    user: 1,
  };

  const currentLevel =
    roleHierarchy[currentUserRole as keyof typeof roleHierarchy] || 0;
  const targetLevel =
    roleHierarchy[targetRole as keyof typeof roleHierarchy] || 0;

  if (currentLevel <= targetLevel && currentUserRole !== "super_admin") {
    throw new ValidationError(
      "No puedes asignar un rol igual o superior al tuyo"
    );
  }
};

// 📧 Email format validation (business logic)
export const validateEmailFormat = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Formato de email no válido");
  }
};

// 🔒 Password strength validation (business logic)
export const validatePasswordStrength = (password: string) => {
  if (password.length < 8) {
    throw new ValidationError("La contraseña debe tener al menos 8 caracteres");
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw new ValidationError(
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    );
  }
};

// 👤 Name validation (business logic)
export const validateUserName = (name: string) => {
  if (!name || name.trim().length < 2) {
    throw new ValidationError("El nombre debe tener al menos 2 caracteres");
  }

  if (name.length > 100) {
    throw new ValidationError("El nombre no puede exceder 100 caracteres");
  }

  // Check for special characters that might cause issues
  const forbiddenChars = /[<>\"'&]/;
  if (forbiddenChars.test(name)) {
    throw new ValidationError("El nombre contiene caracteres no permitidos");
  }
};

// 🔒 HELPER: Validate and get authenticated session
export const getValidatedSession = async () => {
  const session = await getServerSession();
  validateUserAuthentication(session?.user?.id, session?.user?.role);

  // TypeScript assertion after validation - we know user exists after validation
  if (!session?.user?.id || !session?.user?.role) {
    throw new ValidationError("Invalid session state after validation");
  }

  return {
    user: {
      id: session.user.id,
      role: session.user.role as "user" | "admin" | "super_admin",
    },
  };
};
