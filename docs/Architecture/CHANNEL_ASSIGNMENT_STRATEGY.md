# 🎯 ESTRATEGIA: CHANNEL ASSIGNMENT PARA PRODUCTOS

**Fecha**: 2025-01-29
**Decisión**: Channel-Aware Product Availability

---

## 🤔 LA PREGUNTA CRÍTICA

**"¿Necesito identificar qué productos son para online vs POS?"**

### Respuesta: **SÍ, pero de forma FLEXIBLE** ✅

---

## 📊 ESCENARIOS DEL MUNDO REAL

### Escenario 1: Producto SOLO Online
```
Producto: "Laptop Gaming XXL"
- Peso: 15 kg
- Precio: $2,500
- Requiere envío especial
- NO cabe en caja de tienda
- NO quieres que se venda en POS (complicaciones logísticas)

✅ Disponible: ONLINE
❌ NO disponible: POS
```

### Escenario 2: Producto SOLO POS
```
Producto: "Café del día"
- Perecedero
- Se prepara en el momento
- No se puede enviar
- Solo para consumo inmediato

❌ NO disponible: ONLINE
✅ Disponible: POS
```

### Escenario 3: Producto en AMBOS
```
Producto: "iPhone 15"
- Stock compartido: 50 unidades
- Se puede comprar online
- Se puede comprar en tienda
- Mismo inventory pool

✅ Disponible: ONLINE
✅ Disponible: POS
```

### Escenario 4: Producto Exclusivo por Canal
```
Producto: "Bundle Exclusivo Black Friday"
- Promoción SOLO online
- Stock limitado: 100 unidades
- NO disponible en tienda física

✅ Disponible: ONLINE (exclusivo)
❌ NO disponible: POS
```

---

## 💡 SOLUCIÓN PROFESIONAL: CHANNEL AVAILABILITY FLAGS

### Opción 1: Flags Separados (❌ NO Recomendado)

```prisma
model Product {
  id              String   @id
  name            String
  stock           Int

  // ❌ NO - Muy rígido
  isOnline        Boolean  @default(true)
  isPOS           Boolean  @default(true)
}
```

**Problemas**:
- Solo 2 canales (¿qué pasa con phone orders, wholesale?)
- Difícil de extender
- Lógica complicada en queries

---

### Opción 2: Array de Canales (✅ RECOMENDADO)

```prisma
model Product {
  id              String        @id
  name            String
  stock           Int           // Stock TOTAL compartido

  // ✅ SÍ - Flexible y escalable
  availableChannels String[]    @default(["ONLINE", "POS"]) // Array de canales

  // Opcional: Configuración específica por canal
  channelConfig   Json?         // { ONLINE: {...}, POS: {...} }
}
```

**Ventajas**:
- ✅ Flexible: Soporta múltiples canales
- ✅ Escalable: Fácil agregar "PHONE", "WHOLESALE", etc
- ✅ Simple de query: `WHERE 'ONLINE' = ANY(availableChannels)`
- ✅ Default sensato: Disponible en todos por defecto

---

### Opción 3: Tabla Separada (⚠️ Over-engineering para tu caso)

```prisma
model ProductChannelAvailability {
  id              String        @id
  productId       String
  channel         SalesChannel
  isAvailable     Boolean
  minQuantity     Int?
  maxQuantity     Int?
}
```

**Cuándo usar**: Solo si necesitas configuración MUY específica por canal

---

## 🏗️ IMPLEMENTACIÓN RECOMENDADA

### 1. Schema Prisma Actualizado

```prisma
// src/core/database/prisma/models/inventory.prisma

model Product {
  id          String   @id @default(cuid())
  sku         String   @unique
  name        String
  description String?  @db.Text

  // 📦 Stock Management (SHARED across all channels)
  stock       Int      @default(0)
  minStock    Int      @default(5)
  maxStock    Int?

  // 💰 Pricing
  cost        Decimal  @db.Decimal(10, 2)
  price       Decimal  @db.Decimal(10, 2)
  publicPrice Decimal? @db.Decimal(10, 2) // Customer-facing price

  // 🏷️ Classification
  categoryId  String
  supplierId  String?
  barcode     String?  @unique
  unit        String   @default("unit") // unit, kg, liter, etc

  // 🎯 Channel Availability (NEW)
  availableChannels SalesChannel[] @default([ONLINE, POS])

  // 📝 Channel-specific config (optional)
  channelConfig     Json?          @db.Json
  // Example: {
  //   "ONLINE": {
  //     "minQuantity": 1,
  //     "maxQuantity": 5,
  //     "shippingWeight": 2.5
  //   },
  //   "POS": {
  //     "minQuantity": 1,
  //     "maxQuantity": 10,
  //     "allowDiscounts": true
  //   }
  // }

  // 🎨 Media & Details
  images      String[] @default([])
  tags        String[] @default([])
  metadata    Json?    @db.Json

  // 🔐 Status
  isActive    Boolean  @default(true)
  isPublic    Boolean  @default(false) // Show in storefront catalog?
  featured    Boolean  @default(false)

  // 📅 Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 🔗 Relations
  category    Category @relation(fields: [categoryId], references: [id])
  supplier    Supplier? @relation(fields: [supplierId], references: [id])

  // Sales relations
  orderItems     OrderItem[]
  wishlistItems  WishlistItem[]
  reviews        Review[]

  @@index([categoryId])
  @@index([supplierId])
  @@index([isActive])
  @@index([isPublic])
  @@index([stock])
  @@map("products")
}

// Enum de canales de venta
enum SalesChannel {
  ONLINE      // E-commerce storefront
  POS         // Point of Sale (physical store)
  PHONE       // Phone orders
  WHOLESALE   // B2B/wholesale
  MARKETPLACE // Third-party marketplace (Amazon, etc)
}
```

---

## 🎯 USO EN QUERIES

### Query para Storefront (Solo productos ONLINE)

```typescript
// src/features/storefront/server/queries.ts

export async function getPublicProductsQuery(
  options: ProductQueryOptions = {}
) {
  const products = await prisma.product.findMany({
    where: {
      isPublic: true,
      isActive: true,
      availableChannels: {
        has: 'ONLINE', // ✅ Solo productos disponibles en canal ONLINE
      },
      stock: { gt: 0 }, // Con stock
    },
    // ...resto
  });

  return products;
}
```

### Query para POS (Solo productos POS)

```typescript
// src/features/pos/server/queries.ts

export async function getPOSProductsQuery(
  searchTerm?: string
) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      availableChannels: {
        has: 'POS', // ✅ Solo productos disponibles en POS
      },
      stock: { gt: 0 },
      ...(searchTerm && {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { barcode: { equals: searchTerm } },
          { sku: { contains: searchTerm, mode: 'insensitive' } },
        ],
      }),
    },
    // ...resto
  });

  return products;
}
```

### Query para Admin (Ver TODOS los productos)

```typescript
// src/features/inventory/server/queries.ts

export async function getInventoryProductsQuery() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      // ✅ NO filtramos por canal - admin ve todo
    },
    // Incluir info de canales
    select: {
      id: true,
      name: true,
      stock: true,
      availableChannels: true, // Mostrar en qué canales está
      // ...resto
    },
  });

  return products;
}
```

---

## 🎨 UI EN SELLER PORTAL

### Products Tab - Channel Assignment

```tsx
// src/features/seller-portal/ui/components/tabs/ProductsTab.tsx

function ProductChannelSelector({ product }: { product: Product }) {
  const [channels, setChannels] = useState<SalesChannel[]>(
    product.availableChannels
  );

  return (
    <div className="flex gap-2">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={channels.includes('ONLINE')}
          onChange={(e) => {
            if (e.target.checked) {
              setChannels([...channels, 'ONLINE']);
            } else {
              setChannels(channels.filter(c => c !== 'ONLINE'));
            }
          }}
        />
        <span>🛒 Online Store</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={channels.includes('POS')}
          onChange={(e) => {
            if (e.target.checked) {
              setChannels([...channels, 'POS']);
            } else {
              setChannels(channels.filter(c => c !== 'POS'));
            }
          }}
        />
        <span>🏪 Point of Sale</span>
      </label>

      <button onClick={() => updateProductChannels(product.id, channels)}>
        Save
      </button>
    </div>
  );
}
```

### Product Card con Channel Badges

```tsx
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>Stock: {product.stock}</p>

      {/* Channel badges */}
      <div className="flex gap-2 mt-2">
        {product.availableChannels.includes('ONLINE') && (
          <span className="badge bg-blue-100 text-blue-800">
            🛒 Online
          </span>
        )}
        {product.availableChannels.includes('POS') && (
          <span className="badge bg-green-100 text-green-800">
            🏪 POS
          </span>
        )}
      </div>
    </div>
  );
}
```

---

## 🔄 MIGRACIÓN DEL SCHEMA EXISTENTE

### Migration Script

```typescript
// prisma/migrations/add_channel_availability.sql

-- Agregar columna de canales disponibles
ALTER TABLE "products"
ADD COLUMN "availableChannels" TEXT[] DEFAULT '{"ONLINE","POS"}';

-- Agregar columna de configuración por canal (opcional)
ALTER TABLE "products"
ADD COLUMN "channelConfig" JSONB;

-- Por defecto, todos los productos existentes están en ambos canales
UPDATE "products"
SET "availableChannels" = '{"ONLINE","POS"}'
WHERE "availableChannels" IS NULL;

-- Si tienes productos que solo deben estar online (basado en isPublic)
UPDATE "products"
SET "availableChannels" = '{"ONLINE"}'
WHERE "isPublic" = true;

-- Crear índice para mejor performance
CREATE INDEX idx_products_available_channels
ON "products" USING GIN ("availableChannels");
```

### Seed Script Actualizado

```typescript
// src/features/inventory/scripts/seed-inventory.ts

const products = [
  {
    name: "iPhone 15 Pro",
    availableChannels: ['ONLINE', 'POS'], // ✅ Ambos
    isPublic: true,
  },
  {
    name: "Café Americano",
    availableChannels: ['POS'], // ✅ Solo POS (perecedero)
    isPublic: false,
  },
  {
    name: "Bundle Black Friday",
    availableChannels: ['ONLINE'], // ✅ Solo Online (exclusivo web)
    isPublic: true,
  },
  {
    name: "Laptop Gaming 20kg",
    availableChannels: ['ONLINE'], // ✅ Solo Online (muy pesado para POS)
    isPublic: true,
  },
];
```

---

## 📊 CASOS DE USO AVANZADOS

### 1. Configuración Específica por Canal

```typescript
// Producto con config diferente por canal
const product = {
  name: "Coca Cola 2L",
  stock: 100,
  price: 2.50,
  availableChannels: ['ONLINE', 'POS'],
  channelConfig: {
    ONLINE: {
      minQuantity: 6,        // Mínimo 6 (pack) online
      maxQuantity: 24,       // Máximo 24
      shippingWeight: 2.5,   // Peso para shipping
      requiresCooling: true,
    },
    POS: {
      minQuantity: 1,        // Individual en POS
      maxQuantity: 12,
      allowDiscounts: true,  // Descuentos solo en POS
    }
  }
};
```

### 2. Stock Reservado por Canal (Avanzado)

```prisma
// Si necesitas reservar stock específico por canal
model ProductChannelStock {
  id          String       @id @default(cuid())
  productId   String
  channel     SalesChannel
  reserved    Int          @default(0) // Stock reservado para este canal

  product     Product      @relation(...)

  @@unique([productId, channel])
}

// Entonces el stock disponible por canal sería:
// availableStock(channel) = product.stock - channelStock.reserved
```

**Cuándo usar**: Solo si necesitas garantizar stock mínimo por canal
**Tu caso**: Probablemente NO lo necesitas (stock compartido es mejor)

---

## 🎯 VENTAJAS DE ESTA SOLUCIÓN

### ✅ **Flexibility**
- Productos pueden estar en 1, 2, o N canales
- Fácil agregar nuevos canales (PHONE, WHOLESALE)
- Config específica por canal (opcional)

### ✅ **Simplicity**
- Stock compartido (default)
- Query simple: `WHERE 'ONLINE' IN availableChannels`
- UI intuitiva (checkboxes)

### ✅ **Business Logic Correcta**
```typescript
// Validación en checkout
if (!product.availableChannels.includes('ONLINE')) {
  throw new Error('Product not available for online purchase');
}

// Validación en POS
if (!product.availableChannels.includes('POS')) {
  throw new Error('Product not available in store');
}
```

### ✅ **Analytics**
```sql
-- Productos solo online
SELECT * FROM products
WHERE availableChannels = '{"ONLINE"}';

-- Productos en ambos canales
SELECT * FROM products
WHERE 'ONLINE' = ANY(availableChannels)
  AND 'POS' = ANY(availableChannels);

-- Ventas por canal
SELECT channel, COUNT(*), SUM(total)
FROM orders
GROUP BY channel;
```

---

## 🚀 IMPLEMENTACIÓN PASO A PASO

### Paso 1: Actualizar Schema Prisma ✅

```bash
# 1. Editar schema
code src/core/database/prisma/models/inventory.prisma

# 2. Crear migration
npx prisma migrate dev --name add_channel_availability

# 3. Generar tipos
npx prisma generate
```

### Paso 2: Actualizar Queries ✅

```typescript
// Storefront - Solo ONLINE
where: {
  availableChannels: { has: 'ONLINE' }
}

// POS - Solo POS
where: {
  availableChannels: { has: 'POS' }
}
```

### Paso 3: UI en Inventory/Seller Portal ✅

```tsx
// Agregar selector de canales
<ChannelSelector
  value={product.availableChannels}
  onChange={(channels) => updateChannels(channels)}
/>
```

### Paso 4: Validaciones en Checkout ✅

```typescript
// Validar canal antes de crear orden
if (!product.availableChannels.includes(orderChannel)) {
  throw new Error('Product not available in this channel');
}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Schema & Database
- [ ] Agregar `availableChannels` a Product model
- [ ] Agregar `channelConfig` (opcional)
- [ ] Crear enum `SalesChannel`
- [ ] Crear migration
- [ ] Ejecutar migration
- [ ] Seed data con canales

### Queries
- [ ] Actualizar `getPublicProductsQuery` (filtrar por ONLINE)
- [ ] Actualizar `getPOSProductsQuery` (filtrar por POS)
- [ ] Actualizar `getInventoryProductsQuery` (sin filtro)

### UI Components
- [ ] Crear `ChannelSelector` component
- [ ] Agregar badges de canal en ProductCard
- [ ] Agregar filtro por canal en Seller Portal
- [ ] Agregar en ProductModal (inventory)

### Validations
- [ ] Validar canal en checkout
- [ ] Validar canal en POS
- [ ] Validar al menos 1 canal activo

### Testing
- [ ] Crear producto solo ONLINE
- [ ] Crear producto solo POS
- [ ] Crear producto en ambos
- [ ] Verificar queries filtran correctamente
- [ ] Verificar stock se comparte correctamente

---

## ✅ RESUMEN EJECUTIVO

### La Respuesta:

**"¿Necesito identificar productos online vs POS?"**

✅ **SÍ** - Pero de forma FLEXIBLE con `availableChannels: SalesChannel[]`

### Configuración Recomendada:

```prisma
model Product {
  // ... otros campos

  availableChannels SalesChannel[] @default([ONLINE, POS])
  channelConfig     Json?          // Opcional para config avanzada
}

enum SalesChannel {
  ONLINE
  POS
  PHONE      // Futuro
  WHOLESALE  // Futuro
}
```

### Por qué es la mejor solución:

1. ✅ **Flexible**: Soporta N canales
2. ✅ **Simple**: Array de strings
3. ✅ **Escalable**: Fácil agregar canales
4. ✅ **Default sensato**: Ambos canales por defecto
5. ✅ **Stock compartido**: Más eficiente
6. ✅ **Industry standard**: Así lo hace Shopify, Square, etc

---

## 🎯 DECISIÓN FINAL

### ¿Implementamos esto?

Si dices **SÍ**, haré:

1. ✅ Actualizar schema Prisma con `availableChannels`
2. ✅ Crear migration
3. ✅ Actualizar queries de Storefront
4. ✅ Crear UI en Inventory para asignar canales
5. ✅ Crear Seller Portal con esta lógica

**¿Procedemos con la implementación?** 🚀
