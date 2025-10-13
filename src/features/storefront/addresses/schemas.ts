/**
 * 📍 ADDRESS SCHEMAS
 * ==================
 *
 * Zod validation schemas for address data
 *
 * @version 1.0.0 - Address Feature
 */

import { z } from "zod";

// 🏷️ Enum Schema
export const addressTypeSchema = z.enum(["SHIPPING", "BILLING", "BOTH"]);

// 📝 Create Address Schema
export const createAddressSchema = z.object({
  type: addressTypeSchema.default("SHIPPING"),
  label: z.string().max(50).optional().transform(val => val === "" ? undefined : val),
  firstName: z.string().min(1, "El nombre es requerido").max(100),
  lastName: z.string().min(1, "El apellido es requerido").max(100),
  company: z.string().max(100).optional().transform(val => val === "" ? undefined : val),
  street: z.string().min(1, "La calle es requerida").max(200),
  street2: z.string().max(200).optional().transform(val => val === "" ? undefined : val),
  city: z.string().min(1, "La ciudad es requerida").max(100),
  state: z.string().min(1, "El estado es requerido").max(100),
  zipCode: z.string().min(1, "El código postal es requerido").max(20),
  country: z.string().min(2).max(2).default("MX"),
  phone: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .max(20),
  isDefault: z.boolean().optional().default(false),
});

// 📝 Update Address Schema
export const updateAddressSchema = z.object({
  addressId: z.string().cuid(),
  type: addressTypeSchema.optional(),
  label: z.string().max(50).optional().transform(val => val === "" ? undefined : val),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  company: z.string().max(100).optional().transform(val => val === "" ? undefined : val),
  street: z.string().min(1).max(200).optional(),
  street2: z.string().max(200).optional().transform(val => val === "" ? undefined : val),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  zipCode: z.string().min(1).max(20).optional(),
  country: z.string().min(2).max(2).optional(),
  phone: z.string().min(10).max(20).optional(),
  isDefault: z.boolean().optional(),
});

// 🗑️ Delete Address Schema
export const deleteAddressSchema = z.object({
  addressId: z.string().cuid(),
  userId: z.string(),
});

// ⭐ Set Default Address Schema
export const setDefaultAddressSchema = z.object({
  addressId: z.string().cuid(),
  userId: z.string(),
});

// 📍 Address ID Schema
export const addressIdSchema = z.object({
  addressId: z.string().cuid(),
});

// 🔍 Get Addresses Schema
export const getUserAddressesSchema = z.object({
  userId: z.string(),
});

// Type exports for convenience
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type DeleteAddressInput = z.infer<typeof deleteAddressSchema>;
export type SetDefaultAddressInput = z.infer<typeof setDefaultAddressSchema>;
