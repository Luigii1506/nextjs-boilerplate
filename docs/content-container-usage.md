# 📦 ContentContainer Component - Guía de Uso

## Descripción

El componente `ContentContainer` es un wrapper reutilizable que estandariza el área de contenido en todas las secciones administrativas. Proporciona padding consistente, max-width y responsive behavior.

## Problema que Resuelve

### Antes (Código Duplicado):
```tsx
<div className="w-full px-4 py-4 sm:px-6 sm:py-6">
  <div className="max-w-full xl:max-w-[1600px] mx-auto">
    <TabContent />
  </div>
</div>
```

O la variante no-responsive:
```tsx
<div className="max-w-[1600px] mx-auto px-6 py-6">
  <TabContent />
</div>
```

Este patrón se repetía en **7+ archivos** diferentes.

### Después (Componente Reutilizable):
```tsx
<ContentContainer responsive={true}>
  <TabContent />
</ContentContainer>
```

## Features

- ✅ **Responsive Padding**: Se adapta a mobile, tablet y desktop
- 📏 **Consistent Max-Width**: 1600px por defecto (configurable)
- 🎨 **Spacing Variants**: 3 tamaños predefinidos (sm, md, lg)
- 🌙 **Dark Mode**: Compatible con todos los temas
- 🔧 **Configurable**: Props para personalizar comportamiento
- 🎯 **Two Variants**: Responsive y fixed-width

## Instalación

El componente ya está exportado en el barrel de componentes compartidos:

```tsx
import { ContentContainer } from "@/shared/ui/components";
```

## Props

### ContentContainerProps

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `children` | `React.ReactNode` | Sí | - | Contenido a renderizar |
| `responsive` | `boolean` | No | `true` | Usar padding responsive |
| `spacing` | `"sm" \| "md" \| "lg"` | No | `"md"` | Variante de spacing |
| `className` | `string` | No | - | Clases CSS adicionales (outer) |
| `innerClassName` | `string` | No | - | Clases CSS adicionales (inner) |
| `maxWidth` | `string` | No | `"1600px"` | Max-width personalizado |

## Spacing Variants

### Small (sm)
```tsx
<ContentContainer spacing="sm">
  <YourContent />
</ContentContainer>
```

| Breakpoint | Padding |
|------------|---------|
| Mobile | `12px` (vertical y horizontal) |
| Tablet+ | `16px` (vertical y horizontal) |

**Uso**: Contenido compacto, cards pequeñas

---

### Medium (md) - Default
```tsx
<ContentContainer spacing="md">
  <YourContent />
</ContentContainer>
```

| Breakpoint | Padding |
|------------|---------|
| Mobile | `16px` (vertical y horizontal) |
| Tablet+ | `24px` (vertical y horizontal) |

**Uso**: Contenido estándar, la mayoría de secciones

---

### Large (lg)
```tsx
<ContentContainer spacing="lg">
  <YourContent />
</ContentContainer>
```

| Breakpoint | Padding |
|------------|---------|
| Mobile | `16px` horizontal, `24px` vertical |
| Tablet+ | `24px` horizontal, `32px` vertical |
| Desktop | `32px` (vertical y horizontal) |

**Uso**: Dashboards, secciones con mucho contenido

## Variantes

### 1. Responsive (Recomendado)

Usa padding responsive que se adapta al tamaño de pantalla:

```tsx
<ContentContainer responsive={true}>
  <TabContent />
</ContentContainer>
```

**Estructura DOM**:
```html
<div class="w-full px-4 py-4 sm:px-6 sm:py-6">
  <div class="max-w-full mx-auto" style="max-width: min(100%, 1600px)">
    {children}
  </div>
</div>
```

**Características**:
- Full width en mobile
- Responsive padding
- Max-width inteligente (1600px o 100%)

---

### 2. Fixed Width

Usa max-width fijo con padding consistente:

```tsx
<ContentContainer responsive={false}>
  <TabContent />
</ContentContainer>
```

**Estructura DOM**:
```html
<div class="mx-auto px-6 py-6" style="max-width: 1600px">
  {children}
</div>
```

**Características**:
- Max-width fijo (1600px)
- Padding consistente
- Más simple para layouts desktop-first

## Ejemplos de Uso

### 1. Ejemplo Básico - Users (Implementado)

```tsx
import { ContentContainer } from "@/shared/ui/components";

<ContentContainer responsive={true}>
  <TabContent />
</ContentContainer>
```

### 2. Ejemplo - Con Spacing Personalizado

```tsx
<ContentContainer responsive={true} spacing="lg">
  <DashboardContent />
</ContentContainer>
```

### 3. Ejemplo - Con Max-Width Personalizado

```tsx
<ContentContainer responsive={true} maxWidth="1400px">
  <NarrowContent />
</ContentContainer>
```

### 4. Ejemplo - Con Clases Adicionales

```tsx
<ContentContainer
  responsive={true}
  className="bg-gray-100 dark:bg-gray-800"
  innerClassName="rounded-lg"
>
  <YourContent />
</ContentContainer>
```

### 5. Ejemplo - Fixed Width (Inventory, Suppliers)

```tsx
<ContentContainer responsive={false}>
  <InventoryContent />
</ContentContainer>
```

### 6. Ejemplo - Layout Completo

```tsx
<div className="min-h-full bg-gray-50 dark:bg-gray-900">
  {/* Header */}
  <PageHeader
    title="Mi Sección"
    stats={stats}
  />

  {/* Tabs */}
  <StickyTabsContainer responsive={true}>
    <ReusableTabs tabs={tabs} activeTab={activeTab} />
  </StickyTabsContainer>

  {/* Content */}
  <ContentContainer responsive={true}>
    <TabContent />
  </ContentContainer>
</div>
```

## Responsive Behavior

### Responsive Mode (`responsive={true}`):

| Breakpoint | Outer Width | Inner Max-Width | Padding (md) |
|------------|-------------|-----------------|--------------|
| Mobile (<640px) | `100%` | `100%` | `16px` |
| Tablet (640px-1280px) | `100%` | `100%` | `24px` |
| Desktop (>1280px) | `100%` | `1600px` | `24px` |

### Fixed Mode (`responsive={false}`):

| Breakpoint | Width | Padding (md) |
|------------|-------|--------------|
| All sizes | `1600px` max | `24px` |

## Comparación de Variantes

| Feature | Responsive | Fixed |
|---------|-----------|-------|
| Mobile-friendly | ✅ Sí | ⚠️ Limitado |
| Adaptive padding | ✅ Sí | ❌ No |
| Full-width on mobile | ✅ Sí | ❌ No |
| Simpler DOM | ❌ No | ✅ Sí |
| Use case | Admin sections | Desktop-only apps |

## Integración con Otros Componentes

### Con PageHeader

```tsx
<PageHeader title="Usuarios" stats={stats} />
<StickyTabsContainer>
  <ReusableTabs tabs={tabs} />
</StickyTabsContainer>
<ContentContainer responsive={true}>
  <Content />
</ContentContainer>
```

### Con StickyTabsContainer

Ambos componentes tienen el mismo `responsive` pattern para consistencia:

```tsx
<StickyTabsContainer responsive={true}>
  <ReusableTabs />
</StickyTabsContainer>

<ContentContainer responsive={true}>
  <Content />
</ContentContainer>
```

## Casos de Uso

### ✅ Cuándo Usar

1. **Área de contenido principal**: Debajo de headers y tabs
2. **Layout responsive**: Cuando necesitas adaptar padding
3. **Consistencia**: Para mantener el mismo spacing en toda la app
4. **Múltiples secciones**: Cuando tienes varias páginas similares

### ❌ Cuándo NO Usar

1. **Dentro de modales**: Los modales tienen su propio padding
2. **Dentro de cards**: Las cards manejan su propio spacing
3. **Sidebars**: Usan diferentes patrones de layout
4. **Full-width content**: Cuando necesitas usar el 100% del ancho

## Migración desde Código Legacy

### Paso 1: Identificar el Patrón

**Responsive Pattern**:
```tsx
<div className="w-full px-4 py-4 sm:px-6 sm:py-6">
  <div className="max-w-full xl:max-w-[1600px] mx-auto">
    {children}
  </div>
</div>
```

**Fixed Pattern**:
```tsx
<div className="max-w-[1600px] mx-auto px-6 py-6">
  {children}
</div>
```

### Paso 2: Reemplazar con ContentContainer

**Responsive**:
```tsx
<ContentContainer responsive={true}>
  {children}
</ContentContainer>
```

**Fixed**:
```tsx
<ContentContainer responsive={false}>
  {children}
</ContentContainer>
```

### Paso 3: Ajustar Spacing si es Necesario

Si el padding era diferente, usa la prop `spacing`:

```tsx
<ContentContainer responsive={true} spacing="lg">
  {children}
</ContentContainer>
```

## Best Practices

1. **Usa responsive={true} por defecto**: Es mobile-first y funciona en todos los dispositivos
2. **Spacing consistente**: Usa `md` para la mayoría de secciones
3. **Max-width estándar**: Mantén 1600px para consistencia
4. **No anides ContentContainer**: Usa solo un nivel
5. **Combina con PageHeader y StickyTabsContainer**: Para layout completo

## Performance

El componente es muy ligero:

- **No re-renders innecesarios**: Componente funcional simple
- **CSS inline mínimo**: Solo para max-width
- **Sin JavaScript runtime**: Todo CSS estático
- **Bundle size**: ~1KB (minified + gzipped)

## Próximos Pasos - Plan de Migración

### Archivos a Migrar:

1. ✅ **Users**: `/users` - Implementado
2. ⏳ **Inventory**: `/inventory` - Pendiente
3. ⏳ **Suppliers**: `/suppliers` - Pendiente
4. ⏳ **Files**: `/files` - Pendiente
5. ⏳ **Seller Portal**: `/seller-portal` - Pendiente
6. ⏳ **Audit**: `/audit` - Pendiente

### Impacto Estimado:

- **Líneas eliminadas**: ~10-15 líneas por archivo
- **Total**: ~60-90 líneas de código duplicado
- **Tiempo**: ~5 minutos por archivo

## Ejemplos Avanzados

### Con Animaciones

```tsx
<ContentContainer
  responsive={true}
  className="animate-fadeIn"
>
  <YourContent />
</ContentContainer>
```

### Con Background Personalizado

```tsx
<ContentContainer
  responsive={true}
  className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
>
  <YourContent />
</ContentContainer>
```

### Con Border y Shadow

```tsx
<ContentContainer
  responsive={true}
  innerClassName="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
>
  <YourContent />
</ContentContainer>
```

### Diferentes Max-Width por Sección

```tsx
// Dashboard - más ancho
<ContentContainer maxWidth="1800px">
  <DashboardContent />
</ContentContainer>

// Form - más estrecho
<ContentContainer maxWidth="800px">
  <FormContent />
</ContentContainer>
```

## Testing

### Unit Test Básico

```tsx
import { render } from '@testing-library/react';
import { ContentContainer } from '@/shared/ui/components';

describe('ContentContainer', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <ContentContainer>
        <div>Test Content</div>
      </ContentContainer>
    );
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('applies responsive classes when responsive=true', () => {
    const { container } = render(
      <ContentContainer responsive={true}>
        <div>Content</div>
      </ContentContainer>
    );
    expect(container.firstChild).toHaveClass('w-full');
  });

  it('applies fixed classes when responsive=false', () => {
    const { container } = render(
      <ContentContainer responsive={false}>
        <div>Content</div>
      </ContentContainer>
    );
    expect(container.firstChild).toHaveClass('mx-auto');
  });
});
```

## Troubleshooting

### Problema: Contenido muy pegado a los bordes

**Solución**: Aumenta el spacing
```tsx
<ContentContainer spacing="lg">
  {children}
</ContentContainer>
```

### Problema: Contenido muy ancho en desktop

**Solución**: Reduce el max-width
```tsx
<ContentContainer maxWidth="1200px">
  {children}
</ContentContainer>
```

### Problema: Scroll horizontal en móvil

**Solución**: Asegúrate de usar `responsive={true}`
```tsx
<ContentContainer responsive={true}>
  {children}
</ContentContainer>
```

---

**Ubicación del componente**: `src/shared/ui/components/ContentContainer.tsx`

**Exportado desde**: `src/shared/ui/components/index.ts`

**Ver también**:
- [PageHeader Usage Guide](./page-header-usage.md)
- [StickyTabsContainer Usage Guide](./sticky-tabs-container-usage.md)
- [Reusable Components Standard](./reusable-components-standard.md)
