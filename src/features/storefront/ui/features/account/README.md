# 👤 Account Components

Modular account management components extracted from AccountTab.

## 📁 Structure

```
account/
├── components/          # React components
│   ├── AccountHeader.tsx
│   ├── AccountNavigation.tsx
│   ├── AccountStats.tsx
│   └── OrdersSection.tsx
├── types/              # TypeScript interfaces
│   └── index.ts
├── utils/              # Utility functions
│   └── formatters.ts
├── index.ts            # Barrel exports
└── README.md           # This file
```

## 🎯 Components

### AccountHeader
User profile header with tier badge.
- Displays user avatar, name, email
- Shows membership tier badge
- Responsive design

### AccountNavigation
Sidebar navigation for account sections.
- Interactive section switcher
- Badge support for notifications
- Active state styling

### AccountStats
Statistics dashboard showing account metrics.
- Total spent
- Pending orders
- Completed orders
- Saved addresses

### OrdersSection
Complete orders management interface.
- Order history display
- Order details modal
- Cancel order functionality
- Repeat order functionality

## 🛠️ Utilities

### formatters.ts
- `formatPrice(amount)` - Format price to currency
- `getOrderStatusColor(status)` - Get status badge color
- `getOrderStatusLabel(status)` - Get localized status label
- `getTierColor(tier)` - Get tier badge gradient
- `getTierLabel(tier)` - Get localized tier label

## 📋 Types

### AccountSection
Navigation section definition

### UserProfile
User profile data structure

### Address
Address information structure

## 📊 Before & After Refactor

**Before:** AccountTab.tsx = 1,608 lines
**After:** AccountTab.tsx = 355 lines (78% reduction)

**Benefits:**
- ✅ Better code organization
- ✅ Reusable components
- ✅ Easier to maintain
- ✅ Better testability
- ✅ Cleaner imports

## 🔄 Usage

```typescript
import {
  AccountHeader,
  AccountNavigation,
  AccountStats,
  OrdersSection,
  type UserProfile,
  type Address,
  formatPrice,
} from '@/features/storefront/ui/components/account';

// Use components
<AccountHeader user={userProfile} allowAnimations={true} />
<AccountStats orders={orders} addresses={addresses} user={user} />
<OrdersSection orders={orders} allowAnimations={true} />
```

## 🚀 Future Improvements

- [ ] Extract ProfileSection component
- [ ] Extract AddressesSection component
- [ ] Extract SettingsSection component
- [ ] Extract SecuritySection component
- [ ] Add unit tests for components
- [ ] Add Storybook stories
- [ ] Implement real addresses API integration
