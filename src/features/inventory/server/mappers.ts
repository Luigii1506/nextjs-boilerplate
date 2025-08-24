/**
 * 📦 INVENTORY MAPPERS
 * ===================
 *
 * Data transformation layer para Inventory Management
 * Clean Architecture: Infrastructure Layer (Data Mapping)
 *
 * Created: 2025-01-17 - Inventory Management Module
 */

import { INVENTORY_DEFAULTS } from "../constants";
import type {
  ProductWithRelations,
  CategoryWithRelations,
  SupplierWithRelations,
  StockMovement,
  InventoryStats,
  StockAlert,
  StockStatus,
  ProductWithComputedProps,
} from "../types";

// 🏷️ Raw data interfaces for type safety - Aligned with Prisma schema
interface RawProduct {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string;
  price: number; // Prisma Decimal converted to number
  cost: number; // Prisma Decimal converted to number
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
  category?: RawCategory;
  supplier?: RawSupplier | null;
  stockMovements?: RawStockMovement[];
  _count?: {
    stockMovements: number;
  };
}

interface RawCategory {
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
  parent?: RawCategory | null;
  children?: RawCategory[];
  products?: RawProduct[];
  _count?: {
    products: number;
    children: number;
  };
}

interface RawSupplier {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  taxId: string | null;
  paymentTerms: number;
  isActive: boolean;
  rating: number | null; // Prisma Decimal converted to number
  notes: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  createdAt: Date;
  updatedAt: Date;
  products?: RawProduct[];
  _count?: {
    products: number;
  };
}

interface RawStockMovement {
  id: string;
  productId: string;
  type: "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER"; // StockMovementType enum
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference: string | null;
  userId: string;
  createdAt: Date;
  product?: RawProduct;
  user?: {
    id: string;
    name: string | null;
    email: string;
    role: string | null;
  };
}

// 📦 PRODUCT MAPPERS
export function mapProductToExternal(
  rawProduct: RawProduct
): ProductWithRelations {
  return {
    id: rawProduct.id,
    sku: rawProduct.sku,
    name: rawProduct.name,
    description: rawProduct.description,
    categoryId: rawProduct.categoryId,
    price: Number(rawProduct.price), // Already number from Prisma, but ensure type
    cost: Number(rawProduct.cost), // Already number from Prisma, but ensure type
    stock: Number(rawProduct.stock), // Already number from Prisma, but ensure type
    minStock: Number(rawProduct.minStock), // Already number from Prisma, but ensure type
    maxStock: rawProduct.maxStock ? Number(rawProduct.maxStock) : null,
    unit: rawProduct.unit,
    barcode: rawProduct.barcode,
    images: rawProduct.images || [],
    isActive: Boolean(rawProduct.isActive),
    supplierId: rawProduct.supplierId,
    tags: rawProduct.tags || [],
    metadata: rawProduct.metadata as Record<string, unknown> | null,
    createdAt:
      rawProduct.createdAt instanceof Date
        ? rawProduct.createdAt
        : new Date(rawProduct.createdAt),
    updatedAt:
      rawProduct.updatedAt instanceof Date
        ? rawProduct.updatedAt
        : new Date(rawProduct.updatedAt),

    // Relations - Handle null category properly
    category: rawProduct.category
      ? mapCategoryToExternal(rawProduct.category)
      : {
          id: "",
          name: "Sin Categoría",
          description: null,
          parentId: null,
          color: "#6B7280",
          icon: null,
          isActive: false,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          parent: null,
          children: [],
          products: [],
          _count: { products: 0, children: 0 },
        },
    supplier: rawProduct.supplier
      ? mapSupplierToExternal(rawProduct.supplier)
      : null,
    stockMovements:
      rawProduct.stockMovements?.map(mapStockMovementToExternal) || [],
    _count: {
      stockMovements: rawProduct._count?.stockMovements || 0,
    },
  };
}

export function mapProductToComputedProps(
  product: ProductWithRelations
): ProductWithComputedProps {
  // 📊 Stock status calculation
  const stockStatus = calculateStockStatus(product.stock, product.minStock);

  // 📊 Stock percentage
  const stockPercentage = product.maxStock
    ? (product.stock / product.maxStock) * 100
    : Math.min(100, (product.stock / (product.minStock * 4)) * 100);

  // 💰 Financial calculations
  const totalValue = product.cost * product.stock;
  const totalRetailValue = product.price * product.stock;

  // 🚨 Status flags
  const isLowStock = product.stock <= product.minStock;
  const isCriticalStock =
    product.stock <= INVENTORY_DEFAULTS.CRITICAL_STOCK_THRESHOLD;
  const isOutOfStock = product.stock === 0;

  // 💱 Currency formatting
  const formatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  });

  const formattedPrice = formatter.format(product.price);
  const formattedCost = formatter.format(product.cost);

  // 📈 Last movement
  const lastMovement =
    product.stockMovements && product.stockMovements.length > 0
      ? product.stockMovements.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
      : undefined;

  return {
    ...product,
    stockStatus,
    stockPercentage,
    totalValue,
    totalRetailValue,
    isLowStock,
    isCriticalStock,
    isOutOfStock,
    lastMovement,
    formattedPrice,
    formattedCost,
  };
}

export function mapProductToInternal(
  externalProduct: Partial<ProductWithRelations>
): Partial<RawProduct> {
  return {
    sku: externalProduct.sku,
    name: externalProduct.name,
    description: externalProduct.description,
    categoryId: externalProduct.categoryId,
    price: externalProduct.price,
    cost: externalProduct.cost,
    stock: externalProduct.stock,
    minStock: externalProduct.minStock,
    maxStock:
      externalProduct.maxStock !== undefined ? externalProduct.maxStock : null,
    unit: externalProduct.unit,
    barcode: externalProduct.barcode,
    images: externalProduct.images,
    isActive: externalProduct.isActive,
    supplierId:
      externalProduct.supplierId !== undefined
        ? externalProduct.supplierId
        : null,
    tags: externalProduct.tags,
    metadata: externalProduct.metadata,
  };
}

// 🏷️ CATEGORY MAPPERS
export function mapCategoryToExternal(
  rawCategory: RawCategory
): CategoryWithRelations {
  return {
    id: rawCategory.id,
    name: rawCategory.name,
    description: rawCategory.description,
    parentId: rawCategory.parentId,
    color: rawCategory.color,
    icon: rawCategory.icon,
    isActive: Boolean(rawCategory.isActive),
    sortOrder: Number(rawCategory.sortOrder), // Already number from Prisma
    createdAt:
      rawCategory.createdAt instanceof Date
        ? rawCategory.createdAt
        : new Date(rawCategory.createdAt),
    updatedAt:
      rawCategory.updatedAt instanceof Date
        ? rawCategory.updatedAt
        : new Date(rawCategory.updatedAt),

    // Relations
    parent: rawCategory.parent
      ? mapCategoryToExternal(rawCategory.parent)
      : null,
    children: rawCategory.children?.map(mapCategoryToExternal) || [],
    products: rawCategory.products?.map(mapProductToExternal) || [],
    _count: {
      products: rawCategory._count?.products || 0,
      children: rawCategory._count?.children || 0,
    },
  };
}

export function mapCategoryToTreeStructure(
  categories: CategoryWithRelations[]
): CategoryWithRelations[] {
  const categoryMap = new Map<string, CategoryWithRelations>();
  const rootCategories: CategoryWithRelations[] = [];

  // First pass: create map of all categories
  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Second pass: build tree structure
  categories.forEach((category) => {
    const mappedCategory = categoryMap.get(category.id)!;

    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(mappedCategory);
      } else {
        // Parent not found, treat as root
        rootCategories.push(mappedCategory);
      }
    } else {
      rootCategories.push(mappedCategory);
    }
  });

  return rootCategories;
}

// 🚛 SUPPLIER MAPPERS
export function mapSupplierToExternal(
  rawSupplier: RawSupplier
): SupplierWithRelations {
  return {
    id: rawSupplier.id,
    name: rawSupplier.name,
    contactPerson: rawSupplier.contactPerson,
    email: rawSupplier.email,
    phone: rawSupplier.phone,
    website: rawSupplier.website,
    taxId: rawSupplier.taxId,
    paymentTerms: Number(rawSupplier.paymentTerms), // Already number from Prisma
    isActive: Boolean(rawSupplier.isActive),
    rating: rawSupplier.rating ? Number(rawSupplier.rating) : null,
    notes: rawSupplier.notes,
    addressLine1: rawSupplier.addressLine1,
    addressLine2: rawSupplier.addressLine2,
    city: rawSupplier.city,
    state: rawSupplier.state,
    postalCode: rawSupplier.postalCode,
    country: rawSupplier.country,
    createdAt: new Date(rawSupplier.createdAt),
    updatedAt: new Date(rawSupplier.updatedAt),

    // Relations
    products: rawSupplier.products?.map(mapProductToExternal) || [],
    _count: {
      products: rawSupplier._count?.products || 0,
    },
  };
}

export function mapSupplierToSummary(supplier: SupplierWithRelations) {
  return {
    id: supplier.id,
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone,
    rating: supplier.rating,
    isActive: supplier.isActive,
    productCount: supplier._count?.products || 0,
    location:
      [supplier.city, supplier.state, supplier.country]
        .filter(Boolean)
        .join(", ") || null,
  };
}

// 📊 STOCK MOVEMENT MAPPERS
export function mapStockMovementToExternal(
  rawMovement: RawStockMovement
): StockMovement {
  return {
    id: rawMovement.id,
    productId: rawMovement.productId,
    type: rawMovement.type,
    quantity: Number(rawMovement.quantity), // Already number from Prisma
    previousStock: Number(rawMovement.previousStock), // Already number from Prisma
    newStock: Number(rawMovement.newStock), // Already number from Prisma
    reason: rawMovement.reason,
    reference: rawMovement.reference,
    userId: rawMovement.userId,
    createdAt:
      rawMovement.createdAt instanceof Date
        ? rawMovement.createdAt
        : new Date(rawMovement.createdAt),
  };
}

export function mapStockMovementWithDetails(
  rawMovement: RawStockMovement & {
    product?: RawProduct;
    user?: {
      id: string;
      name: string | null;
      email: string;
      role: string | null;
    };
  }
) {
  const movement = mapStockMovementToExternal(rawMovement);

  return {
    ...movement,
    product: rawMovement.product
      ? mapProductToExternal(rawMovement.product)
      : null,
    user: rawMovement.user ? mapUserSummary(rawMovement.user) : null,
    formattedDate: new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(movement.createdAt),
    impact: calculateMovementImpact(movement),
  };
}

// 📊 ANALYTICS MAPPERS
export function mapStatsToExternal(
  rawStats: Record<string, unknown>
): InventoryStats {
  return {
    totalProducts: Number(rawStats.totalProducts) || 0,
    activeProducts: Number(rawStats.activeProducts) || 0,
    totalCategories: Number(rawStats.totalCategories) || 0,
    totalSuppliers: Number(rawStats.totalSuppliers) || 0,
    totalValue: Number(rawStats.totalValue) || 0,
    totalRetailValue: Number(rawStats.totalRetailValue) || 0,
    lowStockProducts: Number(rawStats.lowStockProducts) || 0,
    outOfStockProducts: Number(rawStats.outOfStockProducts) || 0,
    recentMovements: Number(rawStats.recentMovements) || 0,
  };
}

export function mapStatsWithTrends(
  rawStats: Record<string, unknown>,
  previousStats?: Record<string, unknown>
): InventoryStats & {
  trends: Record<
    string,
    { value: number; change: number; changePercent: number }
  >;
} {
  const currentStats = mapStatsToExternal(rawStats);

  const trends: Record<
    string,
    { value: number; change: number; changePercent: number }
  > = {};

  if (previousStats) {
    const prev = mapStatsToExternal(previousStats);

    Object.keys(currentStats).forEach((key) => {
      const current = currentStats[key as keyof InventoryStats] as number;
      const previous = prev[key as keyof InventoryStats] as number;
      const change = current - previous;
      const changePercent = previous > 0 ? (change / previous) * 100 : 0;

      trends[key] = {
        value: current,
        change,
        changePercent: Math.round(changePercent * 100) / 100,
      };
    });
  }

  return {
    ...currentStats,
    trends,
  };
}

export function mapAlertsToExternal(
  rawAlerts: Array<{
    id: string;
    productId: string;
    productName: string;
    productSku: string;
    currentStock: number;
    minStock: number;
    status: StockStatus;
    category: string;
    lastMovement?: Date;
  }>
): StockAlert[] {
  return rawAlerts.map((rawAlert) => ({
    id: rawAlert.id,
    productId: rawAlert.productId,
    productName: rawAlert.productName,
    productSku: rawAlert.productSku,
    currentStock: Number(rawAlert.currentStock),
    minStock: Number(rawAlert.minStock),
    status: rawAlert.status,
    category: rawAlert.category,
    lastMovement: rawAlert.lastMovement,
  }));
}

export function mapAlertsWithPriority(alerts: StockAlert[]) {
  return alerts
    .map((alert) => {
      let priority = 1; // Low
      let urgencyScore = 0;

      // Calculate urgency based on stock status
      switch (alert.status) {
        case "OUT_OF_STOCK":
          priority = 3; // High
          urgencyScore = 10;
          break;
        case "CRITICAL_STOCK":
          priority = 3; // High
          urgencyScore = 8;
          break;
        case "LOW_STOCK":
          priority = 2; // Medium
          urgencyScore = 5;
          break;
      }

      // Adjust based on time since last movement
      if (alert.lastMovement) {
        const daysSinceMovement =
          (Date.now() - alert.lastMovement.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceMovement > 7) urgencyScore += 2;
        if (daysSinceMovement > 30) urgencyScore += 3;
      }

      return {
        ...alert,
        priority,
        urgencyScore,
        priorityLabel:
          priority === 3 ? "Alta" : priority === 2 ? "Media" : "Baja",
      };
    })
    .sort((a, b) => b.urgencyScore - a.urgencyScore);
}

// 🔧 UTILITY MAPPERS
export function mapUserSummary(rawUser: {
  id: string;
  name?: string | null;
  email?: string;
  role?: string | null;
  [key: string]: unknown;
}) {
  return {
    id: rawUser.id,
    name: rawUser.name || undefined,
    email: rawUser.email,
    role: rawUser.role || undefined,
  };
}

export function mapProductSummary(product: ProductWithRelations) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    stock: product.stock,
    minStock: product.minStock,
    price: product.price,
    category: product.category.name,
    status: calculateStockStatus(product.stock, product.minStock),
    isActive: product.isActive,
  };
}

// 📊 CALCULATION HELPERS
function calculateStockStatus(stock: number, minStock: number): StockStatus {
  if (stock === 0) return "OUT_OF_STOCK";
  if (stock <= INVENTORY_DEFAULTS.CRITICAL_STOCK_THRESHOLD)
    return "CRITICAL_STOCK";
  if (stock <= minStock) return "LOW_STOCK";
  return "IN_STOCK";
}

function calculateMovementImpact(movement: StockMovement) {
  const percentageChange =
    movement.previousStock > 0
      ? ((movement.newStock - movement.previousStock) /
          movement.previousStock) *
        100
      : 0;

  return {
    stockChange: movement.newStock - movement.previousStock,
    percentageChange: Math.round(percentageChange * 100) / 100,
    impactLevel:
      Math.abs(percentageChange) > 50
        ? "high"
        : Math.abs(percentageChange) > 20
        ? "medium"
        : "low",
  };
}

// 🎨 PRESENTATION MAPPERS (for UI)
export function mapProductForCard(product: ProductWithRelations) {
  const computed = mapProductToComputedProps(product);

  return {
    ...computed,
    displayName: product.name,
    displaySku: product.sku,
    displayPrice: computed.formattedPrice,
    displayStock: `${product.stock} ${
      product.unit === "piece" ? "pzs" : product.unit
    }`,
    statusBadge: {
      label: getStockStatusLabel(computed.stockStatus),
      color: getStockStatusColor(computed.stockStatus),
      urgent: computed.isOutOfStock || computed.isCriticalStock,
    },
    categoryDisplay: {
      name: product.category.name,
      color: product.category.color,
      icon: product.category.icon,
    },
    supplierDisplay: product.supplier
      ? {
          name: product.supplier.name,
          rating: product.supplier.rating,
          isReliable: (product.supplier.rating || 0) >= 4.0,
        }
      : null,
  };
}

export function mapCategoryForSelect(category: CategoryWithRelations) {
  return {
    value: category.id,
    label: category.name,
    description: category.description,
    color: category.color,
    icon: category.icon,
    disabled: !category.isActive,
    productCount: category._count?.products || 0,
  };
}

// 🎯 STATUS HELPERS
function getStockStatusLabel(status: StockStatus): string {
  const labels = {
    IN_STOCK: "En Stock",
    LOW_STOCK: "Stock Bajo",
    CRITICAL_STOCK: "Crítico",
    OUT_OF_STOCK: "Agotado",
  };
  return labels[status];
}

function getStockStatusColor(status: StockStatus): string {
  const colors = {
    IN_STOCK: "green",
    LOW_STOCK: "yellow",
    CRITICAL_STOCK: "red",
    OUT_OF_STOCK: "gray",
  };
  return colors[status];
}

// 📈 EXPORT/IMPORT MAPPERS
export function mapProductForExport(product: ProductWithRelations) {
  return {
    SKU: product.sku,
    Nombre: product.name,
    Descripción: product.description || "",
    Categoría: product.category.name,
    Proveedor: product.supplier?.name || "",
    Precio: product.price,
    Costo: product.cost,
    Stock: product.stock,
    "Stock Mínimo": product.minStock,
    "Stock Máximo": product.maxStock || "",
    Unidad: product.unit,
    "Código de Barras": product.barcode || "",
    Tags: product.tags.join(", "),
    Estado: product.isActive ? "Activo" : "Inactivo",
    "Fecha Creación": product.createdAt.toISOString(),
    "Última Actualización": product.updatedAt.toISOString(),
  };
}

export function mapImportDataToProduct(importRow: Record<string, unknown>) {
  const tagsValue = importRow.Tags || importRow.tags || "";
  const tagsString =
    typeof tagsValue === "string" ? tagsValue : String(tagsValue);

  return {
    sku: String(importRow.SKU || importRow.sku || ""),
    name: String(importRow.Nombre || importRow.name || ""),
    description:
      importRow.Descripción || importRow.description
        ? String(importRow.Descripción || importRow.description)
        : null,
    price: Number(importRow.Precio || importRow.price || 0),
    cost: Number(importRow.Costo || importRow.cost || 0),
    stock: Number(importRow.Stock || importRow.stock || 0),
    minStock: Number(importRow["Stock Mínimo"] || importRow.minStock || 0),
    maxStock:
      importRow["Stock Máximo"] || importRow.maxStock
        ? Number(importRow["Stock Máximo"] || importRow.maxStock)
        : null,
    unit: String(importRow.Unidad || importRow.unit || "piece"),
    barcode:
      importRow["Código de Barras"] || importRow.barcode
        ? String(importRow["Código de Barras"] || importRow.barcode)
        : null,
    tags: tagsString
      .split(",")
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0),
  };
}
