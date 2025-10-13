# 🏗️ Storefront Architecture Refactor

**Date:** 2025-01-12
**Version:** 3.0.0
**Status:** ✅ COMPLETED

---

## 📋 Summary

Refactored e-commerce features (Cart, Checkout, Orders) into storefront subdomains to align code structure with database schema and improve architectural cohesion.

---

## 🎯 Objectives

### Before (Problematic)
```
src/features/
├── cart/           ← Independent feature
├── checkout/       ← Independent feature
├── orders/         ← Independent feature
└── storefront/     ← Uses all 3 above
```

**Problems:**
- ❌ Inconsistent with Prisma schema (all in `storefront.prisma`)
- ❌ False modularity (cart/checkout/orders only exist for storefront)
- ❌ Confusing dependencies (circular imports)
- ❌ Unclear feature flag ownership

### After (Clean)
```
src/features/storefront/
├── cart/           ← Shopping cart subdomain
├── checkout/       ← Checkout subdomain
├── orders/         ← Orders subdomain
├── products/       ← Products subdomain
├── wishlist/       ← Wishlist subdomain
└── ...
```

**Benefits:**
- ✅ Aligned with Prisma schema (`storefront.prisma`)
- ✅ True cohesion (complete e-commerce flow in one place)
- ✅ Clear ownership (single feature flag: `FEATURE_STOREFRONT=true`)
- ✅ Scalable (POS will be independent with its own structure)

---

## 🔄 Changes Made

### 1. Moved Folders

```bash
# Orders
src/features/orders/  →  src/features/storefront/orders/

# Cart
src/features/cart/    →  src/features/storefront/cart/

# Checkout
src/features/checkout/  →  src/features/storefront/checkout/
```

### 2. Updated Imports

All imports within storefront updated:

```typescript
// OLD
import { useCart } from "@/features/cart";
import { useCheckout } from "@/features/checkout";
import { useOrders } from "@/features/orders";

// NEW
import { useCart } from "@/features/storefront/cart";
import { useCheckout } from "@/features/storefront/checkout";
import { useOrders } from "@/features/storefront/orders";
```

### 3. Backward Compatibility

Created wrapper files at old locations:

- `src/features/cart/index.ts` - Re-exports from `../storefront/cart`
- `src/features/checkout/index.ts` - Re-exports from `../storefront/checkout`
- `src/features/orders/index.ts` - Re-exports from `../storefront/orders`

These wrappers:
- ✅ Prevent breaking existing code
- ⚠️ Show deprecation warning in development
- 🗑️ Will be removed in future version

### 4. Updated Barrel Exports

`src/features/storefront/index.ts` now exports:
- Cart subdomain
- Checkout subdomain
- Orders subdomain
- Core storefront (context, hooks, UI)

**Note:** Some exports commented due to name conflicts. Use direct imports:

```typescript
// ✅ RECOMMENDED
import { useCart } from "@/features/storefront/cart";
import { CheckoutProvider } from "@/features/storefront/checkout";
import { useOrders } from "@/features/storefront/orders";
```

---

## 📊 Database Alignment

### Prisma Schema Structure

All models were already in `storefront.prisma`:

```prisma
// storefront.prisma
model Cart { ... }         // Feature flag: storefront
model CartItem { ... }     // Feature flag: storefront
model Order { ... }        // Feature flag: storefront
model OrderItem { ... }    // Feature flag: storefront
model WishlistItem { ... } // Feature flag: storefront
```

**Now code matches database!** 🎉

---

## 🎛️ Feature Flags

### Single Flag for All

```typescript
// config.ts
export const FEATURE_FLAGS = {
  storefront: true,  // Includes: cart, checkout, orders, wishlist, products
  pos: false,        // Future: Will have its own sales/transactions
}

export const FEATURE_DEPENDENCIES = {
  storefront: ["inventory"],  // Storefront needs products
  checkout: ["storefront"],   // Checkout is part of storefront
}
```

---

## 🚀 Migration Guide

### For Developers

#### Option 1: Update to New Paths (Recommended)

```typescript
// Update imports
import { useCart } from "@/features/storefront/cart";
import { useCheckout } from "@/features/storefront/checkout";
import { useOrders } from "@/features/storefront/orders";
```

#### Option 2: Use Backward Compatible Imports (Temporary)

```typescript
// Old imports still work (with deprecation warning)
import { useCart } from "@/features/cart";
import { useCheckout } from "@/features/checkout";
import { useOrders } from "@/features/orders";
```

### Search and Replace

```bash
# Find all files using old imports
grep -r "@/features/cart" src/
grep -r "@/features/checkout" src/
grep -r "@/features/orders" src/

# Replace (manually or with sed)
@/features/cart     → @/features/storefront/cart
@/features/checkout → @/features/storefront/checkout
@/features/orders   → @/features/storefront/orders
```

---

## 🏗️ Architecture Patterns

### Storefront Subdomains

```
storefront/
├── cart/                    # Shopping cart
│   ├── context/            # Cart state management
│   ├── server/             # Cart server actions
│   ├── types/              # Cart types
│   └── ui/                 # Cart components
│
├── checkout/                # Checkout flow
│   ├── context/            # Checkout state
│   ├── server/             # Payment processing
│   ├── types/              # Checkout types
│   └── ui/                 # Checkout components
│
├── orders/                  # Order management
│   ├── hooks/              # Order hooks (TanStack Query)
│   ├── server/             # Order queries/actions
│   ├── types/              # Order types
│   └── ui/                 # Order components (future)
│
├── products/                # Product catalog
├── wishlist/                # Wishlist
└── ...
```

### Comparison: Storefront vs POS

| Aspect | Storefront | POS (Future) |
|--------|-----------|--------------|
| Cart | ✅ Persistent (DB) | ❌ Temporary (memory) |
| Checkout | Multi-step (shipping, billing) | Single-step (pay now) |
| Orders | ✅ Orders (online) | ❌ Sales (in-person) |
| Payment | Stripe, PayPal | Cash, Terminal |
| Shipping | ✅ Required | ❌ No shipping |
| Database | `storefront.prisma` | `pos.prisma` (future) |

---

## ✅ Validation

### Build Status
```bash
npm run build
# ✅ Compiled successfully
# ⚠️ Only pre-existing linting warnings (cart anys, etc.)
```

### Tests
```bash
# Manual testing:
# ✅ AccountTab shows real orders
# ✅ Cart functionality works
# ✅ Checkout flow works
# ✅ Backward compatibility imports work
```

---

## 📚 Related Documentation

- [Storefront README](./src/features/storefront/README.md)
- [Cart README](./src/features/storefront/cart/README.md)
- [Feature Flags Config](./src/features/feature-flags/config.ts)
- [Prisma Schema](./src/core/database/prisma/models/storefront.prisma)

---

## 🔮 Future Work

### Phase 2: POS Module (Future)
```
src/features/pos/
├── sales/          # POS transactions (NOT orders)
├── register/       # Cash register
├── receipts/       # Receipt printing
└── ...
```

**Key difference:** POS Sales ≠ Storefront Orders (different models!)

### Phase 3: Remove Backward Compatibility (v4.0.0)
- Delete wrapper files (`cart/index.ts`, etc.)
- Remove deprecation warnings
- Breaking change: old imports will fail

---

## 👥 Contributors

- Engineering Team
- Architecture Review Board

---

**Status:** ✅ Refactor Complete
**Build:** ✅ Passing
**Backward Compatibility:** ✅ Maintained
**Next Steps:** Update remaining imports, test thoroughly
