# 🛍️ STOREFRONT - FEATURES PENDIENTES (LADO CLIENTE)

**Fecha**: 2025-01-29
**Estado Actual**: ~85% Completo
**Enfoque**: Cliente (comprador)

---

## ✅ FEATURES COMPLETADOS

### Core E-commerce
- [x] **Catálogo de Productos** - Con filtros, búsqueda, ordenamiento
- [x] **Wishlist** - Agregar/remover productos, sincronización perfecta
- [x] **Carrito** - Agregar/remover/actualizar cantidades, persistencia
- [x] **Checkout** - Flujo completo con Stripe
- [x] **Órdenes** - Creación y listado básico
- [x] **Direcciones** - CRUD completo
- [x] **Métodos de Pago** - CRUD completo con Stripe
- [x] **Webhooks de Stripe** - Payment success, refunds, cancellation

### UI/UX
- [x] Dark mode support
- [x] Animaciones profesionales
- [x] Responsive design
- [x] Loading states
- [x] Error handling

---

## 🚨 PROBLEMAS IDENTIFICADOS A CORREGIR

### 1. ⚠️ **AccountTab - Información Incorrecta** (CRÍTICO)

**Problema**: En `AccountTab.tsx`, el hook `useOrders` no está trayendo la data correctamente.

**Ubicación**: [AccountTab.tsx:105-118](../../src/features/storefront/ui/features/account/AccountTab.tsx#L105)

**Issue**:
```typescript
// ❌ PROBLEMA: ordersData puede tener estructura diferente
const orders: OrderSummary[] = useMemo(() => {
  console.log("🔍 [AccountTab] Orders data:", {
    hasOrdersData: !!ordersData,
    ordersData,
    ordersCount: ordersData?.orders?.length || 0,
    userId: user?.id,
  });
  return ordersData?.orders || [];
}, [ordersData, user?.id]);
```

**Verificar**:
1. ¿Qué devuelve realmente `getOrdersAction`?
2. ¿El formato es `{ orders: [...] }` o `{ data: { orders: [...] } }`?
3. ¿Hay error en la API response?

**Acción Requerida**:
- Revisar el server action `getOrdersAction`
- Verificar el tipo de retorno
- Ajustar el código en AccountTab

---

## 📋 FEATURES PENDIENTES (LADO CLIENTE)

### 🎯 Prioridad ALTA

#### 1. **Vista Detallada de Orden (CRÍTICO)** ⭐

**Estado**: Modal existe pero puede estar incompleto
**Ubicación**: [OrderDetailsModal.tsx](../../src/features/storefront/ui/features/orders/OrderDetailsModal.tsx)

**Requiere**:
- [x] Modal de detalles (existe)
- [ ] **Tracking de envío** (timeline visual)
- [ ] **Estados de la orden** (visual timeline)
- [ ] **Información de productos** completa
- [ ] **Download de invoice/recibo** (PDF)
- [ ] **Botón de contactar soporte** específico para la orden
- [ ] **Opción de reportar problema**

**Ejemplo Professional** (Amazon style):
```
┌─────────────────────────────────────────┐
│  Order #ORD-12345                       │
│  Placed on Jan 29, 2025                 │
│                                         │
│  ● Processing ────────────────────      │
│    Jan 29, 10:30 AM                     │
│                                         │
│  ○ Shipped                              │
│    Expected: Jan 30                     │
│                                         │
│  ○ Delivered                            │
│    Expected: Feb 1                      │
│                                         │
│  Products (3)                           │
│  [Product 1] x2 - $50                   │
│  [Product 2] x1 - $30                   │
│                                         │
│  Shipping Address                       │
│  John Doe                               │
│  123 Main St, City                      │
│                                         │
│  Payment Method                         │
│  Visa •••• 4242                         │
│                                         │
│  Summary                                │
│  Subtotal:  $80.00                      │
│  Shipping:  $10.00                      │
│  Tax:       $8.00                       │
│  Total:     $98.00                      │
│                                         │
│  [Download Invoice] [Contact Support]   │
│  [Cancel Order]                         │
└─────────────────────────────────────────┘
```

---

#### 2. **Tracking de Orden (Seguimiento)** ⭐

**Estado**: No existe
**Prioridad**: Alta

**Features Necesarios**:
- [ ] Timeline visual del estado de la orden
- [ ] Número de guía/tracking
- [ ] Integración con API de paquetería (FedEx, UPS, etc)
- [ ] Actualizaciones en tiempo real
- [ ] Notificaciones de cambios de estado
- [ ] Estimación de entrega actualizada

**Implementación**:
```typescript
// New component needed
src/features/storefront/ui/features/orders/
  ├── OrderTrackingTimeline.tsx    // Visual timeline
  ├── OrderTrackingMap.tsx         // Optional: Map view
  └── OrderTrackingNotification.tsx // Status updates
```

**API Necesaria**:
```typescript
// New action
export async function getOrderTrackingAction(orderId: string): Promise<{
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
  timeline: {
    status: string;
    timestamp: Date;
    location?: string;
    description: string;
  }[];
  estimatedDelivery?: Date;
}> {
  // Implementation
}
```

---

#### 3. **Notificaciones de Email** ⭐

**Estado**: No existe
**Prioridad**: Alta

**Emails Requeridos**:
- [ ] **Confirmación de orden** - Enviado al crear orden
- [ ] **Orden enviada** - Con número de tracking
- [ ] **Orden entregada** - Confirmación de recepción
- [ ] **Orden cancelada** - Notificación de cancelación
- [ ] **Reembolso procesado** - Confirmación de refund
- [ ] **Wishlist reminder** - Recordatorio de items guardados
- [ ] **Abandoned cart** - Recordatorio de carrito abandonado

**Herramientas Sugeridas**:
- Resend (fácil integración con Next.js)
- SendGrid
- Mailgun
- React Email (para templates)

**Implementación**:
```typescript
src/core/email/
  ├── templates/
  │   ├── OrderConfirmation.tsx
  │   ├── OrderShipped.tsx
  │   ├── OrderDelivered.tsx
  │   └── OrderCancelled.tsx
  ├── service.ts
  └── config.ts
```

---

### 🎯 Prioridad MEDIA

#### 4. **Reseñas y Ratings de Productos**

**Estado**: No existe
**Features**:
- [ ] Ver reseñas de otros clientes
- [ ] Escribir reseña después de recibir orden
- [ ] Rating con estrellas (1-5)
- [ ] Subir fotos con la reseña
- [ ] Marcar reseñas como útiles
- [ ] Reportar reseñas inapropiadas
- [ ] Filtrar productos por rating

**Schema Prisma Necesario**:
```prisma
model ProductReview {
  id          String   @id @default(cuid())
  productId   String
  userId      String
  orderId     String?  // Link to verified purchase
  rating      Int      @db.SmallInt // 1-5
  title       String?
  comment     String   @db.Text
  images      String[] // URLs to uploaded images
  isVerifiedPurchase Boolean @default(false)
  helpfulCount Int     @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  product     Product  @relation(fields: [productId], references: [id])
  user        User     @relation(fields: [userId], references: [id])

  @@unique([userId, orderId, productId])
  @@index([productId, rating])
}
```

---

#### 5. **Historial de Compras y Reordenar**

**Estado**: Parcialmente implementado
**Mejoras Necesarias**:
- [x] Ver órdenes pasadas (existe)
- [ ] **Reordenar fácil** - Un clic para agregar al carrito
- [ ] **Productos frecuentes** - Sugerencias basadas en historial
- [ ] **Listas de recompra** - Crear listas de productos recurrentes
- [ ] **Suscripciones** - Órdenes automáticas recurrentes

---

#### 6. **Cupones y Descuentos**

**Estado**: No existe
**Features**:
- [ ] Aplicar código de cupón en checkout
- [ ] Ver cupones disponibles
- [ ] Cupones automáticos (por usuario, por categoría)
- [ ] Descuentos por primera compra
- [ ] Promociones por temporada
- [ ] Descuentos por volumen

**Schema Necesario**:
```prisma
model Coupon {
  id              String    @id @default(cuid())
  code            String    @unique
  type            CouponType // PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING
  value           Decimal
  minPurchase     Decimal?
  maxDiscount     Decimal?
  startDate       DateTime
  endDate         DateTime?
  usageLimit      Int?
  usedCount       Int       @default(0)
  isActive        Boolean   @default(true)
  description     String?
  createdAt       DateTime  @default(now())

  @@index([code, isActive])
}
```

---

#### 7. **Búsqueda Avanzada**

**Estado**: Búsqueda básica existe
**Mejoras**:
- [ ] Autocompletado con sugerencias
- [ ] Búsqueda por voz
- [ ] Filtros avanzados (precio, marca, rating, etc)
- [ ] Historial de búsquedas
- [ ] Búsquedas guardadas
- [ ] Búsqueda por imagen (futuro)

---

#### 8. **Comparación de Productos**

**Estado**: No existe
**Features**:
- [ ] Agregar productos a comparar (máx 4)
- [ ] Vista de comparación lado a lado
- [ ] Comparar especificaciones
- [ ] Comparar precios
- [ ] Agregar al carrito desde comparación

---

### 🎯 Prioridad BAJA (Nice to Have)

#### 9. **Lista de Deseos Compartida**

- [ ] Compartir wishlist por link
- [ ] Wishlist pública/privada
- [ ] Colaborar en wishlist (gift registries)

#### 10. **Programa de Lealtad/Puntos**

- [ ] Ganar puntos por compra
- [ ] Canjear puntos por descuentos
- [ ] Niveles de membresía (Bronze, Silver, Gold)
- [ ] Beneficios exclusivos por nivel

#### 11. **Chat de Soporte en Vivo**

- [ ] Chat widget
- [ ] Soporte en tiempo real
- [ ] Bot automático para FAQs
- [ ] Historial de conversaciones

#### 12. **Recomendaciones Personalizadas**

- [ ] "Clientes también compraron"
- [ ] "Recomendado para ti"
- [ ] Basado en historial de navegación
- [ ] Basado en compras anteriores

---

## 🔧 MEJORAS TÉCNICAS RECOMENDADAS

### Performance
- [ ] Implementar ISR (Incremental Static Regeneration) para productos
- [ ] Optimizar imágenes con Next.js Image
- [ ] Implementar lazy loading para listas largas
- [ ] Cache agresivo para catálogo

### SEO
- [ ] Meta tags dinámicos por producto
- [ ] Structured data (Schema.org)
- [ ] Sitemap dinámico
- [ ] Open Graph para compartir en redes

### Analytics
- [ ] Google Analytics 4 integration
- [ ] Track conversiones
- [ ] Funnel de checkout
- [ ] Abandoned cart tracking

### Security
- [ ] Rate limiting en APIs
- [ ] CSRF protection
- [ ] Input validation completo
- [ ] Sanitización de datos

---

## 📊 PRIORIZACIÓN SUGERIDA

### Sprint 1 (Crítico - 1-2 semanas)
1. ✅ **Fix AccountTab orders data** (1-2 días)
2. ✅ **Completar OrderDetailsModal** (2-3 días)
3. ✅ **Tracking básico de órdenes** (3-4 días)
4. ✅ **Emails de confirmación** (2-3 días)

### Sprint 2 (Alta Prioridad - 2-3 semanas)
5. ✅ **Reseñas de productos** (1 semana)
6. ✅ **Sistema de cupones** (1 semana)
7. ✅ **Mejoras de búsqueda** (3-4 días)

### Sprint 3 (Media Prioridad - 2-3 semanas)
8. ✅ **Comparación de productos** (4-5 días)
9. ✅ **Historial y reordenar** (3-4 días)
10. ✅ **Optimizaciones de performance** (1 semana)

---

## 🎯 SIGUIENTE PASO INMEDIATO

### 🚨 **1. Debuggear y Arreglar AccountTab Orders**

**Acción**:
1. Verificar qué devuelve `getOrdersAction`
2. Verificar estructura de respuesta
3. Ajustar el código en AccountTab
4. Probar con órdenes reales

**Archivos a Revisar**:
- [AccountTab.tsx](../../src/features/storefront/ui/features/account/AccountTab.tsx)
- [getOrdersAction](../../src/features/storefront/orders/server/actions.ts)
- [useOrders hook](../../src/features/storefront/orders/hooks/useOrders.ts)

---

## 📚 RECURSOS Y REFERENCIAS

### Ejemplos de E-commerce Profesional
- **Amazon** - Order tracking, reviews, recommendations
- **Shopify Stores** - Checkout flow, wishlist
- **Stripe Demo** - Payment flow best practices
- **Vercel Commerce** - Next.js e-commerce template

### Herramientas Recomendadas
- **Resend** - Email transaccional
- **React Email** - Email templates
- **Stripe** - Pagos (ya implementado)
- **Uploadthing** - Subida de imágenes para reviews
- **Algolia** - Búsqueda avanzada

---

## ✅ CHECKLIST DE COMPLETITUD

### Funcionalidad Core (85% ✅)
- [x] Productos
- [x] Carrito
- [x] Wishlist
- [x] Checkout
- [x] Órdenes (básico)
- [x] Direcciones
- [x] Métodos de pago
- [ ] Order tracking (50%)
- [ ] Reviews (0%)
- [ ] Cupones (0%)

### UX/UI (90% ✅)
- [x] Responsive
- [x] Dark mode
- [x] Animaciones
- [x] Loading states
- [x] Error handling
- [ ] Empty states (parcial)

### Profesional Polish (60% ✅)
- [x] TypeScript types
- [x] Error handling
- [x] Loading states
- [ ] Emails transaccionales
- [ ] Analytics
- [ ] SEO optimization

---

**Conclusión**: Tu módulo de tienda está en **excelente estado base** (~85% completo). Los features core están implementados profesionalmente. Ahora necesitas:

1. **Arreglar bug de orders en AccountTab** (crítico)
2. **Completar order tracking** (importante para UX)
3. **Agregar emails** (importante para profesionalismo)
4. **Reviews y cupones** (importante para conversiones)

El resto son mejoras incrementales que pueden agregarse según prioridad del negocio.
