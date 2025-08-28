/**
 * 📋 CHECKOUT CONSTANTS
 * ====================
 *
 * Static data for checkout process: payment methods, shipping options, etc.
 */

import { PaymentMethod, ShippingMethod, CheckoutStep } from "./types";

// 🎯 CHECKOUT FLOW CONSTANTS
// ==========================

export const CHECKOUT_STEPS: CheckoutStep[] = [
  "customer-info",
  "shipping-address",
  "shipping-method",
  "payment-method",
  "review-order",
  "processing",
  "completed",
];

export const CHECKOUT_STEP_LABELS: Record<CheckoutStep, string> = {
  "customer-info": "Customer Information",
  "shipping-address": "Shipping Address",
  "shipping-method": "Shipping Method",
  "payment-method": "Payment Method",
  "review-order": "Review Order",
  processing: "Processing",
  completed: "Order Completed",
};

export const CHECKOUT_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in ms

// 💳 PAYMENT METHODS
// =================

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "credit_card",
    name: "Credit Card",
    description: "Visa, Mastercard, American Express",
    type: "credit_card",
    enabled: true,
    icon: "CreditCard",
    processingFee: 0,
    minAmount: 100, // $1.00 in cents
    maxAmount: 1000000, // $10,000 in cents
  },
  {
    id: "debit_card",
    name: "Debit Card",
    description: "Visa, Mastercard debit cards",
    type: "debit_card",
    enabled: true,
    icon: "CreditCard",
    processingFee: 0,
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Pay with your PayPal account",
    type: "paypal",
    enabled: true,
    icon: "Wallet",
    processingFee: 0,
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Direct bank transfer (SPEI)",
    type: "bank_transfer",
    enabled: true,
    icon: "Building",
    processingFee: 0,
    minAmount: 1000, // $10.00 minimum
  },
  {
    id: "cash_on_delivery",
    name: "Cash on Delivery",
    description: "Pay when you receive your order",
    type: "cash_on_delivery",
    enabled: false, // Disabled by default
    icon: "Banknote",
    processingFee: 500, // $5.00 handling fee
    maxAmount: 50000, // $500 maximum
  },
] as const;

// 🚚 SHIPPING METHODS
// ==================

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "5-7 business days",
    price: 999, // $9.99 in cents
    estimatedDays: 6,
    isActive: true,
    provider: "Local Courier",
    trackingEnabled: true,
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "2-3 business days",
    price: 1999, // $19.99 in cents
    estimatedDays: 2,
    isActive: true,
    provider: "Express Courier",
    trackingEnabled: true,
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    description: "Next business day",
    price: 3999, // $39.99 in cents
    estimatedDays: 1,
    isActive: true,
    provider: "Express Courier",
    trackingEnabled: true,
  },
  {
    id: "pickup",
    name: "Store Pickup",
    description: "Pick up at our store",
    price: 0, // Free
    estimatedDays: 0,
    isActive: true,
    provider: "Store",
    trackingEnabled: false,
  },
  {
    id: "free_shipping",
    name: "Free Shipping",
    description: "7-10 business days (orders over $75)",
    price: 0,
    estimatedDays: 8,
    isActive: true,
    provider: "Standard Post",
    trackingEnabled: true,
  },
] as const;

// 🌍 COUNTRIES & REGIONS
// ======================

export const SUPPORTED_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
] as const;

export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
] as const;

// 💰 PRICING CONSTANTS
// ===================

export const TAX_RATES = {
  DEFAULT: 0.08, // 8% default tax
  CA: 0.0975, // California
  NY: 0.08, // New York
  TX: 0.0625, // Texas
  FL: 0.06, // Florida
} as const;

export const FREE_SHIPPING_THRESHOLD = 7500; // $75.00 in cents
export const MIN_ORDER_AMOUNT = 100; // $1.00 in cents
export const MAX_ORDER_AMOUNT = 1000000; // $10,000 in cents

// 📱 UI CONSTANTS
// ==============

export const CHECKOUT_FORM_CONFIG = {
  AUTO_SAVE_DELAY: 1000, // Auto-save form data after 1 second
  SESSION_REFRESH_INTERVAL: 5 * 60 * 1000, // Refresh session every 5 minutes
  STEP_TRANSITION_DURATION: 300, // Animation duration in ms
  ERROR_DISPLAY_DURATION: 5000, // Show errors for 5 seconds
} as const;

// 🔒 SECURITY CONSTANTS
// ====================

export const SECURITY_CONFIG = {
  MAX_CHECKOUT_ATTEMPTS: 3,
  CHECKOUT_COOLDOWN: 15 * 60 * 1000, // 15 minutes cooldown after max attempts
  SESSION_ENCRYPTION_KEY: process.env.CHECKOUT_SESSION_KEY || "default-key",
  PAYMENT_TIMEOUT: 10 * 60 * 1000, // 10 minutes for payment completion
} as const;

// 📊 ANALYTICS CONSTANTS
// =====================

export const ANALYTICS_EVENTS = {
  CHECKOUT_STARTED: "checkout_started",
  STEP_COMPLETED: "checkout_step_completed",
  PAYMENT_INITIATED: "payment_initiated",
  ORDER_COMPLETED: "order_completed",
  CHECKOUT_ABANDONED: "checkout_abandoned",
  ERROR_OCCURRED: "checkout_error",
} as const;

// 🎯 DEFAULT VALUES
// ================

export const DEFAULT_CUSTOMER_INFO = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
};

export const DEFAULT_ADDRESS = {
  firstName: "",
  lastName: "",
  company: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  phone: "",
};
