# 🧭 NAVIGATION SYSTEM - COMPLETE GUIDE

**Sistema de navegación simplificado con funcionalidad completa**

---

## 📋 **TABLA DE CONTENIDOS**

1. [🎯 Visión General](#-visión-general)
2. [🚀 Inicio Rápido](#-inicio-rápido)
3. [🎛️ Feature Flags en Navegación](#️-feature-flags-en-navegación)
4. [🎭 Roles y Permisos](#-roles-y-permisos)
5. [📡 Sistema de Broadcast](#-sistema-de-broadcast)
6. [🔧 Configuración Avanzada](#-configuración-avanzada)
7. [📊 Ejemplos Prácticos](#-ejemplos-prácticos)
8. [🐛 Troubleshooting](#-troubleshooting)

---

## 🎯 **VISIÓN GENERAL**

El sistema de navegación es **reactivo, simple y potente**:

- ✅ **Feature flags reactivos** con broadcast automático
- ✅ **Filtrado por roles** y permisos
- ✅ **Performance optimizado** con memoización
- ✅ **TypeScript strict** con tipos completos
- ✅ **React 19 compliant** con hooks modernos

### **🏗️ Arquitectura Simplificada:**

```
🧭 useNavigation()
    ↓
📋 NAVIGATION_REGISTRY (constants.ts)
    ↓
🎛️ Feature Flags (useIsEnabled)
    ↓
📡 Broadcast System (automático)
    ↓
🎨 UI Components (DynamicNavigation)
```

---

## 🚀 **INICIO RÁPIDO**

### **1. 📦 Importar el Hook:**

```typescript
import { useNavigation } from "@/core/navigation/useNavigation";
```

### **2. 🎯 Usar en Componente:**

```typescript
export default function MyNavigation({ isAdmin }) {
  const { navigationItems, isRouteActive } = useNavigation({
    userRole: isAdmin ? "admin" : "user",
    isAuthenticated: true,
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
        </Link>
      ))}
    </nav>
  );
}
```

### **3. ✅ ¡Listo!**

El sistema se actualiza **automáticamente** cuando:

- Cambian los feature flags (broadcast)
- Cambia el rol del usuario
- Cambia la autenticación

---

## 🎛️ **FEATURE FLAGS EN NAVEGACIÓN**

### **📋 Cómo Agregar Elemento con Feature Flag:**

```typescript
// src/core/navigation/constants.ts
export const NAVIGATION_REGISTRY: NavigationItem[] = [
  // ... elementos existentes

  {
    id: "mi-nueva-feature",
    href: "/mi-feature",
    icon: Star,
    label: "🌟 Mi Nueva Feature",
    description: "Descripción de la feature",
    requiresAuth: true,
    requiredRole: null, // Cualquier usuario autenticado
    requiredFeature: "miNuevaFeature", // 🎯 FEATURE FLAG
    isCore: false, // Es un módulo
    category: "feature",
    order: 15,
    badge: "Nuevo",
  },
];
```

### **🎛️ Definir Feature Flag:**

```typescript
// src/core/config/feature-flags.ts
export const FEATURE_FLAGS = {
  // ... flags existentes
  miNuevaFeature: false, // 🎯 Desactivado por defecto
} as const;
```

### **📡 Flujo Automático:**

1. **Toggle flag** en `/feature-flags` → `miNuevaFeature: true`
2. **Broadcast automático** → Todas las pestañas reciben cambio
3. **Hook se actualiza** → `useNavigation` re-evalúa elementos
4. **UI se actualiza** → Elemento aparece en navegación

**¡Sin código adicional necesario!** 🚀

---

## 🎭 **ROLES Y PERMISOS**

### **📋 Jerarquía de Roles:**

```typescript
user (nivel 1)
  ↓
admin (nivel 2)
  ↓
super_admin (nivel 3)
```

### **🎯 Agregar Elemento Solo para Admins:**

```typescript
{
  id: "admin-panel",
  href: "/admin",
  icon: Shield,
  label: "🛡️ Panel Admin",
  requiresAuth: true,
  requiredRole: "admin", // 🎭 Solo admin y super_admin
  requiredFeature: null,
  isCore: true,
  category: "admin",
  order: 90,
},
```

### **🔧 Combinando Roles + Feature Flags:**

```typescript
{
  id: "advanced-analytics",
  href: "/analytics",
  icon: BarChart,
  label: "📊 Analytics Avanzado",
  requiresAuth: true,
  requiredRole: "admin", // 🎭 Solo admins
  requiredFeature: "advancedAnalytics", // 🎛️ Y feature flag activo
  isCore: false,
  category: "feature",
  order: 20,
},
```

**El elemento solo aparece si:**

- Usuario es `admin` o `super_admin` **Y**
- Feature flag `advancedAnalytics` está activo

---

## 📡 **SISTEMA DE BROADCAST**

### **🔄 Cómo Funciona:**

```typescript
// 1. Usuario cambia feature flag en pestaña A
toggleFlag("miFeature"); // → enabled: true

// 2. Broadcast automático a todas las pestañas
notifyFlagChange("miFeature"); // → BroadcastChannel

// 3. Otras pestañas reciben el cambio
onFlagChange(() => loadFlags()); // → Recarga flags

// 4. Hook se actualiza automáticamente
useNavigation(); // → Re-evalúa con nuevos flags

// 5. UI se actualiza
navigationItems; // → Incluye/excluye elementos
```

### **🎯 Sin Configuración Adicional:**

El broadcast funciona **automáticamente** porque:

- `useNavigation` usa `useIsEnabled()`
- `useIsEnabled` está conectado al broadcast
- Cuando cambian flags → Hook se re-ejecuta
- UI se actualiza automáticamente

---

## 🔧 **CONFIGURACIÓN AVANZADA**

### **🐛 Debug Mode:**

```typescript
const { navigationItems, stats } = useNavigation({
  userRole: "admin",
  isAuthenticated: true,
  debugMode: true, // 🐛 Logs detallados
});

// Console output:
// 🧭 Navigation Debug: {
//   userRole: "admin",
//   totalItems: 4,
//   visibleItems: 3,
//   categories: { core: 2, feature: 1, admin: 0 }
// }
```

### **📊 Estadísticas:**

```typescript
const { stats, categories } = useNavigation({...});

console.log("Total items:", stats.total);
console.log("Visible items:", stats.visible);
console.log("Hidden items:", stats.hidden);
console.log("Core items:", categories.core.length);
console.log("Feature items:", categories.feature.length);
console.log("Admin items:", categories.admin.length);
```

### **🔧 Utilidades:**

```typescript
import { navigationUtils } from "@/core/navigation/useNavigation";

// Obtener estadísticas globales
const globalStats = navigationUtils.getNavigationStats();

// Verificar si ruta está activa
const isActive = navigationUtils.isRouteActive("/users", "/users/123");
// → true (porque /users/123 empieza con /users/)
```

---

## 📊 **EJEMPLOS PRÁCTICOS**

### **🎯 Ejemplo 1: Navegación Básica**

```typescript
// components/Sidebar.tsx
import { useNavigation } from "@/core/navigation/useNavigation";

export default function Sidebar({ user }) {
  const { navigationItems, isRouteActive } = useNavigation({
    userRole: user.role,
    isAuthenticated: !!user,
  });

  return (
    <nav className="sidebar">
      {navigationItems.map((item) => (
        <SidebarItem
          key={item.id}
          item={item}
          isActive={isRouteActive(item.href)}
        />
      ))}
    </nav>
  );
}
```

### **🎯 Ejemplo 2: Navegación con Categorías**

```typescript
export default function CategorizedNavigation({ user }) {
  const { categories } = useNavigation({
    userRole: user.role,
    isAuthenticated: !!user,
  });

  return (
    <nav>
      {/* Core items */}
      <section>
        <h3>Core</h3>
        {categories.core.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </section>

      {/* Feature items */}
      {categories.feature.length > 0 && (
        <section>
          <h3>Features</h3>
          {categories.feature.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </section>
      )}

      {/* Admin items */}
      {categories.admin.length > 0 && (
        <section>
          <h3>Admin</h3>
          {categories.admin.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </section>
      )}
    </nav>
  );
}
```

### **🎯 Ejemplo 3: Navegación Móvil**

```typescript
export default function MobileNavigation({ user, isOpen, onClose }) {
  const { navigationItems, stats } = useNavigation({
    userRole: user.role,
    isAuthenticated: !!user,
  });

  return (
    <div className={`mobile-nav ${isOpen ? "open" : ""}`}>
      <div className="nav-header">
        <span>Navegación ({stats.visible} items)</span>
        <button onClick={onClose}>×</button>
      </div>

      <div className="nav-items">
        {navigationItems.map((item) => (
          <MobileNavItem
            key={item.id}
            item={item}
            onClick={onClose} // Cerrar al navegar
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 🐛 **TROUBLESHOOTING**

### **❌ Problema: Elemento no aparece**

```typescript
// 1. Verificar feature flag
const isEnabled = useIsEnabled();
console.log("Feature activa:", isEnabled("miFeature"));

// 2. Verificar rol
console.log("Rol usuario:", user.role);

// 3. Activar debug mode
const { navigationItems } = useNavigation({
  userRole: user.role,
  isAuthenticated: true,
  debugMode: true, // 🐛 Ver logs detallados
});
```

### **❌ Problema: Broadcast no funciona**

```typescript
// Verificar que el hook esté dentro del Provider
function MyComponent() {
  // ✅ Correcto - dentro del Provider
  const { navigationItems } = useNavigation({...});
}

// ❌ Incorrecto - fuera del Provider
function MyComponent() {
  // Error: useFeatureFlagsServer must be used within Provider
}
```

### **❌ Problema: Performance**

```typescript
// ✅ Correcto - memoización automática
const { navigationItems } = useNavigation({
  userRole: user.role,
  isAuthenticated: !!user,
});

// ❌ Incorrecto - recrear objeto en cada render
const { navigationItems } = useNavigation({
  userRole: user.role,
  isAuthenticated: !!user,
  config: { debugMode: true }, // 🚫 Se recrea en cada render
});

// ✅ Correcto - memoizar configuración
const config = useMemo(() => ({ debugMode: true }), []);
const { navigationItems } = useNavigation({
  userRole: user.role,
  isAuthenticated: !!user,
  ...config,
});
```

---

## 🎯 **QUICK REFERENCE**

### **📋 Agregar Nuevo Elemento:**

1. **Definir en registry:**

   ```typescript
   // constants.ts
   {
     id: "mi-elemento",
     href: "/mi-ruta",
     icon: MiIcon,
     label: "Mi Elemento",
     requiresAuth: true,
     requiredRole: "user", // o null
     requiredFeature: "miFeature", // o null
     category: "feature",
     order: 10,
   }
   ```

2. **Definir feature flag (si aplica):**

   ```typescript
   // feature-flags.ts
   miFeature: false,
   ```

3. **¡Listo!** El elemento aparece automáticamente cuando:
   - Usuario tiene el rol requerido
   - Feature flag está activo (si aplica)

### **🎛️ Comandos Útiles:**

```bash
# Ver todos los feature flags
npm run flags:list

# Crear nuevo feature flag
npm run create-flag

# Build y verificar
npm run build
```

---

## 🚀 **CONCLUSIÓN**

El sistema de navegación es **simple pero potente**:

- **Una sola función:** `useNavigation()`
- **Reactivo automático:** Broadcast integrado
- **Type-safe:** TypeScript completo
- **Performance:** Memoización optimizada
- **Extensible:** Fácil agregar elementos

**¡Disfruta navegando!** 🧭✨
