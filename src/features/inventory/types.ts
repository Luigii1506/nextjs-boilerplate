/**
 * 📦 INVENTORY TYPES
 * =================
 *
 * Tipos TypeScript completos para el sistema de inventory management
 * Interfaces, tipos utilitarios y tipos derivados del schema Prisma
 *
 * Created: 2025-01-17 - Inventory Management Module
 * Updated: 2025-01-17 - Refactored Supplier to shared module
 */

// 🚛 Supplier Types (imported from shared module)
import type {
  Supplier,
  SupplierWithRelations,
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierFilters,
} from "@/shared/types/supplier";

// Re-export for convenience
export type {
  Supplier,
  SupplierWithRelations,
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierFilters,
};

// 🗄️ Base Prisma Types (will be auto-generated)
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number | null;
  unit: string;
  barcode: string | null;
  images: string[];
  isActive: boolean;
  supplierId: string | null;
  tags: string[];
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  color: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ⚠️ SUPPLIER TYPE REMOVED
// Now imported from @/shared/types/supplier (see top of file)

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference: string | null;
  userId: string;
  createdAt: Date;
  product?: {
    id: string;
    name: string;
    sku: string;
    images: string[];
  };
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

// 📊 Enums
export type StockMovementType = "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER";
export type StockStatus =
  | "IN_STOCK"
  | "LOW_STOCK"
  | "CRITICAL_STOCK"
  | "OUT_OF_STOCK";
export type SortDirection = "asc" | "desc";

// 🔗 Relations (with populated data)
export interface ProductWithRelations extends Product {
  category: Category;
  supplier?: Supplier | null;
  stockMovements?: StockMovement[];
  _count?: {
    stockMovements: number;
  };
}

export interface CategoryWithRelations extends Category {
  parent?: Category | null;
  children?: Category[];
  products?: Product[];
  _count?: {
    products: number;
    children: number;
  };
}

// ⚠️ SUPPLIER WITH RELATIONS TYPE REMOVED
// Now imported from @/shared/types/supplier (see top of file)

// 📝 Form Input Types
export interface CreateProductInput {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  cost: number;
  stock?: number; // has default in schema
  minStock?: number; // has default in schema
  maxStock?: number | null;
  unit?: string; // has default in schema
  barcode?: string | null;
  images?: string[]; // has default in schema
  supplierId?: string | null;
  tags?: string[]; // has default in schema
  metadata?: Record<string, unknown>;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
  isActive?: boolean;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  icon?: string;
  sortOrder?: number;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
  isActive?: boolean;
}

// ⚠️ SUPPLIER INPUT TYPES REMOVED
// Now imported from @/shared/types/supplier (see top of file)
// - CreateSupplierInput
// - UpdateSupplierInput

export interface CreateStockMovementInput {
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
  reference?: string;
  userId: string;
}

// 🔍 Query & Filter Types
export interface ProductFilters {
  // Search
  search?: string;

  // Category & Supplier - now support multiple selections
  categoryId?: string;
  categoryIds?: string[]; // Multi-select categories
  supplierId?: string;
  supplierIds?: string[]; // Multi-select suppliers

  // Stock filters
  stockStatus?: StockStatus;
  stockStatuses?: StockStatus[]; // Multi-select stock statuses
  minStock?: number;
  maxStock?: number;

  // Price filters
  minPrice?: number;
  maxPrice?: number;
  minCost?: number;
  maxCost?: number;

  // Status & tags
  isActive?: boolean;
  tags?: string[];

  // Date filters
  createdAfter?: Date | string;
  createdBefore?: Date | string;
  updatedAfter?: Date | string;
  updatedBefore?: Date | string;

  // Advanced filters
  hasImages?: boolean;
  hasLowStock?: boolean; // Stock below minStock
  hasCriticalStock?: boolean; // Stock below criticalStock
  isOutOfStock?: boolean; // Stock = 0
  isFeatured?: boolean;
}

export interface CategoryFilters {
  search?: string;
  parentId?: string;
  isActive?: boolean;
}

// ⚠️ SUPPLIER FILTERS TYPE REMOVED
// Now imported from @/shared/types/supplier (see top of file)

export interface StockMovementFilters {
  productId?: string;
  userId?: string;
  type?: StockMovementType;
  dateFrom?: Date;
  dateTo?: Date;
}

// 🎯 Bulk Operations Types
export type BulkOperationType =
  | "delete"
  | "updateCategory"
  | "updateSupplier"
  | "updatePrice"
  | "updateCost"
  | "activate"
  | "deactivate"
  | "addTags"
  | "removeTags";

export interface BulkOperationInput {
  productIds: string[];
  operation: BulkOperationType;
  data?: {
    categoryId?: string;
    supplierId?: string;
    priceAdjustment?: {
      type: "percentage" | "fixed";
      value: number;
      operation: "increase" | "decrease";
    };
    costAdjustment?: {
      type: "percentage" | "fixed";
      value: number;
      operation: "increase" | "decrease";
    };
    tags?: string[];
    isActive?: boolean;
  };
}

export interface BulkOperationResult {
  success: boolean;
  totalSelected: number;
  successCount: number;
  failedCount: number;
  errors?: Array<{ productId: string; error: string }>;
}

// 💾 Filter Presets Types
export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: ProductFilters;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SavePresetInput {
  name: string;
  description?: string;
  filters: ProductFilters;
  color?: string;
  icon?: string;
  isDefault?: boolean;
}

// 📄 Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 📊 Dashboard & Analytics Types
export interface InventoryStats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalValue: number; // valor total del inventario (cost * stock)
  totalRetailValue: number; // valor total al precio de venta
  lowStockProducts: number;
  outOfStockProducts: number;
  recentMovements: number; // movimientos últimas 24h
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  currentStock: number;
  minStock: number;
  status: StockStatus;
  category: string;
  lastMovement?: Date;
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  totalMovements: number;
  totalQuantityMoved: number;
  category: string;
  currentStock: number;
}

export interface CategorySummary {
  id: string;
  name: string;
  productCount: number;
  totalValue: number;
  lowStockCount: number;
  color?: string;
}

// 🎯 Action Result Types
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>; // validation errors
}

// 🔄 Query Hook Return Types
export interface UseInventoryQueryResult {
  // Data
  products: ProductWithRelations[];
  categories: CategoryWithRelations[];
  suppliers: SupplierWithRelations<unknown>[];
  stockMovements: StockMovement[];
  stats: InventoryStats | null;
  alerts: StockAlert[];

  // Loading states
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: Error | null;

  // Actions
  createProduct: (data: CreateProductInput) => Promise<ActionResult<Product>>;
  updateProduct: (id: string, data: UpdateProductInput) => Promise<ActionResult<Product>>;
  deleteProduct: (id: string) => Promise<ActionResult>;

  // Category - only createCategory, use useCreateCategory hook for update/delete
  createCategory: (
    data: CreateCategoryInput
  ) => Promise<ActionResult<Category>>;

  // Supplier - use useCreateSupplier hook for all CRUD operations

  addStockMovement: (
    data: Omit<CreateStockMovementInput, "userId">
  ) => Promise<ActionResult<StockMovement>>;

  // Utilities
  refetch: () => void;
  invalidateCache: (tags?: string[]) => void;
}

// 🧮 Computed Properties
export interface ProductWithComputedProps extends ProductWithRelations {
  stockStatus: StockStatus;
  stockPercentage: number; // percentage of current stock vs max stock
  totalValue: number; // cost * stock
  totalRetailValue: number; // price * stock
  isLowStock: boolean;
  isCriticalStock: boolean;
  isOutOfStock: boolean;
  lastMovement?: StockMovement;
  formattedPrice: string;
  formattedCost: string;
}

// 📱 UI Component Props Types
export interface ProductCardProps {
  product: ProductWithRelations;
  showActions?: boolean;
  onEdit?: (product: ProductWithRelations) => void;
  onDelete?: (product: ProductWithRelations) => void;
  onView?: (product: ProductWithRelations) => void;
  className?: string;
}

export interface StockIndicatorProps {
  stock: number;
  minStock: number;
  maxStock?: number | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  clickable?: boolean;
  onClick?: (category: Category) => void;
  className?: string;
}

// 🚨 Error Types
export interface InventoryError extends Error {
  code?: string;
  field?: string;
  details?: Record<string, unknown>;
}

// 🔧 Utility Types
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// 📊 Export all types for easy importing
export type {
  // Main entities
  Product,
  Category,
  // Supplier, // ⚠️ Now from @/shared/types/supplier
  StockMovement,

  // With relations
  ProductWithRelations,
  CategoryWithRelations,
  // SupplierWithRelations, // ⚠️ Now from @/shared/types/supplier

  // Input types
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  // CreateSupplierInput, // ⚠️ Now from @/shared/types/supplier
  // UpdateSupplierInput, // ⚠️ Now from @/shared/types/supplier
  CreateStockMovementInput,

  // Query types
  ProductFilters,
  CategoryFilters,
  // SupplierFilters, // ⚠️ Now from @/shared/types/supplier
  StockMovementFilters,
  PaginationParams,
  PaginatedResponse,

  // Stats and analytics
  InventoryStats,
  StockAlert,
  TopProduct,
  CategorySummary,

  // Computed
  ProductWithComputedProps,

  // Component props
  ProductCardProps,
  StockIndicatorProps,
  CategoryBadgeProps,
};
