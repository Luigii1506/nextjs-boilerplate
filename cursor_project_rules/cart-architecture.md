# 🛒 CART FEATURE ARCHITECTURE v1.0.0

## 🎯 **ARQUITECTURA FEATURE-FIRST PARA CART**

El módulo Cart es **independiente y reutilizable** siguiendo los principios Feature-First v3.0.0.

### **📁 ESTRUCTURA COMPLETA:**

```bash
src/features/cart/                     # 🛒 CART FEATURE INDEPENDIENTE
├── hooks/                            # 🧠 HOOKS CENTRALIZADOS
│   ├── cart/                         # 🛍️ Cart-specific hooks
│   │   ├── useCartState.ts           # 🔄 Estado local + reducer + animations
│   │   ├── useCartLogic.ts           # 🧠 Cálculos + validaciones + formateo
│   │   ├── useCartActions.ts         # ⚡ Add/Remove/Update/Checkout actions
│   │   └── index.ts                  # 📤 Barrel export
│   ├── persistence/                  # 💾 Persistencia
│   │   ├── useCartPersistence.ts     # 🔄 localStorage + DB sync
│   │   ├── useCartSync.ts            # 🌐 Online/offline sync
│   │   └── index.ts
│   ├── shared/                       # 🔧 LÓGICA COMPARTIDA
│   │   ├── useCartCalculations.ts    # 💰 Tax, shipping, totals
│   │   ├── useCartValidation.ts      # ✅ Stock validation, limits
│   │   └── index.ts                  # 📤 Barrel export
│   └── index.ts                      # 📤 Main barrel export
├── ui/components/                    # 🎨 COMPONENTES REUTILIZABLES
│   ├── cart/                         # 🛒 Cart UI components
│   │   ├── CartTab.tsx               # 🎯 Tab principal del carrito
│   │   ├── CartItem.tsx              # 🛍️ Item individual del carrito
│   │   ├── CartSummary.tsx           # 💰 Resumen de totales
│   │   ├── CartEmpty.tsx             # 📭 Estado vacío
│   │   ├── CartPreview.tsx           # 👀 Modal de vista rápida
│   │   ├── CartBadge.tsx             # 🏷️ Badge de cantidad
│   │   ├── types/index.ts            # 📋 Types específicos
│   │   └── index.ts                  # 📤 Barrel export
│   ├── shared/                       # 🔧 Shared components
│   │   ├── QuantitySelector.tsx      # 🔢 Selector de cantidad
│   │   ├── PriceDisplay.tsx          # 💵 Display de precios
│   │   └── index.ts
│   └── index.ts
├── server/                           # 🔧 SERVER LOGIC
│   ├── queries.ts                    # 📤 Prisma queries optimizadas
│   ├── service.ts                    # 🏢 Business logic
│   ├── actions.ts                    # ⚡ Server actions para Next.js
│   ├── validators.ts                 # ✅ Validaciones + schemas
│   ├── mappers.ts                    # 🔄 DB → Customer types
│   └── index.ts                      # 📤 Server exports
├── context/                          # 🌍 GLOBAL STATE
│   ├── CartContext.tsx               # 🛒 Cart global state
│   ├── CartProvider.tsx              # 🎁 Provider component
│   └── index.ts
├── types/                            # 📋 TYPES PRINCIPALES
│   ├── models.ts                     # 🏗️ Cart, CartItem interfaces
│   ├── api.ts                        # 🔌 API request/response types
│   ├── hooks.ts                      # 🪝 Hook parameter types
│   └── index.ts                      # 📤 Types export
├── utils/                            # 🛠️ UTILIDADES
│   ├── calculations.ts               # 💰 Tax, shipping, discounts
│   ├── validators.ts                 # ✅ Pure validation functions
│   ├── formatters.ts                 # 🎨 Price, currency formatting
│   └── index.ts
└── index.ts                          # 📤 FEATURE MAIN EXPORT
```

## 🔗 **INTEGRACIÓN CON OTRAS FEATURES:**

### **Storefront Integration:**

```typescript
// src/features/storefront/hooks/products/useProductsActions.ts
import { useCartActions } from "@/features/cart/hooks";

export function useProductsActions() {
  const { addToCart } = useCartActions();

  const onAddToCart = useCallback(
    async (product: ProductForCustomer) => {
      return await addToCart(product.id, 1);
    },
    [addToCart]
  );

  return { onAddToCart /* other actions */ };
}
```

### **Admin Integration:**

```typescript
// src/features/admin/orders/hooks/useManualOrder.ts
import { useCartActions, useCartState } from "@/features/cart/hooks";

export function useManualOrder() {
  const cartState = useCartState();
  const { createOrderFromCart } = useCartActions();

  // Create manual order from cart logic
}
```

## 🎯 **VENTAJAS DE LA ARQUITECTURA INDEPENDIENTE:**

### **✅ Reutilización:**

- **Storefront** - Shopping experience del cliente
- **Admin** - Órdenes manuales, carritos abandonados
- **API** - Headless commerce
- **Mobile** - Apps nativas
- **POS** - Punto de venta

### **✅ Escalabilidad:**

- Cart puede evolucionar independientemente
- Testing aislado y más fácil
- Deploy independiente si es necesario
- Versionado separado

### **✅ Mantenimiento:**

- Separación clara de responsabilidades
- Cambios no impactan otras features
- Desarrollo en paralelo por diferentes devs
- Debug más fácil

## 📋 **TIPOS PRINCIPALES:**

```typescript
// src/features/cart/types/models.ts
export interface Cart {
  id: string;
  sessionId?: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  appliedCoupons: string[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  product: ProductForCustomer; // From storefront types
  quantity: number;
  unitPrice: number;
  total: number;
  addedAt: Date;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
}
```

## 🚀 **HOOKS PATTERN (Feature-First v3.0.0):**

```typescript
// src/features/cart/hooks/cart/index.ts
export { useCartState } from "./useCartState"; // Estado + reducer + animations
export { useCartLogic } from "./useCartLogic"; // Cálculos + validaciones
export { useCartActions } from "./useCartActions"; // Actions + mutations

// Uso en componentes:
import {
  useCartState,
  useCartLogic,
  useCartActions,
} from "@/features/cart/hooks/cart";
```

---

**📅 Versión:** 1.0.0 - Cart Independent Architecture  
**📝 Última actualización:** 2025-01-27  
**🏗️ Basado en:** Feature-First v3.0.0 (storefront-tabs-architecture.md)


