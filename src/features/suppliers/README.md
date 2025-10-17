# 🚛 Suppliers Feature Module

**Shared supplier management module**
Used across multiple features: inventory, pos, services, seller-portal

---

## 📋 Overview

The Suppliers module provides a centralized, reusable supplier management system that can be used by any feature in the application. This follows a **Shared Module Pattern** where common entities are extracted into their own modules to avoid duplication and maintain a single source of truth.

## 🎯 Key Features

- ✅ **Shared across modules** - Use suppliers in inventory, POS, services, etc.
- ✅ **CRUD operations** - Create, Read, Update, Delete suppliers
- ✅ **Search & filters** - Advanced filtering and search capabilities
- ✅ **Type-safe** - Full TypeScript support with shared types
- ✅ **React Query integration** - Optimistic updates and caching
- ✅ **Permission-based** - Integrated with auth system

## 🗂️ Module Structure

```
src/features/suppliers/
├── README.md              # This file
├── index.ts              # Public API exports
├── constants.ts          # Shared constants
├── actions.ts            # Server Actions
├── types.ts              # TypeScript types (re-exported from shared)
├── server/
│   ├── service.ts        # Business logic layer
│   ├── queries.ts        # Database queries
│   └── validators.ts     # Input validation
└── hooks/
    ├── useCreateSupplier.ts  # Mutation hooks
    └── useSuppliersQuery.ts  # Query hooks
```

## 🚀 Quick Start

### Import from the module

```typescript
// Import everything you need from the main module
import {
  // Services
  SupplierService,

  // Hooks
  useCreateSupplier,
  useSuppliersQuery,

  // Types
  Supplier,
  SupplierWithRelations,
  CreateSupplierInput,
} from "@/features/suppliers";
```

### Use in your feature

```typescript
// Example: Use in POS module
import { useSuppliersQuery } from "@/features/suppliers";

function POSPurchaseForm() {
  const { suppliers, isLoading } = useSuppliersQuery();

  return (
    <select>
      {suppliers.map(supplier => (
        <option key={supplier.id} value={supplier.id}>
          {supplier.name}
        </option>
      ))}
    </select>
  );
}
```

## 📦 Database Schema

The Supplier model is defined in:
`src/core/database/prisma/models/supplier.prisma`

```prisma
model Supplier {
  id            String   @id @default(cuid())
  name          String   @unique
  email         String?  @unique
  phone         String?
  // ... other fields

  // Cross-module relations
  products      Product[]       // From inventory
  // purchaseOrders PurchaseOrder[] // From pos (future)
  // services      Service[]       // From services (future)
}
```

## 🔌 Integration Guide

### Step 1: Add to your feature's types

```typescript
// src/features/your-feature/types.ts
import type { Supplier } from "@/features/suppliers";

export interface YourEntity {
  id: string;
  supplierId: string;
  supplier?: Supplier; // Optional relation
}
```

### Step 2: Use the service

```typescript
// src/features/your-feature/server/service.ts
import { SupplierService } from "@/features/suppliers";

export class YourService {
  static async create(input: YourInput) {
    // Get suppliers
    const suppliers = await SupplierService.getMany();

    // Validate supplier exists
    const supplier = await SupplierService.getById(input.supplierId);
    if (!supplier.success) {
      throw new Error("Invalid supplier");
    }

    // Use supplier data...
  }
}
```

### Step 3: Use the hooks

```typescript
// src/features/your-feature/ui/YourComponent.tsx
import { useSuppliersQuery, useCreateSupplier } from "@/features/suppliers";

export function YourComponent() {
  const { suppliers, isLoading } = useSuppliersQuery();
  const { createSupplier } = useCreateSupplier();

  const handleSubmit = async (data) => {
    await createSupplier({
      name: "New Supplier",
      email: "supplier@example.com",
    });
  };

  // ...
}
```

## 📝 API Reference

### Services

#### `SupplierService.create(input, userId)`
Create a new supplier. Requires `CREATE_SUPPLIER` permission.

#### `SupplierService.getMany(filters?)`
Get all suppliers with optional filters. Public access.

#### `SupplierService.getById(id)`
Get supplier by ID. Public access.

#### `SupplierService.update(id, input, userId)`
Update supplier. Requires `UPDATE_SUPPLIER` permission.

#### `SupplierService.delete(id, userId)`
Soft-delete supplier. Requires `DELETE_SUPPLIER` permission.

### Hooks

#### `useSuppliersQuery(options?)`
Fetch suppliers list with React Query.

**Options:**
- `filters?: SupplierFilters`
- `enabled?: boolean`
- `refetchInterval?: number`

**Returns:**
- `suppliers: SupplierWithRelations[]`
- `isLoading: boolean`
- `isError: boolean`
- `error: Error | null`
- `refetch: () => void`

#### `useCreateSupplier(options?)`
Create supplier mutation hook.

**Returns:**
- `createSupplier: (data: CreateSupplierInput) => Promise<void>`
- `isLoading: boolean`
- `error: string | null`
- `reset: () => void`

#### `useUpdateSupplier(options?)`
Update supplier mutation hook.

#### `useDeleteSupplier(options?)`
Delete supplier mutation hook.

## 🎨 Used By

- **📦 Inventory** - Product suppliers
- **🏪 POS** - Purchase orders (future)
- **👥 Seller Portal** - External sellers (future)
- **🔧 Services** - Service providers (future)
- **📦 Logistics** - Shipping suppliers (future)

## 🔐 Permissions

The following permissions are required:

- `CREATE_SUPPLIER` - Create new suppliers
- `UPDATE_SUPPLIER` - Update existing suppliers
- `DELETE_SUPPLIER` - Delete suppliers
- `VIEW_SUPPLIER` - View supplier details (public by default)

## 📚 Related Documentation

- [Inventory Module](../inventory/README.md)
- [Shared Types](../../shared/types/supplier.ts)
- [Database Schema](../../core/database/prisma/models/supplier.prisma)

---

**Created:** 2025-01-17
**Refactored from:** Inventory module to shared module
**Maintained by:** Core Team
