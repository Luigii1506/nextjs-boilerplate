# 💰 ARQUITECTURA: PRICING, DESCUENTOS Y PROMOCIONES

**Fecha**: 2025-01-29
**Decisión**: Flexible Multi-Layer Pricing System
**Impacto**: CRÍTICO - Afecta Product schema, Order schema, Checkout logic

---

## 🎯 EL PROBLEMA

**"¿Cómo manejo descuentos, promociones 2x1, cupones, etc?"**

### Casos de Uso Reales:

#### 1. **Descuento Simple**
```
Producto: iPhone 15
Precio normal: $999
Descuento: 10%
Precio final: $899.10
```

#### 2. **Precio de Oferta Temporal**
```
Producto: iPhone 15
Precio normal: $999
Precio de oferta: $799 (Black Friday)
Válido: Nov 24-27
Después: Vuelve a $999
```

#### 3. **Promoción 2x1**
```
Producto: Coca Cola
Compra: 2 unidades
Pagas: 1 unidad
Descuento: 50% en el total
```

#### 4. **Promoción 3x2**
```
Producto: Camisetas
Compra: 3 unidades
Pagas: 2 unidades
La más barata gratis
```

#### 5. **Cupón de Descuento**
```
Cupón: WELCOME10
Tipo: 10% de descuento
Aplica a: Todo el carrito
Mínimo: $50
Uso: 1 vez por cliente
```

#### 6. **Cupón de Envío Gratis**
```
Cupón: FREESHIP
Tipo: Envío gratis
Aplica a: Órdenes >$100
```

#### 7. **Descuento por Volumen**
```
Producto: Widget
1-9 unidades: $10 c/u
10-49 unidades: $9 c/u (-10%)
50+ unidades: $8 c/u (-20%)
```

#### 8. **Bundle/Paquete**
```
Bundle: "Kit Gamer"
Incluye:
  - Mouse ($30)
  - Teclado ($50)
  - Headset ($40)
Total normal: $120
Precio bundle: $99 (-17.5%)
```

#### 9. **Descuento Combo**
```
Promoción: "Laptop + Mouse"
Compra Laptop (cualquiera)
+ Mouse (20% descuento)
```

#### 10. **First-Time Customer Discount**
```
Cliente: Nuevo
Descuento: 15% en primera compra
Aplica: Automáticamente
```

---

## 💡 ARQUITECTURA PROFESIONAL: MULTI-LAYER PRICING

### Concepto: **Separation of Concerns**

```
┌─────────────────────────────────────────────────────────┐
│              PRICING CALCULATION LAYERS                 │
│                                                         │
│  1️⃣  BASE PRICE (Product)                              │
│      └─ price, publicPrice, salePrice                  │
│                                                         │
│  2️⃣  AUTOMATIC PROMOTIONS (Product-level)              │
│      └─ Temporary sales, volume discounts              │
│                                                         │
│  3️⃣  CART-LEVEL PROMOTIONS                             │
│      └─ 2x1, 3x2, Buy X Get Y                         │
│                                                         │
│  4️⃣  COUPONS (Order-level)                             │
│      └─ User-entered codes                             │
│                                                         │
│  5️⃣  AUTOMATIC DISCOUNTS (Customer-level)              │
│      └─ First purchase, loyalty, VIP                   │
│                                                         │
│  💰 FINAL PRICE = f(all layers)                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ SCHEMA DESIGN COMPLETO

### 1. Product Model (Base Pricing)

```prisma
// src/core/database/prisma/models/inventory.prisma

model Product {
  id          String   @id @default(cuid())
  sku         String   @unique
  name        String

  // ═══════════════════════════════════════════════════════════
  // 💰 BASE PRICING (Layer 1)
  // ═══════════════════════════════════════════════════════════
  cost        Decimal  @db.Decimal(10, 2)  // Costo (privado)
  price       Decimal  @db.Decimal(10, 2)  // Precio base
  publicPrice Decimal? @db.Decimal(10, 2)  // Precio público (override)

  // ═══════════════════════════════════════════════════════════
  // 🔥 SALE PRICING (Layer 2 - Product-level discounts)
  // ═══════════════════════════════════════════════════════════
  salePrice   Decimal? @db.Decimal(10, 2)  // Precio en oferta
  saleStartAt DateTime?                    // Inicio de oferta
  saleEndAt   DateTime?                    // Fin de oferta

  // Helper para saber si está en oferta
  isOnSale    Boolean  @default(false)     // Auto-calculated

  // ═══════════════════════════════════════════════════════════
  // 📊 VOLUME PRICING (Layer 2 - Quantity discounts)
  // ═══════════════════════════════════════════════════════════
  volumePricing Json?  @db.Json
  // Example: [
  //   { minQty: 1, maxQty: 9, price: 10 },
  //   { minQty: 10, maxQty: 49, price: 9 },
  //   { minQty: 50, maxQty: null, price: 8 }
  // ]

  // ═══════════════════════════════════════════════════════════
  // 🎁 BUNDLE/COMBO (Layer 2 - Product bundles)
  // ═══════════════════════════════════════════════════════════
  isBundle    Boolean  @default(false)     // Es un bundle?
  bundleItems Json?    @db.Json            // Items incluidos
  // Example: [
  //   { productId: "abc", quantity: 1 },
  //   { productId: "def", quantity: 2 }
  // ]

  // ... resto de campos (visibility, channels, etc)

  // Relations
  promotions  ProductPromotion[]  // Promociones activas
}
```

---

### 2. Promotion Model (Cart-level Promotions)

```prisma
// src/core/database/prisma/models/storefront.prisma

model Promotion {
  id          String    @id @default(cuid())
  code        String?   @unique  // Optional code (auto-apply if null)
  name        String
  description String?

  // ═══════════════════════════════════════════════════════════
  // 🎯 PROMOTION TYPE
  // ═══════════════════════════════════════════════════════════
  type        PromotionType
  // - BOGO: Buy One Get One (2x1)
  // - BUY_X_GET_Y: Buy X Get Y free
  // - PERCENTAGE: % discount
  // - FIXED_AMOUNT: $ discount
  // - FREE_SHIPPING: Envío gratis
  // - BUNDLE: Bundle discount

  // ═══════════════════════════════════════════════════════════
  // 💰 DISCOUNT VALUE
  // ═══════════════════════════════════════════════════════════
  discountType      DiscountType?  // PERCENTAGE, FIXED_AMOUNT, FREE_ITEM
  discountValue     Decimal?       // 10 (%), 50 ($), etc
  maxDiscount       Decimal?       // Cap de descuento

  // ═══════════════════════════════════════════════════════════
  // 🎯 APPLICABILITY (A qué aplica)
  // ═══════════════════════════════════════════════════════════
  appliesTo         AppliesTo      @default(ALL)
  // - ALL: Todo el carrito
  // - SPECIFIC_PRODUCTS: Productos específicos
  // - SPECIFIC_CATEGORIES: Categorías específicas
  // - SHIPPING: Solo envío

  targetProductIds  String[]       // Si appliesTo = SPECIFIC_PRODUCTS
  targetCategoryIds String[]       // Si appliesTo = SPECIFIC_CATEGORIES

  // ═══════════════════════════════════════════════════════════
  // 📋 CONDITIONS (Cuándo aplica)
  // ═══════════════════════════════════════════════════════════
  conditions        Json?          @db.Json
  // Example: {
  //   minPurchase: 50,           // Mínimo de compra
  //   minQuantity: 2,            // Mínimo de items
  //   maxUsesPerCustomer: 1,     // Límite por cliente
  //   requiresFirstPurchase: true, // Solo primera compra
  //   combineWithOthers: false   // Se puede combinar con otros?
  // }

  // ═══════════════════════════════════════════════════════════
  // 📅 VALIDITY (Cuándo está activa)
  // ═══════════════════════════════════════════════════════════
  isActive    Boolean   @default(true)
  startDate   DateTime
  endDate     DateTime?
  priority    Int       @default(0)  // Mayor = más prioridad

  // ═══════════════════════════════════════════════════════════
  // 📊 USAGE TRACKING
  // ═══════════════════════════════════════════════════════════
  maxUses     Int?      // Límite global
  usedCount   Int       @default(0)

  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  products    ProductPromotion[]
  orders      Order[]   @relation("OrderPromotions")

  @@index([code])
  @@index([isActive, startDate, endDate])
  @@map("promotions")
}

enum PromotionType {
  BOGO              // Buy One Get One (2x1)
  BUY_X_GET_Y       // Buy X Get Y free (3x2)
  PERCENTAGE        // % discount
  FIXED_AMOUNT      // $ discount
  FREE_SHIPPING     // Envío gratis
  BUNDLE            // Bundle discount
  VOLUME            // Descuento por volumen
}

enum DiscountType {
  PERCENTAGE    // 10%, 20%, etc
  FIXED_AMOUNT  // $10, $50, etc
  FREE_ITEM     // Item gratis
}

enum AppliesTo {
  ALL                  // Todo el carrito
  SPECIFIC_PRODUCTS    // Productos específicos
  SPECIFIC_CATEGORIES  // Categorías específicas
  SHIPPING             // Solo envío
  SUBTOTAL             // Subtotal del carrito
}

// Junction table para promotions + products
model ProductPromotion {
  id          String    @id @default(cuid())
  productId   String
  promotionId String

  product     Product   @relation(fields: [productId], references: [id])
  promotion   Promotion @relation(fields: [promotionId], references: [id])

  @@unique([productId, promotionId])
  @@map("product_promotions")
}
```

---

### 3. Coupon Model (User-entered codes)

```prisma
model Coupon {
  id          String    @id @default(cuid())
  code        String    @unique  // WELCOME10, FREESHIP, etc
  name        String
  description String?

  // ═══════════════════════════════════════════════════════════
  // 💰 DISCOUNT
  // ═══════════════════════════════════════════════════════════
  type        CouponType
  // - PERCENTAGE: % discount
  // - FIXED_AMOUNT: $ discount
  // - FREE_SHIPPING: Envío gratis

  value       Decimal   @db.Decimal(10, 2)
  // 10 (%), 50 ($), etc

  maxDiscount Decimal?  @db.Decimal(10, 2)
  // Cap: Si es 10% con max $50, nunca descuenta más de $50

  // ═══════════════════════════════════════════════════════════
  // 📋 CONDITIONS
  // ═══════════════════════════════════════════════════════════
  minPurchase Decimal?  @db.Decimal(10, 2)  // Mínimo de compra
  maxPurchase Decimal?  @db.Decimal(10, 2)  // Máximo de compra

  appliesTo   AppliesTo @default(ALL)
  // A qué aplica (ALL, SPECIFIC_PRODUCTS, etc)

  targetProductIds  String[]   // Si appliesTo = SPECIFIC_PRODUCTS
  targetCategoryIds String[]   // Si appliesTo = SPECIFIC_CATEGORIES

  // ═══════════════════════════════════════════════════════════
  // 📅 VALIDITY
  // ═══════════════════════════════════════════════════════════
  isActive    Boolean   @default(true)
  startDate   DateTime
  endDate     DateTime?

  // ═══════════════════════════════════════════════════════════
  // 📊 USAGE LIMITS
  // ═══════════════════════════════════════════════════════════
  maxUses          Int?  // Límite global (null = ilimitado)
  maxUsesPerUser   Int?  @default(1)  // Límite por usuario
  usedCount        Int   @default(0)

  // ═══════════════════════════════════════════════════════════
  // 🎯 TARGETING
  // ═══════════════════════════════════════════════════════════
  requiresFirstPurchase Boolean @default(false)
  requiresEmail         String? // Solo para este email
  allowedUserIds        String[] // Lista de usuarios permitidos

  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  orders      Order[]   @relation("OrderCoupons")
  usages      CouponUsage[]

  @@index([code, isActive])
  @@map("coupons")
}

enum CouponType {
  PERCENTAGE    // 10%, 20% off
  FIXED_AMOUNT  // $10, $50 off
  FREE_SHIPPING // Envío gratis
}

model CouponUsage {
  id        String   @id @default(cuid())
  couponId  String
  userId    String?
  orderId   String
  usedAt    DateTime @default(now())

  coupon    Coupon   @relation(fields: [couponId], references: [id])
  order     Order    @relation(fields: [orderId], references: [id])

  @@index([couponId, userId])
  @@map("coupon_usages")
}
```

---

### 4. Order Model (Con descuentos aplicados)

```prisma
model Order {
  id          String    @id @default(cuid())
  number      String    @unique

  // ... campos existentes

  // ═══════════════════════════════════════════════════════════
  // 💰 PRICING BREAKDOWN
  // ═══════════════════════════════════════════════════════════
  subtotal          Decimal  @db.Decimal(10, 2)  // Suma de items

  // Descuentos aplicados
  productDiscount   Decimal  @db.Decimal(10, 2) @default(0)  // Descuentos de productos
  promotionDiscount Decimal  @db.Decimal(10, 2) @default(0)  // Descuentos de promociones
  couponDiscount    Decimal  @db.Decimal(10, 2) @default(0)  // Descuento de cupón
  totalDiscount     Decimal  @db.Decimal(10, 2) @default(0)  // Total descontado

  // Otros cargos
  taxAmount         Decimal  @db.Decimal(10, 2) @default(0)
  shippingCost      Decimal  @db.Decimal(10, 2) @default(0)
  shippingDiscount  Decimal  @db.Decimal(10, 2) @default(0)  // Si hay free shipping

  // Total final
  total             Decimal  @db.Decimal(10, 2)

  // ═══════════════════════════════════════════════════════════
  // 🎫 APPLIED PROMOTIONS & COUPONS
  // ═══════════════════════════════════════════════════════════
  appliedPromotions Promotion[] @relation("OrderPromotions")
  appliedCoupon     Coupon?     @relation("OrderCoupons", fields: [couponId], references: [id])
  couponId          String?
  couponCode        String?     // Snapshot del código usado

  // Detalles de descuentos (para referencia futura)
  discountDetails   Json?       @db.Json
  // Example: {
  //   productDiscounts: [
  //     { productId: "abc", originalPrice: 100, finalPrice: 80, saved: 20 }
  //   ],
  //   promotions: [
  //     { promotionId: "promo1", name: "2x1", discount: 50 }
  //   ],
  //   coupon: {
  //     code: "WELCOME10",
  //     type: "PERCENTAGE",
  //     value: 10,
  //     discount: 15
  //   }
  // }

  // ... resto de campos
}
```

---

## 🧮 PRICING CALCULATION ENGINE

### Service: Price Calculator

```typescript
// src/features/storefront/pricing/service.ts

interface PricingContext {
  products: Array<{
    id: string;
    quantity: number;
  }>;
  userId?: string;
  couponCode?: string;
  channel: SalesChannel;
}

interface PricingResult {
  subtotal: number;
  productDiscount: number;
  promotionDiscount: number;
  couponDiscount: number;
  totalDiscount: number;
  shippingCost: number;
  shippingDiscount: number;
  taxAmount: number;
  total: number;
  breakdown: PricingBreakdown;
}

/**
 * 💰 PRICING ENGINE
 * Calcula precios finales aplicando todas las capas de descuentos
 */
export class PricingEngine {

  async calculateOrderPricing(context: PricingContext): Promise<PricingResult> {
    // 1️⃣ Get base prices
    const items = await this.getProductPrices(context.products);
    let subtotal = this.calculateSubtotal(items);

    // 2️⃣ Apply product-level discounts (sale prices, volume pricing)
    const { subtotal: subtotalAfterProduct, discount: productDiscount } =
      await this.applyProductDiscounts(items);

    // 3️⃣ Apply cart-level promotions (2x1, 3x2, etc)
    const { discount: promotionDiscount, appliedPromotions } =
      await this.applyPromotions(items, context);

    // 4️⃣ Apply coupon (if provided)
    const { discount: couponDiscount, appliedCoupon } =
      await this.applyCoupon(context.couponCode, subtotalAfterProduct, context);

    // 5️⃣ Apply automatic discounts (first purchase, loyalty, etc)
    const { discount: autoDiscount } =
      await this.applyAutomaticDiscounts(context.userId, subtotalAfterProduct);

    // 6️⃣ Calculate shipping
    const { cost: shippingCost, discount: shippingDiscount } =
      await this.calculateShipping(items, appliedCoupon, context);

    // 7️⃣ Calculate tax
    const taxAmount = await this.calculateTax(
      subtotalAfterProduct - couponDiscount - autoDiscount,
      context
    );

    // 8️⃣ Final total
    const totalDiscount = productDiscount + promotionDiscount + couponDiscount + autoDiscount;
    const total = subtotal - totalDiscount + shippingCost - shippingDiscount + taxAmount;

    return {
      subtotal,
      productDiscount,
      promotionDiscount,
      couponDiscount,
      totalDiscount,
      shippingCost,
      shippingDiscount,
      taxAmount,
      total,
      breakdown: {
        items,
        appliedPromotions,
        appliedCoupon,
        // ... detalles
      }
    };
  }

  /**
   * Layer 1: Product-level discounts
   */
  private async applyProductDiscounts(items: CartItem[]) {
    let discount = 0;

    for (const item of items) {
      const product = item.product;

      // Check sale price
      if (this.isOnSale(product)) {
        const saved = (product.price - product.salePrice!) * item.quantity;
        discount += saved;
        item.finalPrice = product.salePrice!;
      }

      // Check volume pricing
      const volumePrice = this.getVolumPrice(product, item.quantity);
      if (volumePrice && volumePrice < item.finalPrice) {
        const saved = (item.finalPrice - volumePrice) * item.quantity;
        discount += saved;
        item.finalPrice = volumePrice;
      }
    }

    const subtotal = items.reduce((sum, item) =>
      sum + (item.finalPrice * item.quantity), 0
    );

    return { subtotal, discount };
  }

  /**
   * Layer 2: Cart-level promotions (2x1, 3x2, etc)
   */
  private async applyPromotions(items: CartItem[], context: PricingContext) {
    const activePromotions = await this.getActivePromotions(context.channel);
    let totalDiscount = 0;
    const appliedPromotions: Promotion[] = [];

    for (const promotion of activePromotions) {
      if (!this.canApplyPromotion(promotion, items, context)) continue;

      const discount = this.calculatePromotionDiscount(promotion, items);

      if (discount > 0) {
        totalDiscount += discount;
        appliedPromotions.push(promotion);
      }
    }

    return { discount: totalDiscount, appliedPromotions };
  }

  /**
   * Layer 3: Coupon discounts
   */
  private async applyCoupon(
    code: string | undefined,
    subtotal: number,
    context: PricingContext
  ) {
    if (!code) return { discount: 0, appliedCoupon: null };

    const coupon = await this.validateCoupon(code, context.userId);
    if (!coupon) return { discount: 0, appliedCoupon: null };

    let discount = 0;

    switch (coupon.type) {
      case 'PERCENTAGE':
        discount = subtotal * (coupon.value / 100);
        if (coupon.maxDiscount) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
        break;

      case 'FIXED_AMOUNT':
        discount = Math.min(coupon.value, subtotal);
        break;

      case 'FREE_SHIPPING':
        // Handled in shipping calculation
        break;
    }

    return { discount, appliedCoupon: coupon };
  }

  /**
   * Validate if promotion can be applied
   */
  private canApplyPromotion(
    promotion: Promotion,
    items: CartItem[],
    context: PricingContext
  ): boolean {
    // Check dates
    const now = new Date();
    if (now < promotion.startDate || (promotion.endDate && now > promotion.endDate)) {
      return false;
    }

    // Check usage limit
    if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
      return false;
    }

    // Check minimum purchase
    const conditions = promotion.conditions as any;
    if (conditions?.minPurchase) {
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      if (subtotal < conditions.minPurchase) {
        return false;
      }
    }

    // Check if applies to products in cart
    if (promotion.appliesTo === 'SPECIFIC_PRODUCTS') {
      const hasProduct = items.some(item =>
        promotion.targetProductIds.includes(item.productId)
      );
      if (!hasProduct) return false;
    }

    return true;
  }

  /**
   * Calculate promotion discount (2x1, 3x2, etc)
   */
  private calculatePromotionDiscount(
    promotion: Promotion,
    items: CartItem[]
  ): number {
    switch (promotion.type) {
      case 'BOGO': // 2x1
        return this.calculateBOGODiscount(promotion, items);

      case 'BUY_X_GET_Y': // 3x2
        return this.calculateBuyXGetYDiscount(promotion, items);

      case 'PERCENTAGE':
        return this.calculatePercentageDiscount(promotion, items);

      default:
        return 0;
    }
  }

  private calculateBOGODiscount(promotion: Promotion, items: CartItem[]): number {
    // Example: Buy 2, pay 1 (50% discount)
    const applicableItems = items.filter(item =>
      promotion.targetProductIds.includes(item.productId)
    );

    let discount = 0;
    for (const item of applicableItems) {
      const freeItems = Math.floor(item.quantity / 2);
      discount += freeItems * item.finalPrice;
    }

    return discount;
  }

  private calculateBuyXGetYDiscount(promotion: Promotion, items: CartItem[]): number {
    // Example: Buy 3, pay 2 (cheapest free)
    const conditions = promotion.conditions as any;
    const buyQty = conditions.buyQuantity || 3;
    const payQty = conditions.payQuantity || 2;

    const applicableItems = items.filter(item =>
      promotion.targetProductIds.includes(item.productId)
    );

    if (applicableItems.length === 0) return 0;

    // Sort by price (cheapest last)
    applicableItems.sort((a, b) => b.finalPrice - a.finalPrice);

    let discount = 0;
    for (const item of applicableItems) {
      const sets = Math.floor(item.quantity / buyQty);
      const freePerSet = buyQty - payQty;
      const freeItems = sets * freePerSet;
      discount += freeItems * item.finalPrice;
    }

    return discount;
  }
}
```

---

## 🎨 UI EXAMPLES

### Product Card - Show Sale Price

```tsx
function ProductCard({ product }) {
  const isOnSale = product.salePrice && product.salePrice < product.price;

  return (
    <div className="product-card">
      <h3>{product.name}</h3>

      {/* Pricing */}
      <div className="pricing">
        {isOnSale ? (
          <>
            <span className="original-price line-through text-gray-500">
              ${product.price}
            </span>
            <span className="sale-price text-red-600 font-bold">
              ${product.salePrice}
            </span>
            <span className="badge bg-red-100 text-red-800">
              {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
            </span>
          </>
        ) : (
          <span className="price font-bold">
            ${product.publicPrice || product.price}
          </span>
        )}
      </div>

      {/* Sale timer */}
      {isOnSale && product.saleEndAt && (
        <div className="sale-timer text-sm text-orange-600">
          ⏰ Termina en: <Countdown endDate={product.saleEndAt} />
        </div>
      )}
    </div>
  );
}
```

### Cart - Show Applied Discounts

```tsx
function CartSummary({ pricing }: { pricing: PricingResult }) {
  return (
    <div className="cart-summary">
      <div className="line-item">
        <span>Subtotal</span>
        <span>${pricing.subtotal.toFixed(2)}</span>
      </div>

      {/* Product discounts */}
      {pricing.productDiscount > 0 && (
        <div className="line-item text-green-600">
          <span>Descuentos de productos</span>
          <span>-${pricing.productDiscount.toFixed(2)}</span>
        </div>
      )}

      {/* Promotion discounts */}
      {pricing.promotionDiscount > 0 && (
        <div className="line-item text-green-600">
          <span>Promociones aplicadas</span>
          <span>-${pricing.promotionDiscount.toFixed(2)}</span>
        </div>
      )}

      {/* Coupon discount */}
      {pricing.couponDiscount > 0 && (
        <div className="line-item text-green-600">
          <span>Cupón ({pricing.breakdown.appliedCoupon?.code})</span>
          <span>-${pricing.couponDiscount.toFixed(2)}</span>
        </div>
      )}

      {/* Shipping */}
      <div className="line-item">
        <span>Envío</span>
        <span>
          {pricing.shippingDiscount > 0 ? (
            <>
              <span className="line-through text-gray-500">
                ${pricing.shippingCost.toFixed(2)}
              </span>
              <span className="text-green-600 ml-2">GRATIS</span>
            </>
          ) : (
            `$${pricing.shippingCost.toFixed(2)}`
          )}
        </span>
      </div>

      {/* Tax */}
      <div className="line-item">
        <span>Impuestos</span>
        <span>${pricing.taxAmount.toFixed(2)}</span>
      </div>

      <div className="divider" />

      {/* Total */}
      <div className="line-item font-bold text-lg">
        <span>Total</span>
        <span>${pricing.total.toFixed(2)}</span>
      </div>

      {/* Savings */}
      {pricing.totalDiscount > 0 && (
        <div className="savings-badge bg-green-100 text-green-800">
          🎉 Ahorraste ${pricing.totalDiscount.toFixed(2)}
        </div>
      )}
    </div>
  );
}
```

### Checkout - Coupon Input

```tsx
function CouponInput({ onApply }: { onApply: (code: string) => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    setLoading(true);
    setError(null);

    try {
      await onApply(code);
      // Success!
    } catch (err) {
      setError(err.message || 'Cupón inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coupon-input">
      <label className="block text-sm font-medium mb-2">
        ¿Tienes un cupón?
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Código del cupón"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={handleApply}
          disabled={!code || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Aplicando...' : 'Aplicar'}
        </button>
      </div>
      {error && (
        <p className="text-red-600 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
```

---

## 📋 EXAMPLES DE PROMOCIONES

### 1. Black Friday Sale (Product-level)

```typescript
// Update product
await prisma.product.update({
  where: { id: productId },
  data: {
    salePrice: 799,
    saleStartAt: new Date('2025-11-24'),
    saleEndAt: new Date('2025-11-27'),
    isOnSale: true,
  }
});
```

### 2. Buy 2 Get 1 Free (Promotion)

```typescript
await prisma.promotion.create({
  data: {
    code: null, // Auto-apply
    name: '2x1 en Coca Colas',
    type: 'BOGO',
    appliesTo: 'SPECIFIC_PRODUCTS',
    targetProductIds: ['coca-cola-id'],
    startDate: new Date(),
    endDate: new Date('2025-12-31'),
    isActive: true,
    conditions: {
      minQuantity: 2,
    }
  }
});
```

### 3. Cupón 10% Descuento (Coupon)

```typescript
await prisma.coupon.create({
  data: {
    code: 'WELCOME10',
    name: '10% de Descuento',
    type: 'PERCENTAGE',
    value: 10,
    maxDiscount: 50,
    minPurchase: 100,
    appliesTo: 'ALL',
    startDate: new Date(),
    maxUsesPerUser: 1,
    requiresFirstPurchase: true,
    isActive: true,
  }
});
```

### 4. Free Shipping (Coupon)

```typescript
await prisma.coupon.create({
  data: {
    code: 'FREESHIP',
    name: 'Envío Gratis',
    type: 'FREE_SHIPPING',
    value: 0,
    minPurchase: 50,
    appliesTo: 'SHIPPING',
    startDate: new Date(),
    isActive: true,
  }
});
```

---

## ✅ RESUMEN EJECUTIVO

### Tu Pregunta:
**"¿Cómo manejo descuentos, promociones 2x1, cupones, etc?"**

### La Respuesta:
**Sistema de Pricing Multi-Layer con 3 entidades principales**:

1. **Product** - Sale prices, volume pricing
2. **Promotion** - Cart-level (2x1, 3x2, bundles)
3. **Coupon** - User-entered codes

### Orden de Aplicación:
```
1. Base Price (product.price)
2. Sale Price (product.salePrice) ✅
3. Volume Discount (volumePricing) ✅
4. Promotion (2x1, 3x2, etc) ✅
5. Coupon (WELCOME10) ✅
6. Auto Discounts (first purchase) ✅
= FINAL PRICE
```

### Ventajas:
- ✅ **Flexible** - Soporta cualquier tipo de descuento
- ✅ **Escalable** - Fácil agregar nuevos tipos
- ✅ **Transparente** - Cliente ve cada descuento
- ✅ **Profesional** - Como Amazon, Shopify
- ✅ **Auditable** - Todo guardado en Order

---

## 🚀 ¿IMPLEMENTAMOS ESTO?

Si dices **SÍ**, esto es lo que haremos:

### Schema Changes:
1. ✅ Agregar `salePrice`, `saleStartAt`, `saleEndAt` a Product
2. ✅ Crear tabla `Promotion`
3. ✅ Crear tabla `Coupon` + `CouponUsage`
4. ✅ Actualizar `Order` con breakdown de descuentos

### Implementation:
5. ✅ Crear `PricingEngine` service
6. ✅ Integrar en checkout flow
7. ✅ UI para aplicar cupones
8. ✅ Seller Portal para crear promociones

**Tiempo estimado**: 2-3 días para sistema completo

**¿Procedemos?** 🎯
