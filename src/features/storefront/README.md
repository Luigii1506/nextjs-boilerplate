# 🛒 Storefront Feature

**Version:** 3.0.0 - Cleaned & Optimized
**Architecture:** Feature-First + SPA Pattern
**State Management:** TanStack Query + Context API

---

## 📁 Structure

```
src/features/storefront/
├── context/                      # UI State Management
│   ├── StorefrontUIContext.tsx  # ✅ Tab navigation state
│   └── index.ts
│
├── hooks/                        # Data Fetching Hooks
│   ├── useStorefrontData.ts     # ✅ Products, categories data
│   ├── useWishlist.ts           # ✅ Wishlist operations
│   ├── queryKeys.ts             # TanStack Query keys
│   └── index.ts
│
├── server/                       # Server Layer
│   ├── actions.ts               # Server Actions
│   ├── service.ts               # Business logic
│   ├── queries.ts               # Database queries
│   └── index.ts
│
├── types/                        # TypeScript Types
│   ├── models.ts                # Domain models
│   ├── index.ts
│   └── ...
│
├── ui/                           # UI Layer
│   ├── components/
│   │   ├── overview/            # Overview tab components
│   │   │   └── OverviewTab.tsx
│   │   ├── products/            # Products tab components
│   │   │   ├── ProductsTab.tsx
│   │   │   ├── ProductsGrid.tsx
│   │   │   ├── ProductsHeader.tsx
│   │   │   └── types/
│   │   ├── wishlist/            # Wishlist tab components
│   │   │   ├── WishlistTab.tsx
│   │   │   ├── WishlistGrid.tsx
│   │   │   ├── WishlistHeader.tsx
│   │   │   ├── WishlistFilters.tsx
│   │   │   ├── WishlistStats.tsx
│   │   │   ├── WishlistPagination.tsx
│   │   │   ├── EmptyWishlist.tsx
│   │   │   └── WishlistLoginPrompt.tsx
│   │   ├── tabs/                # Other tabs
│   │   │   ├── CategoriesTab.tsx
│   │   │   ├── AccountTab.tsx
│   │   │   └── SupportTab.tsx
│   │   ├── shared/              # Shared components
│   │   │   ├── ProfessionalProductCard.tsx
│   │   │   └── AnimatedHeartButton.tsx
│   │   └── debug/               # Debug panels
│   │       └── WishlistDebugPanel.tsx
│   ├── routes/
│   │   └── storefront.screen.tsx  # ✅ SPA Container
│   └── styles/
│       └── animations.css
│
└── index.ts                      # Main exports
```

---

## 🎯 Architecture Patterns

### 1. SPA (Single Page Application) Pattern

El Storefront usa un patrón SPA donde todos los tabs están montados simultáneamente pero solo uno visible a la vez:

```typescript
// storefront.screen.tsx
const TabContent = () => {
  const { activeTab } = useStorefrontUI();

  return (
    <div>
      {/* Todos los tabs montados, solo uno visible */}
      <div className={activeTab === "overview" ? "visible" : "invisible"}>
        <OverviewTab />
      </div>
      <div className={activeTab === "products" ? "visible" : "invisible"}>
        <ProductsTab />
      </div>
      {/* ... más tabs */}
    </div>
  );
};
```

**Beneficios:**
- ✅ Cambio instantáneo entre tabs (0ms)
- ✅ Estado preservado (no se pierde al cambiar tabs)
- ✅ Data cacheada con TanStack Query
- ✅ UX premium sin loading states

### 2. Data Fetching con TanStack Query

```typescript
// hooks/useStorefrontData.ts
export function useStorefrontData() {
  return useQuery({
    queryKey: storefrontKeys.all(),
    queryFn: () => getStorefrontDataAction(),
    staleTime: 5 * 60 * 1000,  // 5 minutos
    gcTime: 10 * 60 * 1000,    // 10 minutos
  });
}

// hooks/useWishlist.ts
export function useWishlist() {
  const queryClient = useQueryClient();

  const addToWishlist = useMutation({
    mutationFn: (productId: string) => addToWishlistAction(productId),
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries(storefrontKeys.all());
    },
  });

  return { addToWishlist, /* ... */ };
}
```

### 3. Context API para UI State

```typescript
// context/StorefrontUIContext.tsx
export function useStorefrontUI() {
  return {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
    isTabChanging: boolean;
    globalSearchTerm: string;
    setGlobalSearchTerm: (term: string) => void;
  };
}
```

**Separación clara:**
- **TanStack Query:** Server data (products, wishlist)
- **Context API:** UI state (tab activo, búsqueda)

---

## 🛍️ Wishlist Feature

### Components

**WishlistTab.tsx** - Main wishlist view
- Grid de productos wishlisted
- Filtros y ordenamiento
- Paginación
- Estados vacíos

**AnimatedHeartButton.tsx** - Wishlist toggle button
- Animación smooth al agregar/remover
- Estados de loading
- Optimistic updates

### Operations

```typescript
const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

// Add to wishlist
await addToWishlist.mutateAsync(productId);

// Remove from wishlist
await removeFromWishlist.mutateAsync(productId);

// Check if in wishlist
const wishlisted = isInWishlist(productId);
```

### Optimistic Updates

```typescript
// Actualización optimista
addToWishlist.mutate(productId, {
  onMutate: async (productId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(storefrontKeys.all());

    // Snapshot previous value
    const previousData = queryClient.getQueryData(storefrontKeys.all());

    // Optimistically update
    queryClient.setQueryData(storefrontKeys.all(), (old) => ({
      ...old,
      wishlist: [...old.wishlist, { productId }],
    }));

    return { previousData };
  },
  onError: (err, productId, context) => {
    // Rollback on error
    queryClient.setQueryData(storefrontKeys.all(), context.previousData);
  },
});
```

---

## 🚀 Usage

### Basic Setup

```typescript
import { StorefrontScreen } from "@/features/storefront";

export default function StorefrontPage() {
  return <StorefrontScreen />;
}
```

### Using Storefront Data

```typescript
import { useStorefrontData, useWishlist } from "@/features/storefront/hooks";

function MyComponent() {
  const { data, isLoading } = useStorefrontData();
  const { addToWishlist } = useWishlist();

  if (isLoading) return <Loading />;

  return (
    <div>
      {data.products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToWishlist={() => addToWishlist.mutate(product.id)}
        />
      ))}
    </div>
  );
}
```

### Navigation Between Tabs

```typescript
import { useStorefrontUI } from "@/features/storefront/context";

function Navigation() {
  const { activeTab, setActiveTab } = useStorefrontUI();

  return (
    <nav>
      <button
        onClick={() => setActiveTab("products")}
        className={activeTab === "products" ? "active" : ""}
      >
        Products
      </button>
      <button
        onClick={() => setActiveTab("wishlist")}
        className={activeTab === "wishlist" ? "active" : ""}
      >
        Wishlist
      </button>
    </nav>
  );
}
```

---

## ⚡ Performance Optimizations

### 1. TanStack Query Caching

```typescript
// Configuración optimizada
{
  staleTime: 5 * 60 * 1000,     // 5 min - Data stays fresh
  gcTime: 10 * 60 * 1000,       // 10 min - Cache persists
  refetchOnMount: false,        // No refetch if data exists
  refetchOnWindowFocus: false,  // No refetch on window focus
}
```

### 2. React.memo para Components

```typescript
export const ProfessionalProductCard = memo(
  ProductCardComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.isWishlisted === nextProps.product.isWishlisted
    );
  }
);
```

### 3. Stable Callbacks con Refs

```typescript
// En storefront.screen.tsx
const addToCartRef = useRef(addToCart);
useEffect(() => {
  addToCartRef.current = addToCart;
}, [addToCart]);

const handleAddToCart = useCallback(
  async (productId, quantity) => {
    await addToCartRef.current(productId, quantity);
  },
  [] // ✅ Stable - no dependencies
);
```

---

## 🐛 Common Issues & Solutions

### Issue: Wishlist not updating after add/remove

**Solution:** Verify query invalidation

```typescript
onSuccess: () => {
  queryClient.invalidateQueries(storefrontKeys.all());
}
```

### Issue: Tab switching shows loading

**Solution:** Ensure tabs are always mounted (SPA pattern)

```typescript
// ❌ DON'T - Unmounts tabs
{activeTab === "products" && <ProductsTab />}

// ✅ DO - Keeps tabs mounted
<div className={activeTab === "products" ? "visible" : "invisible"}>
  <ProductsTab />
</div>
```

### Issue: Stale data after mutation

**Solution:** Use optimistic updates or refetch

```typescript
// Option 1: Optimistic update (instant UX)
onMutate: async (data) => {
  await queryClient.cancelQueries(keys);
  queryClient.setQueryData(keys, (old) => updateOptimistically(old, data));
}

// Option 2: Refetch after mutation
onSuccess: () => {
  queryClient.invalidateQueries(keys);
}
```

---

## 📊 Type System

### Main Types

```typescript
// Product for customer view
interface ProductForCustomer {
  id: string;
  name: string;
  description: string;
  currentPrice: number;
  originalPrice: number;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  isWishlisted: boolean;  // Computed based on user
}

// Category for customer
interface CategoryForCustomer {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  image?: string;
}

// Wishlist item
interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: ProductForCustomer;
  createdAt: Date;
}
```

---

## 🧪 Testing

### Unit Tests

```typescript
describe("useWishlist", () => {
  it("should add product to wishlist", async () => {
    const { result } = renderHook(() => useWishlist(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.addToWishlist.mutateAsync("product-1");
    });

    expect(result.current.isInWishlist("product-1")).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe("Storefront SPA", () => {
  it("should switch tabs without losing state", async () => {
    render(<StorefrontScreen />);

    // Go to products
    await userEvent.click(screen.getByText("Products"));
    expect(screen.getByText("Product Grid")).toBeInTheDocument();

    // Go to wishlist
    await userEvent.click(screen.getByText("Wishlist"));
    expect(screen.getByText("Wishlist Grid")).toBeInTheDocument();

    // Go back to products - state should be preserved
    await userEvent.click(screen.getByText("Products"));
    expect(screen.getByText("Product Grid")).toBeInTheDocument();
  });
});
```

---

## 🔄 Changelog

### v3.0.0 - Cleaned & Optimized (2025-01-30)

**Removed:**
- ❌ `.migration-backups/` folder - Old migration backups
- ❌ `context/StorefrontContext.backup.tsx` - Backup
- ❌ `context/StorefrontContext.tsx` - Old context (replaced by StorefrontUIContext)
- ❌ `examples/` folder - Example components not used
- ❌ `ui/components/examples/` - WishlistButtonExample, WishlistSyncTest
- ❌ `MIGRATION_PLAN.md` - Temp migration doc

**Kept & Optimized:**
- ✅ `StorefrontUIContext.tsx` - UI state management
- ✅ `useStorefrontData.ts` - TanStack Query data fetching
- ✅ `useWishlist.ts` - Wishlist operations with mutations
- ✅ All tab components (Overview, Products, Wishlist, etc.)
- ✅ Shared components (ProfessionalProductCard, AnimatedHeartButton)

**Structure:**
- Clean Feature-First architecture
- Separation: UI state (Context) vs Server data (TanStack Query)
- SPA pattern for instant navigation

### v2.0.0 - TanStack Query Migration

- Migrated from custom Context to TanStack Query
- Separated UI state from server data
- Implemented optimistic updates

### v1.0.0 - Initial Implementation

- Initial storefront with custom context
- Basic product listing and wishlist

---

## 📚 Related Documentation

- [SPA Architecture](/docs/Architecture/STOREFRONT_SPA_ARCHITECTURE.md)
- [State Management Guidelines](/docs/Architecture/STATE_MANAGEMENT_GUIDELINES.md)
- [Optimistic Updates Pattern](/docs/Architecture/OPTIMISTIC_UPDATES_PATTERN.md)
- [Cart Feature](/src/features/cart/README.md)

---

**Maintained by:** Engineering Team
**Last Updated:** 2025-01-30
**Status:** Production Ready ✅
