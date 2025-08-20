---
title: Guia completa
slug: /notificacions/guia
---

# 🔔 SISTEMA DE NOTIFICACIONES - GUÍA COMPLETA

> **Documentación exhaustiva del sistema de notificaciones con `useNotifications`, `Sonner`, y arquitectura simplificada**

---

## 📋 **TABLA DE CONTENIDOS**

1. [Arquitectura del Sistema](#-arquitectura-del-sistema)
2. [Hook Principal: `useNotifications`](#-hook-principal-usenotifications)
3. [Uso Básico](#-uso-básico)
4. [Casos de Uso Avanzados](#-casos-de-uso-avanzados)
5. [Configuración y Personalización](#-configuración-y-personalización)
6. [Mejores Prácticas](#-mejores-prácticas)
7. [Troubleshooting](#-troubleshooting)
8. [API Reference](#-api-reference)

---

## 🏗️ **ARQUITECTURA DEL SISTEMA**

### **Diagrama de Arquitectura Simplificado**

```
┌─────────────────────────────────────────────────────────┐
│                    APLICACIÓN                           │
├─────────────────────────────────────────────────────────┤
│  🎯 useNotifications (ÚNICO HOOK)                       │
│  ├── notify() ← MÉTODO PRINCIPAL                         │
│  ├── withNotification() ← WRAPPER INTELIGENTE           │
│  └── success/error/warning/info/loading ← MÉTODOS BASE  │
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
│  🔧 CONFIGURACIÓN MÍNIMA                               │
│  ├── 🎨 types/notifications.ts ← TIPOS BÁSICOS          │
│  └── ⚙️ NotificationProvider config ← SETUP            │
└─────────────────────────────────────────────────────────┘
```

### **Flujo de Datos Simplificado**

```
┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   COMPONENTE   │───▶│  useNotifications │───▶│ NotificationProvider │
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

## 🧩 **HOOK PRINCIPAL: `useNotifications`**

### **Ubicación y Propósito**

**Archivo**: `src/shared/hooks/useNotifications.ts`  
**Propósito**: Hook único y principal para todas las notificaciones

### **Características Principales**

- ✅ **Auto-detección** de tipo de acción (create, update, delete, upload, etc.)
- ✅ **Emojis automáticos** basados en el contexto
- ✅ **Formateo inteligente** de errores multinivel
- ✅ **API `toast.promise`** nativa de Sonner (sin overlaps)
- ✅ **TypeScript completo** con inferencia de tipos
- ✅ **Performance optimizado** con `useCallback`

### **API del Hook**

```typescript
const {
  // 🎯 MÉTODO PRINCIPAL (90% de casos de uso)
  notify,

  // 🔧 MÉTODO AVANZADO
  withNotification,

  // 📝 MÉTODOS DIRECTOS
  success,
  error,
  warning,
  info,
  loading,

  // 🎛️ CONTROL
  dismiss,
  clear,
} = useNotifications();
```

---

## 🚀 **USO BÁSICO**

### **1. Import y Setup**

```typescript
import { useNotifications } from "@/shared/hooks/useNotifications";

const MyComponent = () => {
  const { notify } = useNotifications();

  // Tu código aquí...
};
```

### **2. Patrón Principal**

```typescript
const handleAction = async () => {
  await notify(
    async () => {
      // Tu lógica asíncrona aquí
      const result = await someServerAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    "Procesando...", // Mensaje de loading
    "¡Completado exitosamente!" // Mensaje de éxito (opcional)
  );
};
```

### **3. Ejemplos Básicos**

```typescript
// ✅ Crear usuario
await notify(
  () => createUser(userData),
  "Creando usuario...",
  "Usuario creado exitosamente"
);

// 📝 Actualizar perfil
await notify(
  () => updateProfile(profileData),
  "Actualizando perfil...",
  "Perfil actualizado correctamente"
);

// 🗑️ Eliminar elemento
await notify(
  () => deleteItem(itemId),
  "Eliminando elemento...",
  "Elemento eliminado exitosamente"
);

// 📤 Subir archivo
await notify(
  () => uploadFile(file),
  "Subiendo archivo...",
  "Archivo subido exitosamente"
);
```

---

## 🎯 **CASOS DE USO AVANZADOS**

### **1. CRUD Completo**

```typescript
const UserManager = () => {
  const { notify } = useNotifications();

  // Crear
  const handleCreate = async (userData: CreateUserForm) => {
    await notify(
      async () => {
        const result = await createUserAction(userData);
        if (!result.success) throw new Error(result.error);

        // Actualizar UI local
        refreshUserList();
        closeModal();

        return result;
      },
      "Creando usuario...",
      `Usuario "${userData.name}" creado exitosamente`
    );
  };

  // Leer/Refrescar
  const handleRefresh = async () => {
    await notify(
      async () => {
        const result = await getUsersAction();
        if (!result.success) throw new Error(result.error);

        setUsers(result.data.users);
        return result;
      },
      "Actualizando lista...",
      "Lista actualizada correctamente"
    );
  };

  // Actualizar
  const handleUpdate = async (userId: string, userData: UpdateUserForm) => {
    await notify(
      async () => {
        const result = await updateUserAction(userId, userData);
        if (!result.success) throw new Error(result.error);

        // Actualizar usuario específico en la lista
        setUsers(prev => prev.map(user =>
          user.id === userId ? { ...user, ...userData } : user
        ));

        return result;
      },
      "Actualizando usuario...",
      "Usuario actualizado correctamente"
    );
  };

  // Eliminar
  const handleDelete = async (userId: string, userName: string) => {
    await notify(
      async () => {
        const result = await deleteUserAction(userId);
        if (!result.success) throw new Error(result.error);

        // Remover de la lista local
        setUsers(prev => prev.filter(user => user.id !== userId));

        return result;
      },
      "Eliminando usuario...",
      `Usuario "${userName}" eliminado exitosamente`
    );
  };

  return (
    // Tu JSX aquí...
  );
};
```

### **2. File Upload con Progreso**

```typescript
const FileUploader = () => {
  const { notify, withNotification } = useNotifications();

  const handleMultipleUpload = async (files: File[]) => {
    await withNotification(
      async () => {
        const formData = new FormData();
        files.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });

        const result = await uploadFilesAction(formData);
        if (!result.success) {
          throw new Error(result.error || "Error al subir archivos");
        }

        // Actualizar lista de archivos
        refreshFileList();

        return result;
      },
      {
        loading: `Subiendo ${files.length} archivo(s)...`,
        success: `🎉 ${files.length} archivo(s) subido(s) exitosamente`,
        error: "❌ Error al subir archivos",
      }
    );
  };

  const handleSingleUpload = async (file: File) => {
    await notify(
      async () => {
        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadFileAction(formData);
        if (!result.success) throw new Error(result.error);

        return result;
      },
      `Subiendo "${file.name}"...`,
      `Archivo "${file.name}" subido exitosamente`
    );
  };

  return (
    // Tu JSX aquí...
  );
};
```

### **3. Operaciones Batch**

```typescript
const BatchOperations = () => {
  const { notify } = useNotifications();

  const handleBulkDelete = async (selectedIds: string[]) => {
    await notify(
      async () => {
        const results = await Promise.allSettled(
          selectedIds.map(id => deleteItemAction(id))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        if (failed > 0) {
          throw new Error(`${failed} elemento(s) no pudieron ser eliminados`);
        }

        // Actualizar UI
        refreshItemList();
        clearSelection();

        return { successful, failed };
      },
      `Eliminando ${selectedIds.length} elemento(s)...`,
      `${selectedIds.length} elemento(s) eliminado(s) exitosamente`
    );
  };

  const handleBulkUpdate = async (selectedIds: string[], updateData: any) => {
    await notify(
      async () => {
        const result = await bulkUpdateAction(selectedIds, updateData);
        if (!result.success) throw new Error(result.error);

        refreshItemList();
        return result;
      },
      `Actualizando ${selectedIds.length} elemento(s)...`,
      "Actualización masiva completada"
    );
  };

  return (
    // Tu JSX aquí...
  );
};
```

### **4. Integración con Server Actions**

```typescript
const ServerActionIntegration = () => {
  const { notify } = useNotifications();

  // Con Server Action que retorna ActionResult
  const handleServerAction = async (formData: FormData) => {
    await notify(
      async () => {
        const result = await myServerAction(formData);

        // Server Actions suelen retornar { success, data?, error? }
        if (!result.success) {
          throw new Error(result.error || "Error en el servidor");
        }

        return result.data;
      },
      "Procesando en servidor...",
      "Operación completada exitosamente"
    );
  };

  // Con revalidación automática
  const handleWithRevalidation = async (data: any) => {
    await notify(
      async () => {
        const result = await updateDataAction(data);
        if (!result.success) throw new Error(result.error);

        // Revalidar datos automáticamente
        revalidatePath("/admin/data");

        return result;
      },
      "Actualizando datos...",
      "Datos actualizados y sincronizados"
    );
  };

  return (
    // Tu JSX aquí...
  );
};
```

---

## ⚙️ **CONFIGURACIÓN Y PERSONALIZACIÓN**

### **1. Configuración del Provider**

```typescript
// src/app/layout.tsx
import { NotificationProvider } from "@/shared/providers/NotificationProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <NotificationProvider
          theme="system" // "light" | "dark" | "system"
          visibleToasts={5} // Máximo de toasts visibles
          config={{
            position: "top-right", // Posición por defecto
            duration: 5000, // Duración por defecto (ms)
            richColors: true, // Colores mejorados
            closeButton: true, // Botón de cerrar
            dismissible: true, // Cerrar con click
          }}
        >
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
```

### **2. Personalización de Mensajes**

```typescript
// En tu componente
const { notify } = useNotifications();

// Mensajes dinámicos
const handleDynamicMessage = async (userName: string) => {
  await notify(
    () => deleteUser(userId),
    `Eliminando usuario ${userName}...`,
    `Usuario ${userName} eliminado exitosamente`
  );
};

// Mensajes con emojis automáticos
await notify(
  () => createPost(postData),
  "Creando publicación...", // Se detecta automáticamente → ✅
  "Publicación creada exitosamente"
);

await notify(
  () => uploadImage(imageFile),
  "Subiendo imagen...", // Se detecta automáticamente → 📤
  "Imagen subida exitosamente"
);
```

### **3. Configuración Avanzada con `withNotification`**

```typescript
const { withNotification } = useNotifications();

await withNotification(
  async () => {
    // Tu lógica compleja aquí
    const result = await complexOperation();
    return result;
  },
  {
    loading: "🔄 Procesando operación compleja...",
    success: "🎉 Operación completada exitosamente",
    error: "❌ Error en la operación compleja",
  }
);
```

---

## 🎯 **MEJORES PRÁCTICAS**

### **1. Manejo de Errores**

```typescript
// ✅ BUENO: Lanzar Error con mensaje descriptivo
await notify(
  async () => {
    const result = await someAction();
    if (!result.success) {
      throw new Error(result.error || "Operación falló");
    }
    return result;
  },
  "Procesando...",
  "Completado exitosamente"
);

// ❌ MALO: No manejar errores
await notify(
  () => someAction(), // Si falla, el error será genérico
  "Procesando...",
  "Completado"
);
```

### **2. Mensajes Descriptivos**

```typescript
// ✅ BUENO: Mensajes específicos y útiles
await notify(
  () => updateUserProfile(userId, profileData),
  "Actualizando perfil de usuario...",
  "Perfil actualizado correctamente"
);

// ❌ MALO: Mensajes genéricos
await notify(
  () => updateUserProfile(userId, profileData),
  "Cargando...",
  "Hecho"
);
```

### **3. Actualización de UI**

```typescript
// ✅ BUENO: Actualizar UI dentro del notify
await notify(
  async () => {
    const result = await createItem(itemData);
    if (!result.success) throw new Error(result.error);

    // Actualizar estado local
    setItems((prev) => [...prev, result.data]);

    return result;
  },
  "Creando elemento...",
  "Elemento creado exitosamente"
);

// ❌ MALO: Actualizar UI fuera del notify (puede causar inconsistencias)
await notify(() => createItem(itemData), "Creando...", "Creado");
setItems((prev) => [...prev, newItem]); // Esto se ejecuta incluso si falla
```

### **4. Performance**

```typescript
// ✅ BUENO: Usar useCallback para funciones que se pasan como props
const handleDelete = useCallback(
  async (id: string) => {
    await notify(
      () => deleteItem(id),
      "Eliminando...",
      "Eliminado exitosamente"
    );
  },
  [notify]
);

// ✅ BUENO: Evitar recrear funciones en cada render
const { notify } = useNotifications();

const actions = useMemo(
  () => ({
    create: (data: any) =>
      notify(() => createAction(data), "Creando...", "Creado"),
    update: (id: string, data: any) =>
      notify(() => updateAction(id, data), "Actualizando...", "Actualizado"),
    delete: (id: string) =>
      notify(() => deleteAction(id), "Eliminando...", "Eliminado"),
  }),
  [notify]
);
```

---

## 🐛 **TROUBLESHOOTING**

### **Problema 1: Notificaciones se superponen**

**Síntoma**: Múltiples toasts aparecen para la misma acción

**Causa**: Usar métodos directos en lugar de `notify()`

```typescript
// ❌ PROBLEMÁTICO
const handleAction = async () => {
  const loadingId = loading("Procesando...");
  try {
    await someAction();
    dismiss(loadingId);
    success("Completado!");
  } catch (error) {
    dismiss(loadingId);
    error("Error!");
  }
};

// ✅ SOLUCIÓN
const handleAction = async () => {
  await notify(() => someAction(), "Procesando...", "Completado!");
};
```

### **Problema 2: Errores no se muestran correctamente**

**Síntoma**: Los errores aparecen como "[object Object]" o mensajes genéricos

**Causa**: No lanzar `Error` correctamente

```typescript
// ❌ PROBLEMÁTICO
await notify(async () => {
  const result = await someAction();
  if (!result.success) {
    throw result; // Objeto crudo
  }
  return result;
}, "Procesando...");

// ✅ SOLUCIÓN
await notify(async () => {
  const result = await someAction();
  if (!result.success) {
    throw new Error(result.error || "Operación falló");
  }
  return result;
}, "Procesando...");
```

### **Problema 3: Hook no funciona**

**Síntoma**: Error "useNotifications must be used within NotificationProvider"

**Causa**: Falta el provider o import incorrecto

```typescript
// ✅ VERIFICAR: Import correcto
import { useNotifications } from "@/shared/hooks/useNotifications";

// ✅ VERIFICAR: Provider en layout
// src/app/layout.tsx
<NotificationProvider>{children}</NotificationProvider>;

// ✅ VERIFICAR: Uso dentro de componente React
const MyComponent = () => {
  const { notify } = useNotifications(); // ✅ Dentro del componente
  // ...
};
```

### **Problema 4: TypeScript errors**

**Síntoma**: Errores de tipos en TypeScript

**Causa**: Tipos incorrectos o faltantes

```typescript
// ✅ SOLUCIÓN: Tipar correctamente las funciones
const handleTypedAction = async (data: MyDataType): Promise<void> => {
  await notify(
    async (): Promise<ActionResult> => {
      const result = await myTypedAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    "Procesando datos tipados...",
    "Datos procesados exitosamente"
  );
};
```

---

## 📚 **API REFERENCE**

### **`useNotifications()` Hook**

```typescript
interface UseNotificationsReturn {
  // 🎯 MÉTODO PRINCIPAL
  notify: <T>(
    action: () => Promise<T>,
    loadingMessage: string,
    successMessage?: string
  ) => Promise<T>;

  // 🔧 MÉTODO AVANZADO
  withNotification: <T>(
    action: () => Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => Promise<T>;

  // 📝 MÉTODOS DIRECTOS
  success: (message: string, config?: NotificationConfig) => string;
  error: (message: string, config?: NotificationConfig) => string;
  warning: (message: string, config?: NotificationConfig) => string;
  info: (message: string, config?: NotificationConfig) => string;
  loading: (message: string, config?: NotificationConfig) => string;

  // 🎛️ CONTROL
  dismiss: (id: string) => void;
  clear: () => void;
}
```

### **Tipos Principales**

```typescript
// Configuración básica
interface NotificationConfig {
  duration?: number;
  position?: NotificationPosition;
  closeButton?: boolean;
  dismissible?: boolean;
  richColors?: boolean;
  id?: string;
  onClick?: () => void;
  onDismiss?: () => void;
  action?: NotificationAction;
}

// Posiciones disponibles
type NotificationPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

// Tipos de notificación
type NotificationType = "success" | "error" | "warning" | "info" | "loading";

// Acción en notificación
interface NotificationAction {
  label: string;
  onClick: () => void | Promise<void>;
  style?: "default" | "destructive";
}
```

---

## 🎯 **RESUMEN EJECUTIVO**

### **Para el 90% de casos de uso:**

```typescript
const { notify } = useNotifications();
await notify(action, "Loading message", "Success message");
```

### **Características del Sistema:**

- ✅ **Un solo hook**: `useNotifications`
- ✅ **Un método principal**: `notify()`
- ✅ **Detección automática**: Tipos, emojis, formateo
- ✅ **Sin overlaps**: API nativa de Sonner
- ✅ **TypeScript completo**: Inferencia de tipos
- ✅ **Performance optimizado**: Callbacks y memoización
- ✅ **Arquitectura limpia**: Sin código duplicado
- ✅ **Fácil mantenimiento**: Una sola fuente de verdad

### **Beneficios:**

1. **Simplicidad**: Una línea para notificaciones completas
2. **Inteligencia**: Detección automática de contexto
3. **Consistencia**: Mismo patrón en toda la aplicación
4. **Robustez**: Manejo inteligente de errores
5. **Performance**: Optimizado para React 19
6. **Mantenibilidad**: Código limpio y bien estructurado

**¡El sistema está listo para usar en producción!** 🚀
