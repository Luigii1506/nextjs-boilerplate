---
title: Introducción
slug: /notificacions/introduccion
---

# 🔔 SISTEMA DE NOTIFICACIONES

> **Sistema inteligente de notificaciones con `useActionNotifications`, `Sonner` y detección automática**

---

## 🚀 **INICIO RÁPIDO**

### **1. Setup (Ya está configurado)**

El sistema ya está configurado en `src/app/layout.tsx`:

```typescript
<NotificationProvider
  theme="system"
  visibleToasts={5}
  config={{
    position: "top-right",
    richColors: true,
    closeButton: true,
    dismissible: true,
  }}
>
  {children}
</NotificationProvider>
```

### **2. Uso Básico**

```typescript
import { useActionNotifications } from "@/shared/hooks/useActionNotifications";

const MyComponent = () => {
  const { notify } = useActionNotifications();

  const handleAction = async () => {
    await notify(
      async () => {
        // Tu lógica aquí
        const result = await someAction();
        if (!result.success) {
          throw new Error(result.error);
        }
        return result;
      },
      "Ejecutando acción...", // Mensaje loading
      "Acción completada exitosamente" // Mensaje success (opcional)
    );
  };

  return <button onClick={handleAction}>Ejecutar</button>;
};
```

### **3. Ejemplos Comunes**

```typescript
// ✅ Crear usuario
await notify(
  () => createUserAction(userData),
  "Creando usuario...",
  "Usuario creado exitosamente"
);

// 📝 Actualizar datos
await notify(
  () => updateAction(id, data),
  "Actualizando información...",
  "Información actualizada correctamente"
);

// 🗑️ Eliminar elemento
await notify(
  () => deleteAction(id),
  "Eliminando elemento...",
  "Elemento eliminado exitosamente"
);

// 📤 Subir archivo
await notify(
  () => uploadAction(files),
  "Subiendo archivos...",
  `${files.length} archivo(s) subido(s) exitosamente`
);
```

---

## ✨ **CARACTERÍSTICAS PRINCIPALES**

### **🧠 Inteligencia Automática**

El sistema detecta automáticamente:

- **🎯 Tipo de acción**: "Creando..." → ✅, "Eliminando..." → 🗑️, "Subiendo..." → 📤
- **🎨 Emojis**: Se asignan automáticamente según el contexto
- **⚡ Severidad de errores**: Ajusta duración y opciones según el tipo de error
- **🔄 Formateo**: Los errores se formatean inteligentemente

### **🎭 Sin Overlaps**

Usa la API nativa `toast.promise` de Sonner:

- **Una sola notificación** que se transforma de loading → success/error
- **Sin race conditions** ni superposición de toasts
- **Transiciones suaves** entre estados

### **📝 Configuración Mínima**

```typescript
// Esto es todo lo que necesitas:
const { notify } = useActionNotifications();
await notify(action, "Loading...", "Success!");
```

---

## 🎛️ **API PRINCIPAL**

### **`notify(action, loading, success?)`**

**Parámetros**:

- `action: () => Promise<T>` - Tu función asíncrona
- `loading: string` - Mensaje durante la carga
- `success?: string` - Mensaje de éxito (opcional, se genera automáticamente si no se proporciona)

**Retorna**: `Promise<T>` - El resultado de tu acción

### **`withNotification(action, messages)` - Método Avanzado**

```typescript
await withNotification(
  async () => {
    // Lógica compleja aquí
  },
  {
    loading: "Procesando datos complejos...",
    success: "🎉 Proceso completado exitosamente",
    error: "⚠️ Error en el procesamiento",
  }
);
```

### **Métodos Base Disponibles**

```typescript
const {
  notify, // Método principal
  withNotification, // Método avanzado
  success, // Notificación de éxito directa
  error, // Notificación de error directa
  warning, // Notificación de advertencia
  info, // Notificación informativa
  loading, // Notificación de carga
  dismiss, // Cerrar notificación específica
  clear, // Cerrar todas las notificaciones
} = useActionNotifications();
```

---

## 💡 **PATRONES COMUNES**

### **CRUD Operations**

```typescript
const { notify } = useActionNotifications();

// Crear
const handleCreate = async (data) => {
  await notify(
    async () => {
      const result = await createAction(data);
      if (!result.success) throw new Error(result.error);
      refreshData();
    },
    "Creando elemento...",
    "Elemento creado exitosamente"
  );
};

// Actualizar
const handleUpdate = async (id, data) => {
  await notify(
    () => updateAction(id, data),
    "Actualizando elemento...",
    "Elemento actualizado correctamente"
  );
};

// Eliminar
const handleDelete = async (id) => {
  await notify(
    () => deleteAction(id),
    "Eliminando elemento...",
    "Elemento eliminado exitosamente"
  );
};
```

### **File Operations**

```typescript
// Upload múltiple
const handleUpload = async (files) => {
  await notify(
    async () => {
      const formData = new FormData();
      files.forEach((file, i) => formData.append(`files[${i}]`, file));

      const result = await uploadAction(formData);
      if (!result.success) throw new Error(result.error);

      refreshFileList();
    },
    "Subiendo archivos...",
    `${files.length} archivo(s) subido(s) exitosamente`
  );
};

// Download
const handleDownload = async (fileId, fileName) => {
  await notify(
    () => downloadAction(fileId),
    `Descargando ${fileName}...`,
    "Descarga completada"
  );
};
```

### **Batch Operations**

```typescript
const handleBatchOperation = async (selectedIds) => {
  await notify(
    async () => {
      const results = await Promise.all(
        selectedIds.map((id) => processAction(id))
      );

      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        throw new Error(`${failed.length} elementos fallaron al procesar`);
      }

      refreshData();
    },
    `Procesando ${selectedIds.length} elementos...`,
    "Procesamiento masivo completado"
  );
};
```

---

## ⚙️ **PERSONALIZACIÓN**

### **Mensajes Personalizados**

Los mensajes están centralizados en `src/shared/constants/notifications.ts`:

```typescript
export const NOTIFICATION_MESSAGES = {
  USERS: {
    CREATE_SUCCESS: "✅ Usuario creado exitosamente",
    UPDATE_SUCCESS: "📝 Usuario actualizado correctamente",
    DELETE_SUCCESS: "🗑️ Usuario eliminado exitosamente",
    // ... más mensajes
  },
  // Agregar tus propias categorías
  MY_MODULE: {
    CUSTOM_SUCCESS: "🎉 Operación personalizada exitosa",
    CUSTOM_ERROR: "❌ Error en operación personalizada",
  },
};
```

### **Configuración del Provider**

```typescript
<NotificationProvider
  theme="dark"              // "light" | "dark" | "system"
  visibleToasts={3}         // Máximo de toasts visibles
  config={{
    position: "bottom-right", // Cambiar posición
    duration: 5000,          // Duración por defecto
    richColors: true,        // Colores mejorados
  }}
>
```

---

## 🐛 **TROUBLESHOOTING**

### **Problema: Notificaciones se superponen**

**Solución**: Usar siempre `notify()` en lugar de métodos manuales

```typescript
// ❌ MALO: Crea overlaps
const loadingId = loading("Processing...");
dismiss(loadingId);
success("Done!");

// ✅ BUENO: Una sola notificación
await notify(action, "Processing...", "Done!");
```

### **Problema: Errores no se formatean bien**

**Solución**: Lanzar `Error` con mensaje descriptivo

```typescript
// ❌ MALO
throw result; // Objeto crudo

// ✅ BUENO
throw new Error(result.error || "Operación falló");
```

### **Problema: Hook no funciona**

**Solución**: Verificar que `NotificationProvider` esté en el layout y el import sea correcto

```typescript
// Verificar import
import { useActionNotifications } from "@/shared/hooks/useActionNotifications";

// Verificar uso dentro de componente React
const MyComponent = () => {
  const { notify } = useActionNotifications(); // ✅
  // ...
};
```

---

## 📚 **DOCUMENTACIÓN COMPLETA**

- **[📖 Guía Completa](./NOTIFICATIONS_COMPLETE_GUIDE.md)** - Documentación exhaustiva con ejemplos avanzados
- **[🎯 Tipos TypeScript](../src/shared/types/notifications.ts)** - Definiciones de tipos
- **[🎨 Constantes](../src/shared/constants/notifications.ts)** - Mensajes predefinidos
- **[🧩 Provider](../src/shared/providers/NotificationProvider.tsx)** - Configuración del proveedor

---

## 🎯 **RESUMEN**

**Para el 90% de casos de uso**:

```typescript
const { notify } = useActionNotifications();
await notify(action, "Loading message", "Success message");
```

**Características**:

- ✅ **Una sola línea** para notificaciones completas
- ✅ **Detección automática** de tipos y emojis
- ✅ **Sin overlaps** usando API nativa de Sonner
- ✅ **Formateo inteligente** de errores
- ✅ **TypeScript completo**
- ✅ **Performance optimizado**

**¡Eso es todo lo que necesitas saber para empezar!** 🚀
