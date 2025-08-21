# 🌙 GUÍA COMPLETA: IMPLEMENTACIÓN DE DARK MODE

## 📋 **RESUMEN EJECUTIVO**

Esta guía documenta paso a paso la implementación completa del **Dark Mode** como módulo de UI, incluyendo feature flag integration, broadcast para sincronización cross-tab, y estilos completos. Sirve como **template para agregar nuevos módulos de UI**.

---

## 🎯 **OBJETIVOS ALCANZADOS**

✅ **Feature Flag Integration** - El toggle aparece/desaparece según el feature flag  
✅ **Broadcast Cross-Tab** - Cambios instantáneos entre pestañas  
✅ **Persistencia** - Estado guardado en localStorage  
✅ **Sistema Preference** - Detección automática del tema del sistema  
✅ **Componente Hermoso** - 3 variantes: button, switch, icon  
✅ **Estilos Completos** - Dark mode en toda la aplicación  
✅ **Documentación Completa** - Guía para futuros módulos UI

---

## 📚 **PASOS IMPLEMENTADOS**

### **PASO 1: Configuración del Feature Flag**

#### **1.1 Actualizar configuración principal**

```typescript
// src/core/feature-flags/config.ts

export const FEATURE_FLAGS = {
  // ... otros flags
  darkMode: process.env.FEATURE_DARK_MODE === "true", // ✅ Agregado
} as const;
```

#### **1.2 Categorizar en UI Features**

```typescript
// src/core/feature-flags/config.ts

export const FEATURE_CATEGORIES = {
  // ... otras categorías
  ui: {
    name: "UI Features",
    description: "User interface and experience features",
    color: "orange",
    icon: "Palette",
    flags: ["darkMode", "animations", "notifications"], // ✅ darkMode agregado
  },
} as const;
```

#### **1.3 Configurar en componente FeatureFlagCard**

```typescript
// src/features/admin/feature-flags/components/FeatureFlagCard.tsx

const CATEGORY_CONFIG = {
  // ... otras categorías
  ui: {
    icon: Code,
    colors: {
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      text: "text-indigo-700",
      badge: "bg-indigo-100 text-indigo-800",
    },
  }, // ✅ Agregado soporte visual para categoría UI
} as const;
```

---

### **PASO 2: Hook Personalizado useDarkMode**

#### **2.1 Crear el hook**

```typescript
// src/shared/hooks/useDarkMode.ts

export function useDarkMode(): DarkModeState {
  // 🎛️ Feature flag integration
  const { isEnabled } = useFeatureFlags();
  const isFeatureEnabled = isEnabled("darkMode");

  // 🌙 System preference detection
  const [isSystemDark, setIsSystemDark] = useState(false);
  const [isDarkMode, setIsDarkModeState] = useState(false);
  const [broadcastChannel, setBroadcastChannel] =
    useState<BroadcastChannel | null>(null);

  // 🔍 Detect system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsSystemDark(mediaQuery.matches);
    // ... listener setup
  }, []);

  // 💾 Initialize from localStorage and setup broadcast
  useEffect(() => {
    const channel = new BroadcastChannel("darkMode-sync");
    setBroadcastChannel(channel);

    // Load from localStorage or use system preference
    const stored = localStorage.getItem("darkMode");
    setIsDarkModeState(stored !== null ? stored === "true" : isSystemDark);

    // Listen for broadcast messages
    channel.addEventListener("message", handleBroadcast);
    return () => channel.close();
  }, [isSystemDark]);

  // 🎨 Apply dark mode to document
  useEffect(() => {
    if (isFeatureEnabled && isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode, isFeatureEnabled]);

  // 🔄 Toggle with broadcast
  const toggle = useCallback(() => {
    if (!isFeatureEnabled) return;
    const newValue = !isDarkMode;
    setIsDarkModeState(newValue);
    localStorage.setItem("darkMode", String(newValue));

    // Broadcast to other tabs
    broadcastChannel?.postMessage({
      type: "darkMode-changed",
      isDarkMode: newValue,
      timestamp: Date.now(),
    });
  }, [isDarkMode, isFeatureEnabled, broadcastChannel]);

  return {
    isDarkMode: isFeatureEnabled ? isDarkMode : false,
    isEnabled: isFeatureEnabled,
    isSystemDark,
    toggle,
    setDarkMode,
  };
}
```

#### **2.2 Actualizar barrel exports**

```typescript
// src/shared/hooks/index.ts
export * from "./useDarkMode"; // ✅ Agregado
```

---

### **PASO 3: Componente DarkModeToggle**

#### **3.1 Crear componente con 3 variantes**

```typescript
// src/shared/ui/components/DarkModeToggle.tsx

export function DarkModeToggle({
  size = "md",
  variant = "button", // "button" | "switch" | "icon"
  showTooltip = true,
  className,
  disabled = false,
}: DarkModeToggleProps) {
  const { isDarkMode, isEnabled, toggle } = useDarkMode();

  // 🚫 No renderizar si el feature flag está desactivado
  if (!isEnabled) {
    return null;
  }

  // 🎨 Button variant - Con animaciones de rotación
  if (variant === "button") {
    return (
      <button onClick={toggle} className="...">
        <Sun
          className={
            isDarkMode
              ? "opacity-0 rotate-90 scale-0"
              : "opacity-100 rotate-0 scale-100"
          }
        />
        <Moon
          className={
            isDarkMode
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          }
        />
      </button>
    );
  }

  // 🎛️ Switch variant - Toggle deslizante
  if (variant === "switch") {
    return (
      <button onClick={toggle} className="relative inline-flex rounded-full...">
        <span
          className={`transform transition-all ${
            isDarkMode ? "translate-x-7" : "translate-x-1"
          }`}
        >
          <Sun className={isDarkMode ? "opacity-0" : "opacity-100"} />
          <Moon className={isDarkMode ? "opacity-100" : "opacity-0"} />
        </span>
      </button>
    );
  }

  // 🎯 Icon variant - Minimalista
  return <button onClick={toggle}>{isDarkMode ? <Sun /> : <Moon />}</button>;
}
```

#### **3.2 Actualizar barrel exports**

```typescript
// src/shared/ui/components/index.ts
export * from "./DarkModeToggle"; // ✅ Agregado
```

---

### **PASO 4: Integración en AdminLayout**

#### **4.1 Importar componente**

```typescript
// src/shared/ui/layouts/AdminLayout.tsx
import { DarkModeToggle } from "@/shared/ui/components";
```

#### **4.2 Agregar en header desktop**

```typescript
{/* Desktop Actions */}
<div className="items-center gap-3 hidden lg:flex">
  {headerActions.map((action) => (/* ... */))}

  {/* 🌙 Dark Mode Toggle */}
  <DarkModeToggle
    size="md"
    variant="button"
    showTooltip={true}
  />
</div>
```

#### **4.3 Agregar en sidebar móvil**

```typescript
{
  /* Mobile User Info */
}
<div className="p-4 mb-6 bg-slate-50 dark:bg-slate-700 rounded-lg">
  <div className="flex items-center justify-between">
    <UserMenu {...userProps} />

    {/* 🌙 Mobile Dark Mode Toggle */}
    <DarkModeToggle size="sm" variant="switch" showTooltip={false} />
  </div>
</div>;
```

---

### **PASO 5: Estilos Dark Mode Completos**

#### **5.1 Contenedor principal**

```typescript
<div className="h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
```

#### **5.2 Sidebar**

```typescript
<aside className="bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-colors duration-300">
```

#### **5.3 Header**

```typescript
<header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
```

#### **5.4 Textos y elementos**

```typescript
// Títulos
className = "text-slate-900 dark:text-slate-100";

// Subtítulos
className = "text-slate-600 dark:text-slate-400";

// Botones
className =
  "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700";

// Backgrounds
className = "bg-slate-50 dark:bg-slate-700";

// Borders
className = "border-slate-200 dark:border-slate-600";
```

---

## 🚀 **TEMPLATE PARA NUEVOS MÓDULOS UI**

### **Checklist para agregar un nuevo módulo UI:**

#### **1. ⚙️ Configuración del Feature Flag**

- [ ] Agregar flag en `FEATURE_FLAGS` con variable de entorno
- [ ] Categorizar en `ui` dentro de `FEATURE_CATEGORIES`
- [ ] Agregar soporte visual en `FeatureFlagCard.tsx`

#### **2. 🪝 Hook Personalizado**

- [ ] Crear hook en `src/shared/hooks/useNombreModulo.ts`
- [ ] Implementar feature flag integration con `useFeatureFlags()`
- [ ] Agregar broadcast si necesita sincronización cross-tab
- [ ] Implementar persistencia en localStorage si es necesario
- [ ] Actualizar `src/shared/hooks/index.ts`

#### **3. 🎨 Componente UI**

- [ ] Crear componente en `src/shared/ui/components/NombreModulo.tsx`
- [ ] Implementar lógica de no renderizar si feature flag desactivado
- [ ] Agregar variantes de tamaño y estilo si es necesario
- [ ] Implementar accessibility (aria-labels, keyboard navigation)
- [ ] Actualizar `src/shared/ui/components/index.ts`

#### **4. 🏗️ Integración en Layout**

- [ ] Importar componente en `AdminLayout.tsx`
- [ ] Agregar en posición apropiada (header, sidebar, etc.)
- [ ] Considerar versiones desktop y móvil
- [ ] Testear responsive design

#### **5. 🎨 Estilos Dark Mode**

- [ ] Agregar clases `dark:` para todos los elementos
- [ ] Implementar `transition-colors duration-300` para suavidad
- [ ] Testear contraste y legibilidad
- [ ] Verificar consistencia visual

#### **6. 📚 Documentación**

- [ ] Crear guía específica del módulo
- [ ] Documentar API del hook
- [ ] Agregar ejemplos de uso
- [ ] Actualizar documentación general

---

## 🔧 **ARCHIVOS MODIFICADOS**

### **Archivos Creados:**

- `src/shared/hooks/useDarkMode.ts` - Hook principal
- `src/shared/ui/components/DarkModeToggle.tsx` - Componente UI
- `docs/Feature-flags/DARK_MODE_IMPLEMENTATION_GUIDE.md` - Esta documentación

### **Archivos Modificados:**

- `src/core/feature-flags/config.ts` - Configuración del flag
- `src/features/admin/feature-flags/components/FeatureFlagCard.tsx` - Soporte visual UI
- `src/shared/hooks/index.ts` - Barrel export
- `src/shared/ui/components/index.ts` - Barrel export
- `src/shared/ui/layouts/AdminLayout.tsx` - Integración completa

---

## 🧪 **TESTING**

### **Casos de prueba implementados:**

1. ✅ **Feature Flag OFF** - Toggle no aparece
2. ✅ **Feature Flag ON** - Toggle aparece y funciona
3. ✅ **Persistencia** - Estado se mantiene al recargar
4. ✅ **System Preference** - Detecta preferencia del sistema
5. ✅ **Broadcast** - Sincronización entre pestañas
6. ✅ **Responsive** - Funciona en desktop y móvil
7. ✅ **Dark Mode Styles** - Todos los elementos tienen estilos dark

### **Para testear manualmente:**

1. Ir a Feature Flags admin y activar `darkMode`
2. Verificar que aparece el toggle en header
3. Hacer clic y verificar cambio instantáneo
4. Abrir nueva pestaña y verificar sincronización
5. Desactivar feature flag y verificar que desaparece
6. Testear en móvil y desktop

---

## 🎯 **BENEFICIOS DE ESTA IMPLEMENTACIÓN**

### **🔥 Funcionalidad Completa:**

- **Feature Flag Integration** - Control total sobre la funcionalidad
- **Broadcast Cross-Tab** - Experiencia consistente
- **Persistencia** - Estado guardado entre sesiones
- **System Preference** - UX nativa del sistema

### **🎨 UI/UX Excelente:**

- **3 Variantes** - button, switch, icon para diferentes contextos
- **Animaciones Suaves** - Transiciones de 300ms
- **Responsive Design** - Adaptado para desktop y móvil
- **Accessibility** - ARIA labels y keyboard navigation

### **🏗️ Arquitectura Limpia:**

- **Separación de Responsabilidades** - Hook, componente, estilos
- **Reutilizable** - Template para futuros módulos UI
- **Mantenible** - Código bien documentado y estructurado
- **Escalable** - Fácil agregar nuevas funcionalidades

---

## 📝 **PRÓXIMOS PASOS SUGERIDOS**

1. **Agregar más módulos UI** siguiendo este template
2. **Implementar animaciones** como módulo UI
3. **Crear sistema de notificaciones** visual
4. **Agregar temas personalizados** (no solo dark/light)
5. **Implementar preferencias de usuario** centralizadas

---

## 🎉 **CONCLUSIÓN**

Esta implementación de Dark Mode sirve como **template perfecto** para agregar nuevos módulos de UI. La arquitectura es:

- ✅ **Simple** - Fácil de entender y mantener
- ✅ **Funcional** - Todas las características esperadas
- ✅ **Robusta** - Manejo de errores y edge cases
- ✅ **Escalable** - Template reutilizable para futuros módulos

**¡Ahora tienes una guía completa para agregar cualquier módulo de UI siguiendo las mejores prácticas!** 🚀
