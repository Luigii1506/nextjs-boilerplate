# 🔔 **SISTEMA DE NOTIFICACIONES**

## 📖 **Overview**

Sistema centralizado de notificaciones moderno para la aplicación, construido con **Sonner** e integrado completamente con server actions y permisos.

### **✨ ¿Por qué este sistema?**

- **🚫 Elimina duplicación** - Mensajes centralizados en un solo lugar
- **🎯 Tipado completo** - TypeScript para evitar errores
- **🔄 Integración nativa** - Works out-of-the-box con server actions
- **🛡️ Seguridad integrada** - Notificaciones automáticas para permisos
- **📱 Responsive** - Optimizado para todos los dispositivos
- **⚡ Performance** - Cache inteligente y debounce automático

---

## 🚀 **Inicio Rápido**

### **1. Setup (Ya Configurado)**

```tsx
// app/layout.tsx - Ya incluido
<NotificationProvider>{children}</NotificationProvider>
```

### **2. Uso Básico**

```tsx
import { useNotifications } from "@/shared/hooks/useNotifications";

const MyComponent = () => {
  const notifications = useNotifications();

  // ✅ Éxito
  notifications.success("¡Guardado exitosamente!");

  // ❌ Error
  notifications.error("Error al guardar");

  // ⚠️ Advertencia
  notifications.warning("Revisa los datos");

  // ℹ️ Información
  notifications.info("Nueva actualización disponible");

  // 🔄 Loading
  const loadingId = notifications.loading("Procesando...");
  notifications.dismiss(loadingId); // Cerrar después
};
```

### **3. Métodos de Conveniencia**

```tsx
const { quick } = useNotifications();

quick.saved(); // "Guardado exitosamente"
quick.copied(); // "Copiado al portapapeles"
quick.networkError(); // "Error de conexión" + botón reintentar
quick.unauthorized(); // "No tienes permisos"
```

---

## 🔄 **Con Server Actions**

### **🎯 Hook Especializado**

```tsx
import { useServerAction } from "@/shared/hooks/useServerAction";

const { execute, isPending } = useServerAction(createUserAction, {
  loadingMessage: "Creando usuario...",
  successMessage: "Usuario creado exitosamente",
  errorMessage: "Error al crear usuario",
});

await execute(userData); // Notificaciones automáticas
```

### **📊 Con Promesas**

```tsx
const { withPromise } = useNotifications();

await withPromise(fetchData(), {
  loading: "Cargando...",
  success: "Datos cargados",
  error: "Error al cargar",
});
```

---

## 🛡️ **Con Permisos**

### **🔍 Verificación Automática**

```tsx
import { usePermissionActions } from "@/shared/hooks/usePermissionActions";

const { userActions } = usePermissionActions();

const deleteAction = userActions.delete();

// Verifica permisos automáticamente
await deleteAction.executeWithPermission(() => {
  deleteUser(userId);
  // Solo se ejecuta si tiene permisos
});
```

### **👑 Por Roles**

```tsx
const { roleChecks } = usePermissionActions();

roleChecks.requireAdmin(() => {
  // Solo admins pueden ejecutar esto
  dangerousOperation();
});
```

---

## 📁 **Métodos Especializados**

### **👥 Usuarios**

```tsx
const { users } = useNotifications();

users.userCreated("Juan Pérez");
users.userCreateError("Email ya existe");
users.userUpdated();
users.userDeleted();
```

### **📁 Archivos**

```tsx
const { files } = useNotifications();

files.fileUploaded("documento.pdf");
files.fileUploadError("Archivo muy grande");
files.fileDeleted();
```

### **🔐 Autenticación**

```tsx
const { auth } = useNotifications();

auth.loginSuccess("Usuario123");
auth.accessDenied("panel admin");
auth.sessionExpired();
```

---

## 🎨 **Configuración Avanzada**

### **🎯 Notificación Personalizada**

```tsx
notifications.show({
  type: "success",
  title: "¡Éxito!",
  message: "Operación completada",
  description: "Todos los datos se guardaron correctamente",
  duration: 6000,
  action: {
    label: "Ver Detalles",
    onClick: () => router.push("/details"),
  },
  cancel: {
    label: "Deshacer",
    onClick: () => undoOperation(),
  },
});
```

### **📱 Responsive**

```tsx
// Las notificaciones se adaptan automáticamente:
// 📱 Móvil: position="top-center", duración reducida
// 💻 Desktop: position="top-right", duración normal
```

---

## 📊 **Estructura del Sistema**

```
src/shared/
├── 🔔 providers/
│   └── NotificationProvider.tsx     # Provider principal con Sonner
├── 🪝 hooks/
│   ├── useNotifications.ts          # Hook principal
│   ├── useServerAction.ts           # Integración server actions
│   └── usePermissionActions.ts      # Integración permisos
├── 🎯 types/
│   └── notifications.ts             # Tipos TypeScript
├── 📝 constants/
│   └── notifications.ts             # Mensajes centralizados
└── 🛠️ utils/
    └── notifications.ts             # Utilidades y formatters
```

---

## 🎯 **Características Técnicas**

| Característica        | Descripción                        | Beneficio                    |
| --------------------- | ---------------------------------- | ---------------------------- |
| **🔔 Sonner**         | Librería moderna de notificaciones | Animaciones suaves, mejor UX |
| **⚡ Debounce**       | Previene notificaciones duplicadas | Evita spam de mensajes       |
| **📊 Cache**          | Sistema de cache inteligente       | Mejor performance            |
| **🎨 Responsive**     | Adaptación automática a móviles    | UX consistente               |
| **🛡️ Permisos**       | Integración nativa con RBAC        | Seguridad automática         |
| **🔄 Server Actions** | Hooks especializados para APIs     | Menos código boilerplate     |
| **📱 Accesibilidad**  | Cumple estándares WCAG             | Inclusivo para todos         |

---

## 📚 **Documentación Completa**

### **📖 Para Empezar**

- **[📋 Guía Completa](./NOTIFICATIONS_SYSTEM_COMPLETE_GUIDE.md)** - Tutorial paso a paso
- **[🏗️ Estructura Detallada](./NOTIFICATIONS_STRUCTURE_DETAILED.md)** - Arquitectura interna

### **💡 Para Implementar**

- **[🧪 Ejemplos Prácticos](./NOTIFICATIONS_PRACTICAL_EXAMPLES.md)** - Casos de uso reales
- **[⚡ Referencia Rápida](./NOTIFICATIONS_QUICK_REFERENCE.md)** - Cheat sheet de APIs

---

## 🔄 **Rutas de Aprendizaje**

### **🚀 Para Nuevos Desarrolladores**

1. Lee la **[Guía Completa](./NOTIFICATIONS_SYSTEM_COMPLETE_GUIDE.md)** (30 min)
2. Practica con **[Ejemplos](./NOTIFICATIONS_PRACTICAL_EXAMPLES.md)** (45 min)
3. Usa la **[Referencia](./NOTIFICATIONS_QUICK_REFERENCE.md)** para desarrollo diario

### **🔧 Para Desarrolladores Experimentados**

1. Revisa la **[Estructura](./NOTIFICATIONS_STRUCTURE_DETAILED.md)** (15 min)
2. Implementa casos específicos de **[Ejemplos](./NOTIFICATIONS_PRACTICAL_EXAMPLES.md)** (30 min)
3. Consulta la **[Referencia](./NOTIFICATIONS_QUICK_REFERENCE.md)** según necesites

---

## 🎯 **Casos de Uso Principales**

### **✅ Operaciones CRUD**

```tsx
// Crear
await notifications.withPromise(createUser(data), {
  loading: "Creando usuario...",
  success: "Usuario creado exitosamente",
  error: "Error al crear usuario",
});

// Actualizar
notifications.users.userUpdated(user.name);

// Eliminar
notifications.users.userDeleted();
```

### **🔐 Manejo de Errores**

```tsx
try {
  await riskyOperation();
} catch (error) {
  if (error.code === "PERMISSION_DENIED") {
    notifications.permissions.accessDenied();
  } else if (error.code === "NETWORK_ERROR") {
    notifications.quick.networkError();
  } else {
    notifications.error(error.message);
  }
}
```

### **🛡️ Verificación de Permisos**

```tsx
const { userActions } = usePermissionActions();

// Automáticamente verifica y notifica
const createAction = userActions.create();
if (createAction.canExecute) {
  // Mostrar botón crear
} else {
  // Usuario no tiene permisos, ya se mostró notificación
}
```

---

## 🚀 **Beneficios del Sistema**

### **👨‍💻 Para Desarrolladores**

- **📝 Menos código** - Un hook hace todo
- **🎯 Tipado completo** - IntelliSense perfecto
- **🔄 Integración automática** - Works con server actions y permisos
- **📚 Documentación completa** - Ejemplos para todo

### **👥 Para Usuarios**

- **🎨 UX moderna** - Animaciones suaves y responsive
- **📱 Móvil-friendly** - Optimizado para todos los dispositivos
- **⚡ Performance** - Sin lag ni stuttering
- **🎯 Claridad** - Mensajes consistentes y útiles

### **🏢 Para el Negocio**

- **🔧 Mantenible** - Código centralizado y organizado
- **🛡️ Seguro** - Integración nativa con permisos
- **📊 Escalable** - Fácil añadir nuevos tipos de notificación
- **💰 Costo-efectivo** - Menos bugs, desarrollo más rápido

---

## ⚡ **Quick Start Examples**

```tsx
// ✅ Básico
notifications.success("¡Éxito!");

// 🔄 Con server action
const { execute } = useServerAction(saveData, {
  successMessage: "Datos guardados",
});

// 🛡️ Con permisos
const { userActions } = usePermissionActions();
userActions.delete().executeWithPermission(() => deleteUser());

// 🎯 Personalizado
notifications.show({
  type: "warning",
  message: "¿Estás seguro?",
  action: { label: "Sí", onClick: confirm },
  cancel: { label: "No", onClick: cancel },
});
```

---

**¡Tu aplicación ahora tiene notificaciones de nivel profesional! 🚀**

### **📞 ¿Necesitas Ayuda?**

- 📖 **Documentación**: Revisa los enlaces arriba
- 🔍 **Ejemplos**: Mira `NOTIFICATIONS_PRACTICAL_EXAMPLES.md`
- ⚡ **Quick Ref**: Usa `NOTIFICATIONS_QUICK_REFERENCE.md`
