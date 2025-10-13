/**
 * 📍 ADDRESSES FEATURE - MAIN EXPORTS
 * ====================================
 *
 * Address feature entry point following Feature-First v3.0.0 architecture.
 * Independent, reusable address functionality for e-commerce.
 *
 * @version 1.0.0 - Address Feature
 */

// 📋 Types
export * from "./types";

// 🔧 Schemas
export * from "./schemas";

// 🎬 Server Layer (Actions, Queries)
export * from "./server";

// 🪝 Hooks
export * from "./hooks";

// 🎯 Quick Access Exports (commonly used items)
export type {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
  DeleteAddressInput,
  SetDefaultAddressInput,
  AddressesResponse,
  AddressType,
} from "./types";

export {
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  getUserAddressesAction,
  getUserAddresses,
} from "./server";

export {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "./hooks";

// 🎨 UI Components are in @/features/storefront/ui/features/account/components
// Import from: import { AddressSection, AddressModal } from "@/features/storefront/ui/features/account"

export default {};
