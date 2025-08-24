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

// 📦 PRODUCT MAPPERS
export function mapProductToExternal(rawProduct: any): ProductWithRelations {
  return {
    id: rawProduct.id,
    sku: rawProduct.sku,
    name: rawProduct.name,
    description: rawProduct.description,
    categoryId: rawProduct.categoryId,
    price: parseFloat(rawProduct.price),
    cost: parseFloat(rawProduct.cost),
    stock: parseInt(rawProduct.stock),
    minStock: parseInt(rawProduct.minStock),
    maxStock: rawProduct.maxStock ? parseInt(rawProduct.maxStock) : null,
    unit: rawProduct.unit,
    barcode: rawProduct.barcode,
    images: Array.isArray(rawProduct.images) ? rawProduct.images : [],
    isActive: Boolean(rawProduct.isActive),
    supplierId: rawProduct.supplierId,
    tags: Array.isArray(rawProduct.tags) ? rawProduct.tags : [],
    metadata: rawProduct.metadata || null,
    createdAt: new Date(rawProduct.createdAt),
    updatedAt: new Date(rawProduct.updatedAt),
    
    // Relations
    category: rawProduct.category ? mapCategoryToExternal(rawProduct.category) : null!,
    supplier: rawProduct.supplier ? mapSupplierToExternal(rawProduct.supplier) : null,
    stockMovements: rawProduct.stockMovements?.map(mapStockMovementToExternal) || [],
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
  const isCriticalStock = product.stock <= INVENTORY_DEFAULTS.CRITICAL_STOCK_THRESHOLD;
  const isOutOfStock = product.stock === 0;
  
  // 💱 Currency formatting
  const formatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  });
  
  const formattedPrice = formatter.format(product.price);
  const formattedCost = formatter.format(product.cost);
  
  // 📈 Last movement
  const lastMovement = product.stockMovements && product.stockMovements.length > 0
    ? product.stockMovements.sort((a, b) => 
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

export function mapProductToInternal(externalProduct: any): any {
  return {
    sku: externalProduct.sku,
    name: externalProduct.name,
    description: externalProduct.description,
    categoryId: externalProduct.categoryId,
    price: externalProduct.price,
    cost: externalProduct.cost,
    stock: externalProduct.stock,
    minStock: externalProduct.minStock,
    maxStock: externalProduct.maxStock,
    unit: externalProduct.unit,
    barcode: externalProduct.barcode,
    images: externalProduct.images,
    isActive: externalProduct.isActive,
    supplierId: externalProduct.supplierId,
    tags: externalProduct.tags,
    metadata: externalProduct.metadata,
  };
}

// 🏷️ CATEGORY MAPPERS
export function mapCategoryToExternal(rawCategory: any): CategoryWithRelations {
  return {
    id: rawCategory.id,
    name: rawCategory.name,
    description: rawCategory.description,
    parentId: rawCategory.parentId,
    color: rawCategory.color,
    icon: rawCategory.icon,
    isActive: Boolean(rawCategory.isActive),
    sortOrder: parseInt(rawCategory.sortOrder),
    createdAt: new Date(rawCategory.createdAt),
    updatedAt: new Date(rawCategory.updatedAt),
    
    // Relations
    parent: rawCategory.parent ? mapCategoryToExternal(rawCategory.parent) : null,
    children: rawCategory.children?.map(mapCategoryToExternal) || [],
    products: rawCategory.products?.map(mapProductToExternal) || [],
    _count: {
      products: rawCategory._count?.products || 0,
      children: rawCategory._count?.children || 0,
    },
  };
}

export function mapCategoryToTreeStructure(categories: CategoryWithRelations[]): CategoryWithRelations[] {
  const categoryMap = new Map<string, CategoryWithRelations>();
  const rootCategories: CategoryWithRelations[] = [];
  
  // First pass: create map of all categories
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });
  
  // Second pass: build tree structure
  categories.forEach(category => {
    const mappedCategory = categoryMap.get(category.id)!;
    
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
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
export function mapSupplierToExternal(rawSupplier: any): SupplierWithRelations {
  return {
    id: rawSupplier.id,
    name: rawSupplier.name,
    contactPerson: rawSupplier.contactPerson,
    email: rawSupplier.email,
    phone: rawSupplier.phone,
    website: rawSupplier.website,
    taxId: rawSupplier.taxId,
    paymentTerms: parseInt(rawSupplier.paymentTerms),
    isActive: Boolean(rawSupplier.isActive),
    rating: rawSupplier.rating ? parseFloat(rawSupplier.rating) : null,
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
    productCount: supplier._count.products,
    location: [supplier.city, supplier.state, supplier.country]
      .filter(Boolean)
      .join(", ") || null,
  };
}

// 📊 STOCK MOVEMENT MAPPERS
export function mapStockMovementToExternal(rawMovement: any): StockMovement {
  return {
    id: rawMovement.id,
    productId: rawMovement.productId,
    type: rawMovement.type,
    quantity: parseInt(rawMovement.quantity),
    previousStock: parseInt(rawMovement.previousStock),
    newStock: parseInt(rawMovement.newStock),
    reason: rawMovement.reason,
    reference: rawMovement.reference,
    userId: rawMovement.userId,
    createdAt: new Date(rawMovement.createdAt),
  };
}

export function mapStockMovementWithDetails(rawMovement: any) {
  const movement = mapStockMovementToExternal(rawMovement);
  
  return {
    ...movement,
    product: rawMovement.product ? mapProductToExternal(rawMovement.product) : null,
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
export function mapStatsToExternal(rawStats: any): InventoryStats {
  return {
    totalProducts: parseInt(rawStats.totalProducts),
    activeProducts: parseInt(rawStats.activeProducts),
    totalCategories: parseInt(rawStats.totalCategories),
    totalSuppliers: parseInt(rawStats.totalSuppliers),
    totalValue: parseFloat(rawStats.totalValue),
    totalRetailValue: parseFloat(rawStats.totalRetailValue),
    lowStockProducts: parseInt(rawStats.lowStockProducts),
    outOfStockProducts: parseInt(rawStats.outOfStockProducts),
    recentMovements: parseInt(rawStats.recentMovements),
  };
}

export function mapStatsWithTrends(rawStats: any, previousStats?: any): InventoryStats & {
  trends: Record<string, { value: number; change: number; changePercent: number }>;
} {
  const currentStats = mapStatsToExternal(rawStats);
  
  const trends: Record<string, { value: number; change: number; changePercent: number }> = {};
  
  if (previousStats) {
    const prev = mapStatsToExternal(previousStats);
    
    Object.keys(currentStats).forEach(key => {
      const current = (currentStats as any)[key] as number;
      const previous = (prev as any)[key] as number;
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

export function mapAlertsToExternal(rawAlerts: any[]): StockAlert[] {
  return rawAlerts.map(rawAlert => ({
    id: rawAlert.id,
    productId: rawAlert.productId,
    productName: rawAlert.productName,
    productSku: rawAlert.productSku,
    currentStock: parseInt(rawAlert.currentStock),
    minStock: parseInt(rawAlert.minStock),
    status: rawAlert.status as StockStatus,
    category: rawAlert.category,
    lastMovement: rawAlert.lastMovement ? new Date(rawAlert.lastMovement) : undefined,
  }));
}

export function mapAlertsWithPriority(alerts: StockAlert[]) {
  return alerts.map(alert => {
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
      const daysSinceMovement = (Date.now() - alert.lastMovement.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceMovement > 7) urgencyScore += 2;
      if (daysSinceMovement > 30) urgencyScore += 3;
    }
    
    return {
      ...alert,
      priority,
      urgencyScore,
      priorityLabel: priority === 3 ? "Alta" : priority === 2 ? "Media" : "Baja",
    };
  }).sort((a, b) => b.urgencyScore - a.urgencyScore);
}

// 🔧 UTILITY MAPPERS
export function mapUserSummary(rawUser: any) {
  return {
    id: rawUser.id,
    name: rawUser.name,
    email: rawUser.email,
    role: rawUser.role,
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
  if (stock <= INVENTORY_DEFAULTS.CRITICAL_STOCK_THRESHOLD) return "CRITICAL_STOCK";
  if (stock <= minStock) return "LOW_STOCK";
  return "IN_STOCK";
}

function calculateMovementImpact(movement: StockMovement) {
  const percentageChange = movement.previousStock > 0 
    ? ((movement.newStock - movement.previousStock) / movement.previousStock) * 100
    : 0;
    
  return {
    stockChange: movement.newStock - movement.previousStock,
    percentageChange: Math.round(percentageChange * 100) / 100,
    impactLevel: Math.abs(percentageChange) > 50 ? "high" : 
                 Math.abs(percentageChange) > 20 ? "medium" : "low",
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
    displayStock: `${product.stock} ${product.unit === "piece" ? "pzs" : product.unit}`,
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
    supplierDisplay: product.supplier ? {
      name: product.supplier.name,
      rating: product.supplier.rating,
      isReliable: (product.supplier.rating || 0) >= 4.0,
    } : null,
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
    productCount: category._count.products,
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

export function mapImportDataToProduct(importRow: any) {
  return {
    sku: importRow.SKU || importRow.sku,
    name: importRow.Nombre || importRow.name,
    description: importRow.Descripción || importRow.description || null,
    price: parseFloat(importRow.Precio || importRow.price),
    cost: parseFloat(importRow.Costo || importRow.cost),
    stock: parseInt(importRow.Stock || importRow.stock) || 0,
    minStock: parseInt(importRow["Stock Mínimo"] || importRow.minStock) || 0,
    maxStock: importRow["Stock Máximo"] || importRow.maxStock ? 
              parseInt(importRow["Stock Máximo"] || importRow.maxStock) : null,
    unit: importRow.Unidad || importRow.unit || "piece",
    barcode: importRow["Código de Barras"] || importRow.barcode || null,
    tags: (importRow.Tags || importRow.tags || "")
      .split(",")
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0),
  };
}
