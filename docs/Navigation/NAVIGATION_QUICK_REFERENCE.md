# 🧭 NAVIGATION - QUICK REFERENCE

**Referencia rápida para el sistema de navegación**

---

## 🚀 **USO BÁSICO**

```typescript
import { useNavigation } from "@/core/navigation/useNavigation";

const { navigationItems, isRouteActive } = useNavigation({
  userRole: "admin",
  isAuthenticated: true,
});
```

---

## 📋 **AGREGAR NUEVO ELEMENTO**

### **1. 🎯 En Registry (constants.ts):**

```typescript
{
  id: "mi-elemento",
  href: "/mi-ruta",
  icon: MiIcon,
  label: "Mi Elemento",
  requiresAuth: true,
  requiredRole: "user", // null | "user" | "admin" | "super_admin"
  requiredFeature: "miFeature", // null o nombre del feature flag
  isCore: false, // true = core, false = módulo
  category: "feature", // "core" | "feature" | "admin"
  order: 10,
  badge: "Nuevo", // opcional
}
```

### **2. 🎛️ Feature Flag (si aplica):**

```typescript
// src/core/config/feature-flags.ts
export const FEATURE_FLAGS = {
  miFeature: false, // Desactivado por defecto
} as const;
```

---

## 🎭 **ROLES Y PERMISOS**

```typescript
// Jerarquía: user < admin < super_admin

// Solo usuarios autenticados
requiredRole: null,

// Solo admins y super_admins
requiredRole: "admin",

// Solo super_admins
requiredRole: "super_admin",
```

---

## 🎛️ **FEATURE FLAGS**

```typescript
// Sin feature flag (siempre visible)
requiredFeature: null,

// Con feature flag
requiredFeature: "miFeature",

// El elemento aparece solo si el flag está activo
```

---

## 📊 **CATEGORÍAS**

```typescript
// Core (infraestructura básica)
category: "core",
isCore: true,

// Feature (módulos con feature flags)
category: "feature",
isCore: false,

// Admin (administración del sistema)
category: "admin",
isCore: true,
```

---

## 🔧 **HOOK COMPLETO**

```typescript
const {
  navigationItems, // Elementos filtrados
  isRouteActive, // Función para detectar ruta activa
  currentPath, // Ruta actual
  categories: {
    // Elementos organizados por categoría
    core,
    feature,
    admin,
  },
  stats: {
    // Estadísticas
    total, // Total de elementos en registry
    visible, // Elementos visibles para el usuario
    hidden, // Elementos ocultos
  },
} = useNavigation({
  userRole: "admin",
  isAuthenticated: true,
  debugMode: false, // true para logs detallados
});
```

---

## 📡 **BROADCAST AUTOMÁTICO**

```typescript
// ✅ Funciona automáticamente
// 1. Cambias feature flag → Broadcast a otras pestañas
// 2. Hook se actualiza → Elementos aparecen/desaparecen
// 3. UI se re-renderiza → Sin código adicional

// No necesitas hacer nada especial 🚀
```

---

## 🎨 **EJEMPLOS DE COMPONENTES**

### **Navegación Simple:**

```typescript
export default function SimpleNav({ user }) {
  const { navigationItems, isRouteActive } = useNavigation({
    userRole: user.role,
    isAuthenticated: !!user,
  });

  return (
    <nav>
      {navigationItems.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={isRouteActive(item.href) ? "active" : ""}
        >
          <item.icon />
          {item.label}
          {item.badge && <span className="badge">{item.badge}</span>}
        </Link>
      ))}
    </nav>
  );
}
```

### **Navegación por Categorías:**

```typescript
export default function CategorizedNav({ user }) {
  const { categories } = useNavigation({
    userRole: user.role,
    isAuthenticated: !!user,
  });

  return (
    <nav>
      <NavSection title="Core" items={categories.core} />
      <NavSection title="Features" items={categories.feature} />
      <NavSection title="Admin" items={categories.admin} />
    </nav>
  );
}
```

---

## 🐛 **DEBUG**

```typescript
// Activar logs detallados
const { navigationItems } = useNavigation({
  userRole: "admin",
  isAuthenticated: true,
  debugMode: true, // 🐛 Ver en console
});

// Output:
// 🧭 Navigation Debug: {
//   userRole: "admin",
//   totalItems: 4,
//   visibleItems: 3,
//   categories: { core: 2, feature: 1, admin: 0 }
// }
// ✅ dashboard: Visible
// ✅ users: Visible
// ❌ files: Feature fileUpload disabled
// ✅ feature-flags: Visible
```

---

## ⚡ **PERFORMANCE TIPS**

```typescript
// ✅ Correcto - props estables
const { navigationItems } = useNavigation({
  userRole: user.role,
  isAuthenticated: !!user,
});

// ❌ Incorrecto - recrea objeto
const { navigationItems } = useNavigation({
  userRole: user.role,
  isAuthenticated: !!user,
  debugMode: Math.random() > 0.5, // 🚫 Cambia en cada render
});
```

---

## 🎯 **CHECKLIST PARA NUEVO ELEMENTO**

- [ ] ✅ Agregado a `NAVIGATION_REGISTRY`
- [ ] ✅ Feature flag definido (si aplica)
- [ ] ✅ Rol correcto asignado
- [ ] ✅ Categoría apropiada
- [ ] ✅ Orden lógico
- [ ] ✅ Icono importado
- [ ] ✅ Ruta existe en app
- [ ] ✅ Probado en diferentes roles
- [ ] ✅ Probado con feature flag on/off

---

## 🔗 **LINKS ÚTILES**

- [📖 Guía Completa](./NAVIGATION_SYSTEM_GUIDE.md)
- [🎛️ Feature Flags Guide](../Feature-flags/FEATURE_FLAGS_COMPLETE_GUIDE.md)
- [🎭 Roles & Permissions](../Auth/ROLES_AND_PERMISSIONS.md)
- [📡 Broadcast System](../Broadcasting/BROADCASTING_SYSTEM.md)

---

**¡Happy Navigating!** 🧭✨
