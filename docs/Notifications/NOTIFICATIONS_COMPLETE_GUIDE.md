---
title: Guia completa
slug: /notificacions/guia
---

# 🔔 SISTEMA DE NOTIFICACIONES - GUÍA COMPLETA

> **Documentación exhaustiva del sistema de notificaciones con `useActionNotifications`, `Sonner`, y arquitectura de mensajes centralizados**

---

## 📋 **TABLA DE CONTENIDOS**

1. [Arquitectura del Sistema](#-arquitectura-del-sistema)
2. [Componentes Principales](#-componentes-principales)
3. [Hook Principal: `useActionNotifications`](#-hook-principal-useactionnotifications)
4. [Uso Básico](#-uso-básico)
5. [Casos de Uso Avanzados](#-casos-de-uso-avanzados)
6. [Configuración y Personalización](#-configuración-y-personalización)
7. [Mejores Prácticas](#-mejores-prácticas)
8. [Troubleshooting](#-troubleshooting)
9. [API Reference](#-api-reference)

---

## 🏗️ **ARQUITECTURA DEL SISTEMA**

### **Diagrama de Arquitectura**

```
┌─────────────────────────────────────────────────────────┐
│                    APLICACIÓN                           │
├─────────────────────────────────────────────────────────┤
│  🎯 useActionNotifications                              │
│  ├── notify() ← MÉTODO PRINCIPAL                         │
│  ├── withNotification() ← WRAPPER INTELIGENTE           │
│  └── success/error/warning/info/loading ← MÉTODOS BASE  │
├─────────────────────────────────────────────────────────┤
│  📨 useNotifications (Context Hook)                     │
│  ├── show() ← Mostrar notificación base                 │
│  ├── promise() ← Wrapper para promesas (SONNER API)     │
│  └── users/files/auth/permissions ← MÉTODOS CATEGORIZADOS │
├─────────────────────────────────────────────────────────┤
│  🎭 NotificationProvider (React Context)               │
│  ├── Estado global de notificaciones                    │
│  ├── Configuración centralizada                         │
│  └── Integración con Sonner Toaster                     │
├─────────────────────────────────────────────────────────┤
│  📊 Sonner (UI Library)                                │
│  ├── Toast rendering                                    │
│  ├── Transitions & animations                           │
│  └── Native promise support                             │
├─────────────────────────────────────────────────────────┤
│  🔧 CONFIGURACIÓN                                       │
│  ├── 📝 constants/notifications.ts ← MENSAJES           │
│  ├── 🎨 types/notifications.ts ← TIPOS                  │
│  └── ⚙️ NotificationProvider config ← SETUP            │
└─────────────────────────────────────────────────────────┘
```

### **Flujo de Datos**

```
┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   COMPONENTE   │───▶│ useActionNotifications │───▶│ NotificationProvider │
│                │    │                  │    │                 │
│ notify(action, │    │ withNotification │    │ Context + State │
│ "Loading...",  │    │ ↓               │    │                 │
│ "Success!")    │    │ Auto-detect     │    │                 │
└────────────────┘    │ ↓               │    └─────────────────┘
                      │ Smart errors    │             │
                      │ ↓               │             ▼
                      │ promise() call  │    ┌─────────────────┐
                      └──────────────────┘    │   SONNER UI     │
                                              │                 │
                                              │ ┌─────────────┐ │
                                              │ │ 🔄 Loading  │ │
                                              │ │     ↓       │ │
                                              │ │ ✅ Success  │ │
                                              │ │  or         │ │
                                              │ │ ❌ Error    │ │
                                              │ └─────────────┘ │
                                              └─────────────────┘
```

---

## 🧩 **COMPONENTES PRINCIPALES**

### **1. 🎯 `useActionNotifications` Hook**

**Ubicación**: `src/shared/hooks/useActionNotifications.ts`  
**Propósito**: Hook principal para envolver acciones con notificaciones inteligentes

**Características**:

- ✅ **Auto-detección** de tipo de acción (create, update, delete, upload, etc.)
- ✅ **Emojis automáticos** basados en el contexto
- ✅ **Formateo inteligente** de errores multinivel
- ✅ **API `toast.promise`** nativa de Sonner (sin overlaps)
- ✅ **Zero configuration** - funciona out-of-the-box

### **2. 📨 `useNotifications` Hook**

**Ubicación**: `src/shared/hooks/useNotifications.ts`  
**Propósito**: Hook de contexto para acceso directo a notificaciones categorizadas

**Características**:

- 📱 **Métodos categorizados**: `users.*`, `files.*`, `auth.*`, `permissions.*`
- 🚀 **Métodos quick**: `quick.success()`, `quick.error()`, etc.
- 🎯 **Acceso al context**: Configuración, estado, métodos base

### **3. 🎭 `NotificationProvider`**

**Ubicación**: `src/shared/providers/NotificationProvider.tsx`  
**Propósito**: React Context Provider que integra Sonner y maneja estado global

**Características**:

- ⚙️ **Configuración centralizada**: Posición, duración, colores, etc.
- 🎨 **Theming**: Soporte para tema claro/oscuro
- 📊 **Estado global**: Tracking de notificaciones activas
- 🔧 **Integración Sonner**: Wrapper sobre `Toaster` con configuración custom

### **4. 📝 Constantes y Tipos**

**Archivos**:

- `src/shared/constants/notifications.ts` - Mensajes pre-definidos
- `src/shared/types/notifications.ts` - Tipos TypeScript

---

## 🎯 **HOOK PRINCIPAL: `useActionNotifications`**

### **Importación**

```typescript
import { useActionNotifications } from "@/shared/hooks/useActionNotifications";
// O desde el barrel
import { useActionNotifications } from "@/shared/hooks";
```

### **API Principal**

#### **`notify(action, loadingMessage, successMessage?)`**

**Signatura**:

```typescript
notify: <T>(
  action: () => Promise<T>,
  loadingMessage: string,
  successMessage?: string
) => Promise<T>;
```

**Ejemplo Básico**:

```typescript
const { notify } = useActionNotifications();

const handleCreateUser = async (userData: CreateUserForm) => {
  await notify(
    async () => {
      // Tu lógica asíncrona
      const result = await createUserAction(formData);
      if (!result.success) {
        throw new Error(result.error || "Error creating user");
      }
      // Lógica adicional post-creación
      refreshUsers();
    },
    "Creando usuario...", // Loading message
    "Usuario creado exitosamente" // Success message (opcional)
  );
};
```

#### **`withNotification(action, messages)`** - Método Avanzado

**Signatura**:

```typescript
withNotification: <T>(
  action: () => Promise<T>,
  messages: {
    loading: string;
    success?: string;
    error?: string;
  }
) => Promise<T>;
```

**Ejemplo Avanzado**:

```typescript
const handleComplexOperation = async () => {
  await withNotification(
    async () => {
      // Operación compleja multi-paso
      const step1 = await processStep1();
      const step2 = await processStep2(step1);
      return await finalizeProcess(step2);
    },
    {
      loading: "Procesando operación compleja...",
      success: "🎉 Operación completada con éxito",
      error: "⚠️ Falló la operación compleja",
    }
  );
};
```

### **Inteligencia Automática**

#### **🔍 Auto-detección de Tipo de Acción**

El sistema detecta automáticamente el tipo de acción basado en palabras clave:

```typescript
// Detecta "create" → emoji ✅
await notify(action, "Creando usuario...");

// Detecta "update" → emoji 📝
await notify(action, "Actualizando perfil...");

// Detecta "delete" → emoji 🗑️
await notify(action, "Eliminando archivo...");

// Detecta "upload" → emoji 📤
await notify(action, "Subiendo documento...");

// Detecta "download" → emoji 📥
await notify(action, "Descargando datos...");

// Detecta "auth" → emoji 🔐
await notify(action, "Iniciando sesión...");

// Por defecto → emoji 📋
await notify(action, "Procesando...");
```

#### **🧠 Formateo Inteligente de Errores**

El sistema formatea errores automáticamente con contexto:

```typescript
// Error simple
throw new Error("Usuario no encontrado");
// → "❌ Error al crear usuario: Usuario no encontrado"

// Error de validación
throw new Error("Email is required");
// → "❌ Error al crear usuario: Email is required"

// Error de servidor
throw new Error("Internal server error");
// → "❌ Error al crear usuario: Internal server error"

// Error de permisos
throw new Error("Access denied");
// → "❌ Error al crear usuario: Access denied"
```

#### **⚡ Severidad y Configuración Auto**

```typescript
// Errors de baja severidad (4s duration)
"Validation error", "Not found", "Invalid format";

// Errors de media severidad (6s duration)
"Permission denied", "Unauthorized", "Access denied";

// Errors de alta severidad (8s + botón retry)
"Network error", "Connection failed", "Fetch error";

// Errors críticos (12s + botón report)
"Internal server error", "500", "Server error";
```

---

## 💡 **USO BÁSICO**

### **Caso 1: CRUD de Usuarios**

```typescript
import { useActionNotifications } from "@/shared/hooks/useActionNotifications";

const UsersComponent = () => {
  const { notify } = useActionNotifications();

  // ✅ Crear usuario
  const handleCreateUser = async (userData: CreateUserForm) => {
    await notify(
      async () => {
        const formData = new FormData();
        formData.append("email", userData.email);
        formData.append("name", userData.name);
        formData.append("role", userData.role);

        const result = await createUserAction(formData);
        if (!result.success) {
          throw new Error(result.error || "Error creating user");
        }

        setIsModalOpen(false);
        refreshUsers();
      },
      "Creando usuario...",
      "Usuario creado exitosamente"
    );
  };

  // 📝 Actualizar usuario
  const handleUpdateUser = async (userId: string, userData: UpdateUserForm) => {
    await notify(
      async () => {
        const result = await updateUserAction(userId, userData);
        if (!result.success) {
          throw new Error(result.error);
        }
        refreshUsers();
      },
      "Actualizando usuario...",
      "Usuario actualizado correctamente"
    );
  };

  // 🗑️ Eliminar usuario
  const handleDeleteUser = async (userId: string) => {
    await notify(
      async () => {
        const result = await deleteUserAction(userId);
        if (!result.success) {
          throw new Error(result.error);
        }
        refreshUsers();
      },
      "Eliminando usuario...",
      "Usuario eliminado exitosamente"
    );
  };

  return (
    <div>
      {/* Tu UI aquí */}
      <button onClick={() => handleCreateUser(formData)}>Crear Usuario</button>
    </div>
  );
};
```

### **Caso 2: Upload de Archivos**

```typescript
const FileUploadComponent = () => {
  const { notify } = useActionNotifications();

  const handleFileUpload = async (files: File[]) => {
    await notify(
      async () => {
        const formData = new FormData();
        files.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });

        const result = await uploadFilesAction(formData);
        if (!result.success) {
          throw new Error(result.error || "Upload failed");
        }

        // Actualizar lista de archivos
        refreshFileList();

        // Limpiar formulario
        setSelectedFiles([]);
      },
      "Subiendo archivos...",
      `${files.length} archivo(s) subido(s) exitosamente`
    );
  };

  const handleFileDelete = async (fileId: string, fileName: string) => {
    await notify(
      async () => {
        const result = await deleteFileAction(fileId);
        if (!result.success) {
          throw new Error(result.error);
        }
        refreshFileList();
      },
      `Eliminando ${fileName}...`,
      "Archivo eliminado exitosamente"
    );
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
      />
    </div>
  );
};
```

---

## 🚀 **CASOS DE USO AVANZADOS**

### **Caso 1: Operaciones con Múltiples Steps**

```typescript
const ComplexOperationComponent = () => {
  const { withNotification } = useActionNotifications();

  const handleComplexProcess = async () => {
    await withNotification(
      async () => {
        // Step 1: Validar datos
        const validation = await validateData(inputData);
        if (!validation.valid) {
          throw new Error(`Validación falló: ${validation.errors.join(", ")}`);
        }

        // Step 2: Procesar en servidor
        const processed = await processOnServer(validation.data);
        if (!processed.success) {
          throw new Error("Procesamiento falló en el servidor");
        }

        // Step 3: Actualizar base de datos
        const saved = await saveToDatabase(processed.data);
        if (!saved.success) {
          throw new Error("Error al guardar en base de datos");
        }

        // Step 4: Sincronizar con servicios externos
        await syncWithExternalServices(saved.id);

        // Step 5: Actualizar UI
        refreshData();
        showSuccessModal();

        return { id: saved.id, message: "Proceso completado" };
      },
      {
        loading: "Procesando operación compleja (puede tomar unos segundos)...",
        success: "🎉 Proceso completado exitosamente - Datos sincronizados",
        error: "⚠️ Error en el proceso - Revise los logs para más detalles",
      }
    );
  };

  return (
    <button onClick={handleComplexProcess}>Ejecutar Proceso Complejo</button>
  );
};
```

### **Caso 2: Batch Operations**

```typescript
const BatchOperationsComponent = () => {
  const { notify } = useActionNotifications();

  const handleBatchUserUpdate = async (
    userIds: string[],
    updates: UserUpdate
  ) => {
    await notify(
      async () => {
        const results = await Promise.allSettled(
          userIds.map((id) => updateUserAction(id, updates))
        );

        const failed = results.filter((r) => r.status === "rejected");
        const succeeded = results.filter((r) => r.status === "fulfilled");

        if (failed.length > 0) {
          throw new Error(
            `${failed.length} de ${userIds.length} usuarios fallaron al actualizar`
          );
        }

        refreshUsers();
        return { updated: succeeded.length };
      },
      `Actualizando ${userIds.length} usuarios...`,
      `${userIds.length} usuarios actualizados exitosamente`
    );
  };

  const handleBatchDelete = async (selectedIds: string[]) => {
    await notify(
      async () => {
        // Eliminar en lotes de 10 para evitar sobrecarga
        const batchSize = 10;
        const batches = [];

        for (let i = 0; i < selectedIds.length; i += batchSize) {
          batches.push(selectedIds.slice(i, i + batchSize));
        }

        for (const batch of batches) {
          const results = await Promise.all(
            batch.map((id) => deleteUserAction(id))
          );

          const failures = results.filter((r) => !r.success);
          if (failures.length > 0) {
            throw new Error(`${failures.length} eliminaciones fallaron`);
          }
        }

        refreshUsers();
      },
      `Eliminando ${selectedIds.length} elementos...`,
      "Eliminación masiva completada"
    );
  };

  return (
    <div>
      <button onClick={() => handleBatchUpdate(selectedIds, updateData)}>
        Actualizar Seleccionados
      </button>
      <button onClick={() => handleBatchDelete(selectedIds)}>
        Eliminar Seleccionados
      </button>
    </div>
  );
};
```

### **Caso 3: Con Retry Logic**

```typescript
const RobustOperationComponent = () => {
  const { withNotification } = useActionNotifications();

  const handleWithRetry = async () => {
    await withNotification(
      async () => {
        const maxRetries = 3;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const result = await unstableOperation();
            if (result.success) {
              return result;
            }
            throw new Error(result.error || "Operation failed");
          } catch (error) {
            lastError = error as Error;

            if (attempt < maxRetries) {
              // Esperar antes del retry (exponential backoff)
              await new Promise((resolve) =>
                setTimeout(resolve, Math.pow(2, attempt) * 1000)
              );
              continue;
            }
          }
        }

        throw new Error(
          `Operación falló después de ${maxRetries} intentos: ${lastError?.message}`
        );
      },
      {
        loading: "Ejecutando operación (con reintentos automáticos)...",
        success: "✅ Operación completada (con posibles reintentos)",
        error: "❌ Operación falló después de múltiples intentos",
      }
    );
  };

  return <button onClick={handleWithRetry}>Operación con Retry</button>;
};
```

---

## ⚙️ **CONFIGURACIÓN Y PERSONALIZACIÓN**

### **1. Configuración del Provider**

**En `src/app/layout.tsx`**:

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NotificationProvider
          theme="system" // "light" | "dark" | "system"
          visibleToasts={5} // Número máximo de toasts visibles
          config={{
            position: "top-right", // Posición de las notificaciones
            richColors: true, // Colores mejorados
            closeButton: true, // Botón de cerrar
            dismissible: true, // Permitir cerrar manualmente
            pauseWhenPageIsHidden: true, // Pausar cuando página oculta
          }}
        >
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
```

### **2. Mensajes Personalizados**

**Editar `src/shared/constants/notifications.ts`**:

```typescript
export const NOTIFICATION_MESSAGES = {
  USERS: {
    CREATE_LOADING: "Creando nuevo usuario...",
    CREATE_SUCCESS: "✅ Usuario registrado exitosamente",
    CREATE_ERROR: "❌ Error al registrar usuario",
    // ... más mensajes
  },
  FILES: {
    UPLOAD_LOADING: "Subiendo archivos al servidor...",
    UPLOAD_SUCCESS: "📤 Archivos subidos correctamente",
    UPLOAD_ERROR: "❌ Error en la subida de archivos",
    // ... más mensajes
  },
  // Agregar nuevas categorías
  CUSTOM_MODULE: {
    PROCESS_LOADING: "Procesando datos...",
    PROCESS_SUCCESS: "✅ Datos procesados",
    PROCESS_ERROR: "❌ Error al procesar",
  },
};
```

### **3. Estilos y Temas**

**CSS Personalizado** (en tu archivo CSS global):

```css
/* Personalizar posición */
:root {
  --toast-gap: 14px;
  --toast-width: 356px;
}

/* Tema personalizado */
[data-sonner-toaster][data-theme="custom"] {
  --normal-bg: #ffffff;
  --normal-border: #e5e7eb;
  --normal-text: #374151;

  --success-bg: #dcfce7;
  --success-border: #16a34a;
  --success-text: #15803d;

  --error-bg: #fef2f2;
  --error-border: #dc2626;
  --error-text: #b91c1c;
}

/* Responsive */
@media (max-width: 640px) {
  [data-sonner-toaster] {
    --toast-width: calc(100vw - 32px);
    left: 16px;
    right: 16px;
  }
}
```

### **4. Configuración Avanzada por Entorno**

```typescript
// src/shared/config/notifications.ts
const getNotificationConfig = () => {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isTesting = process.env.NODE_ENV === "test";

  return {
    // En desarrollo: notificaciones más verbosas
    showDebugInfo: isDevelopment,

    // En testing: notificaciones silenciosas
    silent: isTesting,

    // Duración basada en entorno
    defaultDuration: isDevelopment ? 8000 : 4000,

    // Features experimentales solo en dev
    enableAdvancedErrors: isDevelopment,
    enableAnalytics: !isTesting,
  };
};
```

---

## ✅ **MEJORES PRÁCTICAS**

### **1. 🎯 Naming de Mensajes**

```typescript
// ✅ BUENO: Descriptivo y específico
"Creando usuario administrador...";
"Actualizando configuración de perfil...";
"Eliminando archivo de imagen...";
"Subiendo documento PDF...";

// ❌ MALO: Genérico y vago
"Procesando...";
"Guardando...";
"Eliminando...";
"Cargando...";
```

### **2. 🔄 Manejo de Errores**

```typescript
// ✅ BUENO: Error específico con contexto
const handleOperation = async () => {
  await notify(
    async () => {
      const result = await someAction();
      if (!result.success) {
        // Lanza error específico que será formateado automáticamente
        throw new Error(result.error || "Operación falló");
      }
    },
    "Ejecutando operación...",
    "Operación completada exitosamente"
  );
};

// ❌ MALO: Swallow errors o errores genéricos
const handleOperationBad = async () => {
  try {
    await someAction();
    // No hay notificaciones de éxito/error
  } catch (error) {
    console.log(error); // Solo log, no notifica al usuario
  }
};
```

### **3. 🎨 Consistency en UX**

```typescript
// ✅ BUENO: Consistencia en patrones
const UserOperations = () => {
  const { notify } = useActionNotifications();

  // Todos siguen el mismo patrón
  const handleCreate = (data) =>
    notify(
      createAction(data),
      "Creando usuario...",
      "Usuario creado exitosamente"
    );
  const handleUpdate = (id, data) =>
    notify(
      updateAction(id, data),
      "Actualizando usuario...",
      "Usuario actualizado correctamente"
    );
  const handleDelete = (id) =>
    notify(
      deleteAction(id),
      "Eliminando usuario...",
      "Usuario eliminado exitosamente"
    );
};

// ❌ MALO: Inconsistencia en mensajes y patrones
const handleCreate = (data) =>
  notify(createAction(data), "Creating...", "Done!");
const handleUpdate = (id, data) =>
  notify(
    updateAction(id, data),
    "Updating user profile...",
    "Profile has been updated successfully with new information"
  );
```

### **4. 🚀 Performance**

```typescript
// ✅ BUENO: Debouncing para operaciones repetitivas
const debouncedSave = useCallback(
  debounce(async (data) => {
    await notify(
      async () => await autoSaveAction(data),
      "Guardando automáticamente...",
      "Guardado automático completado"
    );
  }, 2000),
  []
);

// ✅ BUENO: Batch operations
const handleBulkOperation = async (items) => {
  await notify(
    async () => {
      // Procesar en lotes para evitar spam de notificaciones
      const results = await processBatch(items);
      return results;
    },
    `Procesando ${items.length} elementos...`,
    `${items.length} elementos procesados exitosamente`
  );
};
```

### **5. 🎭 Accessibility**

```typescript
// ✅ BUENO: Mensajes claros para screen readers
await notify(
  action,
  "Creando nuevo usuario en el sistema", // Descriptivo para accessibility
  "Usuario John Doe creado exitosamente con rol Administrador" // Específico y útil
);

// ❌ MALO: Mensajes con solo emojis o muy técnicos
await notify(
  action,
  "🔄", // Screen reader no puede leer esto bien
  "HTTP 201 - POST /api/users - SUCCESS" // Muy técnico para usuarios finales
);
```

### **6. 🔍 Testing**

```typescript
// tests/notifications.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { useActionNotifications } from "@/shared/hooks/useActionNotifications";

// Mock del hook para testing
jest.mock("@/shared/hooks/useActionNotifications");

const TestComponent = () => {
  const { notify } = useActionNotifications();

  const handleTest = () =>
    notify(
      async () => ({ success: true }),
      "Testing notification...",
      "Test completed successfully"
    );

  return <button onClick={handleTest}>Test</button>;
};

test("should show notification on action", async () => {
  const mockNotify = jest.fn();
  (useActionNotifications as jest.Mock).mockReturnValue({ notify: mockNotify });

  render(<TestComponent />);

  const button = screen.getByText("Test");
  fireEvent.click(button);

  await waitFor(() => {
    expect(mockNotify).toHaveBeenCalledWith(
      expect.any(Function),
      "Testing notification...",
      "Test completed successfully"
    );
  });
});
```

---

## 🐛 **TROUBLESHOOTING**

### **Problema 1: Notificaciones se Superponen**

**Síntomas**: Múltiples toasts aparecen para la misma acción  
**Causa**: Uso de APIs manuales en lugar de `toast.promise`  
**Solución**: Usar siempre `notify()` o `withNotification()`

```typescript
// ❌ PROBLEMÁTICO: Crear loading manual
const loadingId = notifications.loading("Processing...");
notifications.dismiss(loadingId);
notifications.success("Done!"); // Nueva notificación = overlap

// ✅ CORRECTO: Usar API de promise
await notify(action, "Processing...", "Done!"); // Una sola notificación que se transforma
```

### **Problema 2: Errores No Se Formatean**

**Síntomas**: Errores aparecen como "[object Object]" o texto crudo  
**Causa**: Error no es instancia de `Error` o no tiene mensaje  
**Solución**: Siempre lanzar `Error` con mensaje descriptivo

```typescript
// ❌ PROBLEMÁTICO
const result = await someAction();
if (!result.success) {
  throw result; // Objeto, no Error
}

// ✅ CORRECTO
const result = await someAction();
if (!result.success) {
  throw new Error(result.error || "Operación falló"); // Error con mensaje
}
```

### **Problema 3: Hook No Funciona**

**Síntomas**: "useActionNotifications is not a function" o similar  
**Causa**: Falta el `NotificationProvider` o import incorrecto  
**Solución**: Verificar setup

```typescript
// 1. Verificar que Layout.tsx tiene el Provider
<NotificationProvider>{children}</NotificationProvider>;

// 2. Verificar import correcto
import { useActionNotifications } from "@/shared/hooks/useActionNotifications";
// o
import { useActionNotifications } from "@/shared/hooks";

// 3. Verificar uso dentro de componente React
const MyComponent = () => {
  const { notify } = useActionNotifications(); // ✅ Dentro de componente
  // ...
};
```

### **Problema 4: Mensajes No Aparecen**

**Síntomas**: No hay notificaciones visibles  
**Causa**: Configuración de duración o posición  
**Diagnóstico**:

```typescript
// Verificar en DevTools Console
console.log("NotificationProvider config:", {
  position: "top-right",
  visibleToasts: 5,
  theme: "system",
});

// Test básico
const { notify } = useActionNotifications();
notify(
  async () => new Promise((resolve) => setTimeout(resolve, 1000)),
  "Test message",
  "Test success"
);
```

### **Problema 5: Performance Issues**

**Síntomas**: App lenta con muchas notificaciones  
**Causa**: Demasiadas notificaciones simultáneas  
**Solución**:

```typescript
// ✅ Limitar notificaciones visibles
<NotificationProvider visibleToasts={3}>

// ✅ Debounce operaciones repetitivas
const debouncedNotify = useMemo(
  () => debounce((action, loading, success) => notify(action, loading, success), 1000),
  [notify]
);

// ✅ Batch operations
const handleBatch = async (items) => {
  // Una notificación para todo el lote, no una por item
  await notify(
    async () => await processBatch(items),
    `Processing ${items.length} items...`,
    "Batch completed"
  );
};
```

---

## 📚 **API REFERENCE**

### **`useActionNotifications()`**

Retorna un objeto con los siguientes métodos:

#### **`notify(action, loadingMessage, successMessage?)`**

- **Parámetros**:
  - `action: () => Promise<T>` - Función asíncrona a ejecutar
  - `loadingMessage: string` - Mensaje durante la carga
  - `successMessage?: string` - Mensaje de éxito (opcional)
- **Retorna**: `Promise<T>` - El resultado de la acción
- **Funcionalidad**: Envuelve la acción con notificación inteligente

#### **`withNotification(action, messages)`**

- **Parámetros**:
  - `action: () => Promise<T>` - Función asíncrona a ejecutar
  - `messages: { loading: string; success?: string; error?: string; }` - Mensajes configurables
- **Retorna**: `Promise<T>` - El resultado de la acción
- **Funcionalidad**: Control completo sobre mensajes de notificación

#### **Métodos Base**

- **`success(message, options?)`** - Notificación de éxito
- **`error(message, options?)`** - Notificación de error
- **`warning(message, options?)`** - Notificación de advertencia
- **`info(message, options?)`** - Notificación informativa
- **`loading(message, options?)`** - Notificación de carga
- **`dismiss(id)`** - Cerrar notificación específica
- **`clear()`** - Cerrar todas las notificaciones
- **`update(id, options)`** - Actualizar notificación existente

### **`useNotifications()`**

Hook de contexto que retorna:

#### **Métodos Categorizados**

```typescript
{
  // 👥 Usuarios
  users: {
    create: (options?) => string;
    update: (options?) => string;
    delete: (options?) => string;
    // ...más métodos
  },

  // 📁 Archivos
  files: {
    upload: (options?) => string;
    delete: (options?) => string;
    download: (options?) => string;
    // ...más métodos
  },

  // 🔐 Autenticación
  auth: {
    login: (options?) => string;
    logout: (options?) => string;
    register: (options?) => string;
    // ...más métodos
  },

  // 🛡️ Permisos
  permissions: {
    accessDenied: (resource?, action?) => string;
    roleRequired: (requiredRole?) => string;
    // ...más métodos
  }
}
```

#### **Métodos Quick**

```typescript
{
  quick: {
    success: (message: string) => string;
    error: (message: string) => string;
    warning: (message: string) => string;
    info: (message: string) => string;
    loading: (message: string) => string;
  }
}
```

### **`NotificationProvider` Props**

```typescript
interface NotificationProviderProps {
  children: React.ReactNode;
  theme?: "light" | "dark" | "system";
  visibleToasts?: number;
  expand?: boolean;
  config?: {
    position?:
      | "top-left"
      | "top-right"
      | "bottom-left"
      | "bottom-right"
      | "top-center"
      | "bottom-center";
    richColors?: boolean;
    closeButton?: boolean;
    dismissible?: boolean;
    pauseWhenPageIsHidden?: boolean;
    duration?: number;
  };
  toastOptions?: {
    className?: string;
    style?: React.CSSProperties;
    duration?: number;
  };
}
```

### **Tipos TypeScript**

```typescript
// Configuración de notificación
interface NotificationConfig {
  duration?: number;
  position?: ToastPosition;
  closeButton?: boolean;
  dismissible?: boolean;
  richColors?: boolean;
  pauseWhenPageIsHidden?: boolean;
  action?: NotificationAction;
}

// Acción de notificación
interface NotificationAction {
  label: string;
  onClick: () => void | Promise<void>;
}

// Opciones de estilo
interface NotificationStyle {
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
}

// Opciones completas
interface NotificationOptions extends NotificationConfig, NotificationStyle {
  type: "success" | "error" | "warning" | "info" | "loading";
  message: string;
  data?: Record<string, unknown>;
}
```

---

## 🎯 **EJEMPLOS DE INTEGRACIÓN**

### **Ejemplo 1: Módulo Completo**

```typescript
// src/features/products/hooks/useProducts.ts
import { useActionNotifications } from "@/shared/hooks/useActionNotifications";

export const useProducts = () => {
  const { notify } = useActionNotifications();

  const createProduct = async (productData: CreateProductForm) => {
    return await notify(
      async () => {
        const formData = new FormData();
        formData.append("name", productData.name);
        formData.append("price", productData.price.toString());
        formData.append("description", productData.description);

        const result = await createProductAction(formData);
        if (!result.success) {
          throw new Error(result.error || "Error creating product");
        }

        return result.data;
      },
      "Creando producto...",
      "Producto creado exitosamente"
    );
  };

  const updateProduct = async (id: string, updates: UpdateProductForm) => {
    return await notify(
      async () => {
        const result = await updateProductAction(id, updates);
        if (!result.success) {
          throw new Error(result.error || "Error updating product");
        }
        return result.data;
      },
      "Actualizando producto...",
      "Producto actualizado correctamente"
    );
  };

  const deleteProduct = async (id: string) => {
    return await notify(
      async () => {
        const result = await deleteProductAction(id);
        if (!result.success) {
          throw new Error(result.error || "Error deleting product");
        }
      },
      "Eliminando producto...",
      "Producto eliminado exitosamente"
    );
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
```

### **Ejemplo 2: Integración con Formularios**

```typescript
// src/components/forms/ProductForm.tsx
import { useActionNotifications } from "@/shared/hooks/useActionNotifications";
import { useForm } from "react-hook-form";

const ProductForm = ({ product, onSuccess }: ProductFormProps) => {
  const { notify } = useActionNotifications();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: ProductFormData) => {
    const operation = product ? "update" : "create";

    await notify(
      async () => {
        let result;

        if (product) {
          result = await updateProductAction(product.id, data);
        } else {
          result = await createProductAction(data);
        }

        if (!result.success) {
          throw new Error(
            result.error ||
              `Error ${
                operation === "create" ? "creating" : "updating"
              } product`
          );
        }

        // Callback de éxito
        onSuccess?.(result.data);

        return result.data;
      },
      product ? "Actualizando producto..." : "Creando producto...",
      product
        ? "Producto actualizado exitosamente"
        : "Producto creado exitosamente"
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("name", { required: "Name is required" })}
        placeholder="Product name"
      />
      {errors.name && <span>{errors.name.message}</span>}

      <input
        {...register("price", { required: "Price is required", min: 0 })}
        type="number"
        step="0.01"
        placeholder="Price"
      />
      {errors.price && <span>{errors.price.message}</span>}

      <textarea {...register("description")} placeholder="Description" />

      <button type="submit">
        {product ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
};
```

---

## 🎉 **CONCLUSIÓN**

Este sistema de notificaciones ofrece:

✅ **Simplicidad**: Una sola línea `notify(action, loading, success)`  
✅ **Inteligencia**: Auto-detección de tipos, emojis y formateo de errores  
✅ **Robustez**: Sin overlaps usando API nativa de Sonner  
✅ **Flexibilidad**: Configuración avanzada cuando se necesita  
✅ **Performance**: Optimizado para aplicaciones enterprise  
✅ **UX**: Transiciones suaves y mensajes informativos  
✅ **DX**: TypeScript completo y API consistente

**Para la mayoría de casos de uso, solo necesitas**:

```typescript
const { notify } = useActionNotifications();
await notify(action, "Loading...", "Success!");
```

**¡Eso es todo!** El sistema se encarga del resto automáticamente. 🚀
