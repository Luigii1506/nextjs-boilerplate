/**
 * 📦 INVENTORY TYPES
 * =================
 *
 * Tipos TypeScript completos para el sistema de inventory management
 * Interfaces, tipos utilitarios y tipos derivados del schema Prisma
 *
 * Created: 2025-01-17 - Inventory Management Module
 */

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

export interface SupplierWithRelations extends Supplier {
  products?: Product[];
  _count?: {
    products: number;
  };
}

// 📝 Form Input Types
export interface CreateProductInput {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock?: number | null;
  unit: string;
  barcode?: string | null;
  images: string[];
  supplierId?: string | null;
  tags: string[];
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
  search?: string;
  categoryId?: string;
  supplierId?: string;
  stockStatus?: StockStatus;
  isActive?: boolean;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
}

export interface CategoryFilters {
  search?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface SupplierFilters {
  search?: string;
  isActive?: boolean;
  minRating?: number;
  country?: string;
}

export interface StockMovementFilters {
  productId?: string;
  userId?: string;
  type?: StockMovementType;
  dateFrom?: Date;
  dateTo?: Date;
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
  suppliers: SupplierWithRelations[];
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
  updateProduct: (data: UpdateProductInput) => Promise<ActionResult<Product>>;
  deleteProduct: (id: string) => Promise<ActionResult>;

  createCategory: (
    data: CreateCategoryInput
  ) => Promise<ActionResult<Category>>;
  updateCategory: (
    data: UpdateCategoryInput
  ) => Promise<ActionResult<Category>>;
  deleteCategory: (id: string) => Promise<ActionResult>;

  createSupplier: (
    data: CreateSupplierInput
  ) => Promise<ActionResult<Supplier>>;
  updateSupplier: (
    data: UpdateSupplierInput
  ) => Promise<ActionResult<Supplier>>;
  deleteSupplier: (id: string) => Promise<ActionResult>;

  addStockMovement: (
    data: CreateStockMovementInput
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
  product: ProductWithComputedProps;
  showActions?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onView?: (product: Product) => void;
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
  Supplier,
  StockMovement,

  // With relations
  ProductWithRelations,
  CategoryWithRelations,
  SupplierWithRelations,

  // Input types
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateSupplierInput,
  UpdateSupplierInput,
  CreateStockMovementInput,

  // Query types
  ProductFilters,
  CategoryFilters,
  SupplierFilters,
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
