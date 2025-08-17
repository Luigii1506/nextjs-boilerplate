# 🔔 **SISTEMA DE NOTIFICACIONES - GUÍA COMPLETA**

## 📖 **¿Qué es el Sistema de Notificaciones?**

Es un sistema centralizado y robusto para mostrar notificaciones a los usuarios, integrado con **Sonner** (la librería más moderna para React) y completamente integrado con nuestros server actions y sistema de permisos.

### **🎯 Características Principales**

- **🔔 Notificaciones Inteligentes** - Tipos automáticos según contexto
- **🎨 UI Moderna** - Basado en Sonner con animaciones suaves
- **🔄 Integración Server Actions** - Hooks especializados para APIs
- **🛡️ Integración Permisos** - Notificaciones automáticas para acceso denegado
- **📱 Responsive** - Adaptado para móviles y escritorio
- **⚡ Performance** - Debounce automático y cache inteligente
- **🎯 Tipado Completo** - TypeScript en todas las capas

---

## 🚀 **Inicio Rápido**

### **1. Instalación (Ya Incluido)**

```bash
npm install sonner lucide-react
```

### **2. Configurar Provider**

```tsx
// app/layout.tsx
import { NotificationProvider } from "@/shared/providers/NotificationProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <NotificationProvider
          theme="system"
          position="top-right"
          visibleToasts={5}
        >
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
```

### **3. Usar en Componentes**

```tsx
// components/MyComponent.tsx
import { useNotifications } from "@/shared/hooks/useNotifications";

const MyComponent = () => {
  const notifications = useNotifications();

  const handleSave = () => {
    notifications.success("¡Guardado exitosamente!");
  };

  const handleError = () => {
    notifications.error("Error al guardar");
  };

  return (
    <div>
      <button onClick={handleSave}>Guardar</button>
      <button onClick={handleError}>Simular Error</button>
    </div>
  );
};
```

---

## 🎯 **Tipos de Notificaciones**

### **✅ Éxito (Success)**

```tsx
// Básico
notifications.success("Operación exitosa");

// Con configuración
notifications.success("Usuario creado", {
  duration: 5000,
  action: {
    label: "Ver Usuario",
    onClick: () => router.push("/users"),
  },
});

// Método corto
notifications.ok("Todo correcto");
```

### **❌ Error**

```tsx
// Básico
notifications.error("Error al guardar");

// Con acción de ayuda
notifications.error("Error de conexión", {
  action: {
    label: "Reintentar",
    onClick: () => window.location.reload(),
  },
});

// Método corto
notifications.fail("Algo salió mal");
```

### **⚠️ Advertencia (Warning)**

```tsx
// Básico
notifications.warning("Revisa los datos");

// Con información adicional
notifications.warning("Sesión expirando", {
  description: "Tu sesión expira en 5 minutos",
  action: {
    label: "Extender",
    onClick: () => extendSession(),
  },
});

// Método corto
notifications.warn("Cuidado con esto");
```

### **ℹ️ Información**

```tsx
// Básico
notifications.info("Nueva actualización disponible");

// Con descripción
notifications.info("Mantenimiento programado", {
  description: "El sistema estará en mantenimiento de 2-4 AM",
  duration: 8000,
});

// Método corto
notifications.tell("Información importante");
```

### **🔄 Loading**

```tsx
// Básico
const loadingId = notifications.loading("Procesando...");

// Cerrar después
setTimeout(() => {
  notifications.dismiss(loadingId);
  notifications.success("Completado");
}, 3000);

// Método corto
notifications.wait("Un momento...");
```

---

## 🎨 **Configuraciones Avanzadas**

### **🎯 Configuración Personalizada**

```tsx
notifications.show({
  type: "success",
  title: "¡Éxito!",
  message: "Archivo subido correctamente",
  description: "El archivo se procesó en 2.3 segundos",
  duration: 6000,
  action: {
    label: "Ver Archivo",
    onClick: () => openFile(),
  },
  cancel: {
    label: "Deshacer",
    onClick: () => undoUpload(),
  },
});
```

### **🎨 Estilos Personalizados**

```tsx
notifications.success("Operación exitosa", {
  className: "custom-toast",
  classNames: {
    title: "font-bold text-green-600",
    description: "text-sm text-gray-500",
  },
  icon: <CustomIcon />,
});
```

### **📍 Posiciones Disponibles**

```tsx
// En el provider
<NotificationProvider position="bottom-center" />

// Posiciones: top-left, top-center, top-right,
//            bottom-left, bottom-center, bottom-right
```

---

## 🔄 **Integración con Server Actions**

### **🚀 Hook useServerAction**

```tsx
import { useServerAction } from "@/shared/hooks/useServerAction";
import { createUserAction } from "@/app/actions/users";

const CreateUserForm = () => {
  const {
    execute: createUser,
    isPending,
    error,
    data,
  } = useServerAction(createUserAction, {
    loadingMessage: "Creando usuario...",
    successMessage: "Usuario creado exitosamente",
    errorMessage: "Error al crear usuario",
    onSuccess: (user) => {
      router.push(`/users/${user.id}`);
    },
  });

  const handleSubmit = async (formData: FormData) => {
    try {
      await createUser(formData);
    } catch (error) {
      // Error ya mostrado automáticamente
      console.log("Error:", error);
    }
  };

  return (
    <form action={handleSubmit}>
      <input name="name" placeholder="Nombre" />
      <button disabled={isPending}>
        {isPending ? "Creando..." : "Crear Usuario"}
      </button>
    </form>
  );
};
```

### **🎯 Server Action con Promesa**

```tsx
const { execute } = useServerActionWithPromise(
  updateUserAction,
  "actualizar usuario"
);

// Automáticamente muestra: loading -> success/error
await execute(userId, userData);
```

### **🔄 Server Action Optimista**

```tsx
const { execute } = useOptimisticServerAction(deleteUserAction, {
  optimisticUpdate: ([userId]) => {
    // Eliminar inmediatamente de la UI
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  },
  revertOptimistic: () => {
    // Restaurar si falla
    refetchUsers();
  },
  successMessage: "Usuario eliminado",
});
```

---

## 🛡️ **Integración con Permisos**

### **🔍 Hook usePermissionActions**

```tsx
import { usePermissionActions } from "@/shared/hooks/usePermissionActions";

const UserManagement = () => {
  const { userActions } = usePermissionActions();

  const handleDelete = async () => {
    const deleteAction = userActions.delete();

    // Automáticamente verifica permisos y muestra error si no tiene
    await deleteAction.executeWithPermission(async () => {
      await deleteUser(userId);
      // Solo se ejecuta si tiene permisos
    });
  };

  const createButton = userActions.create();

  return (
    <div>
      {/* Solo mostrar si tiene permisos */}
      {createButton.canExecute && (
        <button onClick={handleCreate}>Crear Usuario</button>
      )}

      <button onClick={handleDelete}>Eliminar</button>
    </div>
  );
};
```

### **👑 Verificaciones por Rol**

```tsx
const { roleChecks } = usePermissionActions();

// Solo admins
roleChecks.requireAdmin(() => {
  notifications.info("Panel de admin cargado");
});

// Solo super admins
roleChecks.requireSuperAdmin(() => {
  dangerousOperation();
});

// Por nivel mínimo
roleChecks.requireMinLevel(80, () => {
  advancedFeature();
});
```

---

## ⚡ **Métodos de Conveniencia**

### **🎯 Quick Methods**

```tsx
const { quick } = useNotifications();

// Éxitos comunes
quick.saved(); // "Guardado exitosamente"
quick.created(); // "Creado exitosamente"
quick.updated(); // "Actualizado exitosamente"
quick.deleted(); // "Eliminado exitosamente"
quick.copied(); // "Copiado al portapapeles"

// Errores comunes
quick.saveError(); // "Error al guardar"
quick.loadError(); // "Error al cargar datos"
quick.networkError(); // "Error de conexión" + botón reintentar
quick.validationError(); // "Error de validación"

// Loading
quick.processing(); // "Procesando..."
quick.copying(); // "Copiando..."
quick.pleaseWait(); // "Por favor espera..."

// Advertencias
quick.unauthorized(); // "No tienes permisos"
quick.sessionExpired(); // "Sesión expirada" + botón login
```

### **📁 Métodos Especializados**

```tsx
const { users, files, auth } = useNotifications();

// Usuarios
users.userCreated("Juan Pérez");
users.userCreateError("Email ya existe");
users.userUpdated("María García");
users.userDeleted();

// Archivos
files.fileUploaded("documento.pdf");
files.fileUploadError("Archivo muy grande");
files.fileDeleted("imagen.jpg");

// Autenticación
auth.loginSuccess("Usuario123");
auth.loginError("Credenciales incorrectas");
auth.logoutSuccess();
auth.accessDenied("panel de admin");
```

---

## 🔄 **Métodos con Promesas**

### **🎯 Promise Wrapper**

```tsx
const { withPromise } = useNotifications();

// Wrapper automático para cualquier promesa
const result = await withPromise(fetchUserData(userId), {
  loading: "Cargando usuario...",
  success: (user) => `Usuario ${user.name} cargado`,
  error: (error) => `Error: ${error.message}`,
});
```

### **📊 Progress Wrapper**

```tsx
const { withProgress } = useNotifications();

// Para operaciones complejas
await withProgress(
  async () => {
    const step1 = await uploadFile(file);
    const step2 = await processFile(step1.id);
    return step2;
  },
  {
    starting: "Iniciando procesamiento...",
    success: "Archivo procesado exitosamente",
    error: "Error en el procesamiento",
  }
);
```

---

## 🎨 **Configuración del Provider**

### **⚙️ Opciones del Provider**

```tsx
<NotificationProvider
  // 🎨 Tema
  theme="system" // "light" | "dark" | "system"
  // 📍 Posición
  position="top-right"
  // 📊 Límites
  visibleToasts={5}
  expand={false}
  // ⚙️ Configuración global
  config={{
    duration: 4000,
    closeButton: true,
    dismissible: true,
    richColors: true,
    pauseWhenPageIsHidden: true,
  }}
  // 🎨 Estilos personalizados
  toastOptions={{
    className: "custom-toast-class",
    style: {
      borderRadius: "12px",
      fontFamily: "Inter",
    },
  }}
>
  {children}
</NotificationProvider>
```

### **🎯 Configuración Responsiva**

```tsx
// Las notificaciones automáticamente se adaptan a móvil:
// - Posición: top-center en móvil
// - Duración: 20% menos tiempo
// - Tamaño: Optimizado para pantallas pequeñas
```

---

## 🎯 **Casos de Uso Avanzados**

### **🔄 Operaciones por Lotes**

```tsx
import { useBatchServerActions } from "@/shared/hooks/useServerAction";

const { executeBatch, progress } = useBatchServerActions(
  [deleteUser1Action, deleteUser2Action, deleteUser3Action],
  {
    continueOnError: true,
    progressMessage: (current, total) =>
      `Eliminando usuarios: ${current}/${total}`,
  }
);

// Ejecutar todas las acciones
const results = await executeBatch([[user1.id], [user2.id], [user3.id]]);
```

### **🎨 Notificaciones Personalizadas**

```tsx
// Notificación con múltiples acciones
notifications.show({
  type: "warning",
  title: "Confirmación Requerida",
  message: "¿Estás seguro de eliminar estos 5 usuarios?",
  action: {
    label: "Sí, Eliminar",
    onClick: async () => {
      await deleteSelectedUsers();
      notifications.success("Usuarios eliminados");
    },
  },
  cancel: {
    label: "Cancelar",
    onClick: () => {
      notifications.info("Operación cancelada");
    },
  },
  duration: Infinity, // No se cierra automáticamente
});
```

### **📊 Debug y Analytics**

```tsx
// Solo en desarrollo
if (process.env.NODE_ENV === "development") {
  const { notifications: activeNotifications } = notifications;

  console.log("Notificaciones activas:", activeNotifications.length);

  // Limpiar cache de debounce
  notifications.clearNotificationCache?.();
}
```

---

## 🔧 **Troubleshooting**

### **❌ Problemas Comunes**

**"useNotificationContext must be used within a NotificationProvider"**

```tsx
// ✅ SOLUCIÓN: Asegurar que el provider esté en un nivel superior
<NotificationProvider>
  <MyApp />
</NotificationProvider>
```

**Las notificaciones no se muestran**

```tsx
// ✅ VERIFICAR: Import correcto
import { useNotifications } from "@/shared/hooks/useNotifications";

// ✅ VERIFICAR: Llamada correcta
const notifications = useNotifications();
notifications.success("Test"); // No solo: useNotifications().success()
```

**Notificaciones duplicadas**

```tsx
// ✅ SOLUCIÓN: El debounce automático previene esto
// Si persiste, usar debounce: false
notifications.success("Mensaje", { debounce: false });
```

### **🚀 Mejores Prácticas**

1. **🎯 Usa métodos específicos**: `notifications.users.userCreated()` vs `notifications.success()`
2. **⚡ Combina con server actions**: Siempre usa `useServerAction` para APIs
3. **🛡️ Integra con permisos**: Usa `usePermissionActions` para acciones protegidas
4. **📱 Considera móviles**: Las notificaciones ya son responsivas automáticamente
5. **🔄 Maneja promesas**: Usa `withPromise` y `withProgress` para operaciones async

---

## 📚 **Documentación Relacionada**

- **[🔧 Estructura Detallada](./NOTIFICATIONS_STRUCTURE_DETAILED.md)** - Arquitectura interna
- **[💡 Ejemplos Prácticos](./NOTIFICATIONS_PRACTICAL_EXAMPLES.md)** - Casos de uso reales
- **[⚡ Referencia Rápida](./NOTIFICATIONS_QUICK_REFERENCE.md)** - Cheat sheet
- **[🏠 README Principal](./NOTIFICATIONS_README.md)** - Overview del sistema

**¡Tu aplicación ahora tiene notificaciones de nivel enterprise! 🎉**
