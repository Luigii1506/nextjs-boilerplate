/**
 * 🛒 CART MAPPERS
 * ================
 *
 * Data transformation layer for Cart operations
 * Clean Architecture: Infrastructure Layer (Data Mapping)
 * Following Feature-First v3.0.0 patterns
 *
 * @version 1.0.0 - Cart Feature
 */

import type {
  Cart,
  CartWithItems,
  CartItem,
  CartItemWithProduct,
  CartSummary,
} from "../types";

import type { RawCartQueryResult, RawCartItemQueryResult } from "./queries";

import type { ProductForCustomer } from "@/features/storefront/types";

// 🔄 CART MAPPERS
// ===============

/**
 * Map raw cart data to Cart interface
 */
export function mapRawCartToCart(rawCart: RawCartQueryResult): Cart {
  console.log(
    "🔄 [CART MAPPER] Mapping raw cart to Cart interface:",
    rawCart.id
  );

  try {
    const cart: Cart = {
      id: rawCart.id,
      sessionId: rawCart.sessionId,
      userId: rawCart.userId,

      // Convert Prisma Decimals to numbers
      subtotal: Number(rawCart.subtotal),
      taxAmount: Number(rawCart.taxAmount),
      total: Number(rawCart.total),

      createdAt: rawCart.createdAt,
      updatedAt: rawCart.updatedAt,
      expiresAt: rawCart.expiresAt,

      // Map cart items
      items: rawCart.items.map(mapRawCartItemToCartItem),
    };

    console.log("✅ [CART MAPPER] Cart mapped successfully:", {
      cartId: cart.id,
      itemsCount: cart.items.length,
      total: cart.total,
    });

    return cart;
  } catch (error) {
    console.error("❌ [CART MAPPER] Error mapping cart:", error);
    throw new Error("Failed to map cart data");
  }
}

/**
 * Map raw cart data to CartWithItems interface
 */
export function mapRawCartToCartWithItems(
  rawCart: RawCartQueryResult
): CartWithItems {
  console.log(
    "🔄 [CART MAPPER] Mapping raw cart to CartWithItems:",
    rawCart.id
  );

  try {
    const cart: CartWithItems = {
      id: rawCart.id,
      sessionId: rawCart.sessionId,
      userId: rawCart.userId,

      // Convert Prisma Decimals to numbers
      subtotal: Number(rawCart.subtotal),
      taxAmount: Number(rawCart.taxAmount),
      total: Number(rawCart.total),

      createdAt: rawCart.createdAt,
      updatedAt: rawCart.updatedAt,
      expiresAt: rawCart.expiresAt,

      // Map cart items with products
      items: rawCart.items.map(mapRawCartItemToCartItemWithProduct),
    };

    console.log("✅ [CART MAPPER] CartWithItems mapped successfully:", {
      cartId: cart.id,
      itemsCount: cart.items.length,
      itemsWithProducts: cart.items.filter((item) => item.product).length,
      total: cart.total,
    });

    return cart;
  } catch (error) {
    console.error("❌ [CART MAPPER] Error mapping cart with items:", error);
    throw new Error("Failed to map cart with items data");
  }
}

/**
 * Map raw cart item to CartItem interface
 */
export function mapRawCartItemToCartItem(
  rawItem: RawCartItemQueryResult
): CartItem {
  console.log("🔄 [CART MAPPER] Mapping raw cart item:", rawItem.id);

  try {
    const cartItem: CartItem = {
      id: rawItem.id,
      cartId: rawItem.cartId,
      productId: rawItem.productId,
      quantity: rawItem.quantity,

      // Convert Prisma Decimals to numbers
      unitPrice: Number(rawItem.unitPrice),
      total: Number(rawItem.total),

      createdAt: rawItem.createdAt,
      updatedAt: rawItem.updatedAt,
    };

    return cartItem;
  } catch (error) {
    console.error("❌ [CART MAPPER] Error mapping cart item:", error);
    throw new Error("Failed to map cart item data");
  }
}

/**
 * Map raw cart item with product to CartItemWithProduct interface
 */
export function mapRawCartItemToCartItemWithProduct(
  rawItem: RawCartItemQueryResult
): CartItemWithProduct {
  console.log(
    "🔄 [CART MAPPER] Mapping raw cart item with product:",
    rawItem.id
  );

  try {
    const cartItem: CartItemWithProduct = {
      id: rawItem.id,
      cartId: rawItem.cartId,
      productId: rawItem.productId,
      quantity: rawItem.quantity,

      // Convert Prisma Decimals to numbers
      unitPrice: Number(rawItem.unitPrice),
      total: Number(rawItem.total),

      createdAt: rawItem.createdAt,
      updatedAt: rawItem.updatedAt,

      // Map product data
      product: mapRawProductToProductForCustomer(rawItem.product),
    };

    return cartItem;
  } catch (error) {
    console.error(
      "❌ [CART MAPPER] Error mapping cart item with product:",
      error
    );
    throw new Error("Failed to map cart item with product data");
  }
}

/**
 * Map raw product data to ProductForCustomer interface
 * (Reuses storefront product mapping logic)
 */
function mapRawProductToProductForCustomer(
  rawProduct?: RawCartItemQueryResult["product"]
): ProductForCustomer {
  if (!rawProduct) {
    throw new Error("Product data is required for CartItemWithProduct");
  }

  console.log("🔄 [CART MAPPER] Mapping raw product:", rawProduct.id);

  try {
    const product: ProductForCustomer = {
      id: rawProduct.id,
      sku: rawProduct.sku,
      name: rawProduct.name,
      description: rawProduct.description,
      categoryId: rawProduct.categoryId,

      // Convert Prisma Decimals to numbers - use cart item's frozen price
      price: Number(rawProduct.price),
      stock: rawProduct.stock,
      unit: rawProduct.unit,

      images: rawProduct.images || [],
      tags: rawProduct.tags || [],
      isActive: rawProduct.isActive,

      // Wishlist status (if available from join)
      isWishlisted: rawProduct.isWishlisted || false,

      // Category info
      category: rawProduct.category
        ? {
            id: rawProduct.category.id,
            name: rawProduct.category.name,
            slug: rawProduct.category.slug,
          }
        : null,

      // Customer-specific fields
      publicPrice: Number(rawProduct.price), // Same as price for cart items
      isOnSale: false, // TODO: Implement sale logic
      salePrice: null, // TODO: Implement sale logic
      discountPercentage: 0, // TODO: Implement discount logic

      // Computed fields
      isInStock: rawProduct.stock > 0,
      isLowStock: rawProduct.stock > 0 && rawProduct.stock <= 10, // TODO: Make configurable

      // Reviews and ratings (future)
      averageRating: 0, // TODO: Implement reviews
      reviewCount: 0, // TODO: Implement reviews

      // SEO and metadata
      slug: rawProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""), // Simple slug generation

      // Additional metadata
      createdAt: new Date(), // TODO: Add to product schema
      updatedAt: new Date(), // TODO: Add to product schema
    };

    return product;
  } catch (error) {
    console.error("❌ [CART MAPPER] Error mapping product:", error);
    throw new Error("Failed to map product data for cart item");
  }
}

/**
 * Generate cart summary from CartWithItems
 */
export function generateCartSummary(cart: CartWithItems): CartSummary {
  console.log("🔄 [CART MAPPER] Generating cart summary:", cart.id);

  try {
    const summary: CartSummary = {
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      uniqueItems: cart.items.length,

      subtotal: cart.subtotal,
      taxAmount: cart.taxAmount,
      shippingAmount: 0, // TODO: Implement shipping calculation
      discountAmount: 0, // TODO: Implement discounts
      total: cart.total,

      // Quick stats
      heaviestItem:
        cart.items.length > 0
          ? cart.items.reduce((heaviest, current) =>
              current.quantity > heaviest.quantity ? current : heaviest
            )
          : undefined,

      mostExpensiveItem:
        cart.items.length > 0
          ? cart.items.reduce((expensive, current) =>
              current.total > expensive.total ? current : expensive
            )
          : undefined,
    };

    console.log("✅ [CART MAPPER] Cart summary generated:", {
      cartId: cart.id,
      itemCount: summary.itemCount,
      uniqueItems: summary.uniqueItems,
      total: summary.total,
    });

    return summary;
  } catch (error) {
    console.error("❌ [CART MAPPER] Error generating cart summary:", error);
    throw new Error("Failed to generate cart summary");
  }
}

/**
 * Map multiple raw carts to Cart arrays (for analytics, admin views, etc.)
 */
export function mapRawCartsToCartsArray(
  rawCarts: RawCartQueryResult[]
): Cart[] {
  console.log("🔄 [CART MAPPER] Mapping multiple carts:", rawCarts.length);

  try {
    const carts = rawCarts.map(mapRawCartToCart);

    console.log("✅ [CART MAPPER] Multiple carts mapped successfully:", {
      count: carts.length,
      totalItems: carts.reduce((sum, cart) => sum + cart.items.length, 0),
    });

    return carts;
  } catch (error) {
    console.error("❌ [CART MAPPER] Error mapping multiple carts:", error);
    throw new Error("Failed to map multiple carts");
  }
}

/**
 * Map multiple raw carts to CartWithItems arrays
 */
export function mapRawCartsToCartsWithItemsArray(
  rawCarts: RawCartQueryResult[]
): CartWithItems[] {
  console.log(
    "🔄 [CART MAPPER] Mapping multiple carts with items:",
    rawCarts.length
  );

  try {
    const carts = rawCarts.map(mapRawCartToCartWithItems);

    console.log(
      "✅ [CART MAPPER] Multiple carts with items mapped successfully:",
      {
        count: carts.length,
        totalItems: carts.reduce((sum, cart) => sum + cart.items.length, 0),
        totalValue: carts.reduce((sum, cart) => sum + cart.total, 0),
      }
    );

    return carts;
  } catch (error) {
    console.error(
      "❌ [CART MAPPER] Error mapping multiple carts with items:",
      error
    );
    throw new Error("Failed to map multiple carts with items");
  }
}

// 🎯 UTILITY MAPPERS
// ===================

/**
 * Convert cart to simplified format for API responses
 */
export function cartToApiResponse(cart: CartWithItems) {
  return {
    id: cart.id,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    uniqueItems: cart.items.length,
    subtotal: cart.subtotal,
    taxAmount: cart.taxAmount,
    total: cart.total,
    items: cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      images: item.product.images.slice(0, 1), // Only first image for API
    })),
    updatedAt: cart.updatedAt,
  };
}

export default {};


