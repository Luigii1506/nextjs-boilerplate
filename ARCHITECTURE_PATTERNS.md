# 🏗️ ARCHITECTURE PATTERNS - INVENTORY MODULE

## 📋 Overview

Este documento describe los patrones de diseño y la arquitectura implementada en el módulo de Inventory. Sigue estos patrones para mantener consistencia en todos los módulos del proyecto.

## 🎯 Principios Core

1. **Feature-First Architecture**: Cada feature es auto-contenida
2. **Separation of Concerns**: Capas claramente definidas
3. **DRY (Don't Repeat Yourself)**: Código reutilizable
4. **Single Responsibility**: Cada archivo tiene un propósito claro
5. **Testability**: Funciones puras y componentes aislados

---

## 📁 Estructura de Carpetas

```
src/features/inventory/
├── types.ts                    # Domain Models (TypeScript interfaces)
├── schemas.ts                  # Validation Rules (Zod schemas)
├── constants.ts                # Configuration & Constants
├── actions.ts                  # Server Actions (Application Layer)
├── index.ts                    # Public API (Barrel Export)
│
├── server/                     # Backend Layer
│   ├── service.ts             # Business Logic
│   ├── queries.ts             # Data Queries
│   └── repository.ts          # Data Access
│
├── utils/                      # 🔥 Pure Utilities
│   ├── product.helpers.ts     # Product calculations
│   ├── product.formatters.ts  # Display formatting
│   ├── inventory.metrics.ts   # Aggregations & metrics
│   ├── import.ts              # Import logic
│   ├── export.ts              # Export logic
│   ├── filterPresets.ts       # Filter management
│   └── index.ts               # Barrel export
│
├── hooks/                      # 🔥 Custom Hooks (React Logic Layer)
│   ├── useInventoryQuery.ts   # Data fetching
│   ├── useProductMetrics.ts   # Business logic hook
│   ├── useProductFilters.ts   # Filtering logic
│   ├── useCategoryFilters.ts  # Category filtering
│   └── index.ts               # Barrel export
│
├── context/                    # State Management
│   └── InventoryContext.tsx
│
└── ui/                         # Presentation Layer
    ├── components/
    │   ├── categories/        # 🔥 Category components
    │   │   ├── CategoryCard.tsx
    │   │   ├── CategoryFilters.tsx
    │   │   └── index.ts
    │   ├── products/          # 🔥 Product components
    │   │   ├── ProductCard.tsx
    │   │   ├── ProductFilters.tsx
    │   │   └── index.ts
    │   ├── overview/          # 🔥 Overview components
    │   │   ├── AlertsCard.tsx
    │   │   └── index.ts
    │   ├── shared/            # Shared UI components
    │   ├── modals/            # Modal components
    │   ├── filters/           # Filter components
    │   ├── bulk/              # Bulk action components
    │   └── tabs/              # 🔥 Clean Tabs (~150-200 lines each)
    │       ├── CategoriesTab.tsx
    │       ├── ProductsTab.tsx
    │       ├── OverviewTab.tsx
    │       └── ...
    └── routes/                # Page components
```

---

## 🎯 REGLAS DE DECISIÓN

### 📦 `/utils/` - Pure Functions (No React)

**✅ PONER AQUÍ:**
- Cálculos puros
- Transformaciones de datos
- Formateo (currency, dates, etc)
- Validaciones
- Algoritmos

**❌ NO PONER:**
- Hooks de React
- Componentes
- Lógica con estado
- Side effects

**Ejemplo:**
```typescript
// ✅ BIEN - Pure function
export const calculateStockStatus = (stock: number, minStock: number): StockStatus => {
  if (stock === 0) return "OUT_OF_STOCK";
  if (stock <= minStock) return "LOW_STOCK";
  return "IN_STOCK";
};

// ❌ MAL - Usa hooks
export const useStockStatus = () => {
  const [status, setStatus] = useState(...);
  // Esto va en /hooks
};
```

---

### 🪝 `/hooks/` - Custom Hooks (React Logic)

**✅ PONER AQUÍ:**
- Custom hooks que usan otros hooks
- Lógica de negocio con estado
- useMemo/useCallback complejos
- Efectos (useEffect)
- Integración con Context

**❌ NO PONER:**
- Pure functions (van en /utils)
- Componentes
- JSX/rendering logic

**Ejemplo:**
```typescript
// ✅ BIEN - Custom hook
export const useProductMetrics = () => {
  const { inventory } = useInventoryContext();

  const metrics = useMemo(
    () => calculateInventoryMetrics(inventory.products),
    [inventory.products]
  );

  return metrics;
};

// ❌ MAL - Pure function
export const calculateMetrics = (products) => {
  // Esto va en /utils
};
```

---

### 🎨 `/ui/components/{feature}/` - Extracted Components

**✅ SEPARAR CUANDO:**
- Componente > 80 líneas
- Se usa en 2+ lugares
- Tiene lógica compleja interna
- Necesita tests propios
- Tiene estado complejo

**❌ MANTENER EN TAB CUANDO:**
- Componente < 80 líneas
- Muy específico del tab
- Lógica simple de presentación
- No se reutilizará

**Ejemplo de estructura:**
```typescript
// src/features/inventory/ui/components/categories/CategoryCard.tsx

export interface CategoryCardProps {
  category: CategoryWithRelations;
  onView: (category: CategoryWithRelations) => void;
  onEdit: (category: CategoryWithRelations) => void;
  onDelete: (category: CategoryWithRelations) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onView,
  onEdit,
  onDelete,
}) => {
  // Componente reutilizable, testeableindependientemente
  return (
    <div className="...">
      {/* Card UI */}
    </div>
  );
};
```

---

### 📑 `/ui/components/tabs/` - Clean Tabs

**Objetivo:** Tabs de ~150-200 líneas que SOLO orquestan

**✅ UN TAB DEBERÍA:**
- Importar componentes de `/components/{feature}/`
- Usar hooks de `/hooks/`
- Orquestar componentes
- Manejar modals/dialogs
- Ser fácil de entender en < 2 minutos

**❌ UN TAB NO DEBERÍA:**
- Tener componentes internos > 50 líneas
- Tener cálculos complejos inline
- Duplicar código de otros tabs
- Tener lógica de negocio

**Ejemplo de Tab Limpio:**
```typescript
// src/features/inventory/ui/components/tabs/CategoriesTab.tsx

import { CategoryCard } from "../categories/CategoryCard";
import { CategoryFilters } from "../categories/CategoryFilters";
import { useCategoryFilters } from "../../hooks/useCategoryFilters";

const CategoriesTab: React.FC = () => {
  const { filteredCategories, ...filterProps } = useCategoryFilters(categories);

  return (
    <TabWrapper>
      <TabHeader title="Categorías" ... />

      <CategoryFilters {...filterProps} />

      {isLoading ? (
        <TabLoadingSkeleton />
      ) : (
        <div className="grid ...">
          {filteredCategories.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </TabWrapper>
  );
};
```

---

## 🔄 FLUJO DE DATOS

```
┌─────────────┐
│   Server    │ (actions.ts, server/)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Hooks     │ (useInventoryQuery, useProductMetrics)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Context   │ (InventoryContext)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Tabs       │ (OverviewTab, CategoriesTab) - Orquestación
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Components  │ (CategoryCard, ProductCard) - Presentación
└─────────────┘

Helpers (/utils) pueden ser usados en CUALQUIER capa
```

---

## 📝 CONVENCIONES DE NOMBRES

### Archivos:
- **Components**: `PascalCase.tsx` (e.g., `CategoryCard.tsx`)
- **Hooks**: `camelCase.ts` con prefijo `use` (e.g., `useProductMetrics.ts`)
- **Utils**: `camelCase.ts` descriptivo (e.g., `product.helpers.ts`)
- **Types**: `types.ts`, `schemas.ts`, `constants.ts`

### Exports:
- **Named exports** para componentes y hooks
- **Barrel exports** (`index.ts`) en cada carpeta
- **Type exports** junto con implementación

### Funciones:
- **Helpers**: verbos descriptivos (e.g., `calculateStockStatus`, `formatCurrency`)
- **Hooks**: prefijo `use` (e.g., `useProductMetrics`)
- **Components**: sustantivos (e.g., `CategoryCard`, `ProductList`)

---

## 🧪 TESTING STRATEGY

### Utils (Pure Functions)
```typescript
// product.helpers.test.ts
describe('calculateStockStatus', () => {
  it('returns OUT_OF_STOCK when stock is 0', () => {
    expect(calculateStockStatus(0, 10)).toBe('OUT_OF_STOCK');
  });
});
```

### Hooks
```typescript
// useProductMetrics.test.ts
import { renderHook } from '@testing-library/react-hooks';

describe('useProductMetrics', () => {
  it('calculates metrics correctly', () => {
    const { result } = renderHook(() => useProductMetrics());
    expect(result.current.inventoryMetrics.totalProducts).toBe(100);
  });
});
```

### Components
```typescript
// CategoryCard.test.tsx
import { render, screen } from '@testing-library/react';

describe('CategoryCard', () => {
  it('renders category name', () => {
    render(<CategoryCard category={mockCategory} />);
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });
});
```

---

## ✅ CHECKLIST DE REFACTORIZACIÓN

Cuando refactorices un tab, sigue estos pasos:

### 1. Identificar código a extraer
- [ ] ¿Hay funciones puras? → `/utils/`
- [ ] ¿Hay useMemo/useCallback complejos? → `/hooks/`
- [ ] ¿Hay componentes > 80 líneas? → `/ui/components/{feature}/`

### 2. Crear archivos
- [ ] Crear archivos en carpetas correctas
- [ ] Agregar documentación JSDoc
- [ ] Exportar en barrel exports

### 3. Actualizar tab
- [ ] Importar de nuevas ubicaciones
- [ ] Eliminar código duplicado
- [ ] Simplificar lógica
- [ ] Verificar que tab < 200 líneas

### 4. Verificar
- [ ] ESLint pasa
- [ ] TypeScript compila
- [ ] Tests pasan
- [ ] Funcionalidad intacta

---

## 📚 RECURSOS

### Archivos creados en este refactor:
1. `/utils/product.helpers.ts` - Cálculos de productos
2. `/utils/product.formatters.ts` - Formateo de datos
3. `/utils/inventory.metrics.ts` - Métricas agregadas
4. `/utils/index.ts` - Barrel export
5. `/hooks/useProductMetrics.ts` - Métricas hook
6. `/hooks/useProductFilters.ts` - Filtrado hook
7. `/hooks/useCategoryFilters.ts` - Filtrado categorías
8. `/hooks/index.ts` - Barrel export actualizado

### Próximos pasos:
- Extraer componentes de categories (CategoryCard, CategoryFilters)
- Refactorizar OverviewTab para usar nuevos utils/hooks
- Aplicar mismo patrón a otros tabs
- Documentar casos de uso específicos

---

## 🎯 OBJETIVO FINAL

**Un tab limpio se ve así:**

```typescript
const MyTab = () => {
  // 1. Hooks (lógica)
  const { data, loading } = useMyData();
  const { filtered, filters } = useMyFilters(data);

  // 2. Handlers (callbacks)
  const handleAction = () => { ... };

  // 3. Render (presentación)
  return (
    <TabWrapper>
      <TabHeader title="My Tab" />
      <MyFilters {...filters} />
      {loading ? <Loading /> : <MyGrid items={filtered} />}
    </TabWrapper>
  );
};
```

**~150 líneas máximo. Claro. Mantenible. Testeable.**

---

Created: 2025-01-27
Author: Architecture Refactor - Inventory Module
Status: ✅ Active Pattern
