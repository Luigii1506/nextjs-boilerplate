# 🛒 Cart Feature

**Version:** 2.0.0 - Cleaned & Optimized
**Architecture:** Feature-First v3.0.0
**State Management:** Context API (Optimized)

---

## 📁 Structure

```
src/features/cart/
├── context/                    # State Management
│   ├── CartContext.tsx        # Main cart context (optimized, stable callbacks)
│   └── index.ts               # Context exports
│
├── server/                    # Server Layer
│   ├── actions.ts            # Next.js Server Actions
│   ├── service.ts            # Business logic
│   ├── queries.ts            # Database queries
│   ├── validators.ts         # Input validation
│   ├── mappers.ts            # Data transformation
│   └── index.ts              # Server exports
│
├── types/                     # TypeScript Types
│   ├── models.ts             # Domain models
│   ├── api.ts                # API types
│   ├── hooks.ts              # Hook types
│   └── index.ts              # Types exports
│
├── ui/                        # UI Layer
│   └── components/
│       ├── cart/             # Cart components
│       │   ├── CartTab.tsx
│       │   ├── CartItem.tsx      # ✅ FIXED - Edit Mode Pattern
│       │   ├── CartBadge.tsx
│       │   ├── CartEmpty.tsx
│       │   ├── CartSummary.tsx
│       │   └── index.ts
│       ├── debug/            # Debug components
│       │   └── CartDebugPanel.tsx
│       ├── shared/           # Shared components
│       │   └── index.ts
│       └── index.ts
│
├── hooks/                     # Custom Hooks (minimal)
│   └── index.ts              # Note: Cart uses Context API directly
│
├── utils/                     # Utilities
│   └── index.ts
│
└── index.ts                   # Main feature export
```

---

## 🎯 Key Components

### Context API (Primary State Management)

**File:** `context/CartContext.tsx`

```typescript
// Main cart state management with optimized callbacks
export function useCartContext() {
  return {
    // 📊 Data
    items: CartItemWithProduct[];
    summary: CartSummary | null;
    itemCount: number;
    totalAmount: number;

    // 🎛️ State
    isLoading: boolean;
    isError: boolean;

    // ⚡ Actions (stable callbacks with refs)
    addToCart: (productId: string, quantity: number) => Promise<void>;
    updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
    removeItem: (cartItemId: string) => Promise<void>;
    refreshCart: () => Promise<void>;

    // 🧮 Utilities
    formatPrice: (amount: number) => string;
  };
}
```

**Key Features:**
- ✅ Stable callbacks (no unnecessary re-renders)
- ✅ Automatic auth sync (user/session handling)
- ✅ Optimistic updates with server confirmation
- ✅ Error handling and rollback

### CartItem Component

**File:** `ui/components/cart/CartItem.tsx`

**Fixed with Edit Mode Pattern** (solves infinite loop):

```typescript
// ✅ Uses refs to track state changes
const isUserEditingRef = useRef(false);
const lastServerQuantityRef = useRef(item.quantity);

// Only syncs to server when user is editing
useEffect(() => {
  if (localQuantity !== item.quantity && isUserEditingRef.current) {
    // Debounce and sync to server
  }
}, [localQuantity, item.quantity]);

// Only syncs from server when NOT editing
useEffect(() => {
  if (
    item.quantity !== lastServerQuantityRef.current &&
    !isUserEditingRef.current
  ) {
    setLocalQuantity(item.quantity);
  }
  lastServerQuantityRef.current = item.quantity;
}, [item.quantity]);
```

---

## 🚀 Usage

### Basic Setup

```typescript
// 1. Wrap your app with CartProvider
import { CartProvider } from "@/features/cart";

export default function App({ children }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}

// 2. Use cart in any component
import { useCartContext } from "@/features/cart";

export function MyComponent() {
  const { items, addToCart, removeItem } = useCartContext();

  const handleAdd = async () => {
    await addToCart("product-id", 1);
  };

  return (
    <div>
      <p>Cart has {items.length} items</p>
      <button onClick={handleAdd}>Add to Cart</button>
    </div>
  );
}
```

### Server Actions

```typescript
import {
  addToCartAction,
  updateCartItemAction,
  removeFromCartAction,
  getCartAction,
} from "@/features/cart";

// Add to cart
const result = await addToCartAction({
  productId: "123",
  quantity: 2,
  userId: user?.id,
  sessionId: sessionId,
});

// Update quantity
const result = await updateCartItemAction({
  cartItemId: "cart-item-id",
  quantity: 3,
  userId: user?.id,
});

// Remove item
const result = await removeFromCartAction({
  cartItemId: "cart-item-id",
  userId: user?.id,
});
```

---

## ⚡ Performance Optimizations

### 1. Stable Callbacks

All cart actions use `useCallback` with minimal dependencies:

```typescript
// ✅ GOOD - Stable callback
const addToCart = useCallback(
  async (productId: string, quantity: number) => {
    // ...
  },
  [userId, sessionId] // Only auth-related deps
);
```

### 2. Ref-Based Access

Components use refs to access latest values without causing re-renders:

```typescript
// ✅ GOOD - Use ref for latest value
const addToCartRef = useRef(addToCart);
useEffect(() => {
  addToCartRef.current = addToCart;
}, [addToCart]);

const stableHandler = useCallback(
  async () => {
    await addToCartRef.current(productId, quantity);
  },
  [] // No dependencies!
);
```

### 3. Optimistic Updates

UI updates immediately, server confirms in background:

```typescript
// 1. Update UI immediately (optimistic)
setLocalQuantity(newQuantity);

// 2. Sync to server (debounced)
debounceTimer = setTimeout(async () => {
  await onQuantityChange(itemId, newQuantity);
}, 400);

// 3. Server confirms or rolls back
```

---

## 🐛 Bug Fixes & Patterns

### Infinite Loop Fix (CartItem)

**Problem:** Bidirectional state sync created infinite renders

**Solution:** Edit Mode Pattern with refs

```typescript
// ✅ Pattern to prevent infinite loops
1. isUserEditingRef - Tracks if change is user-initiated
2. lastServerQuantityRef - Detects real server changes
3. Separate flows:
   - User → Server: Only when isUserEditing = true
   - Server → UI: Only when isUserEditing = false
```

**Documentation:** See [INFINITE_LOOP_POST_MORTEM.md](/docs/Architecture/INFINITE_LOOP_POST_MORTEM.md)

### Stale Closures Fix (Storefront)

**Problem:** Cart handlers had stale references

**Solution:** Ref-based stable callbacks

```typescript
// In storefront.screen.tsx
const addToCartRef = useRef(addToCart);
useEffect(() => {
  addToCartRef.current = addToCart;
}, [addToCart]);

const handleAddToCart = useCallback(
  async (productId, quantity) => {
    await addToCartRef.current(productId, quantity);
  },
  [] // Stable!
);
```

---

## 📊 Type System

### Main Types

```typescript
// Cart with items
interface CartWithItems {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: CartItemWithProduct[];
  subtotal: number;
  taxAmount: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

// Cart item with product data
interface CartItemWithProduct {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: ProductForCart;
  createdAt: Date;
  updatedAt: Date;
}

// Cart summary
interface CartSummary {
  itemCount: number;
  uniqueItems: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
}
```

---

## 🧪 Testing

### Unit Tests

```typescript
// Test cart context
describe("CartContext", () => {
  it("should add item to cart", async () => {
    const { result } = renderHook(() => useCartContext(), {
      wrapper: CartProvider,
    });

    await act(async () => {
      await result.current.addToCart("product-1", 2);
    });

    expect(result.current.items).toHaveLength(1);
  });
});

// Test CartItem optimistic updates
describe("CartItem", () => {
  it("should update quantity optimistically", async () => {
    const { getByRole } = render(
      <CartItem item={mockItem} onQuantityChange={jest.fn()} />
    );

    const incrementButton = getByRole("button", { name: /increment/i });
    await userEvent.click(incrementButton);

    // UI updates immediately
    expect(getByDisplayValue("2")).toBeInTheDocument();
  });
});
```

---

## 📚 Related Documentation

- [Infinite Loop Post-Mortem](/docs/Architecture/INFINITE_LOOP_POST_MORTEM.md)
- [State Management Guidelines](/docs/Architecture/STATE_MANAGEMENT_GUIDELINES.md)
- [Optimistic Updates Pattern](/docs/Architecture/OPTIMISTIC_UPDATES_PATTERN.md)
- [Quick Reference](/docs/Architecture/QUICK_REFERENCE_STATE_PATTERNS.md)

---

## 🔄 Changelog

### v2.0.0 - Cleaned & Optimized (2025-01-30)

**Removed:**
- ❌ `CartContext.backup.tsx` - Unnecessary backup
- ❌ `CartContextUltraFast.tsx` - Not being used
- ❌ `hooks/cart/*` - Unused custom hooks
- ❌ `hooks/persistence/*` - Unused
- ❌ `hooks/shared/*` - Unused

**Fixed:**
- ✅ Infinite loop in CartItem (Edit Mode Pattern)
- ✅ Stale closures in Storefront (Ref-based callbacks)
- ✅ Optimized context (stable callbacks)

**Kept:**
- ✅ `CartContext.tsx` - Main context (optimized)
- ✅ Server layer (actions, service, queries)
- ✅ UI components (CartItem with fix)
- ✅ Type system (complete & accurate)

### v1.0.0 - Initial Implementation

- Initial cart feature with TanStack Query
- Context API for state management
- Server actions for mutations

---

**Maintained by:** Engineering Team
**Last Updated:** 2025-01-30
**Status:** Production Ready ✅
