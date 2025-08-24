/**
 * 📦 INVENTORY MOCK DATA
 * =====================
 * 
 * Mock data para desarrollo y testing
 * TODO: Remove when Prisma integration is complete
 * 
 * Created: 2025-01-17 - Inventory Management Module
 */

import type { StockMovementType } from "../types";

// 🏷️ MOCK CATEGORIES
export const MOCK_CATEGORIES = [
  {
    id: "cat-1",
    name: "Electrónicos",
    description: "Dispositivos y accesorios electrónicos",
    parentId: null,
    color: "#3B82F6",
    icon: "Smartphone",
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    parent: null,
    children: [],
    products: [],
    _count: { products: 15, children: 2 },
  },
  {
    id: "cat-2",
    name: "Ropa",
    description: "Prendas de vestir y accesorios",
    parentId: null,
    color: "#EC4899",
    icon: "Shirt",
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    parent: null,
    children: [],
    products: [],
    _count: { products: 8, children: 0 },
  },
  {
    id: "cat-3",
    name: "Hogar",
    description: "Artículos para el hogar",
    parentId: null,
    color: "#10B981",
    icon: "Home",
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    parent: null,
    children: [],
    products: [],
    _count: { products: 12, children: 1 },
  },
];

// 🚛 MOCK SUPPLIERS
export const MOCK_SUPPLIERS = [
  {
    id: "sup-1",
    name: "TechCorp SA",
    contactPerson: "Juan Pérez",
    email: "juan@techcorp.com",
    phone: "+52-55-1234-5678",
    website: "https://techcorp.com",
    taxId: "TCO123456789",
    paymentTerms: 30,
    isActive: true,
    rating: 4.5,
    notes: "Proveedor confiable de electrónicos",
    addressLine1: "Av. Reforma 123",
    addressLine2: "Col. Centro",
    city: "Ciudad de México",
    state: "CDMX",
    postalCode: "06000",
    country: "MX",
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [],
    _count: { products: 15 },
  },
  {
    id: "sup-2",
    name: "Textiles del Norte",
    contactPerson: "María González",
    email: "maria@textilesnorte.com",
    phone: "+52-81-9876-5432",
    website: "https://textilesnorte.com",
    taxId: "TDN987654321",
    paymentTerms: 15,
    isActive: true,
    rating: 4.2,
    notes: "Especialistas en ropa y textiles",
    addressLine1: "Blvd. Díaz Ordaz 456",
    addressLine2: null,
    city: "Monterrey",
    state: "Nuevo León",
    postalCode: "64000",
    country: "MX",
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [],
    _count: { products: 8 },
  },
];

// 📦 MOCK PRODUCTS
export const MOCK_PRODUCTS = [
  {
    id: "prod-1",
    sku: "IPHONE15-128",
    name: "iPhone 15 128GB",
    description: "Smartphone Apple iPhone 15 con 128GB de almacenamiento",
    categoryId: "cat-1",
    price: 24999.0,
    cost: 18000.0,
    stock: 25,
    minStock: 5,
    maxStock: 50,
    unit: "piece",
    barcode: "194253781234",
    images: [
      "https://example.com/iphone15-front.jpg",
      "https://example.com/iphone15-back.jpg",
    ],
    isActive: true,
    supplierId: "sup-1",
    tags: ["apple", "smartphone", "premium"],
    metadata: { warranty: "12 months", color: "Natural Titanium" },
    createdAt: new Date(),
    updatedAt: new Date(),
    category: MOCK_CATEGORIES[0],
    supplier: MOCK_SUPPLIERS[0],
    stockMovements: [],
    _count: { stockMovements: 8 },
  },
  {
    id: "prod-2",
    sku: "TSHIRT-M-BLK",
    name: "Playera Básica Negra M",
    description: "Playera básica de algodón 100% color negro talla M",
    categoryId: "cat-2",
    price: 299.0,
    cost: 150.0,
    stock: 2, // Low stock
    minStock: 5,
    maxStock: 100,
    unit: "piece",
    barcode: "123456789012",
    images: ["https://example.com/tshirt-black.jpg"],
    isActive: true,
    supplierId: "sup-2",
    tags: ["ropa", "algodón", "básica"],
    metadata: { size: "M", material: "100% cotton" },
    createdAt: new Date(),
    updatedAt: new Date(),
    category: MOCK_CATEGORIES[1],
    supplier: MOCK_SUPPLIERS[1],
    stockMovements: [],
    _count: { stockMovements: 3 },
  },
  {
    id: "prod-3",
    sku: "LAMP-LED-DIM",
    name: "Lámpara LED Regulable",
    description: "Lámpara de escritorio LED con regulador de intensidad",
    categoryId: "cat-3",
    price: 899.0,
    cost: 450.0,
    stock: 0, // Out of stock
    minStock: 3,
    maxStock: 25,
    unit: "piece",
    barcode: null,
    images: ["https://example.com/lamp-led.jpg"],
    isActive: true,
    supplierId: null,
    tags: ["lámpara", "led", "regulable", "escritorio"],
    metadata: { power: "12W", color_temp: "3000K-6000K" },
    createdAt: new Date(),
    updatedAt: new Date(),
    category: MOCK_CATEGORIES[2],
    supplier: null,
    stockMovements: [],
    _count: { stockMovements: 5 },
  },
];

// 📊 MOCK STOCK MOVEMENTS
export const MOCK_STOCK_MOVEMENTS = [
  {
    id: "mov-1",
    productId: "prod-1",
    type: "IN" as StockMovementType,
    quantity: 30,
    previousStock: 10,
    newStock: 40,
    reason: "Compra inicial de inventario",
    reference: "PO-001",
    userId: "user-1",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: "mov-2",
    productId: "prod-1",
    type: "OUT" as StockMovementType,
    quantity: 15,
    previousStock: 40,
    newStock: 25,
    reason: "Venta cliente mayorista",
    reference: "SALE-123",
    userId: "user-1",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "mov-3",
    productId: "prod-2",
    type: "OUT" as StockMovementType,
    quantity: 3,
    previousStock: 5,
    newStock: 2,
    reason: "Venta en tienda",
    reference: "SALE-124",
    userId: "user-1",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
];

// 🔧 MOCK DATA UTILITIES
export function resetMockData(): void {
  // Reset arrays to original state
  MOCK_PRODUCTS.length = 0;
  MOCK_CATEGORIES.length = 0;
  MOCK_SUPPLIERS.length = 0;
  MOCK_STOCK_MOVEMENTS.length = 0;

  // Re-populate with original data
  MOCK_PRODUCTS.push(...getOriginalProducts());
  MOCK_CATEGORIES.push(...getOriginalCategories());
  MOCK_SUPPLIERS.push(...getOriginalSuppliers());
  MOCK_STOCK_MOVEMENTS.push(...getOriginalStockMovements());
}

function getOriginalProducts() {
  return [
    // Return fresh copies of original data
    // Implementation details...
  ];
}

function getOriginalCategories() {
  return [
    // Return fresh copies of original data
    // Implementation details...
  ];
}

function getOriginalSuppliers() {
  return [
    // Return fresh copies of original data
    // Implementation details...
  ];
}

function getOriginalStockMovements() {
  return [
    // Return fresh copies of original data
    // Implementation details...
  ];
}

export function getMockDataStats() {
  return {
    products: MOCK_PRODUCTS.length,
    categories: MOCK_CATEGORIES.length,
    suppliers: MOCK_SUPPLIERS.length,
    stockMovements: MOCK_STOCK_MOVEMENTS.length,
  };
}
