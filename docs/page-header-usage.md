# 📄 PageHeader Component - Guía de Uso

## Descripción

El componente `PageHeader` es un header reutilizable y estandarizado para todas las secciones administrativas de la aplicación. Diseñado con un enfoque mobile-first, proporciona una interfaz consistente y profesional.

## Features

- ✅ **Responsive Design**: Mobile-first con breakpoints optimizados
- 🌙 **Dark Mode**: Soporte completo para modo oscuro
- 📊 **Quick Stats**: Muestra estadísticas rápidas con iconos
- ⚙️ **Action Button**: Botón de acción opcional (ej: Settings)
- 🎨 **Color Variants**: 7 variantes de color para stats
- ♿ **Accessible**: ARIA labels y semántica correcta
- 🎬 **Animations**: Transiciones suaves con fadeIn

## Instalación

El componente ya está exportado en el barrel de componentes compartidos:

```tsx
import { PageHeader, type StatItem } from "@/shared/ui/components";
```

## Props

### PageHeaderProps

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `icon` | `React.ReactNode` | No | - | Icono principal del header |
| `title` | `string` | Sí | - | Título de la página |
| `description` | `string` | No | - | Descripción/subtítulo |
| `stats` | `StatItem[]` | No | `[]` | Array de estadísticas rápidas |
| `action` | `React.ReactNode` | No | - | Icono del botón de acción |
| `onActionClick` | `() => void` | No | - | Handler del botón de acción |
| `className` | `string` | No | - | Clases CSS adicionales |
| `hidden` | `boolean` | No | `false` | Oculta el header (para animaciones) |

### StatItem

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `icon` | `React.ReactNode` | Sí | Icono de la estadística |
| `label` | `string` | Sí | Texto a mostrar |
| `color` | `"blue" \| "green" \| "purple" \| "orange" \| "red" \| "yellow" \| "indigo"` | Sí | Color del badge |
| `value` | `string \| number` | No | Valor numérico (opcional) |

## Ejemplos de Uso

### 1. Ejemplo Básico - Users (Implementado)

```tsx
import { PageHeader, type StatItem } from "@/shared/ui/components";
import { Users, UserCheck, Shield, Settings } from "lucide-react";

const headerStats: StatItem[] = [
  {
    icon: <Users className="w-4 h-4" />,
    label: `${stats.total} Total`,
    color: "blue",
    value: stats.total,
  },
  {
    icon: <UserCheck className="w-4 h-4" />,
    label: `${stats.active} Activos`,
    color: "green",
    value: stats.active,
  },
  {
    icon: <Shield className="w-4 h-4" />,
    label: `${stats.admins} Admins`,
    color: "purple",
    value: stats.admins,
  },
];

<PageHeader
  icon={<UserCheck className="w-6 h-6 sm:w-8 sm:h-8" />}
  title="Gestión de Usuarios"
  description="Administra usuarios, roles, permisos y monitorea la actividad del sistema"
  stats={headerStats}
  action={<Settings className="w-5 h-5" />}
  onActionClick={() => console.log("Settings clicked")}
  hidden={!showHeader}
/>
```

### 2. Ejemplo - Inventory

```tsx
import { PageHeader, type StatItem } from "@/shared/ui/components";
import { Package, TrendingUp, AlertTriangle, Settings } from "lucide-react";

const inventoryStats: StatItem[] = [
  {
    icon: <Package className="w-4 h-4" />,
    label: `${totalProducts} Productos`,
    color: "blue",
  },
  {
    icon: <TrendingUp className="w-4 h-4" />,
    label: `${inStock} En Stock`,
    color: "green",
  },
  {
    icon: <AlertTriangle className="w-4 h-4" />,
    label: `${lowStock} Stock Bajo`,
    color: "orange",
  },
];

<PageHeader
  icon={<Package className="w-6 h-6 sm:w-8 sm:h-8" />}
  title="Gestión de Inventario"
  description="Administra productos, categorías y stock"
  stats={inventoryStats}
  action={<Settings className="w-5 h-5" />}
  onActionClick={handleSettings}
/>
```

### 3. Ejemplo - Suppliers

```tsx
import { PageHeader, type StatItem } from "@/shared/ui/components";
import { Truck, CheckCircle, Clock, Settings } from "lucide-react";

const suppliersStats: StatItem[] = [
  {
    icon: <Truck className="w-4 h-4" />,
    label: `${total} Proveedores`,
    color: "blue",
  },
  {
    icon: <CheckCircle className="w-4 h-4" />,
    label: `${active} Activos`,
    color: "green",
  },
  {
    icon: <Clock className="w-4 h-4" />,
    label: `${pending} Pendientes`,
    color: "yellow",
  },
];

<PageHeader
  icon={<Truck className="w-6 h-6 sm:w-8 sm:h-8" />}
  title="Gestión de Proveedores"
  description="Administra proveedores, contactos y pedidos"
  stats={suppliersStats}
  action={<Settings className="w-5 h-5" />}
  onActionClick={openSupplierSettings}
/>
```

### 4. Ejemplo - Files (Sin Stats)

```tsx
import { PageHeader } from "@/shared/ui/components";
import { FileText, Settings } from "lucide-react";

<PageHeader
  icon={<FileText className="w-6 h-6 sm:w-8 sm:h-8" />}
  title="Gestión de Archivos"
  description="Sube, organiza y comparte archivos"
  action={<Settings className="w-5 h-5" />}
  onActionClick={handleFileSettings}
/>
```

### 5. Ejemplo - Con Scroll Behavior (Recomendado)

Para implementar el comportamiento de desaparición con scroll:

```tsx
const [showHeader, setShowHeader] = useState(true);
const [lastScrollY, setLastScrollY] = useState(0);

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

<PageHeader
  // ... otros props
  hidden={!showHeader}
/>
```

## Color Variants

Las estadísticas soportan 7 variantes de color:

| Color | Uso Recomendado | Ejemplo |
|-------|-----------------|---------|
| `blue` | Información general, totales | Total de items |
| `green` | Estado positivo, activos, éxito | Items activos, completados |
| `purple` | Roles especiales, premium | Admins, featured |
| `orange` | Advertencias, stock bajo | Low stock, warnings |
| `red` | Errores, crítico, bloqueados | Errores, banned users |
| `yellow` | Pendientes, en proceso | Pending, in progress |
| `indigo` | Analytics, insights | Analytics data |

## Responsive Behavior

El componente se adapta automáticamente a diferentes tamaños de pantalla:

- **Mobile (< 640px)**:
  - Título: `text-xl`
  - Description: `text-xs`
  - Stats: Full width (flex-1)
  - Action button: Hidden

- **Tablet (640px - 1024px)**:
  - Título: `text-2xl`
  - Description: `text-sm`
  - Stats: Auto width
  - Action button: Visible

- **Desktop (> 1024px)**:
  - Max width: `1600px`
  - Padding: `32px`

## Best Practices

1. **Usa iconos consistentes**: Mantén el mismo tamaño de iconos en stats (`w-4 h-4`)
2. **Limita las stats**: No más de 4-5 stats para evitar sobrecarga visual
3. **Memoiza las stats**: Usa `useMemo` para evitar re-renders innecesarios
4. **Colors significativos**: Usa colores que aporten significado semántico
5. **Action button opcional**: Solo incluye si hay una acción clara (Settings, Filter, etc.)

## Migración desde Headers Antiguos

### Antes:
```tsx
<div className="border-b border-gray-200 dark:border-gray-700 shadow-sm">
  <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
    {/* ... mucho código custom ... */}
  </div>
</div>
```

### Después:
```tsx
<PageHeader
  icon={<Icon className="w-6 h-6 sm:w-8 sm:h-8" />}
  title="Tu Título"
  description="Tu descripción"
  stats={stats}
  action={<Settings className="w-5 h-5" />}
  onActionClick={handler}
/>
```

## Próximos Pasos

1. ✅ **Users**: Implementado
2. ⏳ **Inventory**: Pendiente
3. ⏳ **Suppliers**: Pendiente
4. ⏳ **Files**: Pendiente
5. ⏳ **Seller Portal**: Pendiente
6. ⏳ **Audit**: Pendiente

---

**Ubicación del componente**: `src/shared/ui/components/PageHeader.tsx`

**Exportado desde**: `src/shared/ui/components/index.ts`
