# ⚡ Quick Reference: State Patterns
## Copy & Paste Production-Ready Patterns

**Keep this open while coding. These patterns prevent 90% of state bugs.**

---

## 🎯 Pattern Selection Matrix

| Your Scenario | Use This Pattern | Doc Link |
|--------------|------------------|----------|
| Quantity input with auto-save | Edit Mode Pattern | [Details](#edit-mode-pattern) |
| Like/Unlike toggle | Simple Optimistic | [Details](#simple-optimistic-toggle) |
| Shopping cart | Edit Mode + Context | [Details](#cart-context-pattern) |
| Form with auto-save | Edit Mode + Validation | [Details](#form-auto-save) |
| Real-time collaboration | Debounced Sync | [Details](#realtime-sync) |

---

## 🔥 Edit Mode Pattern (MOST COMMON)

**Use for:** Any input that syncs to server (quantity, text, toggles)

```typescript
// ✅ COPY THIS - Battle-tested pattern
function useEditMode<T>(
  serverValue: T,
  onSave: (value: T) => Promise<void>
) {
  const [localValue, setLocalValue] = useState(serverValue);
  const isEditingRef = useRef(false);
  const lastServerValueRef = useRef(serverValue);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // USER → SERVER
  useEffect(() => {
    if (localValue !== serverValue && isEditingRef.current) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        await onSave(localValue);
        isEditingRef.current = false;
      }, 400);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localValue, serverValue, onSave]);

  // SERVER → USER
  useEffect(() => {
    if (
      serverValue !== lastServerValueRef.current &&
      !isEditingRef.current
    ) {
      setLocalValue(serverValue);
    }
    lastServerValueRef.current = serverValue;
  }, [serverValue]);

  return {
    value: localValue,
    onChange: (val: T) => {
      isEditingRef.current = true;
      setLocalValue(val);
    },
  };
}

// Usage:
function QuantityInput({ item, onUpdate }) {
  const { value, onChange } = useEditMode(
    item.quantity,
    (qty) => onUpdate(item.id, qty)
  );

  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
    />
  );
}
```

---

## 💖 Simple Optimistic Toggle

**Use for:** Like/Unlike, Follow/Unfollow, Enable/Disable

```typescript
// ✅ COPY THIS - For boolean toggles
function WishlistButton({ productId, isInWishlist }) {
  const [optimisticState, setOptimisticState] = useState(isInWishlist);

  // Sync from server when prop changes
  useEffect(() => {
    setOptimisticState(isInWishlist);
  }, [isInWishlist]);

  const handleToggle = async () => {
    const newState = !optimisticState;

    // Optimistic update
    setOptimisticState(newState);

    try {
      if (newState) {
        await addToWishlist(productId);
      } else {
        await removeFromWishlist(productId);
      }
    } catch (error) {
      // Rollback on error
      setOptimisticState(!newState);
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <button onClick={handleToggle}>
      <Heart fill={optimisticState ? 'red' : 'none'} />
    </button>
  );
}
```

---

## 🛒 Cart Context Pattern

**Use for:** Complex state shared across components

```typescript
// ✅ COPY THIS - Professional context structure
interface CartContextValue {
  items: CartItem[];
  addItem: (id: string, qty: number) => Promise<void>;
  updateItem: (id: string, qty: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  isEmpty: boolean;
  itemCount: number;
  totalAmount: number;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // ✅ Use ref to avoid dependency issues
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // ✅ Computed values (memoized)
  const isEmpty = useMemo(() => items.length === 0, [items]);
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );
  const totalAmount = useMemo(
    () => items.reduce((sum, i) => sum + i.total, 0),
    [items]
  );

  // ✅ Stable callbacks (no items dependency)
  const addItem = useCallback(
    async (productId: string, quantity: number) => {
      // Optimistic update
      const optimisticItem = createOptimisticItem(productId, quantity);
      setItems(prev => [...prev, optimisticItem]);

      try {
        const result = await addToCartAction({ productId, quantity });
        setItems(result.data.cart.items);
      } catch (error) {
        // Rollback
        setItems(itemsRef.current);
      }
    },
    [] // ✅ Empty deps - uses ref
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      // Find item from ref (not state!)
      const item = itemsRef.current.find(i => i.id === itemId);
      if (!item) return;

      // Optimistic update
      setItems(prev =>
        prev.map(i => (i.id === itemId ? { ...i, quantity } : i))
      );

      try {
        const result = await updateCartItemAction({ itemId, quantity });
        setItems(result.data.cart.items);
      } catch (error) {
        // Rollback
        setItems(itemsRef.current);
      }
    },
    []
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const originalItems = itemsRef.current;

      // Optimistic update
      setItems(prev => prev.filter(i => i.id !== itemId));

      try {
        const result = await removeFromCartAction({ itemId });
        setItems(result.data.cart.items);
      } catch (error) {
        // Rollback
        setItems(originalItems);
      }
    },
    []
  );

  // ✅ Memoized context value
  const value = useMemo(
    () => ({
      items,
      addItem,
      updateItem,
      removeItem,
      isEmpty,
      itemCount,
      totalAmount,
    }),
    [items, addItem, updateItem, removeItem, isEmpty, itemCount, totalAmount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
```

---

## 📝 Form Auto-Save

**Use for:** Notes, drafts, any text input

```typescript
// ✅ COPY THIS - Auto-save with validation
function NotesEditor({ noteId, initialContent }) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastServerContentRef = useRef(initialContent);

  // Auto-save on change
  useEffect(() => {
    if (content === lastServerContentRef.current) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsSaving(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        await updateNoteAction(noteId, content);
        lastServerContentRef.current = content;
        setLastSaved(new Date());
      } catch (error) {
        toast.error('Failed to save');
        setContent(lastServerContentRef.current);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [content, noteId]);

  // Force save on Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        updateNoteAction(noteId, content);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [noteId, content]);

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your notes..."
      />

      <div className="text-sm text-gray-500">
        {isSaving && 'Saving...'}
        {!isSaving && lastSaved && `Saved at ${lastSaved.toLocaleTimeString()}`}
      </div>
    </div>
  );
}
```

---

## 🚫 Common Mistakes (DON'T DO THIS)

### ❌ Mistake 1: Bidirectional Sync

```typescript
// ❌ WRONG - Creates infinite loop
useEffect(() => {
  setLocalValue(serverValue);
}, [serverValue, localValue]); // ❌ localValue in deps

useEffect(() => {
  syncToServer(localValue);
}, [localValue, serverValue]); // ❌ serverValue in deps

// ✅ CORRECT - Use Edit Mode Pattern (see above)
```

### ❌ Mistake 2: No Cleanup

```typescript
// ❌ WRONG - Timer keeps running after unmount
useEffect(() => {
  setTimeout(() => doSomething(), 1000);
}, []);

// ✅ CORRECT - Always cleanup
useEffect(() => {
  const timer = setTimeout(() => doSomething(), 1000);
  return () => clearTimeout(timer);
}, []);
```

### ❌ Mistake 3: Not Using Refs

```typescript
// ❌ WRONG - Callback recreated on every render
const addItem = useCallback(
  async (id: string) => {
    const item = items.find(i => i.id === id); // ❌ items dependency
    // ...
  },
  [items] // ❌ Causes re-renders
);

// ✅ CORRECT - Use ref
const itemsRef = useRef(items);
useEffect(() => {
  itemsRef.current = items;
}, [items]);

const addItem = useCallback(
  async (id: string) => {
    const item = itemsRef.current.find(i => i.id === id); // ✅ No dependency
    // ...
  },
  [] // ✅ Stable callback
);
```

### ❌ Mistake 4: Context Not Memoized

```typescript
// ❌ WRONG - New object on every render
return (
  <Context.Provider value={{ state, setState }}>
    {children}
  </Context.Provider>
);

// ✅ CORRECT - Memoized value
const value = useMemo(
  () => ({ state, setState }),
  [state]
);

return (
  <Context.Provider value={value}>
    {children}
  </Context.Provider>
);
```

---

## 🐛 Debug Checklist

When you have infinite renders:

1. **Add render counter:**
   ```typescript
   let renderCount = 0;
   renderCount++;
   console.log(`Render ${renderCount}`);
   if (renderCount > 50) debugger;
   ```

2. **Check effects:**
   - [ ] Does any effect update its own dependency?
   - [ ] Are there bidirectional effects?
   - [ ] Are all timers cleaned up?

3. **Check context:**
   - [ ] Is value memoized?
   - [ ] Are callbacks stable?
   - [ ] Are computed values memoized?

4. **Check refs:**
   - [ ] Are non-rendering values in refs?
   - [ ] Is previous server value tracked?
   - [ ] Is editing state tracked?

---

## 📚 More Resources

- **Full Analysis:** [Infinite Loop Post-Mortem](./INFINITE_LOOP_POST_MORTEM.md)
- **Complete Guide:** [State Management Guidelines](./STATE_MANAGEMENT_GUIDELINES.md)
- **Deep Dive:** [Optimistic Updates Pattern](./OPTIMISTIC_UPDATES_PATTERN.md)

---

## 💡 Remember

> **The 3 Questions Before Any Optimistic Update:**
>
> 1. How do I know if this change came from the user or server?
> 2. How do I prevent sync conflicts?
> 3. How do I detect if I've created an infinite loop?

**Answer these → Prevent weeks of debugging.**

---

**Print this page and keep it next to your monitor! 📄**
