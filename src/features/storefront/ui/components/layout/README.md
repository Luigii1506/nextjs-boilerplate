# 🏗️ Layout Components

Main structural components for the storefront screen.

## 📁 Structure

```
layout/
├── StorefrontHeader.tsx        (~250 lines)
├── StorefrontNavigation.tsx    (~120 lines)
├── StorefrontTabContent.tsx    (~220 lines)
├── StorefrontFooter.tsx        (~160 lines)
└── index.ts
```

## 🎯 Components

### StorefrontHeader
**Top navigation bar** with:
- Logo and branding
- Global search bar
- Account button with auth state
- Cart button with badge
- Mobile menu toggle
- Top promotional banner

**Props:**
```typescript
interface StorefrontHeaderProps {
  scrollY: number;
  isPastThreshold: boolean;
}
```

### StorefrontNavigation
**Tab navigation** with:
- All storefront tabs (Overview, Products, Cart, etc.)
- Active tab indicator
- Notification badges (wishlist count, cart count)
- Responsive design

**No props** - Uses context internally

### StorefrontTabContent
**Main content area** with:
- ALL tabs mounted (SPA pattern)
- Smooth tab transitions
- Handles addToCart logic
- Manages active tab visibility

**No props** - Orchestrates all tabs

### StorefrontFooter
**Bottom footer** with:
- Company information
- Quick links
- Customer service links
- Online status indicator
- Development mode indicator

**No props** - Static content

## 🚀 Usage

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

## 📝 Notes

- These are **layout components**, not feature components
- Used exclusively by `storefront.screen.tsx`
- Each component is self-contained and testable
- All use `"use client"` for client-side interactivity
