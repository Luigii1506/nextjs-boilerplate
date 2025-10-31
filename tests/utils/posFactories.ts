import type {
  POSSession,
  POSSessionStatus,
  POSTransactionType,
  POSPaymentMethod,
} from "@/features/pos/types/models";
import type { POSTransactionResult } from "@/features/pos/payment/types";
import type {
  POSSaleSummary,
  POSSaleItemWithProduct,
} from "@/features/pos/sale/types";

let counter = 1;
const nextId = (prefix: string) =>
  `${prefix}-${(counter++).toString().padStart(4, "0")}`;

export const createSession = (overrides: Partial<POSSession> = {}): POSSession => {
  const id = overrides.id ?? `00000000-0000-0000-0000-${(1000 + counter).toString().padStart(12, "0")}`;
  const userId = overrides.userId ?? `00000000-0000-0000-0001-${(1000 + counter).toString().padStart(12, "0")}`;

  return {
    id,
    userId,
    startTime: overrides.startTime ?? new Date("2025-01-01T10:00:00Z"),
    endTime: overrides.endTime ?? null,
    initialCash: overrides.initialCash ?? 1000,
    finalCash: overrides.finalCash ?? null,
    expectedCash: overrides.expectedCash ?? null,
    cashDifference: overrides.cashDifference ?? null,
    status: overrides.status ?? ("OPEN" as POSSessionStatus),
    notes: overrides.notes ?? null,
    createdAt: overrides.createdAt ?? new Date("2025-01-01T10:00:00Z"),
    updatedAt: overrides.updatedAt ?? new Date("2025-01-01T10:00:00Z"),
  };
};

export const createTransactionResult = (
  overrides: Partial<POSTransactionResult> = {}
): POSTransactionResult => ({
  id: overrides.id ?? nextId("trx"),
  transactionNumber: overrides.transactionNumber ?? "POS-20250101-001",
  type: overrides.type ?? ("SALE" as POSTransactionType),
  paymentMethod: overrides.paymentMethod ?? ("CASH" as POSPaymentMethod),
  subtotal: overrides.subtotal ?? 1000,
  tax: overrides.tax ?? 160,
  discount: overrides.discount ?? 0,
  total: overrides.total ?? 1160,
  amountPaid: overrides.amountPaid ?? 1200,
  changeDue: overrides.changeDue ?? 40,
  itemCount: overrides.itemCount ?? 1,
  createdAt: overrides.createdAt ?? new Date("2025-01-01T12:00:00Z"),
});

export const createPrismaCart = (overrides: Record<string, unknown> = {}) => ({
  id: overrides.id ?? nextId("cart"),
  sessionId: overrides.sessionId ?? nextId("session"),
  status: overrides.status ?? "ACTIVE",
  items: overrides.items ?? [
    {
      id: nextId("item"),
      productId: overrides.productId ?? nextId("prod"),
      productSku: "SKU-1",
      productName: "Producto",
      quantity: 1,
      unitPrice: 1000,
      discount: 0,
      subtotal: 1000,
      tax: 160,
      total: 1160,
      product: {
        id: nextId("prod"),
        name: "Producto",
        sku: "SKU-1",
        stock: 5,
      },
    },
  ],
  adjustments: overrides.adjustments ?? [],
  session: overrides.session ?? {
    id: overrides.sessionId ?? nextId("session"),
    userId: overrides.userId ?? nextId("user"),
  },
  ...overrides,
});

export const createSaleSummary = (
  overrides: Partial<POSSaleSummary> = {}
): POSSaleSummary => ({
  itemCount: overrides.itemCount ?? 1,
  subtotal: overrides.subtotal ?? 1000,
  discount: overrides.discount ?? 0,
  fees: overrides.fees ?? 0,
  tax: overrides.tax ?? 160,
  taxRate: overrides.taxRate ?? 0.16,
  total: overrides.total ?? 1160,
});

export const createSaleItem = (
  overrides: Partial<POSSaleItemWithProduct> = {}
): POSSaleItemWithProduct => ({
  id: overrides.id ?? nextId("item"),
  productId: overrides.productId ?? nextId("prod"),
  productSku: overrides.productSku ?? "SKU-1",
  productName: overrides.productName ?? "Producto",
  quantity: overrides.quantity ?? 1,
  unitPrice: overrides.unitPrice ?? 1000,
  discount: overrides.discount ?? 0,
  tax: overrides.tax ?? 160,
  subtotal: overrides.subtotal ?? 1000,
  total: overrides.total ?? 1160,
  addedAt: overrides.addedAt ?? new Date("2025-01-01T10:05:00Z"),
  updatedAt: overrides.updatedAt ?? new Date("2025-01-01T10:05:00Z"),
  metadata: overrides.metadata ?? {},
  product: overrides.product ?? {
    id: overrides.productId ?? nextId("prod"),
    name: overrides.productName ?? "Producto",
    sku: overrides.productSku ?? "SKU-1",
    description: "",
    price: 1000,
    image: null,
    stock: 10,
    categoryId: nextId("cat"),
    createdAt: new Date("2025-01-01T09:00:00Z"),
    updatedAt: new Date("2025-01-01T09:00:00Z"),
    status: "ACTIVE",
    taxRate: 0.16,
  },
});

export const createSalePayload = (overrides: {
  sessionId?: string;
  saleId?: string;
  items?: POSSaleItemWithProduct[];
  summary?: POSSaleSummary;
} = {}) => {
  const items = overrides.items ?? [createSaleItem()];
  const summary = overrides.summary ?? createSaleSummary({
    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
    subtotal: items.reduce((acc, item) => acc + item.subtotal, 0),
    tax: items.reduce((acc, item) => acc + item.tax, 0),
    total: items.reduce((acc, item) => acc + item.total, 0),
  });

  return {
    sale: {
      id: overrides.saleId ?? nextId("sale"),
      sessionId: overrides.sessionId ?? nextId("session"),
      items,
      adjustments: [],
    },
    summary,
  };
};
