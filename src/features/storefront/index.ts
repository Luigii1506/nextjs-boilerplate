/**
 * 🛒 STOREFRONT MODULE - MAIN BARREL EXPORT
 * ==========================================
 *
 * API pública del módulo storefront customer-facing
 * Exportaciones enterprise organizadas por dominio
 *
 * Architecture: Feature-First v3.0.0 - Subdomains Pattern
 * Updated: 2025-01-12 - Integrated Cart, Checkout, Orders
 *
 * NOTE: Due to conflicting exports between subdomains (cart, checkout, orders)
 * and core storefront (schemas, constants), we recommend importing directly:
 *
 * ✅ RECOMMENDED:
 * import { useCart } from "@/features/storefront/cart";
 * import { useCheckout } from "@/features/storefront/checkout";
 * import { useOrders } from "@/features/storefront/orders";
 *
 * ⚠️ AVOID (causes conflicts):
 * import { useCart, useCheckout } from "@/features/storefront";
 */

// 🛒 SUBDOMAINS - E-commerce Flow
// =================================
// Import directly from subdomains to avoid conflicts

// 🛒 Cart Subdomain
export * from "./cart";

// 💳 Checkout Subdomain
export * from "./checkout";

// 📦 Orders Subdomain
export * from "./orders";

// 📊 CORE STOREFRONT
// ===================

// 📊 Types and Interfaces
export type * from "./types";

// 📋 Validation Schemas
// export * from "./schemas"; // Commented: Conflicts with cart/checkout schemas

// ⚙️ Constants and Configuration
// export * from "./constants"; // Commented: Conflicts with checkout constants

// 🎯 Context (SPA State Management)
export * from "./context";

// 🎯 Hooks (Client-side Logic)
export * from "./hooks";

// 🎨 UI Components
export * from "./ui/components";

// 📄 UI Routes/Screens
export * from "./ui/routes";

// 🚀 Server Actions (will be exported when created)
// export * from "./actions";

// 🧮 Utility Functions (will be created later)
// export * from "./utils";
