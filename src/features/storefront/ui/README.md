# 🛒 Storefront UI

Clean, modular UI architecture for the storefront customer-facing interface.

## 📁 Estructura

```
ui/
├── components/              # Componentes compartidos globalmente
│   └── shared/             # Reutilizables por TODAS las features
│       ├── ProductCard.tsx
│       ├── PriceDisplay.tsx
│       ├── ProductSkeleton.tsx
│       └── ...
│
├── features/               # ⭐ UN FOLDER POR CADA TAB/FEATURE
│   │
│   ├── overview/          # Tab: Inicio/Overview
│   │   ├── components/    # Subcomponentes específicos
│   │   ├── types/        # Tipos TypeScript
│   │   ├── OverviewTab.tsx
│   │   └── index.ts
│   │
│   ├── products/          # Tab: Productos
│   │   ├── components/
│   │   ├── types/
│   │   ├── ProductsTab.tsx
│   │   └── index.ts
│   │
│   ├── wishlist/          # Tab: Lista de Deseos
│   │   ├── components/
│   │   ├── types/
│   │   ├── WishlistTab.tsx
│   │   └── index.ts
│   │
│   ├── account/           # Tab: Mi Cuenta
│   │   ├── components/
│   │   │   ├── AccountHeader.tsx
│   │   │   ├── AccountNavigation.tsx
│   │   │   ├── AccountStats.tsx
│   │   │   └── OrdersSection.tsx
│   │   ├── types/
│   │   ├── utils/
│   │   ├── AccountTab.tsx
│   │   └── index.ts
│   │
│   ├── categories/        # Tab: Categorías
│   │   ├── CategoriesTab.tsx
│   │   └── index.ts
│   │
│   ├── support/           # Tab: Soporte
│   │   ├── SupportTab.tsx
│   │   └── index.ts
│   │
│   ├── cart/              # Tab: Carrito de Compras
│   │   ├── components/
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   ├── CartEmpty.tsx
│   │   │   └── CartBadge.tsx
│   │   ├── CartTab.tsx
│   │   └── index.ts
│   │
│   ├── checkout/          # Tab: Proceso de Pago
│   │   ├── CheckoutTab.tsx
│   │   └── index.ts
│   │
│   ├── orders/            # Componentes compartidos de orders
│   │   ├── OrderDetailsModal.tsx
│   │   └── index.ts
│   │
│   └── index.ts           # Barrel export de todas las features
│
├── routes/
│   └── storefront.screen.tsx  # Main SPA screen
│
└── styles/
    └── animations.css         # Custom animations

```

## 🎯 Estándar: Feature-First Architecture

### Principios

1. **Un folder por feature/tab**
   - Cada tab tiene su propio folder en `features/`
   - El archivo principal es `*Tab.tsx`
   - Subcomponentes van en `components/`

2. **Componentes compartidos**
   - `ui/components/shared/` - Compartidos por TODAS las features
   - `feature/components/` - Específicos de esa feature únicamente

3. **Organización interna de cada feature**
   ```
   feature/
   ├── components/      # Subcomponentes (Header, Grid, Filters, etc.)
   ├── types/          # Tipos TypeScript específicos
   ├── utils/          # Funciones utilitarias (opcional)
   ├── FeatureTab.tsx  # Componente principal del tab
   └── index.ts        # Barrel exports
   ```

4. **Imports limpios**
   ```typescript
   // ✅ CORRECTO - Import desde features
   import { ProductsTab, WishlistTab } from "@/features/storefront/ui/features";

   // ✅ CORRECTO - Import compartidos
   import { ProductCard } from "@/features/storefront/ui/components/shared";

   // ❌ INCORRECTO - No importar desde tabs/
   import { ProductsTab } from "../components/tabs/ProductsTab";
   ```

## 📊 Migración Completada

### Antes (Redundante)
```
components/
├── tabs/
│   ├── AccountTab.tsx         ❌ Duplicado
│   ├── CategoriesTab.tsx
│   └── SupportTab.tsx
├── overview/
│   └── OverviewTab.tsx        ❌ Duplicado
├── products/
│   └── ProductsTab.tsx        ❌ Duplicado
└── wishlist/
    └── WishlistTab.tsx        ❌ Duplicado
```

### Después (Limpio)
```
features/
├── overview/
│   └── OverviewTab.tsx        ✅ Organizado
├── products/
│   └── ProductsTab.tsx        ✅ Organizado
├── wishlist/
│   └── WishlistTab.tsx        ✅ Organizado
├── account/
│   └── AccountTab.tsx         ✅ Organizado
├── categories/
│   └── CategoriesTab.tsx      ✅ Organizado
└── support/
    └── SupportTab.tsx         ✅ Organizado
```

## 🚀 Cómo Usar

### Importar un Tab
```typescript
import { OverviewTab } from "@/features/storefront/ui/features";
import { ProductsTab } from "@/features/storefront/ui/features/products";
```

### Importar Componentes Compartidos
```typescript
import { ProductCard, PriceDisplay } from "@/features/storefront/ui/components/shared";
```

### Crear un Nuevo Tab
1. Crear folder en `features/nuevo-tab/`
2. Crear `NuevoTab.tsx`
3. Crear `index.ts` con exports
4. Agregar componentes específicos en `components/` si es necesario
5. Exportar desde `features/index.ts`

## ✨ Beneficios

- ✅ **Sin Redundancia:** Un solo lugar para cada feature
- ✅ **Fácil de Navegar:** Estructura predecible
- ✅ **Modular:** Componentes bien encapsulados
- ✅ **Escalable:** Fácil agregar nuevas features
- ✅ **Imports Limpios:** Rutas claras y consistentes

## 📝 Notas

- La carpeta `debug/` contiene componentes de debugging temporal
- Los componentes en `shared/` deben ser verdaderamente reutilizables
- Cada feature debe tener su propio `index.ts` para barrel exports
