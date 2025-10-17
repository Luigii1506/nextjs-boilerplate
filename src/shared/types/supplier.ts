/**
 * 🚛 SUPPLIER TYPES - SHARED MODULE
 * ==================================
 *
 * Core shared types for Supplier entity
 * Used across multiple features: inventory, pos, services, etc.
 *
 * Created: 2025-01-17 - Refactored from inventory to shared module
 */

// 🗄️ Base Supplier Type (from Prisma)
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  taxId: string | null;
  paymentTerms: number;
  isActive: boolean;
  rating: number | null;
  notes: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 🔗 Supplier with Relations (generic - can be extended by features)
export interface SupplierWithRelations<T = unknown> extends Supplier {
  _count?: {
    products?: number;
    // Future: Add other relation counts as needed
    [key: string]: number | undefined;
  };
  // Generic relations - features can extend this
  relations?: T;
}

// 📝 Form Input Types
export interface CreateSupplierInput {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  paymentTerms?: number;
  rating?: number;
  notes?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {
  id: string;
  isActive?: boolean;
}

// 🔍 Query & Filter Types
export interface SupplierFilters {
  search?: string;
  isActive?: boolean;
  minRating?: number;
  country?: string;
  hasEmail?: boolean;
  hasPhone?: boolean;
  city?: string;
  state?: string;
}

// 🎯 Action Result Type
export interface SupplierActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>; // validation errors
}

// 📊 Supplier Statistics (can be extended by features)
export interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  suppliersWithProducts?: number; // inventory feature
  averageRating?: number;
  topSuppliers?: TopSupplier[];
}

export interface TopSupplier {
  id: string;
  name: string;
  productCount?: number; // inventory feature
  totalOrders?: number; // pos feature
  totalValue?: number; // pos feature
  rating: number | null;
}

// 💾 Export all for easy importing
export type {
  Supplier as SupplierEntity,
  SupplierWithRelations as SupplierWithRelationsType,
  CreateSupplierInput as CreateSupplierDTO,
  UpdateSupplierInput as UpdateSupplierDTO,
  SupplierFilters as SupplierQueryFilters,
  SupplierActionResult as SupplierResult,
};
