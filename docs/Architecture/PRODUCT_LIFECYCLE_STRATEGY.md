# 🔄 ESTRATEGIA: PRODUCT LIFECYCLE & VISIBILITY

**Fecha**: 2025-01-29
**Decisión**: Multi-State Product Management

---

## 🎯 EL PROBLEMA

**"Tengo productos en inventario que NO quiero vender (todavía o nunca)"**

### Casos de Uso Reales:

#### 1. **Producto en Preparación** 🚧
```
Producto: "iPhone 16 Pro"
- Ya lo compré al proveedor (costo registrado)
- Tengo 20 en stock
- Aún no defino precio de venta
- NO quiero que aparezca en tienda
- Pero SÍ quiero trackear el inventario

Estado: EN INVENTARIO, NO VENDIBLE
```

#### 2. **Producto Interno / No Vendible** 🔒
```
Producto: "Laptop de demostración"
- Es para mostrar en tienda
- NO se vende (demo unit)
- Tengo 3 unidades
- Necesito trackear su existencia
- NUNCA debe aparecer en catálogo

Estado: INVENTARIO INTERNO, NUNCA VENDIBLE
```

#### 3. **Producto Descontinuado** 🚫
```
Producto: "iPhone 13"
- Ya no quiero venderlo
- Tengo 5 unidades restantes
- Mantener en inventario para referencia
- NO mostrar en tienda
- Tal vez reactivar después

Estado: DESCONTINUADO, NO VENDIBLE (temporal)
```

#### 4. **Producto Próximamente** 🎯
```
Producto: "PlayStation 6"
- Pre-anuncio, aún no llega
- Preparando ficha de producto
- Stock: 0 (llegarán 100 unidades)
- Mostrar como "Coming Soon"
- NO vendible aún

Estado: PRÓXIMAMENTE, VISIBLE PERO NO VENDIBLE
```

#### 5. **Producto Agotado** 📦
```
Producto: "iPhone 15 Pro Max"
- Stock: 0
- Agotado temporalmente
- Mostrar en catálogo como "Agotado"
- Permitir "Notificarme cuando llegue"
- NO vendible hasta restock

Estado: AGOTADO, VISIBLE PERO NO COMPRABLE
```

#### 6. **Producto Activo y Vendible** ✅
```
Producto: "iPhone 15"
- Stock: 50 unidades
- Precio definido
- Visible en catálogo
- Vendible en canales activos

Estado: ACTIVO, VENDIBLE
```

---

## 💡 SOLUCIÓN PROFESIONAL: MULTI-STATE MANAGEMENT

### Concepto: **3 Dimensiones de Control**

```
┌─────────────────────────────────────────────────────┐
│              PRODUCT VISIBILITY                     │
│                                                     │
│  1️⃣  EXISTENCE (isActive)                          │
│      ├─ Active: Existe en el sistema               │
│      └─ Inactive: Borrado lógico                   │
│                                                     │
│  2️⃣  VISIBILITY (isPublic / visibility)            │
│      ├─ Public: Visible en catálogo                │
│      ├─ Hidden: No visible, pero existe            │
│      ├─ Internal: Solo uso interno                 │
│      └─ ComingSoon: Visible pero no comprable      │
│                                                     │
│  3️⃣  SALEABILITY (availableChannels)               │
│      ├─ ONLINE: Se puede vender online             │
│      ├─ POS: Se puede vender en tienda             │
│      └─ NONE: No vendible en ningún canal          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🗂️ SCHEMA PRISMA COMPLETO

```prisma
// src/core/database/prisma/models/inventory.prisma

model Product {
  id          String   @id @default(cuid())
  sku         String   @unique
  name        String
  description String?  @db.Text

  // ═══════════════════════════════════════════════════════════
  // 📦 STOCK MANAGEMENT (Siempre trackeable)
  // ═══════════════════════════════════════════════════════════
  stock       Int      @default(0)
  minStock    Int      @default(5)
  maxStock    Int?

  // ═══════════════════════════════════════════════════════════
  // 💰 PRICING
  // ═══════════════════════════════════════════════════════════
  cost        Decimal  @db.Decimal(10, 2)           // Costo (siempre requerido)
  price       Decimal  @db.Decimal(10, 2)           // Precio base
  publicPrice Decimal? @db.Decimal(10, 2)           // Precio público (opcional)

  // ═══════════════════════════════════════════════════════════
  // 🔐 1️⃣ EXISTENCE STATE (Primera capa de control)
  // ═══════════════════════════════════════════════════════════
  isActive    Boolean  @default(true)
  // true  = Producto existe en el sistema
  // false = Borrado lógico (soft delete)

  // ═══════════════════════════════════════════════════════════
  // 👁️ 2️⃣ VISIBILITY STATE (Segunda capa de control)
  // ═══════════════════════════════════════════════════════════
  visibility  ProductVisibility @default(HIDDEN)
  // HIDDEN      = En inventario, no visible en catálogos
  // PUBLIC      = Visible en catálogo público
  // INTERNAL    = Uso interno (demos, muestras)
  // COMING_SOON = Visible pero no comprable
  // DISCONTINUED = Descontinuado (histórico)

  // Deprecated: Solo para backward compatibility
  isPublic    Boolean? @default(false)
  // MIGRAR: isPublic=true -> visibility=PUBLIC
  //         isPublic=false -> visibility=HIDDEN

  // ═══════════════════════════════════════════════════════════
  // 🛒 3️⃣ SALEABILITY (Tercera capa de control)
  // ═══════════════════════════════════════════════════════════
  availableChannels SalesChannel[] @default([])
  // []              = NO vendible en ningún canal
  // [ONLINE]        = Solo vendible online
  // [POS]           = Solo vendible en POS
  // [ONLINE, POS]   = Vendible en ambos

  // ═══════════════════════════════════════════════════════════
  // 🎯 OPCIONAL: Configuración específica
  // ═══════════════════════════════════════════════════════════
  channelConfig     Json? @db.Json
  // Configuración avanzada por canal (min/max qty, etc)

  // ═══════════════════════════════════════════════════════════
  // 📊 CATEGORIZATION
  // ═══════════════════════════════════════════════════════════
  categoryId  String
  supplierId  String?
  barcode     String?  @unique
  unit        String   @default("unit")

  // ═══════════════════════════════════════════════════════════
  // 🎨 MEDIA & METADATA
  // ═══════════════════════════════════════════════════════════
  images      String[] @default([])
  tags        String[] @default([])
  metadata    Json?    @db.Json

  // ═══════════════════════════════════════════════════════════
  // 🌟 SPECIAL FLAGS
  // ═══════════════════════════════════════════════════════════
  featured    Boolean  @default(false) // Destacado en home
  isTaxable   Boolean  @default(true)  // Sujeto a impuestos
  isReturnable Boolean @default(true)  // Aceptar devoluciones

  // ═══════════════════════════════════════════════════════════
  // 📅 TIMESTAMPS
  // ═══════════════════════════════════════════════════════════
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  publishedAt DateTime? // Cuando se hizo público

  // ═══════════════════════════════════════════════════════════
  // 🔗 RELATIONS
  // ═══════════════════════════════════════════════════════════
  category    Category @relation(fields: [categoryId], references: [id])
  supplier    Supplier? @relation(fields: [supplierId], references: [id])

  orderItems     OrderItem[]
  wishlistItems  WishlistItem[]
  reviews        Review[]

  @@index([categoryId])
  @@index([supplierId])
  @@index([isActive])
  @@index([visibility])
  @@index([stock])
  @@map("products")
}

// ═══════════════════════════════════════════════════════════
// 📋 ENUMS
// ═══════════════════════════════════════════════════════════

enum ProductVisibility {
  HIDDEN        // En inventario, no público
  PUBLIC        // Visible y vendible (si tiene canales)
  INTERNAL      // Uso interno (demos, no venta)
  COMING_SOON   // Visible pero no comprable aún
  DISCONTINUED  // Descontinuado (no ocultar historial)
}

enum SalesChannel {
  ONLINE      // E-commerce
  POS         // Punto de venta físico
  PHONE       // Órdenes telefónicas
  WHOLESALE   // B2B
}
```

---

## 📊 MATRIZ DE ESTADOS Y COMPORTAMIENTOS

| Estado | `isActive` | `visibility` | `availableChannels` | En Inventory | En Storefront | Vendible |
|--------|-----------|--------------|---------------------|--------------|---------------|----------|
| **Borrado** | ❌ false | - | - | ❌ No | ❌ No | ❌ No |
| **Solo Inventario** | ✅ true | `HIDDEN` | `[]` | ✅ Sí | ❌ No | ❌ No |
| **Demo/Interno** | ✅ true | `INTERNAL` | `[]` | ✅ Sí | ❌ No | ❌ No |
| **Próximamente** | ✅ true | `COMING_SOON` | `[]` | ✅ Sí | 👁️ Visible | ❌ No |
| **Descontinuado** | ✅ true | `DISCONTINUED` | `[]` | ✅ Sí | ❌ No | ❌ No |
| **Preparando** | ✅ true | `HIDDEN` | `[]` | ✅ Sí | ❌ No | ❌ No |
| **Agotado** | ✅ true | `PUBLIC` | `[ONLINE]` | ✅ Sí | 👁️ "Agotado" | ❌ No (stock=0) |
| **Activo Online** | ✅ true | `PUBLIC` | `[ONLINE]` | ✅ Sí | ✅ Sí | ✅ Sí |
| **Activo POS** | ✅ true | `PUBLIC` | `[POS]` | ✅ Sí | ❌ No | ✅ Sí (POS) |
| **Activo Ambos** | ✅ true | `PUBLIC` | `[ONLINE,POS]` | ✅ Sí | ✅ Sí | ✅ Sí |

---

## 🔍 QUERIES POR CONTEXTO

### 1. Inventory (Admin) - VER TODO

```typescript
// Ver TODOS los productos (excepto borrados)
const products = await prisma.product.findMany({
  where: {
    isActive: true, // Solo activos (no borrados)
    // NO filtrar por visibility ni channels
  },
  orderBy: { updatedAt: 'desc' }
});

// Con stats de visibilidad
const stats = {
  total: products.length,
  public: products.filter(p => p.visibility === 'PUBLIC').length,
  hidden: products.filter(p => p.visibility === 'HIDDEN').length,
  internal: products.filter(p => p.visibility === 'INTERNAL').length,
  comingSoon: products.filter(p => p.visibility === 'COMING_SOON').length,
  discontinued: products.filter(p => p.visibility === 'DISCONTINUED').length,
};
```

### 2. Storefront (Cliente) - SOLO VENDIBLES

```typescript
// Solo productos PÚBLICOS, ONLINE, con STOCK
const products = await prisma.product.findMany({
  where: {
    isActive: true,
    visibility: 'PUBLIC',                    // ✅ Debe ser público
    availableChannels: { has: 'ONLINE' },   // ✅ Disponible online
    stock: { gt: 0 },                       // ✅ Con stock
  },
  orderBy: { featured: 'desc' }
});
```

### 3. POS (Vendedor) - SOLO POS + STOCK

```typescript
// Solo productos para POS con stock
const products = await prisma.product.findMany({
  where: {
    isActive: true,
    visibility: {
      in: ['PUBLIC', 'INTERNAL'] // POS puede vender internos también
    },
    availableChannels: { has: 'POS' },
    stock: { gt: 0 },
  },
  orderBy: { name: 'asc' }
});
```

### 4. Seller Portal - PRODUCTOS A LA VENTA

```typescript
// Productos actualmente en venta (cualquier canal)
const products = await prisma.product.findMany({
  where: {
    isActive: true,
    visibility: 'PUBLIC',
    availableChannels: {
      isEmpty: false // Al menos 1 canal
    },
    stock: { gt: 0 },
  }
});
```

### 5. Seller Portal - PRODUCTOS NO VENDIBLES

```typescript
// Productos en inventario pero NO vendibles
const products = await prisma.product.findMany({
  where: {
    isActive: true,
    OR: [
      { visibility: { not: 'PUBLIC' } },     // No público
      { availableChannels: { isEmpty: true } }, // Sin canales
      { stock: { lte: 0 } },                 // Sin stock
    ]
  }
});
```

---

## 🎨 UI COMPONENTS

### Product Status Badge

```tsx
// src/features/inventory/ui/components/ProductStatusBadge.tsx

type ProductStatus = {
  isActive: boolean;
  visibility: ProductVisibility;
  availableChannels: SalesChannel[];
  stock: number;
};

function ProductStatusBadge({ product }: { product: ProductStatus }) {
  // Calcular estado efectivo
  const status = getProductStatus(product);

  const statusConfig = {
    DELETED: {
      label: '🗑️ Borrado',
      color: 'bg-gray-100 text-gray-800',
    },
    INVENTORY_ONLY: {
      label: '📦 Solo Inventario',
      color: 'bg-blue-100 text-blue-800',
    },
    INTERNAL_USE: {
      label: '🔒 Uso Interno',
      color: 'bg-purple-100 text-purple-800',
    },
    COMING_SOON: {
      label: '🎯 Próximamente',
      color: 'bg-yellow-100 text-yellow-800',
    },
    DISCONTINUED: {
      label: '🚫 Descontinuado',
      color: 'bg-red-100 text-red-800',
    },
    OUT_OF_STOCK: {
      label: '📭 Agotado',
      color: 'bg-orange-100 text-orange-800',
    },
    ACTIVE_ONLINE: {
      label: '🛒 Activo Online',
      color: 'bg-green-100 text-green-800',
    },
    ACTIVE_POS: {
      label: '🏪 Activo POS',
      color: 'bg-emerald-100 text-emerald-800',
    },
    ACTIVE_BOTH: {
      label: '✅ Activo (Ambos)',
      color: 'bg-green-100 text-green-800',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function getProductStatus(product: ProductStatus): keyof typeof statusConfig {
  if (!product.isActive) return 'DELETED';
  if (product.visibility === 'INTERNAL') return 'INTERNAL_USE';
  if (product.visibility === 'COMING_SOON') return 'COMING_SOON';
  if (product.visibility === 'DISCONTINUED') return 'DISCONTINUED';
  if (product.visibility === 'HIDDEN') return 'INVENTORY_ONLY';

  // Es PUBLIC
  if (product.stock <= 0) return 'OUT_OF_STOCK';
  if (product.availableChannels.length === 0) return 'INVENTORY_ONLY';

  const hasOnline = product.availableChannels.includes('ONLINE');
  const hasPOS = product.availableChannels.includes('POS');

  if (hasOnline && hasPOS) return 'ACTIVE_BOTH';
  if (hasOnline) return 'ACTIVE_ONLINE';
  if (hasPOS) return 'ACTIVE_POS';

  return 'INVENTORY_ONLY';
}
```

### Product Form - Visibility Section

```tsx
// src/features/inventory/ui/components/ProductVisibilitySection.tsx

function ProductVisibilitySection({ product, onChange }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Visibilidad y Venta</h3>

      {/* 1️⃣ Visibility State */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Estado de Visibilidad
        </label>
        <select
          value={product.visibility}
          onChange={(e) => onChange({ visibility: e.target.value })}
          className="w-full border rounded-lg p-2"
        >
          <option value="HIDDEN">
            📦 Solo Inventario (No visible en catálogos)
          </option>
          <option value="PUBLIC">
            👁️ Público (Visible en catálogos)
          </option>
          <option value="INTERNAL">
            🔒 Uso Interno (Demos, muestras)
          </option>
          <option value="COMING_SOON">
            🎯 Próximamente (Visible pero no comprable)
          </option>
          <option value="DISCONTINUED">
            🚫 Descontinuado
          </option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Controla dónde y cómo se muestra este producto
        </p>
      </div>

      {/* 2️⃣ Sales Channels (solo si es PUBLIC) */}
      {product.visibility === 'PUBLIC' && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Canales de Venta
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={product.availableChannels.includes('ONLINE')}
                onChange={(e) => {
                  const channels = e.target.checked
                    ? [...product.availableChannels, 'ONLINE']
                    : product.availableChannels.filter(c => c !== 'ONLINE');
                  onChange({ availableChannels: channels });
                }}
              />
              <span>🛒 Vender en Tienda Online</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={product.availableChannels.includes('POS')}
                onChange={(e) => {
                  const channels = e.target.checked
                    ? [...product.availableChannels, 'POS']
                    : product.availableChannels.filter(c => c !== 'POS');
                  onChange({ availableChannels: channels });
                }}
              />
              <span>🏪 Vender en Punto de Venta</span>
            </label>
          </div>
          {product.availableChannels.length === 0 && (
            <p className="text-xs text-orange-600 mt-1">
              ⚠️ Producto público pero sin canales de venta seleccionados
            </p>
          )}
        </div>
      )}

      {/* Info helper */}
      <div className="bg-blue-50 p-3 rounded-lg text-sm">
        <p className="font-medium text-blue-900">
          Estado actual:
        </p>
        <p className="text-blue-700">
          {getStatusDescription(product)}
        </p>
      </div>
    </div>
  );
}

function getStatusDescription(product) {
  if (product.visibility === 'HIDDEN') {
    return '📦 Este producto existe solo en inventario. No es visible en ningún catálogo.';
  }
  if (product.visibility === 'INTERNAL') {
    return '🔒 Este producto es de uso interno (demos, muestras). No se vende.';
  }
  if (product.visibility === 'COMING_SOON') {
    return '🎯 Este producto es visible en catálogo como "Próximamente", pero no se puede comprar.';
  }
  if (product.visibility === 'DISCONTINUED') {
    return '🚫 Este producto está descontinuado. Visible solo como referencia histórica.';
  }
  if (product.visibility === 'PUBLIC') {
    if (product.availableChannels.length === 0) {
      return '⚠️ Producto público pero sin canales de venta. Selecciona al menos un canal.';
    }
    const channels = product.availableChannels
      .map(c => c === 'ONLINE' ? 'Tienda Online' : 'Punto de Venta')
      .join(' y ');
    return `✅ Este producto es visible y vendible en: ${channels}`;
  }
  return '';
}
```

---

## 🔄 FLUJO DE TRABAJO TÍPICO

### Workflow 1: Nuevo Producto (No Vendible Aún)

```typescript
// 1. Crear producto en inventario
const product = await createProduct({
  sku: 'iPHONE16',
  name: 'iPhone 16 Pro',
  cost: 800,
  price: 1200,
  stock: 0, // Aún no llega

  // Estado inicial
  isActive: true,
  visibility: 'HIDDEN',         // 📦 Solo inventario
  availableChannels: [],        // No vendible
});

// 2. Registrar compra a proveedor
await updateProduct(product.id, {
  stock: 20, // Llegaron 20 unidades
});

// 3. Preparar para venta
await updateProduct(product.id, {
  publicPrice: 1299,
  visibility: 'PUBLIC',         // 👁️ Hacer público
  availableChannels: ['ONLINE'], // 🛒 Solo online por ahora
});

// 4. Agregar a POS después
await updateProduct(product.id, {
  availableChannels: ['ONLINE', 'POS'], // 🛒🏪 Ambos canales
});
```

### Workflow 2: Producto Demo (Nunca Vendible)

```typescript
const demoProduct = await createProduct({
  sku: 'DEMO-LAPTOP-01',
  name: 'Laptop Demostración Tienda',
  cost: 1000,
  price: 0, // No tiene precio de venta
  stock: 1,

  isActive: true,
  visibility: 'INTERNAL',       // 🔒 Uso interno
  availableChannels: [],        // Nunca vendible
});
```

### Workflow 3: Descontinuar Producto

```typescript
// No borrar, solo descontinuar
await updateProduct(productId, {
  visibility: 'DISCONTINUED',   // 🚫 Descontinuado
  availableChannels: [],        // Ya no vendible
  // stock sigue igual para historial
});
```

---

## ✅ RESUMEN EJECUTIVO

### Tu Pregunta:
**"¿Cómo manejo productos que NO quiero vender (todavía o nunca)?"**

### La Respuesta:
**3 dimensiones de control independientes**:

```typescript
{
  // 1️⃣ ¿Existe el producto?
  isActive: true,  // true = existe, false = borrado

  // 2️⃣ ¿Es visible?
  visibility: 'HIDDEN', // HIDDEN, PUBLIC, INTERNAL, COMING_SOON, DISCONTINUED

  // 3️⃣ ¿Dónde se vende?
  availableChannels: [], // [], [ONLINE], [POS], [ONLINE, POS]
}
```

### Casos de Uso:

| Caso | Configuración | Resultado |
|------|---------------|-----------|
| **Solo Inventario** | `visibility: HIDDEN, channels: []` | ✅ En inventario<br>❌ No visible<br>❌ No vendible |
| **Uso Interno** | `visibility: INTERNAL, channels: []` | ✅ En inventario<br>❌ No visible<br>❌ No vendible |
| **Próximamente** | `visibility: COMING_SOON, channels: []` | ✅ En inventario<br>👁️ Visible<br>❌ No vendible |
| **Activo Online** | `visibility: PUBLIC, channels: [ONLINE]` | ✅ En inventario<br>✅ Visible<br>✅ Vendible online |
| **Descontinuado** | `visibility: DISCONTINUED, channels: []` | ✅ En inventario<br>❌ No visible<br>❌ No vendible |

### Ventajas:

1. ✅ **Trackeas TODO en inventario** (vendible o no)
2. ✅ **Control granular** (visible ≠ vendible)
3. ✅ **Flexible** (puedes cambiar estados fácilmente)
4. ✅ **Profesional** (así lo hace Shopify, Amazon Seller Central)

---

## 🚀 ¿IMPLEMENTAMOS ESTO?

Si dices **SÍ**, actualizo:

1. ✅ Schema Prisma con `visibility` enum
2. ✅ Queries filtradas por contexto
3. ✅ UI en Inventory con selector de visibilidad
4. ✅ Status badges visuales
5. ✅ Validaciones en checkout

**¿Procedemos?** 🎯
