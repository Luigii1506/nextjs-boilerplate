/**
 * 📦 INVENTORY CONSTANTS
 * =====================
 *
 * Constantes centralizadas para el módulo de inventory management
 * Cache tags, configuración y valores por defecto
 *
 * Created: 2025-01-17 - Inventory Management Module
 */

// 🗂️ CACHE TAGS para invalidación de cache
export const INVENTORY_CACHE_TAGS = {
  all: "inventory",
  products: "inventory-products",
  categories: "inventory-categories",
  suppliers: "inventory-suppliers",
  stockMovements: "inventory-stock-movements",
  product: (id: string) => `inventory-product-${id}`,
  category: (id: string) => `inventory-category-${id}`,
  supplier: (id: string) => `inventory-supplier-${id}`,
  lowStock: "inventory-low-stock",
  stats: "inventory-stats",
} as const;

// ⚙️ CONFIGURACIÓN POR DEFECTO
export const INVENTORY_DEFAULTS = {
  // 🔄 Query Configuration
  QUERY_STALE_TIME: 5 * 60 * 1000, // 5 minutos
  QUERY_GC_TIME: 10 * 60 * 1000, // 10 minutos
  STATS_STALE_TIME: 2 * 60 * 1000, // 2 minutos para stats

  // 📊 Pagination
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // 📦 Stock Configuration
  DEFAULT_MIN_STOCK: 5,
  LOW_STOCK_THRESHOLD: 10,
  CRITICAL_STOCK_THRESHOLD: 2,

  // 🏷️ Product Configuration
  DEFAULT_UNIT: "piece",
  MAX_IMAGES_PER_PRODUCT: 10,
  SKU_PREFIX: "SKU",

  // 🔍 Search Configuration
  MIN_SEARCH_LENGTH: 2,
  SEARCH_DEBOUNCE_MS: 300,
} as const;

// 📊 STOCK MOVEMENT TYPES
export const STOCK_MOVEMENT_TYPES = {
  IN: {
    label: "Entrada",
    color: "green",
    icon: "ArrowUp",
    description: "Compras, devoluciones de clientes",
  },
  OUT: {
    label: "Salida",
    color: "red",
    icon: "ArrowDown",
    description: "Ventas, pérdidas, robos",
  },
  ADJUSTMENT: {
    label: "Ajuste",
    color: "blue",
    icon: "Edit",
    description: "Correcciones manuales de inventario",
  },
  TRANSFER: {
    label: "Transferencia",
    color: "purple",
    icon: "ArrowLeftRight",
    description: "Movimientos entre ubicaciones",
  },
} as const;

// 🏷️ PRODUCT CATEGORIES PREDEFINIDAS (para inicialización)
export const DEFAULT_CATEGORIES = [
  {
    name: "General",
    description: "Productos generales sin categoría específica",
    color: "#6B7280",
    icon: "Package",
  },
  {
    name: "Electrónicos",
    description: "Dispositivos y accesorios electrónicos",
    color: "#3B82F6",
    icon: "Smartphone",
  },
  {
    name: "Ropa y Accesorios",
    description: "Prendas de vestir y complementos",
    color: "#EC4899",
    icon: "Shirt",
  },
  {
    name: "Hogar y Jardín",
    description: "Artículos para el hogar y jardinería",
    color: "#10B981",
    icon: "Home",
  },
  {
    name: "Deportes",
    description: "Artículos deportivos y fitness",
    color: "#F59E0B",
    icon: "Trophy",
  },
] as const;

// 🔢 UNITS OF MEASURE
export const UNITS_OF_MEASURE = [
  { value: "piece", label: "Pieza", plural: "Piezas" },
  { value: "kg", label: "Kilogramo", plural: "Kilogramos" },
  { value: "g", label: "Gramo", plural: "Gramos" },
  { value: "liter", label: "Litro", plural: "Litros" },
  { value: "ml", label: "Mililitro", plural: "Mililitros" },
  { value: "meter", label: "Metro", plural: "Metros" },
  { value: "cm", label: "Centímetro", plural: "Centímetros" },
  { value: "box", label: "Caja", plural: "Cajas" },
  { value: "pack", label: "Paquete", plural: "Paquetes" },
  { value: "dozen", label: "Docena", plural: "Docenas" },
] as const;

// 📈 STATUS INDICATORS
export const STOCK_STATUS = {
  IN_STOCK: {
    label: "En Stock",
    color: "green",
    textColor: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  LOW_STOCK: {
    label: "Stock Bajo",
    color: "yellow",
    textColor: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  CRITICAL_STOCK: {
    label: "Stock Crítico",
    color: "red",
    textColor: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
  OUT_OF_STOCK: {
    label: "Sin Stock",
    color: "gray",
    textColor: "text-gray-700 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-900/20",
    borderColor: "border-gray-200 dark:border-gray-800",
  },
} as const;

// 🎨 UI CONSTANTS
export const INVENTORY_UI = {
  // 🏷️ Colors para categorías (cuando no tienen color asignado)
  FALLBACK_COLORS: [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
  ],

  // 📊 Chart colors para dashboard
  CHART_COLORS: {
    primary: "#3B82F6",
    secondary: "#10B981",
    accent: "#F59E0B",
    danger: "#EF4444",
  },

  // 📐 Spacing
  CARD_PADDING: "p-6",
  CARD_SPACING: "space-y-4",

  // 🎯 Animation durations
  ANIMATION_DURATION: 200,
  LOADING_DELAY: 300,
} as const;

// 🔍 SEARCH & FILTER PRESETS
export const SEARCH_FILTERS = {
  STOCK_STATUS: [
    { value: "all", label: "Todos los productos" },
    { value: "in-stock", label: "En stock" },
    { value: "low-stock", label: "Stock bajo" },
    { value: "out-of-stock", label: "Sin stock" },
  ],

  SORT_OPTIONS: [
    { value: "name", label: "Nombre A-Z" },
    { value: "-name", label: "Nombre Z-A" },
    { value: "stock", label: "Stock menor a mayor" },
    { value: "-stock", label: "Stock mayor a menor" },
    { value: "price", label: "Precio menor a mayor" },
    { value: "-price", label: "Precio mayor a menor" },
    { value: "createdAt", label: "Más antiguos" },
    { value: "-createdAt", label: "Más recientes" },
  ],
} as const;
