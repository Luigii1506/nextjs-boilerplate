# 🔗 **TANSTACK QUERY + SERVER ACTIONS INTEGRATION**

## Guía Completa de Integración con Next.js Server Actions

> **Cómo conectar TanStack Query con tus Server Actions existentes, incluyendo validación, optimistic updates y manejo de errores completo.**

---

## 📋 **TABLA DE CONTENIDO**

1. [🏗️ Arquitectura de Integración](#arquitectura-de-integración)
2. [📤 Server Actions Layer](#server-actions-layer)
3. [🔄 TanStack Query Mutations](#tanstack-query-mutations)
4. [⚡ Optimistic Updates Avanzados](#optimistic-updates-avanzados)
5. [✅ Validación con Zod](#validación-con-zod)
6. [🏢 Services Layer](#services-layer)
7. [📊 Flujo Completo Paso a Paso](#flujo-completo)
8. [🚨 Error Handling Enterprise](#error-handling-enterprise)
9. [💾 Cache Strategy Integration](#cache-strategy-integration)
10. [🧪 Testing Integration](#testing-integration)

---

## 🏗️ **ARQUITECTURA DE INTEGRACIÓN**

### Stack Tecnológico Completo

```
┌─────────────────────────────────────────────────────────┐
│                   🎨 UI LAYER                           │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Components    │  │  TanStack Query │              │
│  │   (UserCard)    │  │     Hooks       │              │
│  └─────────────────┘  └─────────────────┘              │
└─────────────────┬───────────────┬───────────────────────┘
                  │               │
                  ▼               ▼
┌─────────────────────────────────────────────────────────┐
│                 💼 BUSINESS LAYER                       │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Mutations     │  │   Optimistic    │              │
│  │   + Validation  │  │    Updates      │              │
│  └─────────────────┘  └─────────────────┘              │
└─────────────────┬───────────────┬───────────────────────┘
                  │               │
                  ▼               ▼
┌─────────────────────────────────────────────────────────┐
│                🌐 SERVER LAYER                          │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Server Actions  │  │   Database      │              │
│  │  (Next.js 15)   │  │   Services      │              │
│  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

### Principios de Integración

1. **🎯 Single Source of Truth**: TanStack Query maneja todo el estado del cliente
2. **⚡ Optimistic First**: Updates inmediatos con rollback automático
3. **✅ Validation Everywhere**: Validación en cliente y servidor
4. **🔄 Seamless Integration**: Server Actions como mutationFn directo
5. **🏢 Enterprise Ready**: Error handling, logging y monitoring completo

---

## 📤 **SERVER ACTIONS LAYER** (**THIN LAYER** - Solo Presentación)

### ✅ **ARQUITECTURA CORRECTA** - Actions como Capa de Presentación

```typescript
// 📄 src/features/admin/users/server/actions.ts
"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { createUserService } from "./service";
import * as schemas from "../schemas";
import * as validators from "./validators";
import { USERS_CACHE_TAGS } from "../constants";
import type { ActionResult, UserListResponse, User } from "../types";

// 👤 CREATE USER - ARQUITECTURA CORRECTA
export async function createUserAction(
  formData: FormData
): Promise<ActionResult<User>> {
  const requestId = `createUser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    // 1. 🔍 Schema validation (input sanitization ONLY)
    const userData = schemas.parseCreateUserFormData(formData);

    // 2. 🛡️ Session validation (authentication ONLY)
    const session = await validators.getValidatedSession();

    // 3. 🏢 Delegate ALL business logic to service
    const userService = await createUserService();
    const newUser = await userService.createUser(userData);

    // 4. 🔄 UI/Presentation concerns (cache invalidation)
    revalidateTag(USERS_CACHE_TAGS.USERS);
    revalidateTag(USERS_CACHE_TAGS.USER_STATS);
    revalidatePath("/users");

    return {
      success: true,
      data: newUser,
      message: "Usuario creado exitosamente",
      timestamp: new Date().toISOString(),
      requestId,
    };
  } catch (error) {
    // Simple error transformation for UI
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error interno del servidor",
      timestamp: new Date().toISOString(),
      requestId,
    };
  }
}

// 📊 GET ALL USERS - ARQUITECTURA CORRECTA
export async function getAllUsersAction(
  limit: number = 10,
  offset: number = 0,
  searchValue?: string,
  searchField: "email" | "name" = "email"
): Promise<ActionResult<UserListResponse>> {
  const requestId = `getAllUsers-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    // 1. 🔍 Schema validation (input sanitization)
    const searchParams = schemas.userSearchSchema.parse({
      limit, offset, searchValue, searchField,
    });

    // 2. 🛡️ Session validation (authentication)
    const session = await validators.getValidatedSession();

    // 3. 🏢 Delegate to service (ALL business logic there)
    const userService = await createUserService();
    const result = await userService.getAllUsers(searchParams);

    return {
      success: true,
      data: result,
      message: "Users retrieved successfully",
      timestamp: new Date().toISOString(),
      requestId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error interno del servidor",
      timestamp: new Date().toISOString(),
      requestId,
    };
  }
}
            validationErrors: { email: ["Email ya está en uso"] },
          };
        }

        // 5. Crear usuario
        const newUser = await createUserService(userData);

        // 6. Revalidar cache
        revalidateTag("users");
        revalidatePath("/admin/users");

        // 7. Logging y auditoría
        console.log(`Usuario creado: ${newUser.id} por ${session.user.id}`);

        return {
          success: true,
          data: newUser,
        };
      });
    });
  });
}

// 🔄 UPDATE - Actualizar usuario existente
export async function updateUserAction(
  formData: FormData
): Promise<UserActionResult<User>> {
  return withErrorHandling(async () => {
    return withAuth(async (session) => {
      return withAuditLog("user_updated", session.user.id, async () => {
        // 1. Extraer datos
        const userId = formData.get("userId") as string;
        const rawData = {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          role: formData.get("role") as string,
        };

        // 2. Validación
        const validationResult = userUpdateSchema.safeParse({
          id: userId,
          ...rawData,
        });

        if (!validationResult.success) {
          return {
            success: false,
            error: "Datos de entrada inválidos",
            validationErrors: validationResult.error.flatten().fieldErrors,
          };
        }

        const updateData = validationResult.data;

        // 3. Verificar existencia y permisos
        const existingUser = await getUserById(userId);
        if (!existingUser) {
          return {
            success: false,
            error: "Usuario no encontrado",
          };
        }

        // 4. Verificar permisos específicos
        const canUpdate =
          session.user.permissions.includes("users.update") ||
          (session.user.id === userId &&
            session.user.permissions.includes("users.update_own"));

        if (!canUpdate) {
          throw new Error("No tienes permisos para actualizar este usuario");
        }

        // 5. Actualizar
        const updatedUser = await updateUserService(userId, updateData);

        // 6. Revalidar
        revalidateTag("users");
        revalidateTag(`user-${userId}`);
        revalidatePath("/admin/users");

        return {
          success: true,
          data: updatedUser,
        };
      });
    });
  });
}

// 🗑️ DELETE - Eliminar usuario
export async function deleteUserAction(
  formData: FormData
): Promise<UserActionResult<{ deletedId: string }>> {
  return withErrorHandling(async () => {
    return withAuth(async (session) => {
      return withAuditLog("user_deleted", session.user.id, async () => {
        // 1. Extraer y validar ID
        const userId = formData.get("userId") as string;

        if (!userId) {
          return {
            success: false,
            error: "ID de usuario requerido",
          };
        }

        // 2. Verificar existencia
        const existingUser = await getUserById(userId);
        if (!existingUser) {
          return {
            success: false,
            error: "Usuario no encontrado",
          };
        }

        // 3. Verificar permisos y reglas de negocio
        if (!session.user.permissions.includes("users.delete")) {
          throw new Error("No tienes permisos para eliminar usuarios");
        }

        // No permitir auto-eliminación
        if (session.user.id === userId) {
          return {
            success: false,
            error: "No puedes eliminar tu propia cuenta",
          };
        }

        // 4. Eliminar usuario
        await deleteUserService(userId);

        // 5. Revalidar
        revalidateTag("users");
        revalidatePath("/admin/users");

        return {
          success: true,
          data: { deletedId: userId },
        };
      });
    });
  });
}

// 🚫 BAN/UNBAN - Banear/desbanear usuario
export async function banUserAction(
  formData: FormData
): Promise<UserActionResult<User>> {
  return withErrorHandling(async () => {
    return withAuth(async (session) => {
      return withAuditLog("user_banned", session.user.id, async () => {
        const userId = formData.get("userId") as string;
        const reason = formData.get("reason") as string;
        const duration = formData.get("duration") as string; // "permanent" | "7d" | "30d"

        // Validación
        if (!userId || !reason) {
          return {
            success: false,
            error: "ID de usuario y razón son requeridos",
            validationErrors: {
              userId: !userId ? ["ID requerido"] : [],
              reason: !reason ? ["Razón requerida"] : [],
            },
          };
        }

        // Verificar permisos
        if (!session.user.permissions.includes("users.ban")) {
          throw new Error("No tienes permisos para banear usuarios");
        }

        // Calcular fecha de expiración
        let banExpires: Date | null = null;
        if (duration !== "permanent") {
          const days = parseInt(duration.replace("d", ""));
          banExpires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        }

        // Banear usuario
        const bannedUser = await banUserService(userId, {
          reason,
          banExpires,
          bannedBy: session.user.id,
        });

        // Revalidar
        revalidateTag("users");
        revalidateTag(`user-${userId}`);

        return {
          success: true,
          data: bannedUser,
        };
      });
    });
  });
}

export async function unbanUserAction(
  formData: FormData
): Promise<UserActionResult<User>> {
  return withErrorHandling(async () => {
    return withAuth(async (session) => {
      return withAuditLog("user_unbanned", session.user.id, async () => {
        const userId = formData.get("userId") as string;

        if (!userId) {
          return {
            success: false,
            error: "ID de usuario requerido",
          };
        }

        // Verificar permisos
        if (!session.user.permissions.includes("users.unban")) {
          throw new Error("No tienes permisos para desbanear usuarios");
        }

        // Desbanear usuario
        const unbannedUser = await unbanUserService(userId, {
          unbannedBy: session.user.id,
        });

        // Revalidar
        revalidateTag("users");
        revalidateTag(`user-${userId}`);

        return {
          success: true,
          data: unbannedUser,
        };
      });
    });
  });
}
```

### Middlewares de Server Actions

```typescript
// 📄 src/shared/server/error-handler.ts
export async function withErrorHandling<T>(
  action: () => Promise<T>
): Promise<T | { success: false; error: string }> {
  try {
    return await action();
  } catch (error) {
    console.error("Server Action Error:", error);

    // Log to monitoring service
    if (process.env.NODE_ENV === "production") {
      // await logError(error);
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error interno del servidor",
    };
  }
}

// 📄 src/core/auth/server.ts
export async function withAuth<T>(
  action: (session: Session) => Promise<T>
): Promise<T | { success: false; error: string }> {
  const session = await getServerSession();

  if (!session) {
    return {
      success: false,
      error: "No autenticado",
    };
  }

  return action(session);
}

// 📄 src/features/audit/server/audit-middleware.ts
export async function withAuditLog<T>(
  action: string,
  userId: string,
  callback: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await callback();

    // Log successful action
    await createAuditLogEntry({
      action,
      userId,
      success: true,
      duration: Date.now() - startTime,
      metadata: { result },
    });

    return result;
  } catch (error) {
    // Log failed action
    await createAuditLogEntry({
      action,
      userId,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}
```

---

## 🏢 **SERVICES LAYER** (**THICK LAYER** - Business Logic)

### ✅ **ARQUITECTURA CORRECTA** - Services como Capa de Dominio

```typescript
// 📄 src/features/admin/users/server/service.ts
import { auth } from "@/core/auth/server";
import { headers } from "next/headers";
import { prisma } from "@/core/database/prisma";
import { createAuditServiceWithHeaders } from "@/features/audit/server";
import * as userQueries from "./queries";
import * as userValidators from "./validators";
import * as userMappers from "./mappers";
import type { User } from "../types";

export class UserService {
  constructor(private options: UserServiceOptions) {}

  // 👤 CREATE USER - TODA LA LÓGICA DE NEGOCIO AQUÍ
  async createUser(userData: {
    email: string;
    name: string;
    password: string;
    role: "user" | "admin" | "super_admin";
  }): Promise<User> {
    const { email, name, password, role } = userData;

    // 1. 🛡️ BUSINESS VALIDATIONS (Authorization + Business Rules)
    await userValidators.validateCreateUser(
      this.options.currentUserRole,
      role,
      email
    );

    // 2. 🏢 DOMAIN OPERATIONS (Core business logic)
    const result = await auth.api.signUpEmail({
      body: { email, name, password },
      headers: await headers(),
    });

    if (!result.user) {
      throw new Error("Error creando usuario");
    }

    // 3. 🎭 ROLE ASSIGNMENT (Business rule)
    if (role !== "user") {
      await prisma.user.update({
        where: { id: result.user.id },
        data: { role },
      });
    }

    // 4. 📊 AUDIT LOGGING (Business concern - Security critical)
    if (role === "admin" || role === "super_admin") {
      try {
        const { service: auditService, requestInfo } =
          await createAuditServiceWithHeaders();
        await auditService.createAuditEvent(
          {
            action: "create",
            resource: "user",
            resourceId: result.user.id,
            resourceName: name,
            description: `Usuario ${name} creado con rol privilegiado ${role}`,
            severity: "high",
            metadata: {
              email,
              role,
              createdBy: this.options.currentUserId,
              source: "admin_panel",
              privileged: true,
            },
          },
          requestInfo
        );
      } catch (auditError) {
        console.error("Error logging privileged user creation:", auditError);
      }
    }

    // 5. 🗂️ DATA TRANSFORMATION (Domain mapping)
    const finalUser = await userQueries.getUserById(result.user.id);
    return userMappers.betterAuthUserToUser(
      result.user,
      (finalUser?.role as "user" | "admin" | "super_admin") || role
    );
  }

  // 🚫 BAN USER - BUSINESS LOGIC COMPLETA
  async banUser(userId: string, reason: string): Promise<User> {
    // 1. 🛡️ BUSINESS VALIDATIONS
    await userValidators.validateUserBan(
      this.options.currentUserId,
      this.options.currentUserRole,
      userId
    );

    // 2. 🏢 DOMAIN OPERATIONS
    const currentUser = await userQueries.getUserById(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    // 3. 🏢 BAN LOGIC (Business operation)
    const bannedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        banned: true,
        banReason: reason,
        banExpires: undefined,
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

    // 4. 📊 AUDIT LOGGING (Security business rule)
    if (!currentUser.banned) {
      try {
        const { service: auditService, requestInfo } =
          await createAuditServiceWithHeaders();
        await auditService.createAuditEvent(
          {
            action: "ban",
            resource: "user",
            resourceId: userId,
            resourceName: bannedUser.name || bannedUser.email,
            description: `Usuario ${
              bannedUser.name || bannedUser.email
            } baneado: ${reason}`,
            severity: "high",
            metadata: {
              bannedBy: this.options.currentUserId,
              reason,
              source: "admin_panel",
              userRole: currentUser.role,
            },
          },
          requestInfo
        );
      } catch (auditError) {
        console.error("Error logging user ban audit:", auditError);
      }
    }

    // 5. 🗂️ DATA TRANSFORMATION
    return userMappers.banUserResultToUser(bannedUser);
  }

  // ✏️ UPDATE USER ROLE - BUSINESS VALIDATIONS
  async updateUserRole(
    userId: string,
    newRole: "user" | "admin" | "super_admin"
  ): Promise<User> {
    const currentUser = await userQueries.getUserById(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    const previousRole = currentUser.role || "user";

    // 🛡️ BUSINESS VALIDATIONS (Critical for security)
    await userValidators.validateRoleChange(
      this.options.currentUserId,
      this.options.currentUserRole,
      userId,
      newRole
    );

    // 🏢 DOMAIN OPERATION
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
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

    // 📊 AUDIT LOGGING (Critical security event)
    try {
      const { service: auditService, requestInfo } =
        await createAuditServiceWithHeaders();
      await auditService.createAuditEvent(
        {
          action: "role_change",
          resource: "user",
          resourceId: userId,
          resourceName: updatedUser.name || updatedUser.email,
          description: `Rol cambiado de ${previousRole} a ${newRole}`,
          severity: "critical",
          metadata: {
            changedBy: this.options.currentUserId,
            previousRole,
            newRole,
            source: "admin_panel",
          },
        },
        requestInfo
      );
    } catch (auditError) {
      console.error("Error logging role change audit:", auditError);
    }

    return userMappers.roleUpdateResultToUser(updatedUser);
  }
}

// 🏭 Factory function to create UserService with session
export const createUserService = async (): Promise<UserService> => {
  const session = await userValidators.getValidatedSession();

  return new UserService({
    currentUserId: session.user.id,
    currentUserRole: session.user.role,
  });
};
```

### 🎯 **PRINCIPIOS DE LA CAPA DE SERVICIOS**

#### 1. **Single Responsibility**

```typescript
// ✅ CORRECTO - Service se encarga SOLO de business logic
class UserService {
  async createUser(userData) {
    // Business validations ✅
    // Domain operations ✅
    // Audit logging ✅
    // Data transformation ✅
    return result;
  }
}
```

#### 2. **Dependency Injection**

```typescript
// ✅ CORRECTO - Dependencies inyectadas via constructor
export class UserService {
  constructor(private options: UserServiceOptions) {}
  // Testeable, reutilizable, modular
}
```

#### 3. **Error Handling de Dominio**

```typescript
// ✅ CORRECTO - Errores específicos del dominio
if (!currentUser) {
  throw new ValidationError("Usuario no encontrado");
}

if (currentUser.role === "super_admin" && newRole !== "super_admin") {
  throw new ValidationError("No puedes degradar un super admin");
}
```

#### 4. **Audit como Business Concern**

```typescript
// ✅ CORRECTO - Audit es parte de las reglas de negocio
// Solo auditar operaciones críticas de seguridad
if (role === "admin" || role === "super_admin") {
  await auditService.createAuditEvent({
    action: "create",
    severity: "high", // Privileged user creation
    // ...
  });
}
```

---

## 🔄 **TANSTACK QUERY MUTATIONS**

### Hook Principal con Mutations Integradas

```typescript
// 📄 src/features/admin/users/hooks/useUsersQuery.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { USERS_QUERY_KEYS, USERS_CONFIG } from "../constants";
import {
  getUsersAction,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  banUserAction,
  unbanUserAction,
} from "../server/actions";
import type { User, CreateUserForm, UpdateUserForm } from "../types";

export const useUsersQuery = () => {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();

  // 📊 QUERY - Obtener usuarios
  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: USERS_QUERY_KEYS.lists(),
    queryFn: async () => {
      const result = await getUsersAction();

      // Manejar respuesta del server action
      if (!result.success) {
        throw new Error(result.error || "Error obteniendo usuarios");
      }

      return result.data || [];
    },
    staleTime: USERS_CONFIG.STALE_TIME,
    gcTime: USERS_CONFIG.CACHE_TIME,
    // Configuración específica para server actions
    retry: (failureCount, error) => {
      // No reintentar errores de autenticación/autorización
      if (error?.message?.includes("No tienes permisos")) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // ✨ MUTATION - Crear usuario
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserForm) => {
      // Convertir a FormData para server action
      const formData = new FormData();
      Object.entries(userData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const result = await createUserAction(formData);

      // Manejar resultado del server action
      if (!result.success) {
        // Crear error con información detallada
        const error: any = new Error(result.error || "Error creando usuario");
        error.validationErrors = result.validationErrors;
        throw error;
      }

      return result.data!;
    },

    // 🚀 OPTIMISTIC UPDATE
    onMutate: async (newUser) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });

      // Snapshot current data
      const previousUsers = queryClient.getQueryData<User[]>(
        USERS_QUERY_KEYS.lists()
      );

      // Optimistic user object
      const optimisticUser: User = {
        ...newUser,
        id: `temp_${Date.now()}`, // Temporary ID
        banned: false,
        emailVerified: false,
        image: null,
        banReason: null,
        banExpires: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Apply optimistic update
      queryClient.setQueryData<User[]>(USERS_QUERY_KEYS.lists(), (old) =>
        old ? [optimisticUser, ...old] : [optimisticUser]
      );

      return { previousUsers, optimisticUser };
    },

    onError: (error: any, variables, context) => {
      // Rollback optimistic update
      if (context?.previousUsers) {
        queryClient.setQueryData(
          USERS_QUERY_KEYS.lists(),
          context.previousUsers
        );
      }

      // Handle different types of errors
      if (error.validationErrors) {
        notify("Por favor corrige los errores en el formulario", "error");
        // You could return validation errors to component here
      } else {
        notify(error.message || "Error creando usuario", "error");
      }
    },

    onSuccess: (newUser, variables, context) => {
      // Replace optimistic user with real user
      queryClient.setQueryData<User[]>(
        USERS_QUERY_KEYS.lists(),
        (old) =>
          old?.map((user) =>
            user.id === context?.optimisticUser.id ? newUser : user
          ) || []
      );

      notify(`Usuario ${newUser.name} creado exitosamente`, "success");
    },

    onSettled: () => {
      // Ensure data consistency
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
  });

  // 🔄 MUTATION - Actualizar usuario
  const updateUserMutation = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Partial<UpdateUserForm>) => {
      const formData = new FormData();
      formData.append("userId", id);

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      const result = await updateUserAction(formData);

      if (!result.success) {
        const error: any = new Error(
          result.error || "Error actualizando usuario"
        );
        error.validationErrors = result.validationErrors;
        throw error;
      }

      return result.data!;
    },

    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      await queryClient.cancelQueries({
        queryKey: USERS_QUERY_KEYS.detail(id),
      });

      const previousUsers = queryClient.getQueryData<User[]>(
        USERS_QUERY_KEYS.lists()
      );
      const previousUser = queryClient.getQueryData<User>(
        USERS_QUERY_KEYS.detail(id)
      );

      // Optimistic updates
      queryClient.setQueryData<User[]>(
        USERS_QUERY_KEYS.lists(),
        (old) =>
          old?.map((user) =>
            user.id === id
              ? { ...user, ...updates, updatedAt: new Date().toISOString() }
              : user
          ) || []
      );

      if (previousUser) {
        queryClient.setQueryData<User>(USERS_QUERY_KEYS.detail(id), {
          ...previousUser,
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousUsers, previousUser };
    },

    onError: (error: any, variables, context) => {
      // Rollback both list and detail
      if (context?.previousUsers) {
        queryClient.setQueryData(
          USERS_QUERY_KEYS.lists(),
          context.previousUsers
        );
      }
      if (context?.previousUser) {
        queryClient.setQueryData(
          USERS_QUERY_KEYS.detail(variables.id),
          context.previousUser
        );
      }

      if (error.validationErrors) {
        notify("Por favor corrige los errores en el formulario", "error");
      } else {
        notify(error.message || "Error actualizando usuario", "error");
      }
    },

    onSuccess: (updatedUser) => {
      notify(`Usuario ${updatedUser.name} actualizado exitosamente`, "success");
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEYS.detail(variables.id),
      });
    },
  });

  // 🗑️ MUTATION - Eliminar usuario
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const formData = new FormData();
      formData.append("userId", userId);

      const result = await deleteUserAction(formData);

      if (!result.success) {
        throw new Error(result.error || "Error eliminando usuario");
      }

      return result.data!;
    },

    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });

      const previousUsers = queryClient.getQueryData<User[]>(
        USERS_QUERY_KEYS.lists()
      );

      // Optimistically remove user
      queryClient.setQueryData<User[]>(
        USERS_QUERY_KEYS.lists(),
        (old) => old?.filter((user) => user.id !== userId) || []
      );

      // Remove from detail cache too
      queryClient.removeQueries({ queryKey: USERS_QUERY_KEYS.detail(userId) });

      return { previousUsers };
    },

    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(
          USERS_QUERY_KEYS.lists(),
          context.previousUsers
        );
      }
      notify(error.message || "Error eliminando usuario", "error");
    },

    onSuccess: (result) => {
      notify("Usuario eliminado exitosamente", "success");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
  });

  // 🚫 MUTATION - Banear usuario
  const banUserMutation = useMutation({
    mutationFn: async ({
      userId,
      reason,
      duration = "permanent",
    }: {
      userId: string;
      reason: string;
      duration?: string;
    }) => {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("reason", reason);
      formData.append("duration", duration);

      const result = await banUserAction(formData);

      if (!result.success) {
        const error: any = new Error(result.error || "Error baneando usuario");
        error.validationErrors = result.validationErrors;
        throw error;
      }

      return result.data!;
    },

    onMutate: async ({ userId, reason, duration }) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });

      const previousUsers = queryClient.getQueryData<User[]>(
        USERS_QUERY_KEYS.lists()
      );

      // Calculate ban expires date
      let banExpires: string | null = null;
      if (duration !== "permanent") {
        const days = parseInt(duration.replace("d", ""));
        banExpires = new Date(
          Date.now() + days * 24 * 60 * 60 * 1000
        ).toISOString();
      }

      // Optimistically ban user
      queryClient.setQueryData<User[]>(
        USERS_QUERY_KEYS.lists(),
        (old) =>
          old?.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  banned: true,
                  banReason: reason,
                  banExpires,
                  updatedAt: new Date().toISOString(),
                }
              : user
          ) || []
      );

      return { previousUsers };
    },

    onError: (error: any, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(
          USERS_QUERY_KEYS.lists(),
          context.previousUsers
        );
      }

      if (error.validationErrors) {
        notify("Por favor proporciona una razón válida para el baneo", "error");
      } else {
        notify(error.message || "Error baneando usuario", "error");
      }
    },

    onSuccess: (bannedUser) => {
      notify(`Usuario ${bannedUser.name} baneado exitosamente`, "success");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
  });

  // ✅ MUTATION - Desbanear usuario
  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const formData = new FormData();
      formData.append("userId", userId);

      const result = await unbanUserAction(formData);

      if (!result.success) {
        throw new Error(result.error || "Error desbaneando usuario");
      }

      return result.data!;
    },

    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });

      const previousUsers = queryClient.getQueryData<User[]>(
        USERS_QUERY_KEYS.lists()
      );

      // Optimistically unban user
      queryClient.setQueryData<User[]>(
        USERS_QUERY_KEYS.lists(),
        (old) =>
          old?.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  banned: false,
                  banReason: null,
                  banExpires: null,
                  updatedAt: new Date().toISOString(),
                }
              : user
          ) || []
      );

      return { previousUsers };
    },

    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(
          USERS_QUERY_KEYS.lists(),
          context.previousUsers
        );
      }
      notify(error.message || "Error desbaneando usuario", "error");
    },

    onSuccess: (unbannedUser) => {
      notify(`Usuario ${unbannedUser.name} desbaneado exitosamente`, "success");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
  });

  // 📊 Computed values
  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => !u.banned).length,
      banned: users.filter((u) => u.banned).length,
      byRole: users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    }),
    [users]
  );

  // 🔍 Filter functions
  const filterUsers = useCallback(
    (filters: { role?: string; banned?: boolean; search?: string }) => {
      let filtered = users;

      if (filters.role && filters.role !== "all") {
        filtered = filtered.filter((user) => user.role === filters.role);
      }

      if (filters.banned !== undefined) {
        filtered = filtered.filter((user) => user.banned === filters.banned);
      }

      if (filters.search && filters.search.trim()) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(
          (user) =>
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search)
        );
      }

      return filtered;
    },
    [users]
  );

  return {
    // Data
    users,
    stats,

    // States
    isLoading,
    error,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    isBanning: banUserMutation.isPending,
    isUnbanning: unbanUserMutation.isPending,

    // Actions with server action integration
    createUser: createUserMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    banUser: async (userId: string, reason?: string) => {
      const banReason = reason || prompt("Razón del baneo:");
      if (!banReason) return;

      return banUserMutation.mutateAsync({ userId, reason: banReason });
    },
    unbanUser: unbanUserMutation.mutateAsync,

    // Legacy compatibility
    toggleBanUser: async (userId: string, reason?: string) => {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      if (user.banned) {
        return unbanUserMutation.mutateAsync(userId);
      } else {
        const banReason = reason || prompt("Razón del baneo:");
        if (!banReason) return;

        return banUserMutation.mutateAsync({ userId, reason: banReason });
      }
    },

    // Utilities
    filterUsers,
    refresh: refetch,
  };
};
```

---

## ⚡ **OPTIMISTIC UPDATES AVANZADOS**

### Patrón de Optimistic Updates con Server Actions

```typescript
// 🎯 Advanced Optimistic Update Pattern
const optimisticUpdatePattern = {
  // 1. Cancel ongoing queries to avoid race conditions
  onMutate: async (mutationData) => {
    await queryClient.cancelQueries({ queryKey: QUERY_KEYS.lists() });

    // 2. Snapshot current state for rollback
    const previousData = queryClient.getQueryData(QUERY_KEYS.lists());

    // 3. Apply optimistic update
    queryClient.setQueryData(QUERY_KEYS.lists(), (old) => {
      return applyOptimisticUpdate(old, mutationData);
    });

    // 4. Return context for error handling
    return { previousData, optimisticData: mutationData };
  },

  // 5. Handle server action response
  onSuccess: (serverData, variables, context) => {
    // Replace optimistic data with real server data
    queryClient.setQueryData(QUERY_KEYS.lists(), (old) => {
      return replaceOptimisticWithReal(old, context.optimisticData, serverData);
    });
  },

  // 6. Rollback on error
  onError: (error, variables, context) => {
    if (context?.previousData) {
      queryClient.setQueryData(QUERY_KEYS.lists(), context.previousData);
    }
  },

  // 7. Ensure consistency
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
  },
};
```

### Optimistic Updates con Validación

```typescript
// 🔄 Optimistic Update with Validation Rollback
const createUserWithValidation = useMutation({
  mutationFn: async (userData: CreateUserForm) => {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    const result = await createUserAction(formData);

    if (!result.success) {
      const error: any = new Error(result.error || "Validation failed");
      error.validationErrors = result.validationErrors;
      error.isValidationError = !!result.validationErrors;
      throw error;
    }

    return result.data!;
  },

  onMutate: async (userData) => {
    // Client-side validation first
    const clientValidation = userCreateSchema.safeParse(userData);
    if (!clientValidation.success) {
      throw new Error("Validation failed on client");
    }

    // Continue with optimistic update
    await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });

    const previousUsers = queryClient.getQueryData<User[]>(
      USERS_QUERY_KEYS.lists()
    );

    const optimisticUser: User = {
      ...userData,
      id: `temp_${Date.now()}`,
      banned: false,
      emailVerified: false,
      image: null,
      banReason: null,
      banExpires: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Mark as optimistic for UI indication
      __isOptimistic: true,
    };

    queryClient.setQueryData<User[]>(USERS_QUERY_KEYS.lists(), (old) =>
      old ? [optimisticUser, ...old] : [optimisticUser]
    );

    return { previousUsers, optimisticUser };
  },

  onError: (error: any, variables, context) => {
    // Rollback optimistic update
    if (context?.previousUsers) {
      queryClient.setQueryData(USERS_QUERY_KEYS.lists(), context.previousUsers);
    }

    // Handle different error types
    if (error.isValidationError) {
      // Return validation errors to component
      return {
        type: "validation",
        errors: error.validationErrors,
      };
    } else {
      // Show general error notification
      notify(error.message || "Error creating user", "error");
    }
  },

  onSuccess: (realUser, variables, context) => {
    // Replace optimistic with real data
    queryClient.setQueryData<User[]>(
      USERS_QUERY_KEYS.lists(),
      (old) =>
        old?.map((user) => {
          if (user.id === context?.optimisticUser.id) {
            // Remove optimistic flag and use real data
            const { __isOptimistic, ...cleanUser } = realUser as any;
            return cleanUser;
          }
          return user;
        }) || []
    );

    notify(`Usuario ${realUser.name} creado exitosamente`, "success");
  },

  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
  },
});
```

---

## ✅ **VALIDACIÓN CON ZOD**

### Schemas de Validación

```typescript
// 📄 src/features/admin/users/schemas.ts
import { z } from "zod";

// Base user schema
export const userSchema = z.object({
  id: z.string().uuid("ID debe ser un UUID válido"),
  name: z
    .string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nombre solo puede contener letras y espacios"),
  email: z
    .string()
    .email("Formato de email inválido")
    .min(5, "Email debe tener al menos 5 caracteres")
    .max(255, "Email no puede exceder 255 caracteres")
    .toLowerCase(),
  role: z.enum(["user", "admin", "super_admin"], {
    errorMap: () => ({ message: "Rol debe ser: user, admin o super_admin" }),
  }),
  banned: z.boolean().default(false),
  emailVerified: z.boolean().default(false),
  image: z.string().url("URL de imagen inválida").nullable().optional(),
  banReason: z
    .string()
    .min(1, "Razón de baneo requerida")
    .nullable()
    .optional(),
  banExpires: z
    .string()
    .datetime("Fecha de expiración inválida")
    .nullable()
    .optional(),
  createdAt: z.string().datetime("Fecha de creación inválida"),
  updatedAt: z.string().datetime("Fecha de actualización inválida"),
});

// Create user schema (subset for creation)
export const userCreateSchema = z
  .object({
    name: userSchema.shape.name,
    email: userSchema.shape.email,
    role: userSchema.shape.role.default("user"),
  })
  .refine(
    async (data) => {
      // Custom async validation - check if email exists
      // This would be done on server side in real implementation
      return true;
    },
    {
      message: "Email ya está en uso",
      path: ["email"],
    }
  );

// Update user schema (all fields optional except id)
export const userUpdateSchema = z
  .object({
    id: userSchema.shape.id,
    name: userSchema.shape.name.optional(),
    email: userSchema.shape.email.optional(),
    role: userSchema.shape.role.optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided for update
      const { id, ...updateFields } = data;
      return Object.keys(updateFields).length > 0;
    },
    {
      message: "Al menos un campo debe ser actualizado",
      path: ["name"], // Show error on first field
    }
  );

// Ban user schema
export const userBanSchema = z.object({
  userId: z.string().uuid("ID de usuario inválido"),
  reason: z
    .string()
    .min(10, "Razón debe tener al menos 10 caracteres")
    .max(500, "Razón no puede exceder 500 caracteres"),
  duration: z.enum(["permanent", "7d", "30d"]).default("permanent"),
});

// Delete user schema
export const userDeleteSchema = z.object({
  userId: z.string().uuid("ID de usuario inválido"),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type CreateUserForm = z.infer<typeof userCreateSchema>;
export type UpdateUserForm = z.infer<typeof userUpdateSchema>;
export type BanUserForm = z.infer<typeof userBanSchema>;
export type DeleteUserForm = z.infer<typeof userDeleteSchema>;

// Validation helpers
export const validateUserCreate = (data: unknown) => {
  return userCreateSchema.safeParse(data);
};

export const validateUserUpdate = (data: unknown) => {
  return userUpdateSchema.safeParse(data);
};

export const validateUserBan = (data: unknown) => {
  return userBanSchema.safeParse(data);
};

export const validateUserDelete = (data: unknown) => {
  return userDeleteSchema.safeParse(data);
};
```

### Integración de Validación en Client y Server

```typescript
// Client-side validation hook
export const useFormValidation = <T extends z.ZodSchema>(schema: T) => {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const validate = useCallback(
    (data: unknown): data is z.infer<T> => {
      const result = schema.safeParse(data);

      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        setErrors(fieldErrors);
        return false;
      }

      setErrors({});
      return true;
    },
    [schema]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    validate,
    errors,
    hasErrors,
    clearErrors,
    getFieldError: (field: string) => errors[field]?.[0],
  };
};

// Usage in component
const CreateUserForm = () => {
  const { validate, errors, getFieldError } =
    useFormValidation(userCreateSchema);
  const [formData, setFormData] = useState<CreateUserForm>({
    name: "",
    email: "",
    role: "user",
  });

  const { createUser, isCreating } = useUsersQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!validate(formData)) {
      return;
    }

    try {
      await createUser(formData);
      // Form will be reset by parent component
    } catch (error) {
      // Server-side validation errors are handled in the mutation
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className={getFieldError("name") ? "border-red-500" : ""}
        />
        {getFieldError("name") && (
          <p className="text-red-500 text-sm">{getFieldError("name")}</p>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          className={getFieldError("email") ? "border-red-500" : ""}
        />
        {getFieldError("email") && (
          <p className="text-red-500 text-sm">{getFieldError("email")}</p>
        )}
      </div>

      <div>
        <label htmlFor="role">Rol</label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, role: e.target.value as any }))
          }
          className={getFieldError("role") ? "border-red-500" : ""}
        >
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
          <option value="super_admin">Super Administrador</option>
        </select>
        {getFieldError("role") && (
          <p className="text-red-500 text-sm">{getFieldError("role")}</p>
        )}
      </div>

      <button type="submit" disabled={isCreating}>
        {isCreating ? "Creando..." : "Crear Usuario"}
      </button>
    </form>
  );
};
```

---

## 🎯 **RESUMEN ARQUITECTÓNICO: CORRECTO vs INCORRECTO**

### ✅ **ARQUITECTURA CORRECTA** (Clean Architecture)

```typescript
// 📤 ACTIONS (THIN LAYER - Infrastructure/Presentation)
export async function createUserAction(formData: FormData) {
  try {
    // ✅ Schema validation (input sanitization)
    const userData = schemas.parseCreateUserFormData(formData);

    // ✅ Authentication (session check)
    const session = await validators.getValidatedSession();

    // ✅ Delegate to service (business logic)
    const userService = await createUserService();
    const newUser = await userService.createUser(userData);

    // ✅ Presentation concerns (cache, UI)
    revalidateTag(USERS_CACHE_TAGS.USERS);

    return { success: true, data: newUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 🏢 SERVICES (THICK LAYER - Domain/Business Logic)
export class UserService {
  async createUser(userData) {
    // ✅ Business validations (authorization + rules)
    await userValidators.validateCreateUser(...);

    // ✅ Domain operations (core business logic)
    const result = await auth.api.signUpEmail(...);

    // ✅ Business rules (role assignment logic)
    if (role !== "user") {
      await prisma.user.update(...);
    }

    // ✅ Audit logging (business concern)
    if (role === "admin") {
      await auditService.createAuditEvent(...);
    }

    // ✅ Data transformation (domain mapping)
    return userMappers.betterAuthUserToUser(result.user, role);
  }
}
```

### ❌ **ARQUITECTURA INCORRECTA** (Anti-Pattern)

```typescript
// ❌ ACTIONS CON BUSINESS LOGIC (Anti-pattern)
export async function createUserAction(formData: FormData) {
  try {
    // ✅ Schema validation - OK
    const userData = schemas.parseCreateUserFormData(formData);

    // ✅ Authentication - OK
    const session = await validators.getValidatedSession();

    // ❌ Business validations in actions - MAL
    await userValidators.validateCreateUser(...);

    // ❌ Permission checks in actions - MAL
    if (!session.user.permissions.includes("users.create")) {
      throw new Error("No permisos");
    }

    // ❌ Business rules in actions - MAL
    const existingUser = await findUserByEmail(userData.email);
    if (existingUser) {
      return { success: false, error: "Email exists" };
    }

    // ❌ Audit logging in actions - MAL
    await auditService.createAuditEvent(...);

    // ✅ Cache invalidation - OK
    revalidateTag("users");

    return { success: true, data: newUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ❌ SERVICES SOLO CON PRISMA (Anti-pattern)
export const createUserService = async (userData) => {
  // ❌ Solo acceso a base de datos - MAL
  return await prisma.user.create({
    data: userData
  });
}
```

### 🎯 **PRINCIPIOS FUNDAMENTALES**

#### **ACTIONS (Infrastructure Layer)**

- **Responsabilidades:**

  - ✅ Input validation/sanitization (Zod schemas)
  - ✅ Authentication (session validation)
  - ✅ Service delegation (business logic)
  - ✅ Cache invalidation (UI concerns)
  - ✅ Error transformation (presentation)

- **NO debe hacer:**
  - ❌ Business validations (permissions, rules)
  - ❌ Domain operations (business logic)
  - ❌ Audit logging (business concern)
  - ❌ Data transformations (domain mapping)

#### **SERVICES (Domain Layer)**

- **Responsabilidades:**

  - ✅ Business validations (authorization + rules)
  - ✅ Domain operations (core business logic)
  - ✅ Audit logging (business concern)
  - ✅ Data transformations (domain mapping)
  - ✅ Error handling (business errors)

- **NO debe hacer:**
  - ❌ HTTP concerns (request/response handling)
  - ❌ Cache invalidation (UI concerns)
  - ❌ Input sanitization (presentation concern)

### 🏆 **BENEFICIOS DE LA ARQUITECTURA CORRECTA**

1. **🧪 Testability**: Services testeables sin HTTP concerns
2. **♻️ Reusability**: Services reutilizables desde multiple lugares
3. **📦 Modularity**: Separación clara de responsabilidades
4. **🔒 Security**: Business rules centralizadas en Services
5. **🚀 Performance**: Optimizaciones en la capa correcta
6. **🛠️ Maintainability**: Cambios en una sola capa

---

### 📚 **CONTINÚA APRENDIENDO**

> **Siguiente paso:** [TANSTACK_QUERY_SERVER_INTEGRATION_PART2.md](./TANSTACK_QUERY_SERVER_INTEGRATION_PART2.md) para ver patterns avanzados y el flujo completo con ejemplos del módulo Users.

---

_Documentación actualizada con la **arquitectura correcta** basada en Clean Architecture y Domain-Driven Design._
