# 📌 StickyTabsContainer Component - Guía de Uso

## Descripción

El componente `StickyTabsContainer` es un wrapper reutilizable que estandariza el layout de tabs en toda la aplicación. Elimina la duplicación de código del wrapper sticky que se repetía en todas las secciones.

## Problema que Resuelve

### Antes (Código Duplicado):
```tsx
<div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900">
  <div className="w-full px-4 pt-4 sm:px-6 sm:pt-6">
    <div className="max-w-full xl:max-w-[1600px] mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1.5 sm:p-2">
        <ReusableTabs ... />
      </div>
    </div>
  </div>
</div>
```

Este patrón se repetía en **7+ archivos** diferentes.

### Después (Componente Reutilizable):
```tsx
<StickyTabsContainer responsive={true}>
  <ReusableTabs ... />
</StickyTabsContainer>
```

## Features

- ✅ **Sticky Positioning**: Tabs permanecen en la parte superior al hacer scroll
- 📱 **Responsive Design**: Dos variantes (responsive y fixed-width)
- 🌙 **Dark Mode**: Soporte completo para modo oscuro
- 🎨 **Consistent Styling**: Border, shadow, y rounded corners estandarizados
- ⚙️ **Configurable**: Z-index y clases CSS personalizables
- 🔄 **Flexible**: Funciona con cualquier contenido, no solo ReusableTabs

## Instalación

El componente ya está exportado en el barrel de componentes compartidos:

```tsx
import { StickyTabsContainer } from "@/shared/ui/components";
```

## Props

### StickyTabsContainerProps

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `children` | `React.ReactNode` | Sí | - | Contenido a renderizar (típicamente ReusableTabs) |
| `responsive` | `boolean` | No | `true` | Usar padding responsive (mobile-friendly) |
| `zIndex` | `number` | No | `20` | Valor de z-index para posicionamiento sticky |
| `className` | `string` | No | - | Clases CSS adicionales para el contenedor exterior |
| `innerClassName` | `string` | No | - | Clases CSS adicionales para el wrapper interno |
| `containerClassName` | `string` | No | - | Clases CSS adicionales para el contenedor de tabs |

## Variantes

### 1. Responsive (Recomendado)

Usa padding responsive que se adapta a móvil, tablet y desktop:

```tsx
<StickyTabsContainer responsive={true}>
  <ReusableTabs ... />
</StickyTabsContainer>
```

**Características:**
- Padding: `16px` (mobile) → `24px` (tablet+)
- Border radius: `8px` (mobile) → `12px` (desktop)
- Max width: `100%` (mobile) → `1600px` (desktop)

### 2. Fixed Width

Usa un max-width fijo de 1600px con padding consistente:

```tsx
<StickyTabsContainer responsive={false}>
  <ReusableTabs ... />
</StickyTabsContainer>
```

**Características:**
- Max width: `1600px` (siempre)
- Padding: `24px` (siempre)
- Border radius: `12px` (siempre)

## Ejemplos de Uso

### 1. Ejemplo Básico - Users (Implementado)

```tsx
import { StickyTabsContainer, ReusableTabs } from "@/shared/ui/components";

<StickyTabsContainer responsive={true} zIndex={20}>
  <ReusableTabs
    tabs={USERS_TABS.map((tab) => ({
      id: tab.id,
      label: tab.label,
      icon: <IconComponent className="w-4 h-4" />,
      color: tab.color,
    }))}
    activeTab={activeTab}
    onTabChange={setActiveTab}
    variant="default"
    size="md"
    animated={true}
    scrollable={true}
    className="bg-transparent border-0 shadow-none p-0"
  />
</StickyTabsContainer>
```

### 2. Ejemplo - Inventory

```tsx
<StickyTabsContainer responsive={true}>
  <ReusableTabs
    tabs={INVENTORY_TABS.map((tab) => ({
      id: tab.id,
      label: tab.label,
      icon: <Package className="w-4 h-4" />,
    }))}
    activeTab={activeTab}
    onTabChange={setActiveTab}
  />
</StickyTabsContainer>
```

### 3. Ejemplo - Con Z-Index Personalizado

```tsx
<StickyTabsContainer responsive={true} zIndex={30}>
  <ReusableTabs ... />
</StickyTabsContainer>
```

### 4. Ejemplo - Con Clases Personalizadas

```tsx
<StickyTabsContainer
  responsive={true}
  className="shadow-lg"
  containerClassName="rounded-2xl p-3"
>
  <ReusableTabs ... />
</StickyTabsContainer>
```

### 5. Ejemplo - Non-Responsive (Desktop Only Apps)

```tsx
<StickyTabsContainer responsive={false}>
  <ReusableTabs ... />
</StickyTabsContainer>
```

## Estructura del DOM

### Responsive Mode (`responsive={true}`):

```html
<div class="sticky top-0 bg-gray-50 dark:bg-gray-900" style="z-index: 20">
  <div class="w-full px-4 pt-4 sm:px-6 sm:pt-6">
    <div class="max-w-full xl:max-w-[1600px] mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border p-1.5 sm:p-2">
        {children}
      </div>
    </div>
  </div>
</div>
```

### Fixed Width Mode (`responsive={false}`):

```html
<div class="sticky top-0 bg-gray-50 dark:bg-gray-900" style="z-index: 20">
  <div class="max-w-[1600px] mx-auto px-6 pt-6">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-2">
      {children}
    </div>
  </div>
</div>
```

## Responsive Behavior

| Breakpoint | Padding Horizontal | Padding Top | Border Radius | Container Width |
|------------|-------------------|-------------|---------------|-----------------|
| Mobile (<640px) | `16px` | `16px` | `8px` | `100%` |
| Tablet (640px-1280px) | `24px` | `24px` | `12px` | `100%` |
| Desktop (>1280px) | `24px` | `24px` | `12px` | `1600px` max |

## Integración con ReusableTabs

El componente está diseñado para funcionar perfectamente con `ReusableTabs`:

```tsx
<StickyTabsContainer>
  <ReusableTabs
    // Remove background, border, shadow, padding from ReusableTabs
    // since StickyTabsContainer provides these
    className="bg-transparent border-0 shadow-none p-0"
    {...otherProps}
  />
</StickyTabsContainer>
```

**Importante**: Asegúrate de sobrescribir los estilos de `ReusableTabs` con:
- `bg-transparent` - El fondo lo proporciona el container
- `border-0` - El border lo proporciona el container
- `shadow-none` - La sombra la proporciona el container
- `p-0` - El padding lo proporciona el container

## Casos de Uso

### ✅ Cuándo Usar

1. **Tabs principales de módulos**: Users, Inventory, Suppliers, etc.
2. **Navegación sticky**: Cuando necesitas tabs que permanezcan visibles
3. **Layout consistente**: Para mantener el mismo estilo en toda la app
4. **Responsive design**: Cuando necesitas adaptar el layout a móvil

### ❌ Cuándo NO Usar

1. **Tabs no-sticky**: Si no necesitas que los tabs sean sticky
2. **Tabs inline**: Tabs dentro de modales o cards
3. **Tabs personalizados**: Cuando necesitas un layout completamente diferente

## Migración desde Código Legacy

### Paso 1: Identificar el Patrón

Busca este patrón en tu código:

```tsx
<div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900">
  <div className="w-full px-4 pt-4 sm:px-6 sm:pt-6">
    // ... más divs
    <ReusableTabs ... />
  </div>
</div>
```

### Paso 2: Reemplazar con StickyTabsContainer

```tsx
<StickyTabsContainer responsive={true} zIndex={20}>
  <ReusableTabs ... />
</StickyTabsContainer>
```

### Paso 3: Ajustar ReusableTabs

Agrega clases para eliminar estilos duplicados:

```tsx
<ReusableTabs
  className="bg-transparent border-0 shadow-none p-0"
  {...otherProps}
/>
```

## Best Practices

1. **Usa responsive={true} por defecto**: Es mobile-first y funciona en todos los dispositivos
2. **Z-index consistente**: Usa `zIndex={20}` para tabs en la mayoría de casos
3. **Limpia estilos duplicados**: Usa `className="bg-transparent border-0 shadow-none p-0"` en ReusableTabs
4. **No anides StickyTabsContainer**: Usa solo un nivel de sticky
5. **Combina con PageHeader**: Usa ambos componentes juntos para layout completo

## Próximos Pasos - Plan de Migración

### Archivos a Migrar:

1. ✅ **Users**: `/users` - Implementado
2. ⏳ **Inventory**: `/inventory` - Pendiente (~50 líneas de código duplicado)
3. ⏳ **Suppliers**: `/suppliers` - Pendiente (~50 líneas de código duplicado)
4. ⏳ **Files**: `/files` - Pendiente (~50 líneas de código duplicado)
5. ⏳ **Seller Portal**: `/seller-portal` - Pendiente (~50 líneas de código duplicado)
6. ⏳ **Audit**: `/audit` - Pendiente (~50 líneas de código duplicado)

### Impacto Estimado:

- **Líneas eliminadas**: ~250-300 líneas de código duplicado
- **Tiempo de migración**: ~15 minutos por archivo
- **Beneficios**: Código más mantenible, consistente y fácil de actualizar

## Combinación con PageHeader

Para un layout completo y estandarizado:

```tsx
<div className="min-h-full bg-gray-50 dark:bg-gray-900">
  {/* 1. Page Header */}
  <PageHeader
    icon={<Users className="w-6 h-6 sm:w-8 sm:h-8" />}
    title="Gestión de Usuarios"
    description="Administra usuarios y permisos"
    stats={headerStats}
  />

  {/* 2. Sticky Tabs */}
  <StickyTabsContainer responsive={true}>
    <ReusableTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      className="bg-transparent border-0 shadow-none p-0"
    />
  </StickyTabsContainer>

  {/* 3. Content Area */}
  <div className="w-full px-4 py-4 sm:px-6 sm:py-6">
    <div className="max-w-full xl:max-w-[1600px] mx-auto">
      <TabContent />
    </div>
  </div>
</div>
```

## Soporte de Navegadores

- ✅ Chrome/Edge (últimas 2 versiones)
- ✅ Firefox (últimas 2 versiones)
- ✅ Safari (últimas 2 versiones)
- ✅ Mobile Safari (iOS 12+)
- ✅ Chrome Mobile (Android 8+)

---

**Ubicación del componente**: `src/shared/ui/components/StickyTabsContainer.tsx`

**Exportado desde**: `src/shared/ui/components/index.ts`

**Ver también**:
- [PageHeader Usage Guide](./page-header-usage.md)
- [ReusableTabs Documentation](../src/shared/ui/components/ReusableTabs.tsx)
