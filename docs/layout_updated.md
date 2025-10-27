# Layout Estandarizado - Guía de Implementación

**Fecha**: 2025-01-18
**Sección Base**: Audit Dashboard
**Aplicar a**: Suppliers, Inventory, Users Admin, y otras secciones con tabs

---

## 📋 Resumen de Cambios

Esta guía documenta todos los cambios realizados para crear un layout estandarizado con tabs que:
- ✅ Usa tabs consistentes (ReusableTabs)
- ✅ Header que desaparece suavemente con scroll
- ✅ Sin altura mínima forzada (no scroll innecesario)
- ✅ Tabs con bordes redondeados
- ✅ Solo renderiza el tab activo (altura dinámica)
- ✅ Backgrounds transparentes en header

---

## 🎯 Cambio 1: Usar ReusableTabs Estándar

### ❌ ANTES (Incorrecto)
```tsx
// Tabs personalizados o diferentes al estándar
<div className="tabs-custom">
  <button>Tab 1</button>
  <button>Tab 2</button>
</div>
```

### ✅ DESPUÉS (Correcto)
```tsx
import { ReusableTabs, type TabItem } from "@/shared/ui/components";

// Configuración de tabs
const tabs: TabItem[] = [
  {
    id: "overview",
    label: "Resumen",
    icon: <BarChart3 className="w-4 h-4" />,
    color: "blue",
  },
  {
    id: "activities",
    label: "Actividades",
    icon: <Activity className="w-4 h-4" />,
    color: "purple",
    hasNotification: totalCount > 0,
    notificationCount: totalCount,
  },
  // ... más tabs
];

// Usar ReusableTabs
<ReusableTabs
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="default"
  size="md"
  animated={true}
  scrollable={true}
  className="bg-transparent border-0 shadow-none p-0"
/>
```

**Archivo de referencia**: `src/features/audit/ui/routes/AuditDashboard.tsx:145-223`

---

## 🎯 Cambio 2: Quitar `min-h-screen` del Contenedor Principal

### ❌ ANTES (Incorrecto)
```tsx
return (
  <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
    {/* Contenido */}
  </div>
);
```

### ✅ DESPUÉS (Correcto)
```tsx
return (
  <div className="bg-gray-50 dark:bg-gray-900">
    {/* Contenido */}
  </div>
);
```

**Razón**: `min-h-screen` fuerza una altura mínima de pantalla completa, creando scroll innecesario cuando el contenido es pequeño. Al quitarlo, el contenedor solo ocupa el espacio necesario.

**Archivo de referencia**: `src/features/audit/ui/routes/AuditDashboard.tsx:177`

---

## 🎯 Cambio 3: Header que Desaparece con Scroll

### Implementación Completa

```tsx
"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
  // Estado para visibilidad del header
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Detectar scroll para mostrar/ocultar header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Mostrar header cuando: scroll up o está en top
      // Ocultar header cuando: scroll down > 50px
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setShowHeader(true);
      } else if (currentScrollY > 50) {
        setShowHeader(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Header con renderizado condicional */}
      {showHeader && (
        <div className="transition-all duration-300 ease-in-out animate-fadeIn">
          <div className="border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="max-w-[1600px] mx-auto px-6 py-6">
              {/* Contenido del header */}
            </div>
          </div>
        </div>
      )}

      {/* Resto del contenido */}
    </div>
  );
}
```

**Puntos clave**:
- ✅ Usa renderizado condicional `{showHeader && ...}` (NO sticky)
- ✅ Header desaparece completamente del DOM cuando está oculto
- ✅ Transición suave con `transition-all duration-300`
- ✅ Threshold de 50px para activar/desactivar
- ✅ Listener con `{ passive: true }` para mejor performance

**Archivo de referencia**: `src/features/audit/ui/routes/AuditDashboard.tsx:55-202`

---

## 🎯 Cambio 4: Header Sin Background Color

### ❌ ANTES (Incorrecto)
```tsx
<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
  <div className="max-w-[1600px] mx-auto px-6 py-6">
    {/* Contenido */}
  </div>
</div>
```

### ✅ DESPUÉS (Correcto)
```tsx
<div className="border-b border-gray-200 dark:border-gray-700 shadow-sm">
  <div className="max-w-[1600px] mx-auto px-6 py-6">
    {/* Contenido */}
  </div>
</div>
```

**Razón**: Quitar `bg-white dark:bg-gray-800` hace que el header sea más ligero visualmente y se integre mejor con el fondo general.

**Archivo de referencia**: `src/features/audit/ui/routes/AuditDashboard.tsx:186`

---

## 🎯 Cambio 5: Tabs Sticky con Bordes Redondeados

### Estructura Completa

```tsx
{/* Tabs Container - Sticky con bordes redondeados */}
<div className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900">
  <div className="max-w-[1600px] mx-auto px-6 pt-6">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
      <ReusableTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="default"
        size="md"
        animated={true}
        scrollable={true}
        className="bg-transparent border-0 shadow-none p-0"
      />
    </div>
  </div>
</div>
```

**Puntos clave**:
- ✅ Tabs siempre sticky (`sticky top-0 z-50`)
- ✅ Container con `rounded-xl` para bordes redondeados
- ✅ Background del contenedor de tabs: `bg-gray-50 dark:bg-gray-900`
- ✅ Wrapper interno con `bg-white dark:bg-gray-800`
- ✅ ReusableTabs con `bg-transparent` para no duplicar backgrounds

**Archivo de referencia**: `src/features/audit/ui/routes/AuditDashboard.tsx:210-225`

---

## 🎯 Cambio 6: Renderizar Solo el Tab Activo

### ❌ ANTES (Incorrecto)
```tsx
<div>
  <div style={{ display: activeTab === "overview" ? "block" : "none" }}>
    <OverviewTab />
  </div>
  <div style={{ display: activeTab === "activities" ? "block" : "none" }}>
    <ActivitiesTab />
  </div>
  {/* Todos los tabs se montan pero se ocultan */}
</div>
```

### ✅ DESPUÉS (Correcto)
```tsx
<div className="transition-opacity duration-200">
  {activeTab === "overview" && (
    <div className="animate-fadeIn">
      <OverviewTab />
    </div>
  )}

  {activeTab === "activities" && (
    <div className="animate-fadeIn">
      <ActivitiesTab />
    </div>
  )}

  {activeTab === "users" && (
    <div className="animate-fadeIn">
      <UsersTab />
    </div>
  )}

  {activeTab === "system" && (
    <div className="animate-fadeIn">
      <SystemTab />
    </div>
  )}
</div>
```

**Beneficios**:
- ✅ Solo el tab activo se monta en el DOM
- ✅ Cada tab tiene su altura natural (no hereda altura del más largo)
- ✅ Mejor performance (menos componentes montados)
- ✅ Animación `fadeIn` al cambiar de tab

**Archivo de referencia**: `src/features/audit/ui/routes/AuditDashboard.tsx:268-315`

---

## 🎨 Animación FadeIn

La animación `animate-fadeIn` debe estar definida en tu CSS:

```css
/* src/features/inventory/ui/styles/animations.css */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-in-out;
}
```

**Importar en el componente**:
```tsx
import "../../../inventory/ui/styles/animations.css";
```

---

## 📐 Estructura HTML Completa del Layout

```tsx
<div className="bg-gray-50 dark:bg-gray-900">
  {/* 1. HEADER - Condicional, desaparece con scroll */}
  {showHeader && (
    <div className="transition-all duration-300 ease-in-out animate-fadeIn">
      <div className="border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          {/* Contenido del header */}
        </div>
      </div>
    </div>
  )}

  {/* 2. TABS - Sticky, siempre visible */}
  <div className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900">
    <div className="max-w-[1600px] mx-auto px-6 pt-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
        <ReusableTabs {...props} />
      </div>
    </div>
  </div>

  {/* 3. CONTENT AREA - Solo tab activo */}
  <div className="max-w-[1600px] mx-auto px-6 py-6">
    {/* Errores si existen */}
    {hasErrors && <ErrorDisplay />}

    {/* Tab content - solo activo */}
    <div className="transition-opacity duration-200">
      {activeTab === "overview" && (
        <div className="animate-fadeIn">
          <OverviewTab />
        </div>
      )}
      {/* ... otros tabs */}
    </div>
  </div>
</div>
```

---

## 🔧 Paso a Paso para Aplicar en Otras Secciones

### 1. Imports necesarios
```tsx
import { useState, useEffect } from "react";
import { ReusableTabs, type TabItem } from "@/shared/ui/components";
import "../../../inventory/ui/styles/animations.css";
```

### 2. Estados necesarios
```tsx
const [activeTab, setActiveTab] = useState<YourTabType>("overview");
const [showHeader, setShowHeader] = useState(true);
const [lastScrollY, setLastScrollY] = useState(0);
```

### 3. Scroll listener (copiar completo)
```tsx
useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY < lastScrollY || currentScrollY < 50) {
      setShowHeader(true);
    } else if (currentScrollY > 50) {
      setShowHeader(false);
    }

    setLastScrollY(currentScrollY);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, [lastScrollY]);
```

### 4. Configurar tabs
```tsx
const tabs: TabItem[] = [
  {
    id: "overview",
    label: "Resumen",
    icon: <Icon className="w-4 h-4" />,
    color: "blue",
  },
  // ... más tabs
];
```

### 5. Estructura HTML
- Div principal: `className="bg-gray-50 dark:bg-gray-900"` (SIN min-h-screen)
- Header condicional: `{showHeader && ...}`
- Header sin background: solo border y shadow
- Tabs sticky con rounded-xl
- Solo renderizar tab activo con `{activeTab === "x" && ...}`

---

## ✅ Checklist de Implementación

Cuando apliques estos cambios en otras secciones, verifica:

- [ ] Imports correctos (useState, useEffect, ReusableTabs, animations.css)
- [ ] Estados para activeTab, showHeader, lastScrollY
- [ ] useEffect para scroll listener con passive: true
- [ ] Div principal SIN `min-h-screen`
- [ ] Header condicional con `{showHeader && ...}`
- [ ] Header SIN `bg-white dark:bg-gray-800`
- [ ] Tabs container con `sticky top-0 z-50`
- [ ] Wrapper de tabs con `rounded-xl`
- [ ] ReusableTabs con `bg-transparent`
- [ ] Tabs content con renderizado condicional (no display:none)
- [ ] Animación `animate-fadeIn` en cada tab
- [ ] Max-width consistente: `max-w-[1600px]`
- [ ] Padding consistente: `px-6 py-6`

---

## 🎯 Secciones Pendientes de Actualización

Aplicar estos mismos cambios a:

1. **Suppliers** (`src/features/suppliers/...`)
2. **Inventory** (`src/features/inventory/...`)
3. **Users Admin** (`src/features/users-admin/...`)
4. Cualquier otra sección con sistema de tabs

---

## 📝 Notas Adicionales

### Performance
- El scroll listener usa `{ passive: true }` para mejor performance
- Solo se renderiza el tab activo (reduce componentes en DOM)
- Transiciones CSS en lugar de JavaScript

### Accesibilidad
- ReusableTabs maneja navegación por teclado
- Transiciones suaves para mejor UX
- Estados claros (activo/inactivo)

### Mantenibilidad
- Estructura consistente en todas las secciones
- Fácil de identificar partes (header, tabs, content)
- Comentarios claros en el código

---

## 📚 Referencias

- **Componente base**: `src/features/audit/ui/routes/AuditDashboard.tsx`
- **ReusableTabs**: `src/shared/ui/components`
- **Animaciones**: `src/features/inventory/ui/styles/animations.css`
- **Tipos de tabs**: `src/features/[feature]/types.ts`

---

**Última actualización**: 2025-01-18
**Estado**: ✅ Implementado en Audit Dashboard
**Próximo paso**: Aplicar a Suppliers, Inventory, Users Admin
