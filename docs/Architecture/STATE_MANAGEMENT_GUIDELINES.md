# 🎯 State Management Guidelines
## Professional React State Architecture

**Version:** 1.0
**Last Updated:** 2025-01-30
**Status:** Mandatory for all new features

---

## 📋 Table of Contents

1. [Core Principles](#core-principles)
2. [State Location Decision Tree](#state-location-decision-tree)
3. [Context API Best Practices](#context-api-best-practices)
4. [Optimistic Updates Pattern](#optimistic-updates-pattern)
5. [Common Anti-Patterns](#common-anti-patterns)
6. [Code Review Checklist](#code-review-checklist)

---

## Core Principles

### The 5 Laws of React State

```typescript
/**
 * 🏛️ THE 5 LAWS OF REACT STATE
 * ==============================
 *
 * Law 1: SINGLE SOURCE OF TRUTH
 * - Each piece of data has ONE authoritative source
 * - Derived state should be computed, not stored
 * - Server is the ultimate source of truth
 *
 * Law 2: UNIDIRECTIONAL DATA FLOW
 * - Data flows in ONE direction: Source → Derived → UI
 * - Never create circular dependencies between state
 * - User actions trigger new flows, don't modify existing ones
 *
 * Law 3: MINIMIZE STATE
 * - If it can be computed, don't store it
 * - If it doesn't trigger re-renders, use refs
 * - If it's transient, use local state
 *
 * Law 4: EXPLICIT MUTATIONS
 * - State changes should be traceable
 * - Use action creators or named handlers
 * - Avoid implicit state updates in effects
 *
 * Law 5: GUARD AGAINST LOOPS
 * - Effects should not update their own dependencies
 * - Use refs to break circular dependencies
 * - Add loop detection in development
 */
```

---

## State Location Decision Tree

```
Does this state affect multiple unrelated components?
├─ YES → Context or Global State
│   └─ Is it server data?
│       ├─ YES → Server State (TanStack Query / Server Actions)
│       └─ NO → React Context + useReducer
│
└─ NO → Does it affect siblings?
    ├─ YES → Lift to common parent
    │   └─ Use props or composition
    │
    └─ NO → Local component state
        └─ useState / useReducer
```

### Decision Matrix

| State Type | Where to Store | Tools | Example |
|------------|---------------|-------|---------|
| **Server Data** | Server State Manager | TanStack Query, SWR, Server Actions | Cart items, Product list |
| **Global UI** | Context | React Context + useReducer | Theme, Language, Notifications |
| **Form State** | Local + Library | react-hook-form, Formik | Login form, Checkout form |
| **Transient UI** | Local useState | useState | Modal open/close, Dropdown |
| **URL State** | URL Params | Next.js router, nuqs | Filters, Pagination, Tabs |
| **Non-Rendering** | Refs | useRef | Timers, DOM refs, Previous values |

---

## Context API Best Practices

### ✅ Good Context Structure

```typescript
/**
 * 🏗️ PROFESSIONAL CONTEXT ARCHITECTURE
 * =====================================
 *
 * Separates:
 * 1. Data context (values)
 * 2. Actions context (functions)
 * 3. Computed values (memoized)
 */

import { createContext, useContext, useMemo, useCallback } from 'react';

// 1️⃣ DEFINE TYPES
interface CartData {
  items: CartItem[];
  summary: CartSummary | null;
}

interface CartActions {
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

interface CartComputed {
  isEmpty: boolean;
  itemCount: number;
  totalAmount: number;
}

interface CartContextValue extends CartData, CartActions, CartComputed {
  loading: boolean;
  error: string | null;
}

// 2️⃣ CREATE CONTEXT
const CartContext = createContext<CartContextValue | null>(null);

// 3️⃣ CUSTOM HOOK (with error handling)
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

// 4️⃣ PROVIDER COMPONENT
export function CartProvider({ children }: { children: React.ReactNode }) {
  // ⚙️ State (minimal)
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔗 Refs for non-rendering values
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // 📊 Computed values (memoized)
  const isEmpty = useMemo(() => items.length === 0, [items]);
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.total, 0),
    [items]
  );

  // 🎬 Actions (stable callbacks)
  const addItem = useCallback(
    async (productId: string, quantity: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await addToCartAction({ productId, quantity });
        if (result.success) {
          setItems(result.data.cart.items);
          setSummary(result.data.summary);
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add item');
      } finally {
        setLoading(false);
      }
    },
    [] // ✅ No dependencies - uses server actions directly
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      // ✅ Use ref to access latest items without dependency
      const item = itemsRef.current.find(i => i.id === itemId);
      if (!item) return;

      // Optimistic update
      setItems(prev =>
        prev.map(i => (i.id === itemId ? { ...i, quantity } : i))
      );

      try {
        const result = await updateCartItemAction({ cartItemId: itemId, quantity });
        if (result.success) {
          setItems(result.data.cart.items);
          setSummary(result.data.summary);
        }
      } catch (err) {
        // Rollback on error
        setItems(itemsRef.current);
        setError(err instanceof Error ? err.message : 'Failed to update item');
      }
    },
    [] // ✅ No dependencies - uses ref for items
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const originalItems = itemsRef.current;

      // Optimistic update
      setItems(prev => prev.filter(i => i.id !== itemId));

      try {
        const result = await removeFromCartAction({ cartItemId: itemId });
        if (result.success) {
          setItems(result.data.cart.items);
          setSummary(result.data.summary);
        }
      } catch (err) {
        // Rollback on error
        setItems(originalItems);
        setError(err instanceof Error ? err.message : 'Failed to remove item');
      }
    },
    []
  );

  // 🎁 Context value (memoized)
  const value = useMemo(
    () => ({
      // Data
      items,
      summary,
      loading,
      error,
      // Actions (already stable from useCallback)
      addItem,
      updateItem,
      removeItem,
      // Computed (already memoized)
      isEmpty,
      itemCount,
      totalAmount,
    }),
    [
      items,
      summary,
      loading,
      error,
      addItem,
      updateItem,
      removeItem,
      isEmpty,
      itemCount,
      totalAmount,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
```

### Key Techniques Explained

#### 1. Using Refs for Non-Rendering Access

```typescript
// ✅ Pattern: Ref Mirror
const [items, setItems] = useState<Item[]>([]);
const itemsRef = useRef(items);

useEffect(() => {
  itemsRef.current = items; // Keep ref in sync
}, [items]);

// Now you can access latest items in callbacks without dependency
const updateItem = useCallback((id: string) => {
  const item = itemsRef.current.find(i => i.id === id);
  // No need to add items to dependency array!
}, []);
```

**Why this works:**
- `useCallback` doesn't need `items` in dependencies
- Callback remains stable (doesn't recreate on every render)
- Prevents unnecessary re-renders of child components

#### 2. Memoizing Computed Values

```typescript
// ❌ DON'T: Recomputed on every render
const isEmpty = items.length === 0;
const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

// ✅ DO: Only recomputed when items change
const isEmpty = useMemo(() => items.length === 0, [items]);
const itemCount = useMemo(
  () => items.reduce((sum, item) => sum + item.quantity, 0),
  [items]
);
```

#### 3. Stable Action Callbacks

```typescript
// ❌ DON'T: Function recreated on every render
const addItem = async (productId: string) => {
  const result = await addToCartAction({ productId });
  setItems(result.data);
};

// ✅ DO: Stable callback
const addItem = useCallback(
  async (productId: string) => {
    const result = await addToCartAction({ productId });
    setItems(result.data);
  },
  [] // Empty deps - server actions are stable
);
```

---

## Optimistic Updates Pattern

### The Edit Mode Pattern

Use this for ANY component with:
- User input that syncs to server
- Debounced save
- Need for instant UI feedback

```typescript
/**
 * 🎯 OPTIMISTIC UPDATE ARCHITECTURE
 * ==================================
 *
 * Flow:
 * 1. User action → Immediate local state update
 * 2. Mark as "editing mode"
 * 3. Debounce → Server sync
 * 4. Server response → Clear editing mode
 * 5. Server → Client sync (only when NOT editing)
 */

interface UseOptimisticUpdateProps<T> {
  serverValue: T;
  onSave: (value: T) => Promise<void>;
  debounceMs?: number;
  validate?: (value: T) => boolean;
}

function useOptimisticUpdate<T>({
  serverValue,
  onSave,
  debounceMs = 400,
  validate = () => true,
}: UseOptimisticUpdateProps<T>) {
  // Local optimistic state
  const [localValue, setLocalValue] = useState(serverValue);

  // Tracking refs
  const isEditingRef = useRef(false);
  const lastServerValueRef = useRef(serverValue);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 🎬 USER → SERVER
  useEffect(() => {
    if (localValue !== serverValue && isEditingRef.current) {
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Start new debounce
      debounceTimerRef.current = setTimeout(async () => {
        if (validate(localValue)) {
          try {
            await onSave(localValue);
          } catch (error) {
            // Rollback on error
            setLocalValue(serverValue);
            console.error('Optimistic update failed:', error);
          }
        }

        // Clear editing flag
        isEditingRef.current = false;
      }, debounceMs);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localValue, serverValue, onSave, debounceMs, validate]);

  // 🔄 SERVER → CLIENT
  useEffect(() => {
    if (
      serverValue !== lastServerValueRef.current &&
      !isEditingRef.current
    ) {
      setLocalValue(serverValue);
    }
    lastServerValueRef.current = serverValue;
  }, [serverValue]);

  // 🎯 User edit handler
  const handleChange = useCallback((newValue: T) => {
    isEditingRef.current = true;
    setLocalValue(newValue);
  }, []);

  // 🔄 Force sync
  const forceSync = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    isEditingRef.current = false;
    setLocalValue(serverValue);
  }, [serverValue]);

  return {
    value: localValue,
    onChange: handleChange,
    forceSync,
    isEditing: isEditingRef.current,
    isDirty: localValue !== serverValue,
  };
}

// 📝 USAGE EXAMPLE
function QuantityInput({ item, onUpdate }: QuantityInputProps) {
  const { value, onChange, isDirty } = useOptimisticUpdate({
    serverValue: item.quantity,
    onSave: (qty) => onUpdate(item.id, qty),
    validate: (qty) => qty > 0 && qty <= item.product.stock,
  });

  return (
    <div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        min={1}
        max={item.product.stock}
      />
      {isDirty && <span className="saving-indicator">Saving...</span>}
    </div>
  );
}
```

---

## Common Anti-Patterns

### ❌ Anti-Pattern 1: Effect Updates Its Own Dependency

```typescript
// ❌ WRONG: Infinite loop
const [count, setCount] = useState(0);

useEffect(() => {
  setCount(count + 1); // ♾️ Updates count, which triggers effect again
}, [count]);

// ✅ CORRECT: Use functional update or remove dependency
useEffect(() => {
  setCount(prev => prev + 1); // Only runs on mount
}, []);
```

### ❌ Anti-Pattern 2: Bidirectional State Sync

```typescript
// ❌ WRONG: Effects update each other's dependencies
useEffect(() => {
  setStateA(stateB);
}, [stateB]);

useEffect(() => {
  setStateB(stateA);
}, [stateA]);

// ✅ CORRECT: Single effect with clear direction
const lastServerValueRef = useRef(serverValue);

useEffect(() => {
  if (serverValue !== lastServerValueRef.current) {
    setLocalValue(serverValue);
  }
  lastServerValueRef.current = serverValue;
}, [serverValue]);
```

### ❌ Anti-Pattern 3: Derived State in useState

```typescript
// ❌ WRONG: Storing derived state
const [items, setItems] = useState<Item[]>([]);
const [itemCount, setItemCount] = useState(0);
const [totalAmount, setTotalAmount] = useState(0);

useEffect(() => {
  setItemCount(items.length);
  setTotalAmount(items.reduce((sum, i) => sum + i.total, 0));
}, [items]);

// ✅ CORRECT: Compute on the fly
const [items, setItems] = useState<Item[]>([]);
const itemCount = useMemo(() => items.length, [items]);
const totalAmount = useMemo(
  () => items.reduce((sum, i) => sum + i.total, 0),
  [items]
);
```

### ❌ Anti-Pattern 4: Context Value Not Memoized

```typescript
// ❌ WRONG: New object on every render = all consumers re-render
function Provider({ children }) {
  const [state, setState] = useState({});

  return (
    <Context.Provider value={{ state, setState }}>
      {children}
    </Context.Provider>
  );
}

// ✅ CORRECT: Memoized value
function Provider({ children }) {
  const [state, setState] = useState({});

  const value = useMemo(
    () => ({ state, setState }),
    [state] // setState is stable, doesn't need to be in deps
  );

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}
```

### ❌ Anti-Pattern 5: Missing Cleanup

```typescript
// ❌ WRONG: Timer keeps running after unmount
useEffect(() => {
  const timer = setTimeout(() => {
    doSomething();
  }, 1000);
}, []);

// ✅ CORRECT: Cleanup function
useEffect(() => {
  const timer = setTimeout(() => {
    doSomething();
  }, 1000);

  return () => clearTimeout(timer);
}, []);
```

### ❌ Anti-Pattern 6: Unnecessary Re-Renders from Context

```typescript
// ❌ WRONG: All consumers re-render when ANY state changes
const CartContext = createContext({
  items: [],
  loading: false,
  addItem: () => {},
});

// ✅ BETTER: Split contexts by update frequency
const CartDataContext = createContext({ items: [] });
const CartActionsContext = createContext({ addItem: () => {} });
const CartLoadingContext = createContext({ loading: false });

// ✅ BEST: Use context selectors (with use-context-selector library)
import { createContext } from 'use-context-selector';

const CartContext = createContext({
  items: [],
  loading: false,
});

// Component only re-renders when items change, not loading
function ItemList() {
  const items = useContextSelector(CartContext, ctx => ctx.items);
  // ...
}
```

---

## Code Review Checklist

### State Management Review

When reviewing state-related code, verify:

#### General State
- [ ] Is this the right place for this state? (local vs context vs global)
- [ ] Is this state really needed, or can it be derived?
- [ ] Are all useState/useReducer initialized with correct default values?
- [ ] Are state updates immutable? (no `array.push()`, use spread operator)

#### Effects
- [ ] Does every useEffect have the correct dependencies?
- [ ] Are there any missing cleanup functions?
- [ ] Does any effect update its own dependencies? (loop risk)
- [ ] Are effects doing too much? (should be split)
- [ ] Are there any effects that could be event handlers instead?

#### Context
- [ ] Is the context value memoized?
- [ ] Are callbacks in context stable (useCallback with correct deps)?
- [ ] Is this context too broad? (could it be split?)
- [ ] Does the provider re-render unnecessarily?

#### Optimistic Updates
- [ ] Is there a flag to track user editing state?
- [ ] Is there a ref to track previous server values?
- [ ] Is the debounce timer properly cleaned up?
- [ ] Is there error handling with rollback?
- [ ] Is there protection against concurrent updates?

#### Performance
- [ ] Are expensive computations memoized?
- [ ] Are callbacks stable (useCallback where needed)?
- [ ] Are refs used for non-rendering values?
- [ ] Is React.memo used for expensive pure components?

#### Testing
- [ ] Are there tests for state updates?
- [ ] Are there tests for error cases and rollback?
- [ ] Are there tests for concurrent updates?
- [ ] Is there a render counter in dev mode for critical components?

---

## Testing State Management

### Unit Testing Context

```typescript
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

describe('CartContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );

  it('should add item optimistically', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toHaveLength(0);

    await act(async () => {
      await result.current.addItem('product-1', 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('should rollback on error', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    // Mock server error
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Server error'));

    const originalItems = result.current.items;

    await act(async () => {
      await result.current.addItem('product-1', 2);
    });

    // Should rollback to original state
    expect(result.current.items).toEqual(originalItems);
    expect(result.current.error).toBeTruthy();
  });
});
```

### Integration Testing Optimistic Updates

```typescript
import { render, screen, userEvent } from '@testing-library/react';

describe('QuantityInput Optimistic Updates', () => {
  it('should update UI immediately on user interaction', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();

    render(<QuantityInput item={mockItem} onUpdate={onUpdate} />);

    const input = screen.getByRole('spinbutton');

    // Initial value
    expect(input).toHaveValue(1);

    // Click increment button
    await user.click(screen.getByRole('button', { name: /increment/i }));

    // UI should update IMMEDIATELY
    expect(input).toHaveValue(2);

    // Server call should be debounced (not immediate)
    expect(onUpdate).not.toHaveBeenCalled();

    // Wait for debounce
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(mockItem.id, 2);
    }, { timeout: 500 });
  });

  it('should not create infinite loop on rapid clicks', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();

    render(<QuantityInput item={mockItem} onUpdate={onUpdate} />);

    const incrementButton = screen.getByRole('button', { name: /increment/i });

    // Rapid clicks
    await user.click(incrementButton);
    await user.click(incrementButton);
    await user.click(incrementButton);
    await user.click(incrementButton);
    await user.click(incrementButton);

    // Should only result in ONE server call after debounce
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledWith(mockItem.id, 6);
    });
  });
});
```

---

## Performance Monitoring

### Development Mode Monitoring

```typescript
// utils/performance.ts

/**
 * Development-only render counter to detect infinite loops
 */
export function useRenderCounter(componentName: string, threshold = 50) {
  if (process.env.NODE_ENV !== 'development') return;

  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  renderCount.current++;

  const elapsed = Date.now() - startTime.current;
  const rendersPerSecond = (renderCount.current / elapsed) * 1000;

  console.log(
    `🔴 [RENDER ${renderCount.current}] ${componentName} at ${Date.now()}`
  );

  if (renderCount.current > threshold && elapsed < 1000) {
    console.error(
      `❌ INFINITE LOOP DETECTED in ${componentName}!`,
      `\n${renderCount.current} renders in ${elapsed}ms`,
      `\n${rendersPerSecond.toFixed(0)} renders/second`
    );

    // Stop execution for debugging
    debugger;
  }
}

// Usage in component
function CartProvider({ children }) {
  useRenderCounter('CartProvider');
  // ...
}
```

---

## Further Reading

- [React Docs: Managing State](https://react.dev/learn/managing-state)
- [Kent C. Dodds: Application State Management](https://kentcdodds.com/blog/application-state-management-with-react)
- [Dan Abramov: You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)
- [Optimistic UI Updates](https://www.apollographql.com/docs/react/performance/optimistic-ui/)

---

**Maintained by:** Engineering Team
**Review Cycle:** Quarterly
**Enforcement:** Mandatory for all PRs
