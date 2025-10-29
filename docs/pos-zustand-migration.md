# POS Zustand Migration Guide

## Overview

The POS system has been migrated from Context Providers to Zustand stores for better performance, cleaner architecture, and elimination of state synchronization issues.

**Migration Date:** October 2025
**Motivation:** Solve state desynchronization issues between multiple component instances

---

## Architecture Change

### Before (Context Providers)
```
<SaleProvider>
  <PaymentProvider>
    <POSUIProvider>
      <Component1 /> // Independent usePOSSession() instance
      <Component2 /> // Independent usePOSSession() instance
      <Component3 /> // Independent usePOSSession() instance
    </POSUIProvider>
  </PaymentProvider>
</SaleProvider>
```

**Problems:**
- Multiple independent instances of `usePOSSession()` caused state desynchronization
- Required manual `router.refresh()` after state changes
- Nested Providers caused cascading re-renders
- Complex synchronization logic with `useEffect`

### After (Zustand Stores)
```
<POSUIProvider>
  <Component1 /> // Shares sessionStore
  <Component2 /> // Shares sessionStore
  <Component3 /> // Shares sessionStore
</POSUIProvider>
```

**Benefits:**
- ✅ Single source of truth for all state
- ✅ Automatic state propagation to all components
- ✅ No manual refresh required
- ✅ Selective subscriptions for optimal performance
- ✅ Redux DevTools integration

---

## New Zustand Stores

### 1. Session Store (`sessionStore.ts`)

**Replaces:** `usePOSSession` hook

**State:**
```typescript
{
  currentSession: POSSession | null;
  sessionSummary: POSSessionSummary | null;
  isLoading: boolean;
  error: string | null;
}
```

**Computed Properties:**
- `hasActiveSession()` - Returns true if there's a current session
- `isSessionOpen()` - Returns true if session status is OPEN
- `isSessionClosed()` - Returns true if session status is CLOSED
- `isSessionSuspended()` - Returns true if session status is SUSPENDED

**Actions:**
- `loadActiveSession(userId)` - Load active session for user
- `openSession(userId, initialCash, notes?)` - Open new session
- `closeSession(finalCash, notes?)` - Close current session
- `suspendSession()` - Suspend current session
- `resumeSession()` - Resume suspended session
- `clearSession()` - Clear session state

**Usage:**
```typescript
// In any component
import { useSessionStore, useIsSessionOpen, useSessionActions } from '@/features/pos';

const MyComponent = () => {
  const currentSession = useSessionStore((state) => state.currentSession);
  const isSessionOpen = useIsSessionOpen();
  const { openSession, closeSession } = useSessionActions();

  // Use the data...
};
```

---

### 2. Sale Store (`saleStore.ts`)

**Replaces:** `SaleProvider` and `useSale` hook

**State:**
```typescript
{
  sessionId: string | null;
  items: POSSaleItemWithProduct[];
  summary: POSSaleSummary;
  isLoading: boolean;
  isInitialized: boolean;
}
```

**Computed Properties:**
- `itemCount()` - Total quantity of all items
- `total()` - Total amount from summary
- `hasItems()` - Returns true if cart has items
- `canCheckout()` - Returns true if ready for checkout

**Actions:**
- `setSessionId(sessionId)` - Set session ID and initialize sale
- `initializeSale(sessionId)` - Load active sale for session
- `addItem(productId, quantity)` - Add product to cart
- `updateQuantity(itemId, quantity)` - Update item quantity
- `removeItem(itemId)` - Remove item from cart
- `clearSale()` - Clear all items
- `applyDiscount(type, value)` - Apply discount to sale
- `refreshSale()` - Refresh sale data from server
- `reset()` - Reset store to initial state

**Usage:**
```typescript
import { useSaleStore, useSaleItems, useSaleSummary, useSaleActions } from '@/features/pos';

const MyComponent = () => {
  const items = useSaleItems();
  const summary = useSaleSummary();
  const { addItem, removeItem } = useSaleActions();

  // Use the data...
};
```

---

### 3. Payment Store (`paymentStore.ts`)

**Replaces:** `PaymentProvider` and `usePayment` hook

**State:**
```typescript
{
  paymentState: {
    sessionId: string | null;
    saleSummary: POSSaleSummary | null;
    paymentMethod: POSPaymentMethod | null;
    amountPaid: number;
    changeDue: number;
    mixedPayment: MixedPaymentInput | null;
    isProcessing: boolean;
    isComplete: boolean;
    error: string | null;
    // ... more fields
  };
  currentTransaction: POSTransactionResult | null;
}
```

**Computed Properties:**
- `isProcessing()` - Returns true if payment is processing
- `isComplete()` - Returns true if payment is complete
- `error()` - Returns current error message
- `canProcess()` - Returns true if can process payment
- `changeDue()` - Returns calculated change due
- `requiresChange()` - Returns true if change is due

**Actions:**
- `setPaymentMethod(method)` - Set payment method
- `setAmountPaid(amount)` - Set amount paid
- `setMixedPayment(cash, card, transfer)` - Set mixed payment amounts
- `setSaleSummary(summary)` - Set sale summary for payment
- `processPayment(input)` - Process the payment
- `resetPayment()` - Reset payment state

**Usage:**
```typescript
import { usePaymentStore, useCurrentTransaction, usePaymentActions } from '@/features/pos';

const MyComponent = () => {
  const isProcessing = usePaymentStore((state) => state.isProcessing());
  const transaction = useCurrentTransaction();
  const { setPaymentMethod, processPayment } = usePaymentActions();

  // Use the data...
};
```

---

## Migration Examples

### Example 1: Opening a Session

**Before (with usePOSSession):**
```typescript
const { openSession, loadActiveSession } = usePOSSession();

const handleOpen = async () => {
  await openSession(initialCash, notes);
  await loadActiveSession(); // Manual reload needed
  router.refresh(); // Manual refresh needed
};
```

**After (with sessionStore):**
```typescript
const { openSession } = useSessionActions();

const handleOpen = async () => {
  await openSession(userId, initialCash, notes);
  // State automatically propagates to all components!
};
```

---

### Example 2: Closing a Session

**Before (with usePOSSession):**
```typescript
const { closeSession, loadActiveSession } = usePOSSession();

const handleClose = async () => {
  await closeSession(finalCash, notes);
  await loadActiveSession(); // Manual reload
  router.refresh(); // Manual refresh
};
```

**After (with sessionStore):**
```typescript
const { closeSession } = useSessionActions();

const handleClose = async () => {
  await closeSession(finalCash, notes);
  // SessionGuard automatically detects session is closed!
};
```

---

### Example 3: Adding Items to Cart

**Before (with SaleProvider):**
```typescript
const { addItem } = useSale();

const handleAdd = async (productId: string) => {
  await addItem(productId, 1);
  // Multiple re-renders due to Provider nesting
};
```

**After (with saleStore):**
```typescript
const { addItem } = useSaleActions();

const handleAdd = async (productId: string) => {
  await addItem(productId, 1);
  // Only subscribing components re-render
};
```

---

## Store Initialization

The stores are initialized in `pos.screen.tsx` using the `StoreInitializer` component:

```typescript
const StoreInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentSession = useSessionStore((state) => state.currentSession);
  const setSessionId = useSaleStore((state) => state.setSessionId);

  // Auto-initialize sale store when session changes
  useEffect(() => {
    if (currentSession?.id) {
      setSessionId(currentSession.id);
    } else {
      setSessionId(null);
    }
  }, [currentSession?.id, setSessionId]);

  return <>{children}</>;
};
```

---

## Performance Optimizations

### Selective Subscriptions

Zustand allows components to subscribe only to the data they need:

```typescript
// ❌ BAD - Component re-renders on ANY store change
const store = useSaleStore();

// ✅ GOOD - Component only re-renders when items change
const items = useSaleStore((state) => state.items);

// ✅ EVEN BETTER - Use selector hooks
const items = useSaleItems(); // Pre-optimized selector
```

### Computed Properties

Computed properties are memoized and don't cause re-renders unless dependencies change:

```typescript
const canCheckout = useSaleStore((state) => state.canCheckout());
// Only re-renders when items or summary change
```

---

## Redux DevTools Integration

All stores have Redux DevTools integration enabled:

1. Install Redux DevTools browser extension
2. Open DevTools and navigate to Redux tab
3. You'll see three stores:
   - **POS-Session** - Session state
   - **POS-Sale** - Cart/Sale state
   - **POS-Payment** - Payment state

You can:
- Inspect current state
- View action history
- Time-travel debug (undo/redo actions)

---

## Backward Compatibility

The old Context Providers still exist for backward compatibility but are marked as **DEPRECATED**:

- ❌ `usePOSSession` - Use `useSessionStore` instead
- ❌ `SaleProvider` / `useSale` - Use `useSaleStore` instead
- ❌ `PaymentProvider` / `usePayment` - Use `usePaymentStore` instead

The only remaining Provider is `POSUIProvider` which manages UI-only state (modals, active tab).

---

## Files Changed

### Created Files
- `/src/features/pos/session/state/session.store.ts` - Session Zustand store
- `/src/features/pos/sale/state/sale.store.ts` - Sale Zustand store
- `/src/features/pos/payment/state/payment.store.ts` - Payment Zustand store

### Modified Components
- `SessionGuard.tsx` - Now uses `useSessionStore`
- `POSHeader.tsx` - Now uses `useSessionStore`
- `CloseSessionModal.tsx` - Now uses `useSessionStore`
- `OpenSessionModal.tsx` - Now uses `useSessionStore`
- `BrowseTab.tsx` - Now uses sale selectors from `@/features/pos`
- `SaleTab.tsx` - Now consumes sale metrics/selectors
- `POSNavigation.tsx` - Uses sale metrics selector
- `PaymentTab.tsx` - Uses sale + payment stores from `@/features/pos`
- `pos.screen.tsx` - Removed Provider nesting, added `StoreInitializer`

### Modified Exports
- `/src/features/pos/index.ts` - Added Zustand store exports

---

## Testing Checklist

- [x] Open session flow works without refresh
- [x] Close session flow works without refresh
- [x] Add items to cart updates badge immediately
- [x] Payment processing works correctly
- [x] Session state syncs across all components
- [x] No more router.refresh() calls needed
- [x] Redux DevTools integration works

---

## Troubleshooting

### State not updating in component

**Solution:** Make sure you're subscribing to the correct part of the store:

```typescript
// ❌ WRONG - Not subscribing to anything
const { currentSession } = useSessionStore();

// ✅ CORRECT - Subscribe to specific state
const currentSession = useSessionStore((state) => state.currentSession);
```

### Store not initialized

**Solution:** Make sure `StoreInitializer` is wrapping your components in `pos.screen.tsx`.

### Getting stale data

**Solution:** Use computed properties instead of accessing nested state:

```typescript
// ❌ May be stale
const itemCount = useSaleStore((state) => state.items.length);

// ✅ Always fresh
const itemCount = useSaleStore((state) => state.itemCount());
```

---

## Future Improvements

1. **React Query Integration:** Consider adding React Query for server state caching
2. **Persistence:** Add Zustand persist middleware to save state in localStorage
3. **Optimistic Updates:** Implement optimistic UI updates for better UX
4. **Error Recovery:** Add retry logic and error recovery mechanisms

---

## References

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
