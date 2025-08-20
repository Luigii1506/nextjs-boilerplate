import { z } from "zod";

// 🎯 USER SCHEMAS FOR VALIDATION
// ===============================
// Zod schemas para validación de usuarios con React 19

// 📧 Email schema
export const emailSchema = z
  .string()
  .min(1, "Email es requerido")
  .email("Email debe ser válido");

// 🔒 Password schema
export const passwordSchema = z
  .string()
  .min(8, "Contraseña debe tener al menos 8 caracteres")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Contraseña debe contener al menos una mayúscula, una minúscula y un número"
  );

// 👤 Name schema
export const nameSchema = z
  .string()
  .min(1, "Nombre es requerido")
  .min(2, "Nombre debe tener al menos 2 caracteres")
  .max(100, "Nombre no puede exceder 100 caracteres");

// 🎭 Role schema
export const roleSchema = z.enum(["user", "admin", "super_admin"]);

// 🔍 Search field schema
export const searchFieldSchema = z.enum(["email", "name"]);

// 📊 Pagination schema
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

// 🔍 User search schema
export const userSearchSchema = z.object({
  searchValue: z.string().optional(),
  searchField: searchFieldSchema.default("email"),
  ...paginationSchema.shape,
});

// 👤 Create user schema
export const createUserSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  password: passwordSchema,
  role: roleSchema.default("user"),
});

// ✏️ Update user schema
export const updateUserSchema = z.object({
  id: z.string().min(1, "ID de usuario requerido"),
  email: emailSchema.optional(),
  name: nameSchema.optional(),
  role: roleSchema.optional(),
});

// 🎭 Update role schema
export const updateRoleSchema = z.object({
  userId: z.string().min(1, "ID de usuario requerido"),
  role: roleSchema,
});

// 🚫 Ban user schema
export const banUserSchema = z.object({
  id: z.string().min(1, "ID de usuario requerido"),
  reason: z
    .string()
    .min(1, "Razón del ban requerida")
    .default("Violación de términos"),
});

// ✅ Unban user schema
export const unbanUserSchema = z.object({
  id: z.string().min(1, "ID de usuario requerido"),
});

// 🔄 Bulk update schema
export const bulkUpdateSchema = z.object({
  userIds: z
    .array(z.string())
    .min(1, "Al menos un usuario debe ser seleccionado"),
  newRole: roleSchema,
});

// 📋 User details schema
export const userDetailsSchema = z.object({
  userId: z.string().min(1, "ID de usuario requerido"),
});

// 🗑️ Delete user schema
export const deleteUserSchema = z.object({
  userId: z.string().min(1, "ID de usuario requerido"),
});

// 🎯 FormData parsers
export const parseCreateUserFormData = (formData: FormData) => {
  return createUserSchema.parse({
    email: formData.get("email")?.toString(),
    name: formData.get("name")?.toString(),
    password: formData.get("password")?.toString(),
    role: formData.get("role")?.toString() || "user",
  });
};

export const parseUpdateUserFormData = (formData: FormData) => {
  const parsed = updateUserSchema.parse({
    id: formData.get("id")?.toString(),
    email: formData.get("email")?.toString(),
    name: formData.get("name")?.toString(),
    role: formData.get("role")?.toString(),
  });

  // Map id to userId for service compatibility
  return {
    userId: parsed.id,
    email: parsed.email,
    name: parsed.name,
    role: parsed.role,
  };
};

export const parseUpdateRoleFormData = (formData: FormData) => {
  return updateRoleSchema.parse({
    userId: formData.get("userId")?.toString(),
    role: formData.get("role")?.toString(),
  });
};

export const parseBanUserFormData = (formData: FormData) => {
  return banUserSchema.parse({
    id: formData.get("id")?.toString(),
    reason: formData.get("reason")?.toString() || "Violación de términos",
  });
};

export const parseUnbanUserFormData = (formData: FormData) => {
  return unbanUserSchema.parse({
    id: formData.get("id")?.toString(),
  });
};

export const parseBulkUpdateFormData = (formData: FormData) => {
  return bulkUpdateSchema.parse({
    userIds: formData.getAll("userIds") as string[],
    newRole: formData.get("newRole")?.toString(),
  });
};

export const parseDeleteUserFormData = (formData: FormData) => {
  return deleteUserSchema.parse({
    userId: formData.get("userId")?.toString(),
  });
};
