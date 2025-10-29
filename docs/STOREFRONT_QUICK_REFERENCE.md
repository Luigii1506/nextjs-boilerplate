# 🛒 STOREFRONT ARCHITECTURE - QUICK REFERENCE

**Última actualización:** 28/10/2025
**Versión:** 3.0.0 - Cleaned & Optimized

---

## 📋 TL;DR

El storefront es una **mini-aplicación SPA de ecommerce**, NO un módulo administrativo.

### Características Clave

```
✅ Patrón SPA - Todos los tabs montados siempre
✅ TanStack Query - Data fetching con caching
✅ Context API - Solo UI state (80 líneas)
✅ Optimistic Updates - UI instantánea
✅ Single Source of Truth - Sync automática
```

---

## 🏗️ ESTRUCTURA MENTAL

### 3 Capas principales

```
┌─────────────────────────────────────┐
│     UI Layer (ui/features/)         │  Tabs: Overview, Products, Wishlist, etc.
│                                     │  Componentes: Memoized, Reusable
└─────────────────────┬───────────────┘
                      │
┌─────────────────────┴───────────────┐
│    Data & State Layer               │  Hooks: useStorefrontData, useWishlist
│    (hooks/ + context/)              │  Context: StorefrontUIContext
└─────────────────────┬───────────────┘
                      │
┌─────────────────────┴───────────────┐
│    Server Layer (server/)           │  Actions, Services, Queries, Mappers
└─────────────────────────────────────┘
```

---

## 📁 FILES & RESPONSABILIDADES

### Context (State Management)

| Archivo | Líneas | Responsabilidad |
|---------|--------|-----------------|
| `StorefrontUIContext.tsx` | 80 | Tab navigation, search, modals |
| `cart/CartContext.tsx` | 350 | Cart operations (add, remove, update) |
| `checkout/CheckoutContext.tsx` | 80+ | Checkout flow (steps, shipping, payment) |

### Hooks (Data & Operations)

| Archivo | Hook | Responsabilidad |
|---------|------|-----------------|
| `useStorefrontData.ts` | `useStorefrontData()` | Fetch all data (TanStack Query) |
| | `useStorefrontProducts()` | Fetch products only |
| | `useStorefrontCategories()` | Fetch categories only |
| | `useFeaturedContent()` | Fetch featured items |
| `useWishlist.ts` | `useWishlist()` | Wishlist mutations (optimistic) |
| | `useWishlistToggle()` | Simplified wishlist toggle |
| `cart/useCart.ts` | `useCart()` | Use cart context |

### UI Features (Tabs)

| Archivo | Líneas | Usuarios | Complejidad |
|---------|--------|----------|-------------|
| `features/overview/OverviewTab.tsx` | 231 | Nuevos | Baja |
| `features/products/ProductsTab.tsx` | 450 | Compradores | Alta (filtros avanzados) |
| `features/wishlist/WishlistTab.tsx` | 212 | Registrados | Media |
| `features/cart/CartTab.tsx` | 275 | Compradores | Media |
| `features/checkout/CheckoutTab.tsx` | 300+ | Compradores | Alta (payment flow) |
| `features/account/AccountTab.tsx` | 200+ | Registrados | Media |

### Shared Components

| Componente | Líneas | Reutilización | Memoized |
|-----------|--------|---------------|----------|
| `ProfessionalProductCard.tsx` | 265 | Alta (4+ tabs) | ✅ Yes |
| `AnimatedHeartButton.tsx` | 80+ | Alta (wishlist) | ✅ Yes |
| `PriceDisplay.tsx` | 30 | Alta (precios) | ✅ Yes |
| `ProductSkeleton.tsx` | 40 | Media (loading) | ✅ Yes |
| `QuickViewModal.tsx` | 100+ | Media (modal) | ✅ Yes |

### Server Layer

| Archivo | Responsabilidad |
|---------|-----------------|
| `server/actions.ts` | Thin actions - Validación + Delegación |
| `server/service.ts` | Thick logic - Lógica de negocio |
| `server/queries.ts` | DB queries - Acceso a datos |
| `server/mappers.ts` | Data transformation - Mapeo de datos |
| `server/validators.ts` | Validation - Validación de inputs |

---

## 🎯 FLUJO DE DATOS TÍPICO

### Add to Wishlist Example

```
1. UI Layer
   ProductCard.tsx
   └─ onAddToWishlist(productId)

2. Hook Layer
   useWishlist().addToWishlist(productId)
   └─ useMutation() ← TanStack Query
      ├─ onMutate() → Optimistic update (instant UI)
      ├─ mutationFn() → Call server action
      └─ onError() → Rollback if fails

3. Server Layer
   addToWishlistAction(userId, productId)
   └─ addToWishlistService()
      └─ Database update
         └─ Return new wishlist

4. Back to Hook Layer
   onSettled() → Invalidate queries
   └─ Back to UI: re-render with new data
```

**Total time:** ~100ms (optimistic = instant)

---

## 💡 DESIGN PATTERNS

### 1. Optimistic Updates ⚡

```typescript
// User action feels instant
const { addToWishlist } = useWishlist();

await addToWishlist(productId); // Returns immediately
// UI already updated (optimistically)
// If fails: automatic rollback
```

### 2. Single Source of Truth 🎯

```typescript
// No prop drilling, no state duplicates
const { wishlist } = useStorefrontData(); // From TanStack Query

// Derive other state from wishlist
const products = rawProducts.map(p => ({
  ...p,
  isWishlisted: wishlist.some(w => w.productId === p.id),
}));
```

### 3. Tab as Mini-App 📱

```typescript
// Each tab is a complete mini-application
// Not just a grid of data, but a full workflow
const ProductsTab: React.FC<ProductsTabProps> = ({ onAddToCart }) => {
  // Global state (hooks)
  // + Local state (filters, pagination)
  // + Server actions (add to cart)
  // = Mini-app
};
```

### 4. SPA Pattern ⚡

```typescript
// All tabs always mounted (not conditional)
<div className={activeTab === "products" ? "visible" : "invisible"}>
  <ProductsTab /> {/* Never unmounts */}
</div>

// Benefits:
// - Instant switching (0ms)
// - State preserved
// - Smooth UX
```

---

## 🚀 COMMON TASKS

### Add a new Product Filter

1. Add type to `types/models.ts`
2. Add case to `ProductsTab.tsx` filter logic
3. Update `ProductsFilters.tsx` component

### Add Wishlist to a New Tab

```typescript
const { addToWishlist, removeFromWishlist } = useWishlist();

// Optimistic update happens automatically
await addToWishlist(productId);
```

### Show Product Modal

```typescript
const { setViewingProduct } = useStorefrontUI();

<button onClick={() => setViewingProduct(product)}>
  Quick View
</button>
```

### Change Active Tab

```typescript
const { setActiveTab } = useStorefrontUI();

<button onClick={() => setActiveTab("products")}>
  Browse Products
</button>
```

---

## ⚠️ COMMON PITFALLS

### ❌ Don't

```typescript
// ❌ Don't: Create new context for data
const [products, setProducts] = useState([]);

// ❌ Don't: Fetch in multiple places
useEffect(() => { fetchProducts(); }, []);

// ❌ Don't: Duplicate wishlist state
const [isWishlisted, setIsWishlisted] = useState(false);

// ❌ Don't: Inline complex filters
const filtered = data.filter(/* 50 lines of logic */);

// ❌ Don't: Unmount tabs on navigation
{activeTab === "products" && <ProductsTab />}
```

### ✅ Do

```typescript
// ✅ Do: Use TanStack Query hooks
const { data } = useStorefrontData();

// ✅ Do: Fetch once, cache everywhere
const { data, isLoading } = useStorefrontData();

// ✅ Do: Derive from single source
const isWishlisted = wishlist.some(w => w.productId === productId);

// ✅ Do: Extract to hooks
const filteredProducts = useProductFiltering(products, filters);

// ✅ Do: Keep tabs mounted (visibility-based)
<div className={activeTab === "products" ? "visible" : "invisible"}>
  <ProductsTab />
</div>
```

---

## 📊 PERFORMANCE METRICS

### Tab Switching
- **Current:** ~150ms (smooth transition)
- **Optimized:** ~0ms (already cached)

### Add to Wishlist
- **Optimistic:** Instant (UI updates first)
- **Server:** ~500ms (background sync)

### Product Loading
- **First load:** ~2s (network)
- **Subsequent loads:** Instant (cache)

---

## 🔗 RELATED FILES

### Reading ARCHITECTURE_PATTERNS.md?

**Important:** The storefront is DIFFERENT from inventory/admin modules.

**DO apply:**
- ✅ Utils separation (pure functions)
- ✅ Hooks organization
- ✅ Component extraction
- ✅ Server layer pattern (thin actions, thick services)

**DON'T apply:**
- ❌ Tab size limit (450 lines is ok for storefront)
- ❌ Conditional tab rendering (SPA pattern requires always mounted)

---

## 📚 KEY FILES TO UNDERSTAND

### Core Patterns
1. `context/StorefrontUIContext.tsx` - How to do ultra-light context
2. `hooks/useStorefrontData.ts` - How to use TanStack Query
3. `hooks/useWishlist.ts` - How to do optimistic updates
4. `ui/routes/storefront.screen.tsx` - SPA pattern

### Example Implementations
1. `ui/features/products/ProductsTab.tsx` - Complex tab with filters
2. `ui/features/wishlist/WishlistTab.tsx` - Simple tab
3. `ui/features/overview/OverviewTab.tsx` - Homepage pattern
4. `ui/components/shared/ProfessionalProductCard.tsx` - Memoized component

### Server Layer
1. `server/actions.ts` - Thin actions
2. `server/service.ts` - Business logic
3. `cart/server/actions.ts` - Cart operations

---

## ✅ CHECKLIST: BEFORE MODIFYING

- [ ] Do I need to change data? → Use hooks (useWishlist, useCart)
- [ ] Do I need to change UI state? → Use StorefrontUIContext
- [ ] Am I adding a new filter? → Update ProductsTab + ProductsFilters
- [ ] Is my component > 80 lines? → Consider extracting
- [ ] Am I fetching data in useEffect? → Use useStorefrontData instead
- [ ] Am I duplicating state? → Check Single Source of Truth pattern

---

## 🎓 LEARNING PATH

1. **Start here:** Read this file (you are here)
2. **Understand data flow:** Read `useStorefrontData.ts` + `useWishlist.ts`
3. **See it in action:** Look at `ProductsTab.tsx` (most complex)
4. **Learn patterns:** Read `StorefrontUIContext.tsx` + `CartContext.tsx`
5. **Deep dive:** Read `/docs/STOREFRONT_ARCHITECTURE_ANALYSIS.md`

---

## 📞 QUICK HELP

### "How do I add a new tab?"
1. Create feature folder: `ui/features/myfeature/`
2. Create tab component: `MyFeatureTab.tsx`
3. Add to exports: `ui/features/index.ts`
4. Render in: `ui/components/layout/StorefrontTabContent.tsx`
5. Add to nav: `ui/components/layout/StorefrontNavigation.tsx`

### "How do I fetch new data?"
1. Check if already in `useStorefrontData()`
2. If yes: use the hook
3. If no: add to server action + TanStack Query key

### "Why is my component re-rendering too much?"
1. Check if you're passing new functions as props
2. Use `useCallback` for event handlers
3. Use `memo()` for the component
4. Check dependencies in `useMemo`

### "How do I know if data is loading?"
```typescript
const { data, isLoading } = useStorefrontData();
// Also available: error
```

---

**Last Updated:** 2025-01-28
**Status:** Production Ready ✅
**Maintainer:** Engineering Team
