/**
 * 🛒 STOREFRONT SCHEMAS
 * =====================
 *
 * Zod schemas for storefront data validation
 * Client-side and server-side unified validations
 *
 * Created: 2025-01-17 - Storefront Module
 */

import { z } from "zod";
import {
  CustomerGender,
  CustomerTier,
  AddressType,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
} from "./types/models";

// 🔧 Utility schemas
const stringRequired = (field: string) =>
  z.string().min(1, `${field} es requerido`);

const emailSchema = z.string().email("Email inválido");
const phoneSchema = z
  .string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, "Número de teléfono inválido")
  .optional()
  .or(z.literal(""));

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/(?=.*[a-z])/, "Debe contener al menos una minúscula")
  .regex(/(?=.*[A-Z])/, "Debe contener al menos una mayúscula")
  .regex(/(?=.*\d)/, "Debe contener al menos un número");

const positiveNumber = z.number().positive("Debe ser un número positivo");
const nonNegativeNumber = z.number().min(0, "No puede ser negativo");

// 🏷️ ENUM SCHEMAS
export const customerGenderSchema = z.nativeEnum(CustomerGender);
export const customerTierSchema = z.nativeEnum(CustomerTier);
export const addressTypeSchema = z.nativeEnum(AddressType);
export const orderStatusSchema = z.nativeEnum(OrderStatus);
export const paymentStatusSchema = z.nativeEnum(PaymentStatus);
export const fulfillmentStatusSchema = z.nativeEnum(FulfillmentStatus);

// 👤 CUSTOMER SCHEMAS
export const customerRegistrationSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: stringRequired("Nombre"),
    lastName: stringRequired("Apellidos"),
    phone: phoneSchema,
    birthDate: z.date().optional(),
    gender: customerGenderSchema.optional(),
    acceptTerms: z.boolean().refine((val) => val, {
      message: "Debes aceptar los términos y condiciones",
    }),
    marketingEmails: z.boolean().optional().default(true),
    smsNotifications: z.boolean().optional().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const customerLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Contraseña requerida"),
});

export const updateCustomerSchema = z.object({
  firstName: z.string().min(1, "Nombre requerido").optional(),
  lastName: z.string().min(1, "Apellidos requeridos").optional(),
  phone: phoneSchema,
  birthDate: z.date().optional(),
  gender: customerGenderSchema.optional(),
  marketingEmails: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
});

// 📍 ADDRESS SCHEMAS
export const createAddressSchema = z.object({
  userId: z.string().cuid("ID de cliente inválido"),
  type: addressTypeSchema,
  label: z.string().optional(),
  firstName: stringRequired("Nombre"),
  lastName: stringRequired("Apellidos"),
  street: stringRequired("Dirección"),
  city: stringRequired("Ciudad"),
  state: stringRequired("Estado"),
  zipCode: stringRequired("Código postal"),
  country: stringRequired("País").default("MX"),
  phone: phoneSchema,
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema
  .omit({ userId: true })
  .partial();

// 🛒 CART SCHEMAS
export const addToCartSchema = z.object({
  productId: z.string().cuid("ID de producto inválido"),
  quantity: z.number().int().min(1, "Cantidad debe ser al menos 1"),
  sessionId: z.string().optional(),
  userId: z.string().cuid().optional(),
});

export const updateCartItemSchema = z.object({
  cartId: z.string().cuid("ID de carrito inválido"),
  productId: z.string().cuid("ID de producto inválido"),
  quantity: z.number().int().min(0, "Cantidad no puede ser negativa"),
});

export const removeFromCartSchema = z.object({
  cartId: z.string().cuid("ID de carrito inválido"),
  productId: z.string().cuid("ID de producto inválido"),
});

// 💖 WISHLIST SCHEMAS
export const addToWishlistSchema = z.object({
  userId: z.string().cuid("ID de cliente inválido"),
  productId: z.string().cuid("ID de producto inválido"),
});

export const removeFromWishlistSchema = addToWishlistSchema;

// 📦 ORDER SCHEMAS
export const orderItemSchema = z.object({
  productId: z.string().cuid("ID de producto inválido"),
  quantity: z.number().int().positive("Cantidad debe ser positiva"),
  unitPrice: positiveNumber,
  total: nonNegativeNumber,
  productSku: stringRequired("SKU del producto"),
  productName: stringRequired("Nombre del producto"),
  productImage: z.string().url().optional(),
});

export const createOrderSchema = z.object({
  userId: z.string().cuid().optional(),
  email: emailSchema,
  phone: phoneSchema,
  items: z.array(orderItemSchema).min(1, "Debe incluir al menos un producto"),
  shippingAddressId: z.string().cuid("ID de dirección inválido"),
  shippingMethod: z.string().optional(),
  paymentMethod: stringRequired("Método de pago"),
  paymentIntentId: z.string().optional(),
  subtotal: nonNegativeNumber,
  taxAmount: nonNegativeNumber,
  shippingCost: nonNegativeNumber,
  discountAmount: nonNegativeNumber.optional().default(0),
  total: positiveNumber,
  customerNotes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().cuid("ID de pedido inválido"),
  status: orderStatusSchema,
  notes: z.string().optional(),
  trackingNumber: z.string().optional(),
  shippingMethod: z.string().optional(),
  estimatedDelivery: z.date().optional(),
});

export const updatePaymentStatusSchema = z.object({
  orderId: z.string().cuid("ID de pedido inválido"),
  paymentStatus: paymentStatusSchema,
  paymentIntentId: z.string().optional(),
  notes: z.string().optional(),
});

// ⭐ REVIEW SCHEMAS
export const createReviewSchema = z.object({
  productId: z.string().cuid("ID de producto inválido"),
  userId: z.string().cuid("ID de cliente inválido"),
  orderId: z.string().cuid().optional(),
  rating: z
    .number()
    .int()
    .min(1)
    .max(5, "La calificación debe ser entre 1 y 5"),
  title: z
    .string()
    .max(100, "El título no puede exceder 100 caracteres")
    .optional(),
  content: stringRequired("Contenido de la reseña").max(
    1000,
    "La reseña no puede exceder 1000 caracteres"
  ),
});

export const updateReviewSchema = createReviewSchema
  .omit({ productId: true, userId: true, orderId: true })
  .partial();

// 🔍 SEARCH & FILTER SCHEMAS
export const productSearchSchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().cuid().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  inStock: z.boolean().optional(),
  rating: z.number().min(1).max(5).optional(),
  sortBy: z
    .enum(["name", "price", "rating", "newest", "popularity"])
    .optional()
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export const categorySearchSchema = z.object({
  query: z.string().optional(),
  parentId: z.string().cuid().optional(),
  featured: z.boolean().optional(),
  sortBy: z.enum(["name", "productCount", "newest"]).optional().default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

// 🔍 CUSTOMER FILTER SCHEMAS (for public storefront)
export const productFiltersCustomerSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  categories: z.array(z.string()).optional(),
  brand: z.string().optional(),
  brands: z.array(z.string()).optional(),
  priceRange: z.tuple([z.number(), z.number()]).optional(),
  inStock: z.boolean().optional(),
  onSale: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  minRating: z.number().min(0).max(5).optional(),
  isNew: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortBy: z
    .enum([
      "relevance",
      "price_asc",
      "price_desc",
      "rating",
      "newest",
      "bestseller",
      "popularity",
    ])
    .optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export const categoryFiltersCustomerSchema = z.object({
  query: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
  hasProducts: z.boolean().optional(),
  minProductCount: z.number().min(0).optional(),
  sortBy: z
    .enum(["name", "productCount", "popularity", "newest", "alphabetical"])
    .optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// 🎯 CHECKOUT SCHEMAS
export const checkoutAddressSchema = z.union([
  z.object({ id: z.string().cuid() }), // Existing address
  createAddressSchema.omit({ userId: true }), // New address
]);

export const checkoutSchema = z.object({
  userId: z.string().cuid().optional(),
  cartId: z.string().cuid("ID de carrito inválido"),
  email: emailSchema,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: phoneSchema,
  shippingAddress: checkoutAddressSchema,
  billingAddress: checkoutAddressSchema.optional(),
  shippingMethod: stringRequired("Método de envío"),
  paymentMethod: stringRequired("Método de pago"),
  customerNotes: z.string().optional(),
});

export const paymentIntentSchema = z.object({
  orderId: z.string().cuid("ID de pedido inválido"),
  amount: positiveNumber,
  currency: z.string().length(3, "Código de moneda inválido").default("MXN"),
  paymentMethod: stringRequired("Método de pago"),
  customerEmail: emailSchema,
  metadata: z.record(z.string()).optional(),
});

// 🛍️ GUEST CART SCHEMAS
export const guestCartItemSchema = z.object({
  productId: z.string().cuid("ID de producto inválido"),
  quantity: z.number().int().positive("Cantidad debe ser positiva"),
});

export const guestCartSchema = z.object({
  sessionId: stringRequired("ID de sesión"),
  items: z.array(guestCartItemSchema),
});

export const convertGuestCartSchema = z.object({
  sessionId: stringRequired("ID de sesión"),
  userId: z.string().cuid("ID de cliente inválido"),
  mergeStrategy: z.enum(["replace", "merge", "keep_guest"]).default("merge"),
});

// 📊 PAGINATION SCHEMA
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// 🎨 UI STATE SCHEMAS
export const sortOptionsSchema = z.object({
  sortBy: z.string(),
  sortOrder: z.enum(["asc", "desc"]),
});

export const filterSchema = z.record(z.any());

// 💫 Advanced validation functions
export const validatePrice = (value: number, field: string = "precio") => {
  if (value < 0) throw new Error(`${field} no puede ser negativo`);
  if (value > 999999.99) throw new Error(`${field} excede el límite máximo`);
  return true;
};

export const validateQuantity = (value: number, max?: number) => {
  if (!Number.isInteger(value) || value < 0)
    throw new Error("Cantidad debe ser un número entero positivo");
  if (max && value > max) throw new Error(`Cantidad no puede exceder ${max}`);
  return true;
};

export const validateEmail = (email: string) => {
  return emailSchema.safeParse(email).success;
};

export const validatePassword = (password: string) => {
  return passwordSchema.safeParse(password).success;
};

// 🔄 Schema transformations
export const transformDecimalToNumber = (value: any) => {
  if (typeof value === "string") return parseFloat(value);
  if (typeof value === "number") return value;
  return 0;
};

export const transformStringToDate = (value: string | Date) => {
  if (value instanceof Date) return value;
  return new Date(value);
};

// 📤 EXPORT ALL SCHEMAS
export const storefrontSchemas = {
  // Customer
  customerRegistration: customerRegistrationSchema,
  customerLogin: customerLoginSchema,
  updateCustomer: updateCustomerSchema,

  // Address
  createAddress: createAddressSchema,
  updateAddress: updateAddressSchema,

  // Cart
  addToCart: addToCartSchema,
  updateCartItem: updateCartItemSchema,
  removeFromCart: removeFromCartSchema,
  guestCart: guestCartSchema,
  convertGuestCart: convertGuestCartSchema,

  // Wishlist
  addToWishlist: addToWishlistSchema,
  removeFromWishlist: removeFromWishlistSchema,

  // Orders
  createOrder: createOrderSchema,
  updateOrderStatus: updateOrderStatusSchema,
  updatePaymentStatus: updatePaymentStatusSchema,
  orderItem: orderItemSchema,

  // Reviews
  createReview: createReviewSchema,
  updateReview: updateReviewSchema,

  // Search & Filters
  productSearch: productSearchSchema,
  categorySearch: categorySearchSchema,

  // Checkout
  checkout: checkoutSchema,
  paymentIntent: paymentIntentSchema,

  // Utilities
  pagination: paginationSchema,
  sortOptions: sortOptionsSchema,
  filter: filterSchema,
} as const;

export type StorefrontSchemas = typeof storefrontSchemas;
