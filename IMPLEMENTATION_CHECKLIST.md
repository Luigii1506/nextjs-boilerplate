# ✅ **CHECKLIST DE IMPLEMENTACIÓN - TANSTACK QUERY**

> **IMPORTANTE:** Sigue estos pasos EN ORDEN para migrar sin romper nada.

---

## 🎯 **FASE 1: SETUP (Ya completado ✅)**

- [x] ✅ Crear `src/features/storefront/hooks/queryKeys.ts`
- [x] ✅ Crear `src/features/storefront/hooks/useStorefrontData.ts`
- [x] ✅ Crear `src/features/storefront/hooks/useWishlist.ts`
- [x] ✅ Crear `src/features/storefront/hooks/useCart.ts`
- [x] ✅ Crear `src/features/storefront/hooks/index.ts`
- [x] ✅ Crear `src/features/storefront/context/StorefrontUIContext.tsx`
- [x] ✅ Actualizar `src/features/storefront/context/index.ts`

---

## 🔧 **FASE 2: CAMBIOS EN CÓDIGO (TU TURNO)**

### **📝 Paso 1: Actualizar storefront.screen.tsx**

**Archivo:** `src/features/storefront/ui/routes/storefront.screen.tsx`

#### **1.1 Cambiar imports (líneas 32-37)**

```diff
- import {
-   StorefrontProvider,
-   useStorefrontContext,
-   STOREFRONT_TABS,
-   type TabId,
- } from "../../context";

+ import {
+   StorefrontUIProvider,
+   useStorefrontUI,
+   STOREFRONT_TABS,
+   type TabId,
+ } from "../../context";
+ import { useStorefrontData, useWishlist, useCart } from "../../hooks";
```

#### **1.2 Cambiar Provider (líneas ~680-716)**

Busca la función `export default function StorefrontScreen()` al final del archivo.

```diff
  export default function StorefrontScreen() {
    return (
-     <StorefrontProvider>
+     <StorefrontUIProvider>
-       <CartProvider>
-         <CheckoutProvider>
            <StorefrontContent />
-         </CheckoutProvider>
-       </CartProvider>
-     </StorefrontProvider>
+     </StorefrontUIProvider>
    );
  }
```

#### **1.3 Actualizar CustomerHeader (líneas ~78-86)**

Busca `const CustomerHeader` y cambia:

```diff
  const CustomerHeader: React.FC<CustomerHeaderProps> = ({
    scrollY,
    isPastThreshold,
  }) => {
-   const { globalSearchTerm, setGlobalSearchTerm, setActiveTab } =
-     useStorefrontContext();
+   const { globalSearchTerm, setGlobalSearchTerm, setActiveTab } =
+     useStorefrontUI();

-   const { itemCount, formatPrice, totalAmount } = useCartContext();
+   const { summary } = useCart();
+   const itemCount = summary?.itemCount || 0;
+   const totalAmount = summary?.total || 0;
+
+   const formatPrice = (amount: number) => {
+     return new Intl.NumberFormat("es-MX", {
+       style: "currency",
+       currency: "MXN",
+     }).format(amount);
+   };

    // ...resto sin cambios
  }
```

#### **1.4 Actualizar TabContent**

Busca la función `const TabContent` (probablemente línea ~450):

```diff
  const TabContent = () => {
-   const { activeTab } = useStorefrontContext();
+   const { activeTab } = useStorefrontUI();
+   const { addToCart } = useCart();

    return (
      <div className="...">
        {activeTab === 'overview' && <OverviewTab />}
-       {activeTab === 'products' && <ProductsTab onAddToCart={...} />}
+       {activeTab === 'products' && <ProductsTab onAddToCart={addToCart} />}
        {activeTab === 'wishlist' && <WishlistTab />}
        {/* resto igual */}
      </div>
    );
  };
```

---

### **📝 Paso 2: Actualizar ProductsTab**

**Archivo:** `src/features/storefront/ui/components/products/ProductsTab.tsx`

#### **2.1 Cambiar imports (líneas ~23-24)**

```diff
- import { useStorefrontContext } from "@/features/storefront/context";
+ import { useStorefrontUI } from "@/features/storefront/context";
+ import { useStorefrontData, useWishlist } from "@/features/storefront/hooks";
```

#### **2.2 Actualizar lógica del componente (líneas ~47-57)**

```diff
  const ProductsTab: React.FC<ProductsTabProps> = ({ onAddToCart }) => {
-   const {
-     products,
-     categories,
-     globalSearchTerm,
-     setGlobalSearchTerm,
-     addToWishlist,
-     removeFromWishlist,
-     setViewingProduct,
-   } = useStorefrontContext();

+   // UI State
+   const {
+     globalSearchTerm,
+     setGlobalSearchTerm,
+     setViewingProduct,
+   } = useStorefrontUI();
+
+   // Data (TanStack Query)
+   const { data, isLoading } = useStorefrontData();
+   const { addToWishlist, removeFromWishlist } = useWishlist();
+
+   // Extract data
+   const products = data?.products || [];
+   const categories = data?.categories || [];
+
+   // Loading state
+   if (isLoading) {
+     return (
+       <div className="flex justify-center items-center h-64">
+         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
+       </div>
+     );
+   }

    // ...resto del código SIN CAMBIOS
  }
```

---

### **📝 Paso 3: Actualizar WishlistTab**

**Archivo:** `src/features/storefront/ui/components/wishlist/WishlistTab.tsx`

#### **3.1 Cambiar imports**

```diff
- import { useStorefrontContext } from "@/features/storefront/context";
+ import { useStorefrontData, useWishlist } from "@/features/storefront/hooks";
```

#### **3.2 Actualizar lógica**

```diff
  function WishlistTab() {
-   const {
-     wishlist,
-     products,
-     removeFromWishlist,
-   } = useStorefrontContext();

+   const { data, isLoading } = useStorefrontData();
+   const { removeFromWishlist } = useWishlist();
+
+   const wishlistProducts = data?.products.filter(p => p.isWishlisted) || [];
+
+   if (isLoading) {
+     return <LoadingSkeleton />;
+   }

-   const wishlistProducts = products.filter(p => p.isWishlisted);

    // ...resto SIN CAMBIOS
  }
```

---

### **📝 Paso 4: Actualizar ProfessionalProductCard**

**Archivo:** `src/features/storefront/ui/components/shared/ProfessionalProductCard.tsx`

#### **4.1 Cambiar imports**

```diff
- import { useStorefrontContext } from "@/features/storefront/context";
+ import { useWishlistToggle } from "@/features/storefront/hooks";
```

#### **4.2 Simplificar lógica**

```diff
  function ProductCard({ product, onAddToCart }) {
-   const { addToWishlist, removeFromWishlist } = useStorefrontContext();
+   const { toggle, isToggling } = useWishlistToggle();

-   const handleWishlist = async () => {
-     if (product.isWishlisted) {
-       await removeFromWishlist(product.id);
-     } else {
-       await addToWishlist(product.id);
-     }
-   };
+   const handleWishlist = () => {
+     toggle(product.id, product.isWishlisted);
+   };

    return (
      <div>
        <button
          onClick={handleWishlist}
-         disabled={false}
+         disabled={isToggling}
        >
          {product.isWishlisted ? '❤️' : '🤍'}
        </button>
      </div>
    );
  }
```

---

## 🧪 **FASE 3: TESTING**

### **Paso 1: Iniciar el servidor**

```bash
npm run dev
```

### **Paso 2: Abrir en browser**

```
http://localhost:3000/store
```

### **Paso 3: Verificar funcionalidades**

- [ ] Página carga sin errores
- [ ] No hay loops infinitos (check console)
- [ ] Navegación entre tabs funciona
- [ ] Agregar a wishlist funciona (⚡ instantáneo)
- [ ] Remover de wishlist funciona (⚡ instantáneo)
- [ ] Agregar al carrito funciona
- [ ] Búsqueda global funciona
- [ ] No hay errores en consola

### **Paso 4: Verificar React Query DevTools**

Abre las DevTools de React Query (esquina inferior izquierda).

Deberías ver:
- ✅ `['storefront']` query
- ✅ `['cart', {...}]` query
- ✅ Mutations ejecutándose sin errores

---

## 🧹 **FASE 4: CLEANUP (Después de verificar que todo funciona)**

```bash
# Eliminar archivos obsoletos
rm src/features/storefront/context/StorefrontContext.tsx
rm src/features/storefront/context/StorefrontContext.backup.tsx
rm src/features/cart/context/CartContext.backup.tsx

# Eliminar carpetas de ejemplos/backups
rm -rf src/features/storefront/examples/

# Verificar que no hay imports rotos
npm run build
```

---

## 🚨 **SI ALGO FALLA**

### **Rollback rápido:**

```bash
# Restaurar backup
git checkout src/features/storefront/ui/routes/storefront.screen.tsx
git checkout src/features/storefront/ui/components/products/ProductsTab.tsx
git checkout src/features/storefront/ui/components/wishlist/WishlistTab.tsx
```

### **Ver logs:**

```bash
# En browser console, busca:
# - "❌" (errores)
# - "TanStack Query" (logs de debugging)
```

---

## 📊 **MÉTRICAS DE ÉXITO**

Después de la migración, deberías ver:

| Métrica | Antes | Después |
|---------|-------|---------|
| **Console errors** | ❌ Loops infinitos | ✅ Limpio |
| **Wishlist toggle** | ~1-2s | ⚡ Instantáneo |
| **Tab switching** | ~300ms | ⚡ 0ms |
| **Cart updates** | ~1s | ⚡ Instantáneo |
| **Code lines** | 799 | ~200 |

---

## ✅ **CHECKLIST FINAL**

- [ ] Todos los archivos actualizados
- [ ] Tests manuales pasados
- [ ] No hay errores en consola
- [ ] React Query DevTools muestra queries correctas
- [ ] Código obsoleto eliminado
- [ ] Build exitoso (`npm run build`)

---

## 🎓 **PRÓXIMOS PASOS**

Una vez que esto funcione:

1. **Replicar pattern en otros módulos**
   - Admin panel
   - Inventory
   - Settings

2. **Optimizar queries**
   - Agregar prefetching
   - Ajustar staleTime según necesidades

3. **Agregar tests**
   - Unit tests para hooks
   - Integration tests para componentes

---

**¿Listo?** Comienza con **FASE 2 - Paso 1** y ve haciendo los cambios uno por uno.

**No hagas todos los cambios de una vez.** Hazlos incrementales y prueba después de cada paso.
