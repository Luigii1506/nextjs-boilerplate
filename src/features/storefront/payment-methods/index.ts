/**
 * 💳 PAYMENT METHODS FEATURE
 * ===========================
 *
 * Manage saved payment methods (credit/debit cards).
 * PCI-compliant with Stripe integration.
 *
 * @version 1.0.0 - Feature-First Architecture
 */

// Types
export type {
  PaymentMethod,
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
  PaymentMethodsResponse,
} from "./types";

// Schemas
export {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
  type CreatePaymentMethodInput as CreatePaymentMethodSchemaInput,
  type UpdatePaymentMethodInput as UpdatePaymentMethodSchemaInput,
} from "./schemas";

// Server Actions & Queries
export {
  createPaymentMethodAction,
  updatePaymentMethodAction,
  deletePaymentMethodAction,
  setDefaultPaymentMethodAction,
} from "./server/actions";

export {
  getPaymentMethodsQuery,
  getPaymentMethodQuery,
} from "./server/queries";

// Hooks
export {
  usePaymentMethods,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
  useSetDefaultPaymentMethod,
  paymentMethodsKeys,
} from "./hooks/usePaymentMethods";
