/**
 * 📍 ADDRESS TYPES
 * =================
 *
 * TypeScript types for address management
 *
 * @version 1.0.0 - Address Feature
 */

// 🏷️ Enums
export type AddressType = "SHIPPING" | "BILLING" | "BOTH";

// 📋 Base Types
export interface Address {
  id: string;
  userId: string;
  type: AddressType;
  label?: string | null;
  firstName: string;
  lastName: string;
  company?: string | null;
  street: string;
  street2?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 📝 Input Types
export interface CreateAddressInput {
  type: AddressType;
  label?: string;
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  addressId: string;
  type?: AddressType;
  label?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface DeleteAddressInput {
  addressId: string;
  userId: string;
}

export interface SetDefaultAddressInput {
  addressId: string;
  userId: string;
}

// 🎯 Response Types
export interface AddressesResponse {
  addresses: Address[];
  defaultAddress: Address | null;
}

export interface AddressResponse {
  address: Address;
}

// ✅ Validation Types
export interface AddressValidationResult {
  isValid: boolean;
  errors: string[];
}
