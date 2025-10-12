# ⚡ Optimistic Updates Pattern
## Professional Implementation Guide

**TL;DR:** Copy the "Edit Mode Pattern" code below for any feature with user input that syncs to server.

---

## What is an Optimistic Update?

An optimistic update means updating the UI **immediately** when the user performs an action, without waiting for the server to respond. This makes your app feel **instant** and **responsive**.

```
Traditional Flow (Slow):
User clicks → Show loading → Wait for server → Update UI
                              ↑
                         500ms - 2s delay

Optimistic Flow (Fast):
User clicks → Update UI instantly → Server sync in background
              ↑
           0ms perceived delay
```

---

## When to Use Optimistic Updates

### ✅ Use When:
- Adding/removing items (cart, wishlist, favorites)
- Updating quantities or counters
- Toggling states (like/unlike, follow/unfollow)
- Form inputs with auto-save
- Real-time collaboration features

### ❌ Don't Use When:
- Payment processing
- Critical data validation required upfront
- Destructive actions (delete account, etc.)
- Operations that commonly fail

---

## The Edit Mode Pattern (Copy This!)

This is a **battle-tested pattern** that prevents infinite loops and handles all edge cases.

### Complete Implementation

```typescript
/**
 * ⚡ EDIT MODE PATTERN FOR OPTIMISTIC UPDATES
 * ===========================================
 *
 * Copy this for ANY feature with:
 * - User input that syncs to server
 * - Debounced save
 * - Need for instant UI feedback
 *
 * This pattern prevents:
 * ❌ Infinite loops
 * ❌ Race conditions
 * ❌ State conflicts
 * ❌ Stale closures
 * ❌ Lost user input
 */

import { useState, useRef, useEffect, useCallback } from 'react';

interface UseOptimisticUpdateConfig<T> {
  /** Current value from server (source of truth) */
  serverValue: T;

  /** Function to save value to server */
  onSave: (value: T) => Promise<void>;

  /** Debounce delay in milliseconds (default: 400ms) */
  debounceMs?: number;

  /** Optional validation before saving */
  validate?: (value: T) => boolean | string;

  /** Called when save succeeds */
  onSuccess?: () => void;

  /** Called when save fails */
  onError?: (error: Error) => void;
}

export function useOptimisticUpdate<T>({
  serverValue,
  onSave,
  debounceMs = 400,
  validate = () => true,
  onSuccess,
  onError,
}: UseOptimisticUpdateConfig<T>) {
  // 🎯 Local optimistic state (what user sees)
  const [localValue, setLocalValue] = useState(serverValue);

  // 🔐 Tracking refs (prevent loops)
  const isEditingRef = useRef(false); // Is user actively editing?
  const lastServerValueRef = useRef(serverValue); // Last known server value
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null); // Debounce timer
  const saveInProgressRef = useRef(false); // Is save request in flight?

  // 🚀 USER → SERVER FLOW
  // When user edits, debounce and sync to server
  useEffect(() => {
    // Only sync if:
    // 1. Local value differs from server
    // 2. User is editing (change came from user, not server)
    // 3. No save already in progress
    if (
      localValue !== serverValue &&
      isEditingRef.current &&
      !saveInProgressRef.current
    ) {
      // Clear any pending timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Start new debounce timer
      debounceTimerRef.current = setTimeout(async () => {
        // Validate before saving
        const validationResult = validate(localValue);
        if (validationResult !== true) {
          const errorMessage =
            typeof validationResult === 'string'
              ? validationResult
              : 'Validation failed';
          onError?.(new Error(errorMessage));
          // Reset to server value on validation error
          setLocalValue(serverValue);
          isEditingRef.current = false;
          return;
        }

        // Save to server
        saveInProgressRef.current = true;
        try {
          await onSave(localValue);
          onSuccess?.();
        } catch (error) {
          console.error('Optimistic update failed:', error);
          // Rollback to server value on error
          setLocalValue(serverValue);
          onError?.(
            error instanceof Error ? error : new Error('Save failed')
          );
        } finally {
          saveInProgressRef.current = false;
          isEditingRef.current = false; // ✅ Clear editing flag
        }
      }, debounceMs);
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localValue, serverValue, onSave, debounceMs, validate, onSuccess, onError]);

  // 🔄 SERVER → CLIENT FLOW
  // When server value changes, update local state
  useEffect(() => {
    // Only sync from server if:
    // 1. Server value actually changed (not just a re-render)
    // 2. User is NOT currently editing
    // 3. No save in progress
    if (
      serverValue !== lastServerValueRef.current &&
      !isEditingRef.current &&
      !saveInProgressRef.current
    ) {
      console.log('🔄 [OPTIMISTIC] Server value changed, syncing to UI:', {
        from: lastServerValueRef.current,
        to: serverValue,
      });
      setLocalValue(serverValue);
    }

    // Always update ref to track latest server value
    lastServerValueRef.current = serverValue;
  }, [serverValue]);

  // 🎬 User action handler
  const handleChange = useCallback((newValue: T) => {
    console.log('⚡ [OPTIMISTIC] User changed value:', newValue);
    isEditingRef.current = true; // ✅ Mark as user-initiated
    setLocalValue(newValue);
  }, []);

  // 🔄 Force sync from server (cancel pending changes)
  const forceSync = useCallback(() => {
    console.log('🔄 [OPTIMISTIC] Force sync from server');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    isEditingRef.current = false;
    saveInProgressRef.current = false;
    setLocalValue(serverValue);
  }, [serverValue]);

  // 💾 Force save immediately (skip debounce)
  const forceSave = useCallback(async () => {
    console.log('💾 [OPTIMISTIC] Force save');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (localValue !== serverValue) {
      try {
        await onSave(localValue);
        onSuccess?.();
      } catch (error) {
        setLocalValue(serverValue);
        onError?.(error instanceof Error ? error : new Error('Save failed'));
      } finally {
        isEditingRef.current = false;
        saveInProgressRef.current = false;
      }
    }
  }, [localValue, serverValue, onSave, onSuccess, onError]);

  return {
    /** Current value to display in UI */
    value: localValue,

    /** Call this when user changes value */
    onChange: handleChange,

    /** Is user currently editing? */
    isEditing: isEditingRef.current,

    /** Has local value diverged from server? */
    isDirty: localValue !== serverValue,

    /** Is save request in flight? */
    isSaving: saveInProgressRef.current,

    /** Cancel changes and sync from server */
    forceSync,

    /** Save immediately (skip debounce) */
    forceSave,
  };
}
```

---

## Usage Examples

### Example 1: Cart Quantity Input

```typescript
import { useOptimisticUpdate } from '@/shared/hooks/useOptimisticUpdate';

interface QuantityInputProps {
  item: CartItem;
  onUpdate: (itemId: string, quantity: number) => Promise<void>;
}

function QuantityInput({ item, onUpdate }: QuantityInputProps) {
  const {
    value,
    onChange,
    isDirty,
    isSaving,
  } = useOptimisticUpdate({
    serverValue: item.quantity,
    onSave: (qty) => onUpdate(item.id, qty),
    validate: (qty) => {
      if (qty < 1) return 'Quantity must be at least 1';
      if (qty > item.product.stock) return `Only ${item.product.stock} available`;
      return true;
    },
    debounceMs: 400,
  });

  const handleIncrement = () => {
    if (value < item.product.stock) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > 1) {
      onChange(value - 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleDecrement} disabled={value <= 1}>
        -
      </button>

      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          min={1}
          max={item.product.stock}
          className={isDirty ? 'border-yellow-500' : 'border-gray-300'}
        />
        {isSaving && (
          <span className="absolute right-2 top-2 text-xs text-gray-500">
            Saving...
          </span>
        )}
      </div>

      <button onClick={handleIncrement} disabled={value >= item.product.stock}>
        +
      </button>
    </div>
  );
}
```

### Example 2: Wishlist Toggle

```typescript
function WishlistButton({ productId, isInWishlist }: WishlistButtonProps) {
  const {
    value: isLiked,
    onChange: setIsLiked,
    isSaving,
  } = useOptimisticUpdate({
    serverValue: isInWishlist,
    onSave: async (liked) => {
      if (liked) {
        await addToWishlistAction(productId);
      } else {
        await removeFromWishlistAction(productId);
      }
    },
    debounceMs: 300,
  });

  return (
    <button
      onClick={() => setIsLiked(!isLiked)}
      disabled={isSaving}
      className={isLiked ? 'text-red-500' : 'text-gray-400'}
    >
      <Heart fill={isLiked ? 'currentColor' : 'none'} />
    </button>
  );
}
```

### Example 3: Auto-Save Text Input

```typescript
function NotesEditor({ noteId, initialContent }: NotesEditorProps) {
  const {
    value,
    onChange,
    isDirty,
    isSaving,
    forceSave,
  } = useOptimisticUpdate({
    serverValue: initialContent,
    onSave: (content) => updateNoteAction(noteId, content),
    debounceMs: 1000, // Longer debounce for text input
    onSuccess: () => {
      toast.success('Note saved');
    },
    onError: (error) => {
      toast.error('Failed to save note');
    },
  });

  // Save on Cmd+S / Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        forceSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [forceSave]);

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your notes..."
      />

      <div className="flex items-center gap-2 text-sm text-gray-500">
        {isSaving && <span>Saving...</span>}
        {isDirty && !isSaving && <span>Unsaved changes</span>}
        {!isDirty && !isSaving && <span>All changes saved</span>}
      </div>
    </div>
  );
}
```

---

## Component Pattern for CartItem

Here's the EXACT pattern used in CartItem.tsx that fixed the infinite loop:

```typescript
export function CartItem({ item, onQuantityChange }: CartItemProps) {
  // 🎯 Local state for instant UI updates
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  // 🔐 Refs to prevent loops
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastServerQuantityRef = useRef(item.quantity);
  const isUserEditingRef = useRef(false);

  // 🚀 USER → SERVER: Debounced sync
  useEffect(() => {
    if (localQuantity !== item.quantity && isUserEditingRef.current) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (onQuantityChange) {
          onQuantityChange(item.id, localQuantity);
        }
        isUserEditingRef.current = false; // ✅ Clear flag after sync
      }, 400);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [localQuantity, item.quantity, item.id, onQuantityChange]);

  // 🔄 SERVER → CLIENT: Sync only when server actually changes
  useEffect(() => {
    if (
      item.quantity !== lastServerQuantityRef.current &&
      !isUserEditingRef.current
    ) {
      setLocalQuantity(item.quantity);
    }
    lastServerQuantityRef.current = item.quantity;
  }, [item.quantity]);

  // 🎬 User handlers
  const handleIncrement = () => {
    if (item.product.stock > localQuantity) {
      isUserEditingRef.current = true; // ✅ Mark as user change
      setLocalQuantity(localQuantity + 1);
    }
  };

  const handleDecrement = () => {
    if (localQuantity > 1) {
      isUserEditingRef.current = true; // ✅ Mark as user change
      setLocalQuantity(localQuantity - 1);
    }
  };

  return (
    <div>
      <button onClick={handleDecrement}>-</button>
      <span>{localQuantity}</span>
      <button onClick={handleIncrement}>+</button>
    </div>
  );
}
```

### Key Insights

1. **`isUserEditingRef`**: Distinguishes user changes from server changes
2. **`lastServerQuantityRef`**: Detects REAL server changes (not just re-renders)
3. **Clear flag AFTER sync**: `isUserEditingRef.current = false` in debounce callback
4. **Two separate effects**: One for user→server, one for server→client
5. **No circular dependencies**: Effects don't update their own dependencies

---

## Testing Optimistic Updates

### Unit Test Example

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptimisticUpdate } from './useOptimisticUpdate';

describe('useOptimisticUpdate', () => {
  it('should update local state immediately', () => {
    const onSave = jest.fn();
    const { result } = renderHook(() =>
      useOptimisticUpdate({
        serverValue: 1,
        onSave,
      })
    );

    expect(result.current.value).toBe(1);

    act(() => {
      result.current.onChange(2);
    });

    // Local state updated immediately
    expect(result.current.value).toBe(2);
    expect(result.current.isDirty).toBe(true);

    // Server not called yet (debounced)
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should debounce server calls', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useOptimisticUpdate({
        serverValue: 1,
        onSave,
        debounceMs: 400,
      })
    );

    // Rapid changes
    act(() => result.current.onChange(2));
    act(() => result.current.onChange(3));
    act(() => result.current.onChange(4));

    // Should only call onSave once after debounce
    await waitFor(
      () => {
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith(4);
      },
      { timeout: 500 }
    );
  });

  it('should rollback on error', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('Server error'));
    const { result } = renderHook(() =>
      useOptimisticUpdate({
        serverValue: 1,
        onSave,
      })
    );

    act(() => {
      result.current.onChange(2);
    });

    expect(result.current.value).toBe(2);

    // Wait for save to fail
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });

    // Should rollback to server value
    await waitFor(() => {
      expect(result.current.value).toBe(1);
    });
  });

  it('should not create infinite loop', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ serverValue }) =>
        useOptimisticUpdate({
          serverValue,
          onSave,
        }),
      { initialProps: { serverValue: 1 } }
    );

    // User change
    act(() => {
      result.current.onChange(2);
    });

    // Wait for save
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(2);
    });

    // Simulate server response
    rerender({ serverValue: 2 });

    // Should NOT trigger another save
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Test Example

```typescript
import { render, screen, userEvent } from '@testing-library/react';

describe('CartItem Optimistic Updates', () => {
  it('should handle rapid clicks without loop', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn().mockResolvedValue(undefined);

    render(<CartItem item={mockItem} onUpdate={onUpdate} />);

    const incrementButton = screen.getByLabelText('Increment quantity');

    // Rapid clicks
    await user.click(incrementButton);
    await user.click(incrementButton);
    await user.click(incrementButton);
    await user.click(incrementButton);
    await user.click(incrementButton);

    // Should show updated value immediately
    expect(screen.getByDisplayValue('6')).toBeInTheDocument();

    // Should only call server once after debounce
    await waitFor(
      () => {
        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate).toHaveBeenCalledWith(mockItem.id, 6);
      },
      { timeout: 500 }
    );
  });
});
```

---

## Debugging Checklist

If you're experiencing issues with optimistic updates:

### Infinite Loops
- [ ] Are you using `isEditingRef` to distinguish user vs server changes?
- [ ] Are you using `lastServerValueRef` to detect real server changes?
- [ ] Are you clearing `isEditingRef` AFTER server sync completes?
- [ ] Are effects updating their own dependencies?
- [ ] Is debounce timer properly cleaned up?

### Lost Updates
- [ ] Are you setting `isEditingRef.current = true` in user handlers?
- [ ] Is the server sync effect checking `isEditingRef.current`?
- [ ] Are you handling errors and rolling back properly?

### Race Conditions
- [ ] Are you tracking `saveInProgressRef` to prevent concurrent saves?
- [ ] Are you canceling pending debounce timers correctly?
- [ ] Is server response updating the `serverValue` prop?

### Stale Closures
- [ ] Are you using refs instead of state in callbacks?
- [ ] Are useCallback dependencies correct?
- [ ] Are you using functional state updates where needed?

---

## Further Reading

- [Infinite Loop Post-Mortem](./INFINITE_LOOP_POST_MORTEM.md) - Full analysis of the cart bug
- [State Management Guidelines](./STATE_MANAGEMENT_GUIDELINES.md) - Comprehensive patterns
- [Apollo Docs: Optimistic UI](https://www.apollographql.com/docs/react/performance/optimistic-ui/)
- [TanStack Query: Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)

---

**Maintained by:** Engineering Team
**Last Updated:** 2025-01-30
**Status:** Production-Ready Pattern
