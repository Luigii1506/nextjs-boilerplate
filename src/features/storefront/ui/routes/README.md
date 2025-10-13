# 🛒 Storefront Routes

Clean, modular route components for the storefront SPA.

## 📁 Structure

```
routes/
└── storefront.screen.tsx    # Main SPA orchestrator (78 lines)

Layout components are in:
ui/components/layout/
├── StorefrontHeader.tsx        (~250 lines)
├── StorefrontNavigation.tsx    (~120 lines)
├── StorefrontTabContent.tsx    (~220 lines)
├── StorefrontFooter.tsx        (~160 lines)
└── index.ts
```

## 📊 Refactorization Results

**Before:**
- `storefront.screen.tsx` - 746 lines ❌

**After:**
- `storefront.screen.tsx` - 78 lines ✅ (90% reduction!)
- 4 modular components extracted

## 🎯 Component Responsibilities

### storefront.screen.tsx
**Main orchestrator** - Sets up providers and coordinates layout
- CartProvider
- CheckoutProvider
- StorefrontUIProvider
- useScrollHeader hook
- Debug panels (development only)

### StorefrontHeader
**Top navigation bar** with:
- Logo and branding
- Global search bar
- Account button with auth state
- Cart button with badge
- Mobile menu toggle
- Top promotional banner

### StorefrontNavigation
**Tab navigation** with:
- All storefront tabs (Overview, Products, Cart, etc.)
- Active tab indicator
- Notification badges (wishlist count, cart count)
- Responsive design

### StorefrontTabContent
**Main content area** with:
- ALL tabs mounted (SPA pattern)
- Smooth tab transitions
- Handles addToCart logic
- Manages active tab visibility

### StorefrontFooter
**Bottom footer** with:
- Company information
- Quick links
- Customer service links
- Online status indicator
- Development mode indicator

## 🚀 Usage

### Import the main screen:
```typescript
import StorefrontScreen from "@/features/storefront/ui/routes/storefront.screen";

export default function Page() {
  return <StorefrontScreen />;
}
```

### Import layout components (if needed):
```typescript
import {
  StorefrontHeader,
  StorefrontNavigation,
  StorefrontTabContent,
  StorefrontFooter
} from "@/features/storefront/ui/components/layout";
// Or shorter:
import {
  StorefrontHeader,
  StorefrontNavigation,
  StorefrontTabContent,
  StorefrontFooter
} from "@/features/storefront/ui/components";
```

## ✨ Benefits

- ✅ **90% smaller** main file
- ✅ **Modular** - Each component has one responsibility
- ✅ **Maintainable** - Easy to find and update code
- ✅ **Testable** - Components can be tested in isolation
- ✅ **Reusable** - Components can be reused if needed
- ✅ **Clear** - Each file has a clear purpose

## 🎨 SPA Pattern

The screen follows the **True SPA Pattern**:

1. **All tabs are always mounted** - No unmount/remount on tab change
2. **Only active tab is visible** - Using CSS opacity and z-index
3. **Smooth transitions** - CSS transitions for tab changes
4. **No state loss** - Tab state preserved during navigation
5. **Fast navigation** - Instant tab switching

## 📝 Notes

- Components use `"use client"` directive for client-side interactivity
- All animations defined in `../styles/animations.css`
- Debug panels only shown in development mode
- Scroll header uses enhanced hook for smooth behavior
