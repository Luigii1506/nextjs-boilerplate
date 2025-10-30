# 🏪 POS (Point of Sale) Feature

Modern, professional Point of Sale system built with Next.js 15, Prisma, and Zustand.

---

## 📋 Overview

This feature provides a complete POS solution for retail businesses with:
- Session management (open/close cash register)
- Product browsing and searching
- Shopping cart management
- Payment processing (Cash, Card, Transfer)
- Transaction history
- Sales reporting
- Real-time inventory updates

---

## 🏗️ Architecture

### State Management (Zustand)

The POS uses **Zustand stores** for global state management:

```
┌─────────────────────────────────────────────┐
│           POS Application                    │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ Session Store│  │  Sale Store  │        │
│  │ (Zustand)    │  │  (Zustand)   │        │
│  └──────────────┘  └──────────────┘        │
│                                              │
│         ┌──────────────┐                    │
│         │Payment Store │                    │
│         │  (Zustand)   │                    │
│         └──────────────┘                    │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │      POSUIProvider (Context)         │  │
│  │   (Modal states, Active tab)         │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Single source of truth
- ✅ No state synchronization issues
- ✅ Automatic updates across all components
- ✅ Redux DevTools integration
- ✅ Better performance with selective subscriptions

---

## 🚀 Quick Start

### Import Stores

```typescript
import {
  // Session
  useSessionStore,
  useSessionActions,
  useIsSessionOpen,
  useHasActiveSession,

  // Sale
  useSaleStore,
  useSaleActions,
  useSaleItems,
  useSaleSummary,
  useHasItems,
  useCanCheckout,

  // Payment
  usePaymentStore,
  usePaymentActions,
  usePaymentFacade,
  useCurrentTransaction,
  usePaymentProcessing,
} from '@/features/pos';
```

### Basic Usage

```typescript
const POSComponent = () => {
  // Session management
  const isSessionOpen = useIsSessionOpen();
  const { openSession, closeSession } = useSessionActions();

  // Cart management
  const items = useSaleItems();
  const summary = useSaleSummary();
  const hasItems = useHasItems();
  const canCheckout = useCanCheckout();
  const { addItem, removeItem } = useSaleActions();

  // Payment processing
  const isProcessing = usePaymentProcessing();
  const { processPayment } = usePaymentActions();
  // or aggregate everything via the facade
  // const payment = usePaymentFacade();

  // Your component logic...
};
```

> **Important:** Action hooks use `useMemo` internally for React 19 compatibility. See [docs/zustand-react19-pattern.md](../../docs/zustand-react19-pattern.md) for detailed explanation and best practices when working with Zustand stores.
>
> **Note:** Payment state se gestiona exclusivamente con Zustand (`usePaymentActions` / `usePaymentFacade`).

---

## 📁 Project Structure

```
src/features/pos/
├── ui/                        # UI Components
│   ├── components/
│   │   ├── layout/           # Header, Navigation, Footer
│   │   ├── modals/           # OpenSession, CloseSession modals
│   │   └── SessionGuard.tsx  # Access control
│   ├── features/
│   │   ├── browse/           # Product browsing
│   │   ├── sale/             # Cart view
│   │   ├── payment/          # Payment processing
│   │   └── history/          # Transaction history
│   └── routes/
│       └── pos.screen.tsx    # Main SPA screen
│
├── context/                   # React Context (UI-only state)
│   └── POSUIContext.tsx      # Tabs, modals, UI toggles
│
├── session/
│   ├── state/                # Zustand session store
│   │   └── session.store.ts
│   ├── server/               # Session server actions & queries
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   └── service.ts
│   └── schemas/
│
├── sale/
│   ├── state/                # Zustand sale/cart store (React 19 safe)
│   │   └── sale.store.ts
│   ├── server/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   └── service.ts
│   ├── schemas/
│   └── hooks/                # Sale hooks (selectors, invalidations)
│
├── payment/
│   ├── state/                # Zustand payment store
│   │   └── payment.store.ts
│   ├── server/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   └── types.ts
│   └── types/
│
├── hooks/                     # Data-fetch hooks (TanStack Query)
│   ├── usePOSData.ts
│   ├── useSearchProducts.ts
│   └── useCategories.ts
│
├── types/                     # Domain models & inputs
│   ├── models.ts
│   ├── inputs.ts
│   └── queries.ts
│
└── utils/                     # Shared utilities (formatters, helpers)
    └── formatters.ts
```

> ℹ️ **Cache hygiene:** Usa `usePOSInvalidations()` para centralizar la limpieza de TanStack Query (historial, dashboard, venta activa) en lugar de llamar `queryClient.invalidateQueries` manualmente.

---

## 🔑 Key Features

### 1. Session Management
- Open/close cash register
- Track initial/final cash amounts
- Session status (OPEN, CLOSED, SUSPENDED)
- Session summary and reporting

### 2. Product Browsing
- Real-time product search
- Category filtering
- Stock level indicators
- Quick add to cart

### 3. Shopping Cart
- Add/remove items
- Update quantities
- Apply discounts
- Real-time total calculation
- Dedicated Prisma models (`pos_carts`, `pos_cart_items`, `pos_cart_adjustments`) isolated from storefront carts

### 4. Payment Processing
- Multiple payment methods (Cash, Card, Transfer)
- Mixed payments
- Change calculation
- Transaction receipts

### 5. Transaction History
- View past transactions
- Transaction details
- Sales reports
- Performance metrics

---

## 🎯 Component Guide

### SessionGuard

Protects POS routes and ensures user has an active session:

```typescript
<SessionGuard>
  <POSInterface />
</SessionGuard>
```

**Features:**
- Blocks access without authentication
- Shows "Open Session" form if no active session
- Automatically loads session on mount
- Clean loading states

### BrowseTab

Product browsing and search interface:

```typescript
const { addItem } = useSaleActions();

const handleAddToCart = async (productId: string) => {
  await addItem(productId, 1);
};
```

### SaleTab

Shopping cart view:

```typescript
const items = useSaleItems();
const summary = useSaleSummary();
const { updateQuantity, removeItem, clearSale } = useSaleActions();
```

### PaymentTab

Payment processing interface:

```typescript
const { processPayment } = usePaymentActions();
const { clearSale } = useSaleActions();

const handleCheckout = async () => {
  const result = await processPayment({
    sessionId,
    paymentMethod: 'CASH',
    amountPaid: 1000,
  });

  if (result.success) {
    await clearSale();
  }
};
```

---

## 📊 State Management Details

### Session Store

**State:**
- `currentSession` - Current active session
- `sessionSummary` - Session statistics
- `isLoading` - Loading state
- `error` - Error message

**Actions:**
- `loadActiveSession(userId)` - Load user's active session
- `openSession(userId, initialCash, notes?)` - Open new session
- `closeSession(finalCash, notes?)` - Close session
- `suspendSession()` - Suspend session
- `resumeSession()` - Resume session

### Sale Store

**State:**
- `sessionId` - Current session ID
- `items` - Cart items
- `summary` - Totals (subtotal, tax, discount, total)
- `isLoading` - Loading state
- `isInitialized` - Initialization status

**Actions:**
- `setSessionId(sessionId)` - Set session and initialize
- `addItem(productId, quantity)` - Add to cart
- `updateQuantity(itemId, quantity)` - Update quantity
- `removeItem(itemId)` - Remove from cart
- `clearSale()` - Clear cart
- `applyDiscount(type, value)` - Apply discount

### Payment Store

**State:**
- `paymentState` - Payment details
- `currentTransaction` - Completed transaction

**Actions:**
- `setPaymentMethod(method)` - Set payment method
- `setAmountPaid(amount)` - Set amount
- `processPayment(input)` - Process payment
- `resetPayment()` - Reset state

---

## 🔧 Development

### Prerequisites
```bash
# Environment variables
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Run Development Server
```bash
npm run dev
# Navigate to http://localhost:3000/pos
```

### Database Schema
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Seed test data (optional)
npm run seed:pos
```

---

## 🧪 Testing

### Manual Testing Checklist

1. **Session Flow**
   - [ ] Open session with initial cash
   - [ ] Verify session shows in header
   - [ ] Close session with final cash
   - [ ] Verify returns to "Open Session" form

2. **Cart Flow**
   - [ ] Add products to cart
   - [ ] Update quantities
   - [ ] Remove items
   - [ ] Verify totals calculation

3. **Payment Flow**
   - [ ] Process cash payment
   - [ ] Process card payment
   - [ ] Verify change calculation
   - [ ] Verify transaction receipt

4. **Edge Cases**
   - [ ] Try accessing POS without session
   - [ ] Try checkout with empty cart
   - [ ] Try insufficient payment amount
   - [ ] Verify stock updates after sale

---

## 🐛 Debugging

### Redux DevTools

All stores are connected to Redux DevTools:

1. Install [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
2. Open browser DevTools → Redux tab
3. Inspect stores: **POS-Session**, **POS-Sale**, **POS-Payment**

### Common Issues

**Issue:** State not updating
```typescript
// ❌ Wrong
const { currentSession } = useSessionStore();

// ✅ Correct
const currentSession = useSessionStore((state) => state.currentSession);
```

**Issue:** Too many re-renders
```typescript
// ❌ Wrong - Re-renders on any store change
const store = useSaleStore();

// ✅ Correct - Only re-renders when items change
const items = useSaleItems();
```

---

## 📚 Documentation

- [POS State Management Guide](../../docs/pos-state-management.md) - Quick reference
- [Zustand Migration Guide](../../docs/pos-zustand-migration.md) - Full migration details
- [API Documentation](./docs/api.md) - Server actions and queries

---

## 🚧 Roadmap

- [ ] React Query integration for server state caching
- [ ] Offline mode with Zustand persist
- [ ] Receipt printing
- [ ] Barcode scanning
- [ ] Multi-currency support
- [ ] Advanced reporting dashboard
- [ ] Employee permissions system

---

## 🤝 Contributing

1. Follow the existing architecture patterns
2. Use Zustand stores for global state
3. Use server actions for data mutations
4. Write TypeScript types for all data structures
5. Add JSDoc comments to functions
6. Test manually before committing

---

## 📄 License

This feature is part of the NextJS Boilerplate project.
