/**
 * 🛒 STOREFRONT CONSTANTS
 * =======================
 *
 * Constantes centralizadas para el módulo storefront customer-facing
 * Cache tags, configuración y valores por defecto para usuarios finales
 *
 * Created: 2025-01-17 - Storefront Module (Customer-Focused)
 */

// 🗂️ CACHE TAGS para invalidación de cache (customer-specific)
export const STOREFRONT_CACHE_TAGS = {
  ALL: "storefront",
  PRODUCTS: "storefront-products",
  CATEGORIES: "storefront-categories",
  FEATURED: "storefront-featured",
  CUSTOMER: (id: string) => `storefront-customer-${id}`,
  CUSTOMER_DATA: "storefront-customer-data",
  CART: (id: string) => `storefront-cart-${id}`,
  WISHLIST: "storefront-wishlist",
  STATS: "storefront-stats",
  POPULAR: "storefront-popular",
  ON_SALE: "storefront-on-sale",
  NEW_ARRIVALS: "storefront-new-arrivals",
} as const;

// ⚙️ CONFIGURACIÓN POR DEFECTO (optimizada para customers)
export const STOREFRONT_DEFAULTS = {
  // 🔄 Query Configuration (más agresivo para UX)
  QUERY_STALE_TIME: 2 * 60 * 1000, // 2 minutos (más fresh para customers)
  QUERY_GC_TIME: 5 * 60 * 1000, // 5 minutos
  STATS_STALE_TIME: 1 * 60 * 1000, // 1 minuto para stats
  CART_STALE_TIME: 30 * 1000, // 30 segundos para cart

  // 📊 Pagination (customer-optimized)
  PAGE_SIZE: 12, // Múltiplo de 3 y 4 para grids
  MOBILE_PAGE_SIZE: 6, // Menos en mobile
  MAX_PAGE_SIZE: 48, // Más productos por página

  // 🛒 Shopping Configuration
  MAX_CART_ITEMS: 99,
  MAX_WISHLIST_ITEMS: 200,
  CART_SESSION_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 días
  GUEST_CART_DURATION: 24 * 60 * 60 * 1000, // 1 día

  // 🏷️ Product Display
  FEATURED_PRODUCTS_COUNT: 8,
  POPULAR_CATEGORIES_COUNT: 6,
  NEW_ARRIVALS_DAYS: 30, // productos de últimos 30 días
  RECENT_VIEWED_LIMIT: 10,
  RECOMMENDATIONS_LIMIT: 8,

  // 🔍 Search Configuration
  MIN_SEARCH_LENGTH: 1, // Más permisivo para customers
  SEARCH_DEBOUNCE_MS: 400, // Ligeramente más lento
  SEARCH_HISTORY_LIMIT: 20,

  // 💰 Currency
  DEFAULT_CURRENCY: "MXN",
  CURRENCY_DECIMAL_PLACES: 2,
} as const;

// 🛍️ PRODUCT SORT OPTIONS para customers
export const PRODUCT_SORT_OPTIONS = [
  {
    value: "relevance",
    label: "Más relevantes",
    description: "Ordenar por relevancia",
  },
  {
    value: "popularity",
    label: "Más populares",
    description: "Los productos más vendidos primero",
  },
  {
    value: "price",
    label: "Precio: Menor a mayor",
    description: "Productos más baratos primero",
  },
  {
    value: "-price",
    label: "Precio: Mayor a menor",
    description: "Productos más caros primero",
  },
  {
    value: "-rating",
    label: "Mejor calificados",
    description: "Mayor calificación primero",
  },
  {
    value: "-newest",
    label: "Más recientes",
    description: "Productos nuevos primero",
  },
  {
    value: "-discount",
    label: "Mayor descuento",
    description: "Mayores ofertas primero",
  },
  {
    value: "name",
    label: "Nombre A-Z",
    description: "Orden alfabético ascendente",
  },
] as const;

// 🎨 PRODUCT BADGES (customer-facing)
export const PRODUCT_BADGES = {
  NEW: {
    type: "new",
    label: "Nuevo",
    color: "green",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    textColor: "text-green-800 dark:text-green-400",
    icon: "Sparkles",
  },
  SALE: {
    type: "sale",
    label: "Oferta",
    color: "red",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    textColor: "text-red-800 dark:text-red-400",
    icon: "Percent",
  },
  BESTSELLER: {
    type: "bestseller",
    label: "Más vendido",
    color: "yellow",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    textColor: "text-yellow-800 dark:text-yellow-400",
    icon: "Crown",
  },
  LIMITED: {
    type: "limited",
    label: "Edición limitada",
    color: "purple",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    textColor: "text-purple-800 dark:text-purple-400",
    icon: "Zap",
  },
  OUT_OF_STOCK: {
    type: "out_of_stock",
    label: "Agotado",
    color: "gray",
    bgColor: "bg-gray-100 dark:bg-gray-900/20",
    textColor: "text-gray-800 dark:text-gray-400",
    icon: "XCircle",
  },
} as const;

// 🛒 AVAILABILITY STATUS (customer-friendly)
export const AVAILABILITY_STATUS = {
  IN_STOCK: {
    status: "in_stock",
    label: "Disponible",
    color: "green",
    textColor: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/10",
    icon: "Check",
  },
  LOW_STOCK: {
    status: "low_stock",
    label: "Últimas unidades",
    color: "orange",
    textColor: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/10",
    icon: "AlertTriangle",
  },
  OUT_OF_STOCK: {
    status: "out_of_stock",
    label: "Agotado",
    color: "red",
    textColor: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/10",
    icon: "XCircle",
  },
} as const;

// 🎨 STOREFRONT UI CONSTANTS (customer-optimized)
export const STOREFRONT_UI = {
  // 🌈 Brand Colors (warmer, more inviting)
  BRAND_COLORS: {
    primary: "#3B82F6", // Blue - trust, reliability
    secondary: "#10B981", // Green - positive, growth
    accent: "#F59E0B", // Amber - warmth, energy
    success: "#059669", // Emerald - success states
    warning: "#D97706", // Orange - warnings
    danger: "#DC2626", // Red - errors, urgent
    purple: "#8B5CF6", // Purple - premium feel
    pink: "#EC4899", // Pink - playful, feminine
  },

  // 🎭 Customer Theme Colors
  THEME_COLORS: {
    light: {
      bg: "#FFFFFF",
      surface: "#F9FAFB",
      border: "#E5E7EB",
      text: "#111827",
      textMuted: "#6B7280",
    },
    dark: {
      bg: "#0F172A",
      surface: "#1E293B",
      border: "#334155",
      text: "#F1F5F9",
      textMuted: "#94A3B8",
    },
  },

  // 📐 Spacing (customer-friendly)
  SPACING: {
    cardPadding: "p-4 lg:p-6",
    sectionSpacing: "space-y-6 lg:space-y-8",
    gridGap: "gap-4 lg:gap-6",
    containerPadding: "px-4 sm:px-6 lg:px-8",
  },

  // 🎯 Animation Timings (smooth for customers)
  ANIMATIONS: {
    fast: "150ms",
    normal: "250ms",
    slow: "350ms",

    // Easing functions
    easeDefault: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeBounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },

  // 📱 Responsive Breakpoints
  BREAKPOINTS: {
    mobile: "640px",
    tablet: "768px",
    desktop: "1024px",
    wide: "1280px",
  },
} as const;

// 🔍 FILTER PRESETS para customers
export const CUSTOMER_FILTERS = {
  PRICE_RANGES: [
    { min: 0, max: 500, label: "Menos de $500" },
    { min: 500, max: 1000, label: "$500 - $1,000" },
    { min: 1000, max: 2500, label: "$1,000 - $2,500" },
    { min: 2500, max: 5000, label: "$2,500 - $5,000" },
    { min: 5000, max: null, label: "Más de $5,000" },
  ],

  RATINGS: [
    { value: 4, label: "4+ estrellas" },
    { value: 3, label: "3+ estrellas" },
    { value: 2, label: "2+ estrellas" },
    { value: 1, label: "1+ estrellas" },
  ],

  AVAILABILITY: [
    { value: "in_stock", label: "En stock" },
    { value: "on_sale", label: "En oferta" },
    { value: "new_arrivals", label: "Nuevos" },
    { value: "bestsellers", label: "Más vendidos" },
  ],
} as const;

// 📦 DELIVERY OPTIONS
export const DELIVERY_OPTIONS = [
  {
    id: "standard",
    name: "Envío estándar",
    description: "5-7 días hábiles",
    price: 99,
    estimatedDays: "5-7",
    icon: "Truck",
  },
  {
    id: "express",
    name: "Envío express",
    description: "2-3 días hábiles",
    price: 199,
    estimatedDays: "2-3",
    icon: "Zap",
  },
  {
    id: "overnight",
    name: "Envío nocturno",
    description: "1 día hábil",
    price: 399,
    estimatedDays: "1",
    icon: "Clock",
  },
  {
    id: "pickup",
    name: "Recoger en tienda",
    description: "Disponible hoy",
    price: 0,
    estimatedDays: "Hoy",
    icon: "MapPin",
  },
] as const;

// 💳 PAYMENT METHODS
export const PAYMENT_METHODS = [
  {
    id: "credit_card",
    name: "Tarjeta de crédito",
    description: "Visa, Mastercard, American Express",
    icon: "CreditCard",
    enabled: true,
  },
  {
    id: "debit_card",
    name: "Tarjeta de débito",
    description: "Visa, Mastercard",
    icon: "CreditCard",
    enabled: true,
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Paga con tu cuenta PayPal",
    icon: "Wallet",
    enabled: true,
  },
  {
    id: "bank_transfer",
    name: "Transferencia bancaria",
    description: "SPEI, transferencia directa",
    icon: "Building",
    enabled: true,
  },
  {
    id: "cash_on_delivery",
    name: "Pago contra entrega",
    description: "Paga cuando recibas tu pedido",
    icon: "Banknote",
    enabled: false,
  },
] as const;

// 🏆 CUSTOMER TIERS (loyalty program)
export const CUSTOMER_TIERS = {
  BRONZE: {
    name: "Bronce",
    minOrders: 0,
    benefits: ["Envío gratis en pedidos +$1000"],
    color: "#CD7F32",
    icon: "Award",
  },
  SILVER: {
    name: "Plata",
    minOrders: 5,
    benefits: ["Envío gratis en pedidos +$800", "5% descuento extra"],
    color: "#C0C0C0",
    icon: "Award",
  },
  GOLD: {
    name: "Oro",
    minOrders: 15,
    benefits: [
      "Envío gratis siempre",
      "10% descuento extra",
      "Soporte prioritario",
    ],
    color: "#FFD700",
    icon: "Crown",
  },
  PLATINUM: {
    name: "Platino",
    minOrders: 30,
    benefits: [
      "Envío gratis express",
      "15% descuento extra",
      "Acceso anticipado",
      "Soporte VIP",
    ],
    color: "#E5E4E2",
    icon: "Gem",
  },
} as const;
