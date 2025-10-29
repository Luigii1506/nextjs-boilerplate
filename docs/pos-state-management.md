# POS State Management - Quick Reference

## Zustand Stores Overview

The POS system uses three Zustand stores for global state management.

---

## 📦 Import Patterns

```typescript
// Session Management
import {
  useSessionStore,
  useIsSessionOpen,
  useSessionActions
} from '@/features/pos';

// Sale Management
import {
  useSaleStore,
  useSaleItems,
  useSaleSummary,
  useSaleActions
} from '@/features/pos';

// Payment Management
import {
  usePaymentStore,
  useCurrentTransaction,
  usePaymentActions
} from '@/features/pos';
```

---

## 🏪 Session Store

### Quick Access
```typescript
// Current session
const currentSession = useSessionStore((state) => state.currentSession);
const isSessionOpen = useIsSessionOpen();
const isLoading = useSessionStore((state) => state.isLoading);

// Actions
const { openSession, closeSession, loadActiveSession } = useSessionActions();
```

### Common Operations
```typescript
// Load active session
await loadActiveSession(userId);

// Open new session
await openSession(userId, initialCash, notes);

// Close session
await closeSession(finalCash, notes);
```

---

## 🛒 Sale Store

### Quick Access
```typescript
// Sale data
const items = useSaleItems();
const summary = useSaleSummary();
const sessionId = useSaleStore((state) => state.sessionId);

// Computed values
const itemCount = useSaleStore((state) => state.itemCount());
const hasItems = useSaleStore((state) => state.hasItems());
const canCheckout = useSaleStore((state) => state.canCheckout());

// Actions
const { addItem, updateQuantity, removeItem, clearSale } = useSaleActions();
```

### Common Operations
```typescript
// Add item to cart
await addItem(productId, quantity);

// Update quantity
await updateQuantity(itemId, newQuantity);

// Remove item
await removeItem(itemId);

// Clear entire cart
await clearSale();

// Apply discount
await applyDiscount('percentage', 10); // 10% off
```

---

## 💳 Payment Store

### Quick Access
```typescript
// Payment state
const paymentState = usePaymentStore((state) => state.paymentState);
const currentTransaction = useCurrentTransaction();

// Computed values
const isProcessing = usePaymentStore((state) => state.isProcessing());
const isComplete = usePaymentStore((state) => state.isComplete());
const changeDue = usePaymentStore((state) => state.changeDue());
const canProcess = usePaymentStore((state) => state.canProcess());

// Actions
const {
  setPaymentMethod,
  setAmountPaid,
  processPayment,
  resetPayment
} = usePaymentActions();
```

### Common Operations
```typescript
// Set payment method
setPaymentMethod('CASH');

// Set amount paid
setAmountPaid(1000);

// Process payment
const result = await processPayment({
  sessionId: 'session-123',
  paymentMethod: 'CASH',
  amountPaid: 1000,
});

// Reset after completion
resetPayment();
```

---

## 🎯 Best Practices

### 1. Selective Subscriptions
```typescript
// ❌ AVOID - Re-renders on any state change
const store = useSaleStore();

// ✅ PREFER - Only re-renders when items change
const items = useSaleStore((state) => state.items);

// ✅ BEST - Use selector hooks
const items = useSaleItems();
```

### 2. Computed Properties
```typescript
// ❌ AVOID - Computed on every render
const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

// ✅ PREFER - Memoized by Zustand
const itemCount = useSaleStore((state) => state.itemCount());
```

### 3. Actions
```typescript
// ❌ AVOID - Direct state manipulation
useSaleStore.setState({ items: [] });

// ✅ PREFER - Use actions
const { clearSale } = useSaleActions();
await clearSale();
```

---

## 🔄 Typical Workflow

### Complete POS Flow
```typescript
const POSComponent = () => {
  // 1. Load session on mount
  const { user } = useAuth();
  const { loadActiveSession } = useSessionActions();

  useEffect(() => {
    if (user?.id) {
      loadActiveSession(user.id);
    }
  }, [user?.id]);

  // 2. Check session status
  const isSessionOpen = useIsSessionOpen();
  if (!isSessionOpen) {
    return <OpenSessionForm />;
  }

  // 3. Add items to cart
  const { addItem } = useSaleActions();
  const handleAddProduct = (productId: string) => {
    await addItem(productId, 1);
  };

  // 4. Process payment
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

  // 5. Close session
  const { closeSession } = useSessionActions();
  const handleCloseSession = async () => {
    await closeSession(finalCash, notes);
  };
};
```

---

## 🛠️ Redux DevTools

All stores are connected to Redux DevTools for debugging:

1. Install Redux DevTools browser extension
2. Open browser DevTools → Redux tab
3. View stores: **POS-Session**, **POS-Sale**, **POS-Payment**

**Features:**
- Inspect current state
- View action history
- Time-travel debugging

---

## 📊 Store State Structure

### Session Store
```typescript
{
  currentSession: POSSession | null,
  sessionSummary: POSSessionSummary | null,
  isLoading: boolean,
  error: string | null
}
```

### Sale Store
```typescript
{
  sessionId: string | null,
  items: POSSaleItemWithProduct[],
  summary: POSSaleSummary,
  isLoading: boolean,
  isInitialized: boolean
}
```

### Payment Store
```typescript
{
  paymentState: {
    sessionId: string | null,
    saleSummary: POSSaleSummary | null,
    paymentMethod: POSPaymentMethod | null,
    amountPaid: number,
    changeDue: number,
    isProcessing: boolean,
    isComplete: boolean,
    error: string | null,
    // ...more fields
  },
  currentTransaction: POSTransactionResult | null
}
```

---

## 🚨 Common Issues

### Issue: State not updating

**Cause:** Not subscribing to state

**Fix:**
```typescript
// ❌ Wrong
const { currentSession } = useSessionStore();

// ✅ Correct
const currentSession = useSessionStore((state) => state.currentSession);
```

### Issue: Too many re-renders

**Cause:** Subscribing to entire store

**Fix:**
```typescript
// ❌ Wrong - Re-renders on any change
const store = useSaleStore();

// ✅ Correct - Only re-renders when items change
const items = useSaleItems();
```

### Issue: Stale data

**Cause:** Using derived state instead of computed properties

**Fix:**
```typescript
// ❌ Wrong - May be stale
const total = items.reduce((sum, item) => sum + item.total, 0);

// ✅ Correct - Always fresh
const total = useSaleStore((state) => state.summary.total);
```

---

## 📚 Related Documentation

- [POS Zustand Migration Guide](./pos-zustand-migration.md) - Full migration details
- [Zustand Official Docs](https://github.com/pmndrs/zustand)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
