# 🏗️ ARQUITECTURA: INVENTORY, POS Y STOREFRONT

**Fecha**: 2025-01-29
**Arquitecto**: Sistema de E-commerce Multi-Canal
**Decisión**: Single Inventory Source con Multiple Sales Channels

---

## 🎯 PROBLEMA A RESOLVER

Necesitas un sistema que soporte:

1. ✅ **Tienda Online** (Storefront) - Sin POS
2. ✅ **Punto de Venta** (POS) - Sin Tienda Online
3. ✅ **Ambos** (Tienda + POS) - Inventory compartido
4. ✅ **Solo Inventory** - Sin ventas, solo gestión

---

## 💡 SOLUCIÓN PROFESIONAL: ARQUITECTURA OMNICHANNEL

### Patrón: **Single Source of Truth with Multiple Sales Channels**

```
┌─────────────────────────────────────────────────────────────┐
│                      📦 INVENTORY                           │
│                   (Single Source of Truth)                  │
│                                                             │
│  • Products (SKU, name, cost, stock)                       │
│  • Categories                                               │
│  • Suppliers                                                │
│  • Stock Management                                         │
│  • Pricing Rules                                            │
│                                                             │
│  ⚡ Esta es la ÚNICA fuente de verdad para productos       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (consume)
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────────┐                    ┌──────────────────┐
│   🛒 STOREFRONT   │                    │     🏪 POS       │
│  (Sales Channel)  │                    │ (Sales Channel)  │
│                   │                    │                  │
│ • Public catalog  │                    │ • In-store sales │
│ • Cart            │                    │ • Cash register  │
│ • Checkout        │                    │ • Receipts       │
│ • Orders          │                    │ • Shift mgmt     │
│ • Wishlist        │                    │ • Barcode scan   │
│ • Reviews         │                    │ • Split payment  │
│                   │                    │                  │
│ Feature Flag:     │                    │ Feature Flag:    │
│ storefront        │                    │ pos              │
└───────────────────┘                    └──────────────────┘
        │                                           │
        └─────────────┬─────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │    📊 SHARED MODELS     │
        │                         │
        │  • Order (unified)      │
        │  • Transaction          │
        │  • Stock Movement       │
        │  • Analytics            │
        └─────────────────────────┘
```

---

## 🗂️ ARQUITECTURA DE MÓDULOS

### 1. **INVENTORY** (Core Module) 🏗️

**Propósito**: Single source of truth para todos los productos

**Responsabilidades**:
- ✅ CRUD de productos
- ✅ Gestión de stock (aumentar/disminuir)
- ✅ Categorías y suppliers
- ✅ Pricing management
- ✅ Stock alerts (low stock)
- ✅ Product variants (sizes, colors, etc)
- ✅ Bulk operations

**Feature Flag**: `inventory` (siempre ON si tienes e-commerce o POS)

**Ubicación**: `src/features/inventory/`

**No depende de**: Ningún otro módulo de ventas

**Consumido por**: Storefront, POS, Admin Dashboard

---

### 2. **STOREFRONT** (Sales Channel) 🛒

**Propósito**: Canal de ventas online para clientes

**Responsabilidades**:
- ✅ Catálogo público (consume de Inventory)
- ✅ Shopping cart
- ✅ Checkout con Stripe
- ✅ Wishlist
- ✅ Customer orders
- ✅ Reviews y ratings
- ✅ Search & filters
- ✅ Coupons

**Feature Flag**: `storefront`

**Ubicación**: `src/features/storefront/`

**Depende de**: `inventory` (read-only)

**Escribe en**: `Order`, `Cart`, `Wishlist`, `Review`

**NO toca**: `Product.stock` directamente (solo via Order creation)

---

### 3. **POS** (Sales Channel) 🏪

**Propósito**: Canal de ventas en tienda física

**Responsabilidades**:
- ✅ In-store sales
- ✅ Cash register management
- ✅ Barcode scanning
- ✅ Split payments (cash + card)
- ✅ Receipt printing
- ✅ Shift management
- ✅ Quick checkout
- ✅ Returns & exchanges

**Feature Flag**: `pos`

**Ubicación**: `src/features/pos/` (TO CREATE)

**Depende de**: `inventory` (read-only)

**Escribe en**: `Order`, `Transaction`, `CashRegisterSession`

**NO toca**: `Product.stock` directamente (solo via Order creation)

---

### 4. **SELLER PORTAL** (Admin Module) 👨‍💼

**Propósito**: Dashboard para el dueño/vendedor

**Responsabilidades**:
- ✅ Ver todas las orders (online + POS)
- ✅ Gestionar tracking de envíos
- ✅ Responder reviews
- ✅ Ver analytics
- ✅ Gestionar inventory (via Inventory module)
- ✅ Configurar promociones
- ✅ Reports & insights

**Feature Flag**: `sellerPortal` (se activa si tienes storefront O pos)

**Ubicación**: `src/features/seller-portal/` (TO CREATE)

**Depende de**: `inventory`, `storefront` (si activo), `pos` (si activo)

---

## 📊 DATABASE SCHEMA DESIGN

### Enfoque: **Shared Models con Channel Identifier**

```prisma
// ═══════════════════════════════════════════════════════════
// 📦 INVENTORY (Core - Always exists)
// ═══════════════════════════════════════════════════════════

model Product {
  id          String   @id @default(cuid())
  sku         String   @unique
  name        String
  description String?

  // 💰 Pricing
  cost        Decimal  // Costo (private)
  price       Decimal  // Precio base (interno)
  publicPrice Decimal? // Precio público (puede ser diferente)

  // 📦 Stock (SINGLE SOURCE OF TRUTH)
  stock       Int      @default(0)
  minStock    Int      @default(5)
  maxStock    Int?

  // 🏷️ Metadata
  categoryId  String
  supplierId  String?
  isActive    Boolean  @default(true)
  isPublic    Boolean  @default(false) // Mostrar en storefront?

  // Relations
  category    Category @relation(...)
  orders      OrderItem[]

  // Storefront-specific (optional)
  wishlistItems WishlistItem[] // Only if storefront enabled
  reviews       Review[]       // Only if storefront enabled

  @@map("products")
}

// ═══════════════════════════════════════════════════════════
// 📋 ORDERS (Unified - usado por Storefront Y POS)
// ═══════════════════════════════════════════════════════════

model Order {
  id              String      @id @default(cuid())
  number          String      @unique // ORD-12345

  // 🏪 CRITICAL: Sales Channel identifier
  channel         SalesChannel @default(ONLINE) // ONLINE, POS, PHONE, etc

  // 👤 Customer info
  userId          String?     // Null for guest or POS walk-in
  email           String
  phone           String?

  // 📦 Order details
  status          OrderStatus
  paymentStatus   PaymentStatus
  paymentMethod   String      // STRIPE, CASH, CARD, MIXED

  // 💰 Totals
  subtotal        Decimal
  taxAmount       Decimal
  shippingCost    Decimal     @default(0) // 0 for POS
  total           Decimal

  // 🚚 Shipping (only for ONLINE)
  shippingMethod  String?
  shippingAddress Json?       // Null for POS
  trackingNumber  String?     // Only for shipped orders

  // 🏪 POS-specific (only for POS orders)
  cashRegisterSessionId String? // Link to POS session
  posTerminalId         String? // Which terminal

  // 📅 Timestamps
  placedAt        DateTime    @default(now())
  shippedAt       DateTime?
  deliveredAt     DateTime?

  items           OrderItem[]

  @@index([channel])
  @@index([status])
  @@index([userId])
  @@map("orders")
}

enum SalesChannel {
  ONLINE      // Storefront
  POS         // Point of Sale
  PHONE       // Phone order
  WHOLESALE   // B2B order
}

// ═══════════════════════════════════════════════════════════
// 💰 TRANSACTIONS (Unified payment tracking)
// ═══════════════════════════════════════════════════════════

model Transaction {
  id              String      @id @default(cuid())
  orderId         String
  channel         SalesChannel

  type            TransactionType // SALE, REFUND, VOID
  method          PaymentMethod   // STRIPE, CASH, CARD

  amount          Decimal
  status          String      // PENDING, COMPLETED, FAILED

  // Stripe-specific
  stripePaymentIntentId String?

  // POS-specific
  cashAmount      Decimal?
  cardAmount      Decimal?
  changeGiven     Decimal?

  createdAt       DateTime    @default(now())

  order           Order       @relation(...)

  @@map("transactions")
}

// ═══════════════════════════════════════════════════════════
// 📊 STOCK MOVEMENTS (Audit trail)
// ═══════════════════════════════════════════════════════════

model StockMovement {
  id          String          @id @default(cuid())
  productId   String

  type        StockMovementType // SALE, PURCHASE, ADJUSTMENT, RETURN
  channel     SalesChannel?     // Which channel caused it

  quantity    Int               // Positive or negative
  previousStock Int
  newStock    Int

  // Reference
  orderId     String?
  notes       String?

  createdAt   DateTime        @default(now())
  createdBy   String?

  product     Product         @relation(...)

  @@index([productId])
  @@index([type])
  @@map("stock_movements")
}
```

---

## 🔧 FEATURE FLAGS CONFIGURATION

### En `src/core/config/features.ts`:

```typescript
export const FEATURE_FLAGS = {
  // Core modules
  inventory: true,        // Always ON (base requirement)

  // Sales channels (can be independent)
  storefront: true,       // E-commerce online
  pos: false,             // Point of Sale (futuro)

  // Admin modules (conditional)
  sellerPortal: true,     // Shows if storefront OR pos is enabled

  // Optional features
  reviews: true,          // Product reviews (storefront only)
  coupons: true,          // Discount system
  loyalty: false,         // Points/rewards program
} as const;
```

### Lógica de Activación:

```typescript
// Seller Portal se muestra si tienes al menos un canal de ventas
const showSellerPortal = FEATURE_FLAGS.storefront || FEATURE_FLAGS.pos;

// Reviews solo si tienes storefront
const showReviews = FEATURE_FLAGS.storefront && FEATURE_FLAGS.reviews;

// POS requiere inventory
if (FEATURE_FLAGS.pos && !FEATURE_FLAGS.inventory) {
  throw new Error("POS requires inventory module");
}
```

---

## 🏢 SELLER PORTAL STRUCTURE

### Ubicación: `src/features/seller-portal/`

```
src/features/seller-portal/
├── ui/
│   ├── routes/
│   │   └── seller-portal.screen.tsx       # Main screen
│   ├── components/
│   │   ├── tabs/
│   │   │   ├── OrdersTab.tsx              # Manage orders
│   │   │   ├── TrackingTab.tsx            # Shipping tracking
│   │   │   ├── ReviewsTab.tsx             # Customer reviews
│   │   │   ├── ProductsTab.tsx            # Products for sale
│   │   │   ├── AnalyticsTab.tsx           # Sales analytics
│   │   │   └── SettingsTab.tsx            # Store settings
│   │   └── shared/
│   │       ├── OrderCard.tsx
│   │       ├── TrackingForm.tsx
│   │       └── ReviewCard.tsx
│   └── context/
│       └── SellerPortalContext.tsx
├── hooks/
│   ├── useOrders.ts                        # Get all orders (online + POS)
│   ├── useUpdateTracking.ts
│   └── useReviews.ts
├── server/
│   ├── actions.ts                          # Server actions
│   ├── queries.ts                          # Database queries
│   └── service.ts                          # Business logic
└── types/
    └── index.ts                            # TypeScript types
```

### Tabs del Seller Portal:

1. **📦 Orders** - Ver y gestionar todas las órdenes
   - Filtrar por canal (online/POS)
   - Filtrar por estado
   - Bulk actions
   - Export to CSV

2. **🚚 Tracking** - Gestionar envíos
   - Ingresar tracking numbers
   - Actualizar estados
   - Ver timeline
   - Integración con carriers

3. **⭐ Reviews** - Gestionar reviews
   - Ver reviews pendientes
   - Responder a reviews
   - Reportar reviews inapropiadas
   - Analytics de ratings

4. **📦 Products** - Gestión rápida
   - Ver productos en venta
   - Toggle public/private
   - Quick price updates
   - Link a Inventory completo

5. **📊 Analytics** - Métricas de ventas
   - Ventas por canal
   - Top products
   - Revenue trends
   - Customer insights

6. **⚙️ Settings** - Configuración
   - Store info
   - Shipping methods
   - Tax settings
   - Notifications

---

## 🔄 FLUJO DE STOCK MANAGEMENT

### Cuando se crea una orden (cualquier canal):

```typescript
// 1. Orden creada en Storefront o POS
const order = await createOrder({
  channel: 'ONLINE', // o 'POS'
  items: [
    { productId: 'abc', quantity: 2 }
  ]
});

// 2. Inventory Service reduce stock automáticamente
await inventoryService.reduceStock({
  productId: 'abc',
  quantity: 2,
  reason: {
    type: 'SALE',
    channel: 'ONLINE',
    orderId: order.id
  }
});

// 3. StockMovement creado para audit trail
await createStockMovement({
  productId: 'abc',
  type: 'SALE',
  channel: 'ONLINE',
  quantity: -2,
  previousStock: 10,
  newStock: 8,
  orderId: order.id
});

// 4. Alert si low stock
if (newStock <= product.minStock) {
  await sendLowStockAlert(product);
}
```

### Cuando se cancela/reembolsa:

```typescript
// 1. Orden cancelada
await cancelOrder(orderId);

// 2. Stock restaurado automáticamente
await inventoryService.restoreStock({
  productId: 'abc',
  quantity: 2,
  reason: {
    type: 'RETURN',
    orderId: orderId
  }
});
```

---

## 🎯 VENTAJAS DE ESTA ARQUITECTURA

### ✅ **Flexibility**
- Puedes activar solo Storefront
- Puedes activar solo POS
- Puedes activar ambos
- Puedes agregar más canales (Phone, Wholesale)

### ✅ **Single Source of Truth**
- Stock siempre consistente
- No hay sincronización manual
- Un solo lugar para gestionar productos

### ✅ **Scalability**
- Fácil agregar nuevos canales
- Módulos independientes
- Feature flags granulares

### ✅ **Maintainability**
- Código organizado por feature
- Dependencias claras
- Fácil de testear

### ✅ **Business Logic Correcta**
- Inventory = Truth source
- Storefront = Read + Create Orders
- POS = Read + Create Orders
- Seller Portal = Manage Everything

---

## 📋 NAVIGATION STRUCTURE

### Main Navigation (con feature flags):

```typescript
// src/shared/components/layout/navigation.tsx

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    enabled: true, // Always
  },

  // ═══════════════════════════════════════════
  // INVENTORY (Core)
  // ═══════════════════════════════════════════
  {
    name: 'Inventory',
    href: '/inventory',
    icon: BoxIcon,
    enabled: FEATURE_FLAGS.inventory,
    description: 'Gestionar productos, stock y suppliers'
  },

  // ═══════════════════════════════════════════
  // SALES CHANNELS
  // ═══════════════════════════════════════════
  {
    name: 'Storefront',
    href: '/storefront',
    icon: ShoppingBagIcon,
    enabled: FEATURE_FLAGS.storefront,
    description: 'Ver tienda online como cliente'
  },
  {
    name: 'POS',
    href: '/pos',
    icon: CashRegisterIcon,
    enabled: FEATURE_FLAGS.pos,
    description: 'Punto de venta en tienda física'
  },

  // ═══════════════════════════════════════════
  // SELLER MANAGEMENT
  // ═══════════════════════════════════════════
  {
    name: 'Seller Portal',
    href: '/seller-portal',
    icon: StoreIcon,
    enabled: FEATURE_FLAGS.sellerPortal, // Auto-enabled if storefront OR pos
    description: 'Gestionar órdenes, envíos y reviews',
    badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
  },
];
```

---

## 🔐 PERMISSIONS & ROLES

```typescript
// Different users have different access

// Owner/Admin - Full access
{
  inventory: true,
  sellerPortal: true,
  storefront: true,
  pos: true,
}

// Store Manager - Sales only
{
  inventory: false,      // Read-only
  sellerPortal: true,
  pos: true,
}

// Warehouse Staff - Inventory only
{
  inventory: true,
  sellerPortal: false,
  pos: false,
}
```

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Seller Portal Foundation (Esta semana)

1. ✅ Crear estructura `src/features/seller-portal/`
2. ✅ Orders Management Tab
   - Ver todas las órdenes
   - Filtrar por canal/estado
   - Ver detalles
3. ✅ Tracking Management
   - Ingresar tracking numbers
   - Actualizar estados
   - Timeline visual

### Phase 2: Reviews & Products (Próxima semana)

4. ✅ Reviews Management Tab
5. ✅ Products Quick Management Tab
6. ✅ Analytics básicos

### Phase 3: POS System (Futuro - 2-3 semanas)

7. ✅ Crear módulo `src/features/pos/`
8. ✅ Cash register interface
9. ✅ Barcode scanning
10. ✅ Receipt printing

---

## 💡 DECISIÓN FINAL: TU CASO

### Configuración Actual Recomendada:

```typescript
// config/features.ts
export const FEATURE_FLAGS = {
  // ✅ Core (siempre ON)
  inventory: true,

  // ✅ Tu tienda online (activo)
  storefront: true,

  // ⏳ POS (futuro, OFF por ahora)
  pos: false,

  // ✅ Seller Portal (ON porque tienes storefront)
  sellerPortal: true,

  // ✅ Features opcionales
  reviews: true,
  coupons: true,
  loyalty: false, // Futuro
};
```

### Estructura de Carpetas:

```
src/features/
├── inventory/              ✅ EXISTE - Mantener
│   └── (gestión de productos y stock)
│
├── storefront/             ✅ EXISTE - Mantener
│   └── (tienda online para clientes)
│
├── seller-portal/          🆕 CREAR - Esta semana
│   └── (portal para gestionar ventas)
│
└── pos/                    ⏳ FUTURO - Fase 3
    └── (punto de venta físico)
```

---

## ✅ RESUMEN EJECUTIVO

### Respuestas a tus preguntas:

**Q: ¿Inventory debe estar dentro de Storefront?**
❌ NO. Inventory es independiente y es consumido por Storefront.

**Q: ¿POS debe manejar su propio inventory?**
❌ NO. POS también consume de Inventory (single source of truth).

**Q: ¿Puedo tener tienda sin POS?**
✅ SÍ. Solo activa `storefront` flag.

**Q: ¿Puedo tener POS sin tienda?**
✅ SÍ. Solo activa `pos` flag.

**Q: ¿Puedo tener ambos?**
✅ SÍ. Activa ambos flags, comparten Inventory.

**Q: ¿Dónde gestiono las órdenes de storefront?**
✅ En **Seller Portal** (nuevo módulo).

---

## 🎯 NEXT STEPS INMEDIATOS

1. ✅ **HOY**: Crear estructura de Seller Portal
2. ✅ **HOY**: Implementar Orders Management Tab
3. ✅ **MAÑANA**: Tracking Management
4. ✅ **ESTA SEMANA**: Reviews Tab + Analytics básicos

**¿Empezamos creando la estructura del Seller Portal?** 🚀
