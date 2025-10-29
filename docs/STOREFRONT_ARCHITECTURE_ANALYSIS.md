# 🛒 ANÁLISIS EXHAUSTIVO: ARQUITECTURA DEL MÓDULO STOREFRONT

**Análisis realizado:** 28/10/2025
**Nivel de profundidad:** Very Thorough
**Objetivo:** Entender la arquitectura actual y patrones para aplicar ARCHITECTURE_PATTERNS.md correctamente

---

## 📊 RESUMEN EJECUTIVO

El módulo **storefront** es fundamentalmente diferente a los módulos administrativos (inventory, users, suppliers, audit). No es un "módulo CRUD admin" sino una **mini-aplicación de ecommerce con patrón SPA**.

| Aspecto | Storefront | Inventory/Admin |
|---------|-----------|-----------------|
| **Patrón** | SPA (Single Page App) | Tabs administrativos |
| **Estado** | TanStack Query + Context API | Context API mostly |
| **Tabs** | Son "páginas completas" | Formularios/grillas administrativas |
| **Complejidad** | Alta (filtros, flujos, cart) | Media (CRUD + visualización) |
| **Reutilización** | Alta (componentes compartidos) | Media (componentes por feature) |
| **Autenticación** | Usuarios finales | Usuarios administrativos |

---

## 1️⃣ ESTRUCTURA DE CARPETAS ACTUAL

```
src/features/storefront/
├── context/                          # UI State Management
│   ├── StorefrontUIContext.tsx       # ✅ 80 líneas - Tab nav, search, modals
│   └── index.ts
│
├── hooks/                            # Data Fetching & Operations
│   ├── useStorefrontData.ts          # ✅ TanStack Query - Main hook
│   │   ├── useStorefrontData()       # Todo: products, categories, wishlist
│   │   ├── useStorefrontProducts()   # Especializado para productos
│   │   ├── useStorefrontCategories() # Especializado para categorías
│   │   └── useFeaturedContent()      # Especializado para featured
│   ├── useWishlist.ts                # ✅ TanStack Query mutations
│   │   ├── useWishlist()             # Full CRUD + optimistic updates
│   │   └── useWishlistToggle()       # Simplified toggle
│   └── queryKeys.ts                  # ✅ TanStack Query key factory
│
├── cart/                             # Cart Feature (Submodule)
│   ├── context/
│   │   └── CartContext.tsx           # ✅ 350 líneas - Complete cart state
│   ├── hooks/
│   │   └── useCart.ts                # ✅ Custom hook para cart
│   ├── server/
│   │   ├── actions.ts                # Server Actions
│   │   ├── service.ts                # Business logic
│   │   ├── queries.ts                # DB queries
│   │   └── ...
│   └── types/                        # Cart-specific types
│
├── checkout/                         # Checkout Feature (Submodule)
│   ├── context/
│   │   └── CheckoutContext.tsx       # ✅ Checkout state management
│   ├── hooks/
│   │   ├── useCheckoutState.ts
│   │   └── useCheckoutActions.ts
│   ├── server/                       # Server layer
│   └── types/                        # Checkout types
│
├── addresses/                        # Address Feature (Submodule)
├── orders/                           # Orders Feature (Submodule)
├── payment-methods/                  # Payment Methods Feature (Submodule)
├── pricing/                          # Pricing calculations
│
├── server/                           # Main Storefront Server Layer
│   ├── actions.ts                    # ✅ Thin server actions
│   ├── service.ts                    # ✅ Business logic
│   ├── queries.ts                    # ✅ Database queries
│   ├── mappers.ts                    # ✅ Data transformation
│   └── validators.ts                 # ✅ Input validation
│
├── types/                            # Shared Types
│   ├── models.ts                     # Domain models
│   ├── index.ts                      # Barrel export
│   └── ...
│
├── schemas.ts                        # Zod validation schemas
├── constants.ts                      # App-wide constants
│
└── ui/                               # Presentation Layer
    ├── routes/
    │   └── storefront.screen.tsx     # ✅ Main SPA container
    │
    ├── components/
    │   ├── layout/
    │   │   ├── StorefrontHeader.tsx
    │   │   ├── StorefrontNavigation.tsx
    │   │   ├── StorefrontTabContent.tsx  # ✅ SPA router
    │   │   └── StorefrontFooter.tsx
    │   │
    │   ├── shared/                   # Reutilizables
    │   │   ├── ProfessionalProductCard.tsx     # ✅ 265 líneas, memoized
    │   │   ├── AnimatedHeartButton.tsx         # Wishlist toggle
    │   │   ├── PriceDisplay.tsx
    │   │   ├── ProductSkeleton.tsx
    │   │   └── QuickViewModal.tsx
    │   │
    │   └── debug/
    │       └── WishlistDebugPanel.tsx
    │
    └── features/                     # TABS (Mini-apps)
        ├── overview/                 # Homepage
        │   ├── OverviewTab.tsx       # ✅ 231 líneas
        │   ├── HeroSection.tsx
        │   ├── FeaturedProducts.tsx
        │   └── ...
        │
        ├── products/                 # Full Catalog
        │   ├── ProductsTab.tsx       # ✅ 450 líneas (!) - Tab "página"
        │   ├── ProductsHeader.tsx
        │   ├── ProductsGrid.tsx
        │   ├── ProductsFilters.tsx   # Filtros complejos
        │   ├── ProductsPagination.tsx
        │   └── types/
        │
        ├── wishlist/                 # Wishlist Feature
        │   ├── WishlistTab.tsx       # ✅ 212 líneas
        │   ├── WishlistGrid.tsx
        │   ├── WishlistHeader.tsx
        │   ├── WishlistFilters.tsx
        │   └── ...
        │
        ├── cart/                     # Shopping Cart
        │   ├── CartTab.tsx           # ✅ 275 líneas
        │   └── components/
        │       ├── CartItem.tsx
        │       ├── CartSummary.tsx
        │       └── ...
        │
        ├── checkout/                 # Checkout Flow
        │   └── CheckoutTab.tsx
        │
        ├── categories/               # Category Browse
        │   └── CategoriesTab.tsx
        │
        ├── account/                  # User Account
        │   ├── AccountTab.tsx
        │   └── components/
        │       ├── AddressSection.tsx
        │       ├── OrdersSection.tsx
        │       └── ...
        │
        └── support/                  # Help/Support
            └── SupportTab.tsx
```

---

## 2️⃣ ORGANIZACION DE CONTEXTOS

### A. StorefrontUIContext ✅ (80 líneas)
```typescript
// Responsabilidades: SOLO UI STATE
interface StorefrontUIContextType {
  // Tab navigation (SPA)
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isTabChanging: boolean;

  // Search
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;

  // Product modal
  viewingProduct: ProductForCustomer | null;
  setViewingProduct: (product: ProductForCustomer | null) => void;
}
```

**Patrón:** ULTRA-LIGERO. Solo UI state, nada de data server.
**Líneas:** 80 (reducido de 348 líneas en versión anterior)
**Ventajas:**
- No genera re-renders innecesarios
- No causa infinite loops
- Simple, fácil de debuggear
- Foco 100% en UI

### B. CartContext ✅ (350 líneas)
```typescript
// Responsabilidades: Cart operations + state
interface CartContextType {
  // Data
  items: CartItemWithProduct[];
  summary: CartSummary | null;
  itemCount: number;
  totalAmount: number;

  // State
  isLoading: boolean;
  isError: boolean;

  // Actions
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;

  // Utils
  formatPrice: (amount: number) => string;
}
```

**Patrón:** Business logic context. Maneja las operaciones del carrito.
**Nota:** CartContext hace server actions directamente (no TanStack Query)
**Por qué no TanStack Query?** El cart es un flujo de trabajo único por usuario/sesión, no necesita caching complejo como products.

### C. CheckoutContext ✅ (80+ líneas)
```typescript
// Responsabilidades: Checkout flow state
interface CheckoutContextType {
  // State
  currentStep: CheckoutStep;
  setCurrentStep: (step: CheckoutStep) => void;

  // Shipping
  selectedShippingMethod: ShippingMethod | null;
  setSelectedShippingMethod: (method: ShippingMethod) => void;

  // Payment
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;

  // Order
  createdOrder: Order | null;
  setCreatedOrder: (order: Order | null) => void;

  // Calculations
  calculation: CheckoutCalculation | null;
}
```

**Patrón:** Flujo step-by-step para checkout
**Responsabilidades:** Manejar steps, métodos de envío/pago

---

## 3️⃣ ORGANIZACION DE HOOKS

### A. useStorefrontData (TanStack Query)

```typescript
// Hook PRINCIPAL - Carga TODO
export function useStorefrontData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: storefrontKeys.all,
    queryFn: async (): Promise<StorefrontData> => {
      const result = await getStorefrontDataAction({
        productFilters: {...},
        categoryFilters: {...},
        userId: user?.id,
        featuredProductsLimit: 12,
      });
      return result.data;
    },
    staleTime: 5 * 60 * 1000,    // 5 min
    gcTime: 10 * 60 * 1000,      // 10 min
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: 3,
  });
}

// Helper hooks especializados
export function useStorefrontProducts() {
  const { data, isLoading, error } = useStorefrontData();
  return {
    products: data?.products || [],
    isLoading,
    error,
  };
}

export function useStorefrontCategories() {
  const { data, isLoading, error } = useStorefrontData();
  return {
    categories: data?.categories || [],
    isLoading,
    error,
  };
}

export function useFeaturedContent() {
  const { data, isLoading, error } = useStorefrontData();
  return {
    featuredProducts: data?.featuredProducts || [],
    featuredCategories: data?.featuredCategories || [],
    isLoading,
    error,
  };
}
```

**Patrón:** Separación clara - un hook principal + helpers especializados
**Data fetching:** TanStack Query con caching inteligente
**Beneficios:**
- ✅ Zero infinite loops
- ✅ Caching automático
- ✅ Background refetch
- ✅ DevTools integration

### B. useWishlist (TanStack Query Mutations)

```typescript
export function useWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      // Server call
      const result = await addToWishlistAction(user.id, productId);
      return result;
    },

    // OPTIMISTIC UPDATES
    onMutate: async (productId) => {
      // 1. Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: storefrontKeys.all });

      // 2. Snapshot previous
      const previousData = queryClient.getQueryData(storefrontKeys.all);

      // 3. Update optimistically
      queryClient.setQueryData(storefrontKeys.all, (old) => {
        return {
          ...old,
          products: old.products.map(p =>
            p.id === productId ? { ...p, isWishlisted: true } : p
          ),
          wishlist: [...old.wishlist, {...}],
        };
      });

      return { previousData };
    },

    // ROLLBACK on error
    onError: (err, productId, context) => {
      queryClient.setQueryData(storefrontKeys.all, context.previousData);
    },

    // SYNC after success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: storefrontKeys.all });
    },
  });

  const removeMutation = useMutation({...}); // Similar

  return {
    addToWishlist: addMutation.mutateAsync,
    removeFromWishlist: removeMutation.mutateAsync,
    isAddingToWishlist: addMutation.isPending,
    isRemovingFromWishlist: removeMutation.isPending,
    // ... más
  };
}

// Helper hook para toggle
export function useWishlistToggle() {
  const { addToWishlist, removeFromWishlist, isWishlistMutating } = useWishlist();

  const toggle = async (productId: string, isCurrentlyWishlisted: boolean) => {
    if (isCurrentlyWishlisted) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return { toggle, isToggling: isWishlistMutating };
}
```

**Patrón:** TanStack Query mutations con optimistic updates
**Características:**
- ✅ Updates instantáneos en UI
- ✅ Rollback automático si falla
- ✅ Sincronización con server
- ✅ Loading states por acción

### C. useCart (Custom Context Hook)

```typescript
// Este NO usa TanStack Query, usa CartContext directamente
export function useCart() {
  const context = useCartContext();
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

// Uso
const { addToCart, removeItem, items } = useCart();
```

**Por qué Context API en lugar de TanStack Query?**
- El cart es session-based, no global
- Cambios frecuentes (add/remove items)
- No necesita caching complejo
- Más sencillo que Query para operaciones simple

---

## 4️⃣ ORGANIZACION DE TABS/FEATURES

### Patrón: "Mini-Aplicaciones" no formularios

Los tabs del storefront son **DIFERENTES** a los tabs administrativos:

| Aspecto | Storefront | Inventory/Admin |
|---------|-----------|-----------------|
| **Naturaleza** | Aplicación de compra | Herramienta administrativa |
| **Complejidad** | Alta (workflows completos) | Media (CRUD) |
| **Estado local** | Filtros, paginación, búsqueda | Filtros principalmente |
| **Componentes** | Muchos sub-componentes | Menos abstracciones |
| **Líneas de código** | 200-450 líneas | 200-350 líneas |
| **Lógica** | Mezcla UI + data + acciones | Principalmente UI |

### A. ProductsTab (450 líneas)

```typescript
// PATRÓN: Tab-as-a-Mini-App
const ProductsTab: React.FC<ProductsTabProps> = ({ onAddToCart }) => {
  // 1. UI State (desde Context)
  const { globalSearchTerm, setGlobalSearchTerm, setViewingProduct } =
    useStorefrontUI();

  // 2. Data (desde TanStack Query hooks)
  const { data, isLoading } = useStorefrontData();
  const { addToWishlist, removeFromWishlist } = useWishlist();

  // 3. Component State (local filters, view mode, sorting)
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);

  // 4. Derived State (useMemo para cálculos)
  const products = useMemo(() => {
    const wishlistProductIds = new Set(
      wishlist.map((w) => w.productId)
    );
    return rawProducts.map((p) => ({
      ...p,
      isWishlisted: wishlistProductIds.has(p.id),
    }));
  }, [rawProducts, wishlist]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];
    
    // Filtrar por búsqueda
    if (localSearchTerm.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(localSearchTerm.toLowerCase())
      );
    }

    // Filtrar por categorías
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p =>
        filters.categories.includes(p.categoryId)
      );
    }

    // ... más filtros (precios, ratings, brands, stock, ofertas)

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_asc": return a.price - b.price;
        case "price_desc": return b.price - a.price;
        case "rating": return (b.rating || 0) - (a.rating || 0);
        // ... más opciones
        default: return 0;
      }
    });

    return filtered;
  }, [products, localSearchTerm, filters, sortBy]);

  // 5. Paginación
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  // 6. Event Handlers
  const handleWishlistToggle = useCallback(
    async (product: ProductForCustomer) => {
      try {
        if (product.isWishlisted) {
          await removeFromWishlist(product.id);
        } else {
          await addToWishlist(product.id);
        }
        return { success: true, message: "..." };
      } catch (error) {
        return { success: false, message: "Error" };
      }
    },
    [addToWishlist, removeFromWishlist]
  );

  // 7. Render
  return (
    <div className="products-tab">
      <ProductsHeader {...headerProps} />
      
      <div className="flex gap-6">
        <ProductsFilters {...filterProps} />
        
        <div className="flex-1">
          <ProductsGrid
            products={paginatedProducts}
            onAddToCart={onAddToCart}
            onAddToWishlist={handleWishlistToggle}
            {...gridProps}
          />
          
          {totalPages > 1 && <ProductsPagination {...paginationProps} />}
        </div>
      </div>
    </div>
  );
};
```

**Estructura:** 450 líneas distribuidas en:
- ~100 líneas: Hooks y state management
- ~150 líneas: Lógica de filtrado/ordenamiento (useMemo)
- ~150 líneas: Render
- ~50 líneas: Event handlers

**Características:**
- ✅ Filtros avanzados (categorías, precios, ratings, brands, stock, ofertas)
- ✅ Búsqueda en tiempo real
- ✅ Ordenamiento (relevance, price, rating, newest, bestseller)
- ✅ Paginación
- ✅ Vista grid/list
- ✅ Wishlist toggle
- ✅ Add to cart
- ✅ Quick view modal

### B. WishlistTab (212 líneas)

```typescript
const WishlistTab: React.FC = () => {
  // Data hooks
  const { data, isLoading } = useStorefrontData();
  const { removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Derived data
  const wishlistWithProducts = useMemo(() => {
    return wishlist
      .map((wishlistItem) => {
        const product = products.find(p => p.id === wishlistItem.productId);
        return product ? { ...product, wishlistItem } : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [wishlist, products]);

  // Simple filtering
  const filteredWishlist = useMemo(() => {
    if (!globalSearchTerm.trim()) return wishlistWithProducts;
    return wishlistWithProducts.filter(p =>
      p.name.toLowerCase().includes(globalSearchTerm.toLowerCase())
    );
  }, [wishlistWithProducts, globalSearchTerm]);

  // Handlers
  const handleRemoveFromWishlist = async (productId: string) => {
    await removeFromWishlist(productId);
  };

  // Render
  return (
    <div className="wishlist-tab space-y-6">
      <WishlistHeader />
      {wishlistWithProducts.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <>
          <WishlistGrid products={filteredWishlist} />
          <WishlistPagination />
        </>
      )}
    </div>
  );
};
```

**Estructura:** 212 líneas (más simple que ProductsTab)
- Filtrado simple (solo búsqueda)
- Sin paginación (mostrar todo)
- Grid view principalmente

### C. OverviewTab (231 líneas)

```typescript
const OverviewTab: React.FC = () => {
  // Data
  const { data, isLoading } = useStorefrontData();
  const { addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Derived (wishlist state)
  const featuredProducts = useMemo(() => {
    const wishlistProductIds = new Set(wishlist.map(w => w.productId));
    return rawFeaturedProducts.map(p => ({
      ...p,
      isWishlisted: wishlistProductIds.has(p.id),
    }));
  }, [rawFeaturedProducts, wishlist]);

  // Handlers (simple)
  const handleWishlistToggle = async (product) => {
    if (product.isWishlisted) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  // Render: Hero + Featured Products + Categories + Stats
  return (
    <div className="overview-tab space-y-8">
      <HeroSection />
      <FeaturedProductsGrid products={featuredProducts.slice(0, 8)} />
      <PopularCategories categories={categories.slice(0, 12)} />
      <StatsSection />
    </div>
  );
};
```

**Patrón:** Homepage tradicional
- Hero section
- Featured products (8 items)
- Popular categories (12 items)
- Stats cards

---

## 5️⃣ COMPONENTES COMPARTIDOS

### A. ProfessionalProductCard (265 líneas)

```typescript
interface ProfessionalProductCardProps {
  product: ProductForCustomer;
  onAddToCart?: (productId: string, quantity?: number) => Promise<void>;
  onAddToWishlist?: (product) => Promise<{ success: boolean; message: string }>;
  onQuickView?: (product: ProductForCustomer) => void;
  isAddingToWishlist?: boolean;
  isAddingToCart?: boolean;
  variant?: "grid" | "list";
}

export const ProfessionalProductCard = memo(
  ProfessionalProductCardComponent,
  (prevProps, nextProps) => {
    // Custom comparison - evita re-renders innecesarios
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.isWishlisted === nextProps.product.isWishlisted &&
      // ... más comparaciones
    );
  }
);
```

**Características:**
- ✅ Memoized para evitar re-renders
- ✅ Soporta grid y list view
- ✅ Wishlist button integrado
- ✅ Dark mode support
- ✅ Price formatting
- ✅ Stock status

**Reutilización:**
- ProductsTab
- WishlistTab
- OverviewTab
- QuickViewModal

### B. AnimatedHeartButton (wishlist toggle)

Botón de wishlist con animación smooth.
- Dos variantes: overlay (en grid) e inline (en list)
- Estados de loading
- Animaciones fluidas

### C. Otros componentes compartidos

- `PriceDisplay` - Formatea precios
- `ProductSkeleton` - Loading placeholder
- `QuickViewModal` - Modal rápida de producto

---

## 6️⃣ DIFERENCIAS: STOREFRONT vs ADMINISTRATIVO

### SPA Pattern vs Formularios

**Storefront (SPA):**
```
StorefrontScreen
  ├── Providers (Cart, Checkout, UI)
  └── StorefrontTabContent
      ├── OverviewTab (siempre montado)
      ├── ProductsTab (siempre montado)
      ├── WishlistTab (siempre montado)
      ├── CartTab (siempre montado)
      └── ... (todos montados)

Cambio de tab = cambio de visibility, NO remount
```

**Administrativo:**
```
InventoryScreen
  └── InventoryContext
      └── TabTabs (Tabs component)
          ├── CategoriesTab (condicional)
          ├── ProductsTab (condicional)
          ├── OverviewTab (condicional)
          └── ...

Cambio de tab = remount componente
```

### Implicaciones:

| Aspecto | Storefront | Administrativo |
|---------|-----------|-----------------|
| **Velocidad** | Instantánea (visibility) | Depende render |
| **Estado** | Se preserva | Se reinicia |
| **Cache** | TanStack Query caching | Request al servidor |
| **UX** | Premium (0ms switch) | Estándar (render + load) |

---

## 7️⃣ ARQUITECTURA: CÓMO APLICAR PATTERNS

### ✅ PATRONES YA APLICADOS CORRECTAMENTE

1. **Server Actions Thin + Services Thick**
   - ✅ `server/actions.ts` - Thin, solo validación + delegación
   - ✅ `server/service.ts` - Thick, lógica compleja
   - ✅ `server/queries.ts` - Database layer
   - ✅ `server/mappers.ts` - Data transformation
   - ✅ `server/validators.ts` - Validation logic

2. **TanStack Query para Data Fetching**
   - ✅ `useStorefrontData()` - Query con caching
   - ✅ `useWishlist()` - Mutations con optimistic updates
   - ✅ Separación clara: Query para reads, Mutations para writes

3. **Context API para UI State**
   - ✅ `StorefrontUIContext` - SOLO UI state (80 líneas)
   - ✅ Separación: Query = data, Context = UI
   - ✅ Reducción de re-renders

4. **SPA Pattern para Tabs**
   - ✅ Todos los tabs montados siempre
   - ✅ Visibility-based switching
   - ✅ State preservation
   - ✅ Zero-delay navigation

### ⚠️ ÁREAS DE MEJORA (según ARCHITECTURE_PATTERNS.md)

1. **Componentes en Tabs que podrían extractarse**
   - ProductsFilters (inline) → ✅ Ya existe como componente
   - ProductsGrid (inline) → ✅ Ya existe como componente
   - ProductsHeader (inline) → ✅ Ya existe como componente
   - **Están bien organizados**

2. **Utils Functions (Pure Functions)**
   - **Faltaría:** Helpers para cálculos (descuentos, impuestos, etc.)
   - **Solución:** Crear `/utils/pricing.helpers.ts`, `/utils/filter.helpers.ts`

3. **Hooks Organization**
   - ✅ `useStorefrontData()` - Main hook
   - ✅ `useWishlist()` - Mutation hook
   - ✅ Helper hooks (`useStorefrontProducts()`, etc.)
   - **Perfecto**

4. **Tipos Compartidos**
   - ✅ `types/models.ts` - Domain models
   - ✅ `types/index.ts` - Barrel export
   - **Bien organizado**

---

## 8️⃣ PATRONES ESPECIALES DEL STOREFRONT

### A. Optimistic Updates Pattern

```typescript
// En useWishlist()
onMutate: async (productId) => {
  // 1. Cancel queries
  await queryClient.cancelQueries({ queryKey: storefrontKeys.all });

  // 2. Snapshot
  const previousData = queryClient.getQueryData(storefrontKeys.all);

  // 3. Update optimistically
  queryClient.setQueryData(storefrontKeys.all, (old) => ({
    ...old,
    products: old.products.map(p =>
      p.id === productId ? { ...p, isWishlisted: true } : p
    ),
    wishlist: [...old.wishlist, newWishlistItem],
  }));

  return { previousData };
},

onError: (err, productId, context) => {
  // 4. Rollback if fails
  queryClient.setQueryData(storefrontKeys.all, context.previousData);
}
```

**Beneficio:** UI updates instantly, rollback if error

### B. Single Source of Truth Pattern

```typescript
// En ProductsTab
const products = useMemo(() => {
  const wishlistProductIds = new Set(wishlist.map(w => w.productId));
  return rawProducts.map(p => ({
    ...p,
    isWishlisted: wishlistProductIds.has(p.id),  // ← Derived from wishlist array
  }));
}, [rawProducts, wishlist]);
```

**Beneficio:** `isWishlisted` siempre sincronizado con wishlist array

### C. Tab-as-Mini-App Pattern

```typescript
// Cada tab recibe acciones desde TabContent
<ProductsTab onAddToCart={handleAddToCart} />

// Tab usa hooks + props + state local
const ProductsTab: React.FC<ProductsTabProps> = ({ onAddToCart }) => {
  const { data } = useStorefrontData();           // Global data
  const { addToWishlist } = useWishlist();        // Global mutations
  const { activeTab, setViewingProduct } = useStorefrontUI();  // Global UI
  const [filters, setFilters] = useState(...);    // Local state
  // ...
};
```

**Beneficio:** Mezcla perfecta de global y local state

### D. Memoization Strategy

```typescript
// Componentes memoizados
export const ProfessionalProductCard = memo(
  ProfessionalProductCardComponent,
  (prevProps, nextProps) => {
    // Custom comparison
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.isWishlisted === nextProps.product.isWishlisted &&
      // ... más
    );
  }
);

// useMemo para derived state
const filteredProducts = useMemo(() => {
  // Lógica compleja
}, [dependencies]);

// useCallback para handlers estables
const handleWishlistToggle = useCallback(async (product) => {
  // Handler
}, [dependencies]);
```

**Beneficio:** Performance optimizations en múltiples niveles

---

## 9️⃣ RECOMENDACIONES: CÓMO APLICAR ARCHITECTURE_PATTERNS.md

### 1. Pure Functions (`/utils/`)

**Crear:**
```
src/features/storefront/utils/
├── pricing.helpers.ts       # calculateDiscountPrice, calculateTax, etc.
├── filter.helpers.ts        # filterByPrice, filterByCategory, etc.
├── format.helpers.ts        # formatCurrency, formatDate, etc.
├── sort.helpers.ts          # sortByPrice, sortByRating, etc.
└── index.ts                 # Barrel export
```

**Ejemplo:**
```typescript
// utils/pricing.helpers.ts
export const calculateDiscountPrice = (originalPrice: number, discountPercent: number): number => {
  return Math.round(originalPrice * (1 - discountPercent / 100));
};

export const calculateTaxAmount = (subtotal: number, taxRate: number): number => {
  return Math.round(subtotal * taxRate);
};

// utils/filter.helpers.ts
export const filterProductsByPrice = (
  products: ProductForCustomer[],
  minPrice: number,
  maxPrice: number
): ProductForCustomer[] => {
  return products.filter(p => {
    const price = p.salePrice || p.price;
    return price >= minPrice && price <= maxPrice;
  });
};

// utils/sort.helpers.ts
export const sortProductsByPrice = (
  products: ProductForCustomer[],
  order: "asc" | "desc"
): ProductForCustomer[] => {
  return [...products].sort((a, b) => {
    const priceA = a.salePrice || a.price;
    const priceB = b.salePrice || b.price;
    return order === "asc" ? priceA - priceB : priceB - priceA;
  });
};
```

### 2. Custom Hooks (`/hooks/`)

**Crear helpers hooks:**
```typescript
// hooks/useProductFiltering.ts
export function useProductFiltering(
  products: ProductForCustomer[],
  filters: ProductFilters,
  searchTerm: string
) {
  return useMemo(() => {
    let filtered = [...products];

    // Apply all filters
    if (searchTerm) {
      filtered = filterProductsBySearch(filtered, searchTerm);
    }
    if (filters.categories.length) {
      filtered = filterProductsByCategories(filtered, filters.categories);
    }
    if (filters.priceRange) {
      filtered = filterProductsByPrice(filtered, ...filters.priceRange);
    }

    return filtered;
  }, [products, filters, searchTerm]);
}

// hooks/useProductSorting.ts
export function useProductSorting(
  products: ProductForCustomer[],
  sortBy: string
) {
  return useMemo(() => {
    switch (sortBy) {
      case "price_asc": return sortProductsByPrice(products, "asc");
      case "price_desc": return sortProductsByPrice(products, "desc");
      // ... más casos
      default: return products;
    }
  }, [products, sortBy]);
}
```

### 3. Extract Components When...

**YA BIEN HECHO:**
- ✅ ProductsGrid - Extracted
- ✅ ProductsFilters - Extracted
- ✅ ProductsHeader - Extracted
- ✅ ProfessionalProductCard - Extracted + memoized
- ✅ AnimatedHeartButton - Extracted

**PODRÍA MEJORARSE:**
- ProductsTab (450 líneas) es grande pero está bien porque:
  - Mezcla UI state + data fetching + actions
  - Es una "página completa" (mini-app)
  - Los subcomponentes están extraídos
  - **Alternativa:** Si crece más, considerar extraer lógica a hooks

### 4. Clean Tabs Pattern

**Objetivo:** Tabs de ~200 líneas que SOLO orquestan

**ProductsTab actual:** 450 líneas (grande, pero justificado)
```
- 100 líneas: State management (hooks + useState)
- 150 líneas: Filtering/sorting logic (useMemo)
- 150 líneas: Render + event handlers
- 50 líneas: Handlers

MEJORA SUGERIDA: Extraer lógica a hooks
```

**Opción A: Crear hook para filtering logic**
```typescript
// hooks/useProductsTabFiltering.ts
export function useProductsTabFiltering(products: ProductForCustomer[]) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("relevance");
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const filteredAndSorted = useMemo(() => {
    // Toda la lógica de filtrado
    return applyAllFilters(products, filters, sortBy, localSearchTerm);
  }, [products, filters, sortBy, localSearchTerm]);

  return {
    filters,
    setFilters,
    sortBy,
    setSortBy,
    localSearchTerm,
    setLocalSearchTerm,
    filteredAndSorted,
  };
}
```

**ProductsTab simplificado:**
```typescript
const ProductsTab: React.FC<ProductsTabProps> = ({ onAddToCart }) => {
  // Data
  const { data, isLoading } = useStorefrontData();
  const { addToWishlist, removeFromWishlist } = useWishlist();

  // Filtering logic (moved to hook)
  const {
    filters,
    setFilters,
    filteredAndSorted,
    // ... rest
  } = useProductsTabFiltering(data?.products || []);

  // Pagination
  const { paginatedProducts, /* ... */ } = usePagination(
    filteredAndSorted,
    24
  );

  // Render
  return (
    <div className="products-tab">
      <ProductsHeader {...} />
      <ProductsFilters {...} />
      <ProductsGrid products={paginatedProducts} {...} />
      <ProductsPagination {...} />
    </div>
  );
};
```

---

## 🔟 CHECKLIST: APLICAR PATTERNS

### 1. Utils Functions
- [ ] Create `/utils/pricing.helpers.ts` - Pricing calculations
- [ ] Create `/utils/filter.helpers.ts` - Filter logic
- [ ] Create `/utils/sort.helpers.ts` - Sorting logic
- [ ] Create `/utils/format.helpers.ts` - Formatting
- [ ] Create `/utils/index.ts` - Barrel export
- [ ] Update tests for utils

### 2. Hooks
- [ ] Create `/hooks/useProductFiltering.ts` - Filtering hook
- [ ] Create `/hooks/useProductSorting.ts` - Sorting hook
- [ ] Create `/hooks/usePagination.ts` - Pagination hook
- [ ] Update `/hooks/index.ts` - Add new exports

### 3. Clean Tabs
- [ ] Refactor ProductsTab to use new hooks (target: ~250 lines)
- [ ] Add JSDoc comments
- [ ] Verify no duplicated logic

### 4. Components
- [ ] Review if any components should be extracted
- [ ] Add prop documentation
- [ ] Verify memoization where needed

### 5. Types & Validation
- [ ] Ensure all types are in `/types/`
- [ ] Ensure all schemas are in `/schemas.ts`
- [ ] Add JSDoc for complex types

### 6. Documentation
- [ ] Update README.md with new structure
- [ ] Document hooks
- [ ] Document components

---

## 11️⃣ CONCLUSIONES

### Storefront es DIFERENTE

El módulo storefront **no debe seguir los mismos patrones que inventory/admin** porque:

1. **Es una mini-aplicación**, no un CRUD administrativo
2. **Patrón SPA** con tabs siempre montados (no condicional)
3. **TanStack Query** para data fetching (no solo Context)
4. **Workflows complejos** (cart → checkout → order)
5. **Usuarios finales** con UX premium

### Patrones Correctos

✅ **Actualmente bien aplicados:**
- TanStack Query para reads
- Mutations para writes
- Context para UI state solamente
- Optimistic updates
- SPA pattern
- Componentes reutilizables memoizados
- Server layer (actions thin, services thick)

⚠️ **Mejoras sugeridas:**
- Extraer pure functions a `/utils/`
- Crear helpers hooks para lógica compleja
- Documentar patterns con JSDoc
- Considerar refactorizar ProductsTab (muy grande)

### Aplicar ARCHITECTURE_PATTERNS.md

**SÓLO en partes relevantes:**
- ✅ `/utils/` - Pure functions (nuevas utilities)
- ✅ `/hooks/` - Custom hooks (nuevos helpers)
- ✅ `/ui/components/` - Extracted components (ya bien hecho)
- ⚠️ `/tabs/` - No aplicar el patrón 150-200 líneas (el storefront es diferente)
- ⚠️ Server layer - Ya bien implementado (copiar patrón actual)

---

## REPORTE FINAL

**Análisis:** Completo
**Arquitectura:** Sólida y bien pensada
**Recomendación:** Mantener el patrón actual + agregar utils/hooks helpers

El storefront es un ejemplo de **buena arquitectura moderna en Next.js**.
