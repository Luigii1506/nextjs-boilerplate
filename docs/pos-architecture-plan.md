# 🏪 Arquitectura del Módulo POS

## Análisis Comparativo: Storefront vs POS

### Similitudes Arquitectónicas
- ✅ SPA con tabs (todos siempre montados)
- ✅ Múltiples contextos (state separation)
- ✅ TanStack Query para data fetching
- ✅ Server Actions para mutaciones
- ✅ Estructura server/types/hooks/ui

### Diferencias Clave

| Aspecto | Storefront | POS |
|---------|-----------|-----|
| **User** | Cliente final (e-commerce) | Cajero (empleado) |
| **Tabs** | 8 (overview, products, cart, checkout, wishlist, categories, account, support) | 4 (browse, sale, payment, history) |
| **Sub-features** | cart, checkout, addresses, payment-methods, orders, pricing | sale, payment, session |
| **Flujo** | Browse → Add to Cart → Checkout → Stripe → Confirmation | Browse → Add to Sale → Payment → Print Receipt |
| **Payment** | Stripe (online) | Cash/Card/Transfer (físico) |
| **Session** | No aplica | Apertura/cierre de caja |
| **Inventory** | Read-only | Read + Update (reduce stock) |

---

## Estructura Final de POS

```
/src/features/pos/
│
├── 📋 TYPES LAYER (✅ YA CREADO)
│   ├── types/
│   │   ├── models.ts            [POSSession, POSTransaction, POSCart, etc.]
│   │   ├── inputs.ts            [API inputs/outputs]
│   │   ├── queries.ts           [Query options & results]
│   │   └── index.ts
│   └── schemas/
│       └── index.ts             [Zod validation]
│
├── 🛍️ SALE SUB-FEATURE (Equivalente a cart/)
│   ├── context/
│   │   └── SaleContext.tsx      [350 líneas aprox - como CartContext]
│   │       ├── State: items, subtotal, discount, tax, total
│   │       ├── Actions: addItem, updateQuantity, removeItem, clearSale
│   │       ├── useMemo: itemCount, totalAmount
│   │       └── useCallback: todas las actions
│   ├── server/
│   │   ├── actions.ts           [addToSaleAction, updateSaleItemAction, etc.]
│   │   ├── service.ts           [Business logic]
│   │   └── queries.ts           [DB queries]
│   ├── hooks/
│   │   └── useSale.ts           [Hook para acceder a SaleContext]
│   ├── types/
│   │   ├── SaleItem.ts
│   │   ├── SaleSummary.ts
│   │   └── index.ts
│   └── index.ts
│
├── 💰 PAYMENT SUB-FEATURE (Equivalente a checkout/)
│   ├── context/
│   │   └── PaymentContext.tsx   [250 líneas aprox - como CheckoutContext]
│   │       ├── State: paymentMethod, amountPaid, changeDue
│   │       ├── Actions: setPaymentMethod, processPayment, printReceipt
│   │       ├── Computed: canProcess, isValidPayment
│   │       └── Dependencies: useSaleContext() [consume SaleContext]
│   ├── server/
│   │   ├── actions.ts           [processPaymentAction, printReceiptAction]
│   │   └── queries.ts
│   ├── hooks/
│   │   └── usePayment.ts        [Hook para acceder a PaymentContext]
│   ├── types/
│   │   ├── PaymentData.ts
│   │   ├── Receipt.ts
│   │   └── index.ts
│   └── index.ts
│
├── 🏪 SESSION SUB-FEATURE (Específico de POS)
│   ├── server/
│   │   ├── actions.ts           [openSessionAction, closeSessionAction]
│   │   ├── service.ts           [Session business logic]
│   │   └── queries.ts           [Get session, calculate summary]
│   ├── hooks/
│   │   └── useSession.ts        [TanStack Query hook]
│   ├── types/
│   │   ├── SessionData.ts
│   │   └── index.ts
│   └── index.ts
│
├── 🎨 CONTEXT (UI State - Ligero)
│   ├── POSUIContext.tsx         [80 líneas aprox - como StorefrontUIContext]
│   │   ├── State: activeTab, searchTerm, showModal
│   │   ├── NO maneja data (solo UI)
│   │   └── Transiciones suaves entre tabs
│   └── index.ts
│
├── 🪝 HOOKS (TanStack Query)
│   ├── usePOSData.ts            [Main data hook - productos, sesión, stats]
│   ├── useTransactions.ts       [Query transacciones]
│   ├── queryKeys.ts             [Query key factory]
│   └── index.ts
│
├── 📊 SERVER (Infrastructure)
│   ├── actions.ts               [Consolidated server actions]
│   ├── service.ts               [Business logic layer]
│   ├── queries.ts               [Database queries]
│   ├── mappers.ts               [Data transformation]
│   └── index.ts
│
├── 🛠️ UTILS
│   ├── receipt.formatter.ts     [Format receipt for printing]
│   ├── transaction.helpers.ts   [Generate transaction numbers, etc.]
│   ├── payment.calculator.ts    [Calculate change, validate amounts]
│   └── index.ts
│
├── 🎨 UI
│   ├── routes/
│   │   ├── pos.screen.tsx       [Main SPA Entry Point]
│   │   │   ├── Provider nesting: SaleProvider → PaymentProvider → POSUIProvider
│   │   │   └── Render: <POSTabContent />
│   │   └── index.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── POSHeader.tsx           [Session info, time, user]
│   │   │   ├── POSTabContent.tsx       [Tab router SPA - 4 tabs]
│   │   │   │   ├── BrowseTab (visible/invisible)
│   │   │   │   ├── SaleTab (visible/invisible)
│   │   │   │   ├── PaymentTab (visible/invisible)
│   │   │   │   └── HistoryTab (visible/invisible)
│   │   │   └── index.ts
│   │   │
│   │   └── shared/
│   │       ├── ProductQuickSearch.tsx  [Barcode scanner + autocomplete]
│   │       ├── NumericKeypad.tsx       [For cash input]
│   │       ├── ReceiptPreview.tsx      [Preview antes de imprimir]
│   │       └── index.ts
│   │
│   └── features/
│       ├── browse/                     [Tab 1: Buscar productos]
│       │   ├── BrowseTab.tsx
│       │   ├── ProductSearchBar.tsx
│       │   ├── CategoryQuickSelect.tsx
│       │   ├── ProductGrid.tsx
│       │   └── index.ts
│       │
│       ├── sale/                       [Tab 2: Carrito activo]
│       │   ├── SaleTab.tsx
│       │   ├── SaleItems.tsx           [Lista de items]
│       │   ├── SaleItemRow.tsx         [Item individual]
│       │   ├── SaleDiscount.tsx        [Aplicar descuentos]
│       │   ├── SaleSummary.tsx         [Subtotal, tax, total]
│       │   └── index.ts
│       │
│       ├── payment/                    [Tab 3: Procesar pago]
│       │   ├── PaymentTab.tsx
│       │   ├── PaymentMethodSelector.tsx [Cash, Card, Transfer]
│       │   ├── CashPayment.tsx         [Keypad + calculate change]
│       │   ├── CardPayment.tsx         [Terminal integration]
│       │   ├── ReceiptPrint.tsx        [Print button + preview]
│       │   └── index.ts
│       │
│       └── history/                    [Tab 4: Historial]
│           ├── HistoryTab.tsx
│           ├── TransactionList.tsx
│           ├── TransactionDetail.tsx
│           └── index.ts
│
└── index.ts                            [Feature-level barrel export]
```

---

## Orden de Implementación (Batches)

### Batch 1: ✅ COMPLETADO
- Types (models, inputs, queries)
- Schemas (Zod validation)

### Batch 2: Sub-feature SALE (como cart/)
1. `sale/types/` - Tipos específicos de sale
2. `sale/server/queries.ts` - DB queries
3. `sale/server/service.ts` - Business logic
4. `sale/server/actions.ts` - Server actions
5. `sale/context/SaleContext.tsx` - Context principal
6. `sale/hooks/useSale.ts` - Hook de acceso
7. `sale/index.ts` - Barrel export

### Batch 3: Sub-feature PAYMENT (como checkout/)
1. `payment/types/` - Tipos específicos
2. `payment/server/actions.ts` - Process payment, print receipt
3. `payment/context/PaymentContext.tsx` - Orquestación
4. `payment/hooks/usePayment.ts` - Hook de acceso
5. `payment/index.ts` - Barrel export

### Batch 4: Sub-feature SESSION
1. `session/server/queries.ts`
2. `session/server/actions.ts` - Open/close session
3. `session/hooks/useSession.ts` - TanStack Query hook
4. `session/index.ts`

### Batch 5: Infrastructure
1. `server/queries.ts` - Consolidated queries
2. `server/service.ts` - Business logic
3. `server/mappers.ts` - Data transformation
4. `server/actions.ts` - Consolidated actions

### Batch 6: Hooks & Context
1. `hooks/usePOSData.ts` - Main data hook
2. `hooks/useTransactions.ts`
3. `hooks/queryKeys.ts`
4. `context/POSUIContext.tsx` - UI state ligero

### Batch 7: Utils
1. `utils/receipt.formatter.ts`
2. `utils/transaction.helpers.ts`
3. `utils/payment.calculator.ts`

### Batch 8: UI - Routes & Layout
1. `ui/routes/pos.screen.tsx` - Main entry point
2. `ui/components/layout/POSHeader.tsx`
3. `ui/components/layout/POSTabContent.tsx` - Tab router

### Batch 9: UI - Shared Components
1. `ui/components/shared/ProductQuickSearch.tsx`
2. `ui/components/shared/NumericKeypad.tsx`
3. `ui/components/shared/ReceiptPreview.tsx`

### Batch 10: UI - Feature Tabs
1. `ui/features/browse/BrowseTab.tsx`
2. `ui/features/sale/SaleTab.tsx`
3. `ui/features/payment/PaymentTab.tsx`
4. `ui/features/history/HistoryTab.tsx`

---

## Provider Nesting (Crítico)

```typescript
// En pos.screen.tsx
const POSScreen = () => (
  <SaleProvider>           {/* Primero: Sale state */}
    <PaymentProvider>      {/* Segundo: Payment state (depende de Sale) */}
      <POSUIProvider>      {/* Tercero: UI state (ligero) */}
        <POSTabContent />
      </POSUIProvider>
    </PaymentProvider>
  </SaleProvider>
);
```

**Razón del orden:**
- SaleProvider primero → Maneja items, totales
- PaymentProvider segundo → Consume `useSaleContext()` para calcular payment
- POSUIProvider tercero → Solo UI (tabs, modals), independiente

---

## Comparación de Contextos

### SaleContext (POS) vs CartContext (Storefront)

| Aspecto | CartContext | SaleContext |
|---------|-------------|-------------|
| **Items** | CartItem[] | SaleItem[] |
| **SessionID** | Usa localStorage (anon users) | Usa POSSession (cashier) |
| **Totals** | Subtotal + tax + shipping | Subtotal + tax + discount |
| **Actions** | add, update, remove, clear, refresh | add, update, remove, clear, applyDiscount |
| **Dependencies** | Server Actions | Server Actions |
| **Performance** | useMemo + useCallback | useMemo + useCallback |

### PaymentContext (POS) vs CheckoutContext (Storefront)

| Aspecto | CheckoutContext | PaymentContext |
|---------|-----------------|----------------|
| **Depends on** | CartContext | SaleContext |
| **Steps** | Shipping → Payment → Review → Processing | Payment Method → Amount → Process |
| **Payment** | Stripe integration | Cash/Card/Transfer |
| **Output** | Order + Payment Intent | Transaction + Receipt |
| **Addresses** | Sí (shipping) | No (venta directa) |

---

## Decisiones de Diseño

### ¿Por qué NO copiar exactamente storefront?

1. **No necesita checkout complejo:**
   - Storefront: Shipping address, payment methods guardados, Stripe
   - POS: Pago directo (cash/card), sin shipping

2. **No necesita wishlist/account:**
   - Storefront: Customer-facing, guardar para después
   - POS: Transacción inmediata, sin guardar

3. **Necesita session management:**
   - Storefront: No tiene concepto de "sesión de cajero"
   - POS: Crítico para tracking de efectivo y responsabilidad

4. **Diferentes métricas:**
   - Storefront: Productos vistos, abandono de carrito
   - POS: Transacciones por hora, efectivo en caja, reconciliación

### ¿Qué patrones SÍ reutilizar?

✅ **Patrón SPA con tabs:**
- Todos los tabs siempre montados
- Visibility: hidden para tabs inactivos
- Transiciones suaves

✅ **Separación de contextos:**
- SaleContext (data) vs POSUIContext (UI)
- PaymentContext orquesta sobre SaleContext

✅ **Server Actions + TanStack Query:**
- Mutations con Server Actions
- Queries con TanStack Query
- Optimistic updates

✅ **Estructura server/types/hooks/ui:**
- Mantener misma organización
- Facilita onboarding de nuevos devs

---

## Próximos Pasos

Continuar con **Batch 2: Sub-feature SALE**

Crear archivos en este orden:
1. `sale/types/`
2. `sale/server/queries.ts`
3. `sale/server/service.ts`
4. `sale/server/actions.ts`
5. `sale/context/SaleContext.tsx`
6. `sale/hooks/useSale.ts`
