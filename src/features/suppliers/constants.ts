/**
 * 🚛 SUPPLIERS CONSTANTS
 * ======================
 */

export const SUPPLIER_DEFAULTS = {
  PAYMENT_TERMS: 30, // días
  COUNTRY: "MX",
  MIN_RATING: 1.0,
  MAX_RATING: 5.0,
} as const;

export const SUPPLIER_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  RATING_MIN: 1.0,
  RATING_MAX: 5.0,
} as const;

export const SUPPLIER_QUERY_KEYS = {
  ALL: ["suppliers"] as const,
  LISTS: () => [...SUPPLIER_QUERY_KEYS.ALL, "list"] as const,
  LIST: (filters: string) =>
    [...SUPPLIER_QUERY_KEYS.LISTS(), filters] as const,
  DETAILS: () => [...SUPPLIER_QUERY_KEYS.ALL, "detail"] as const,
  DETAIL: (id: string) => [...SUPPLIER_QUERY_KEYS.DETAILS(), id] as const,
  STATS: () => [...SUPPLIER_QUERY_KEYS.ALL, "stats"] as const,
} as const;
