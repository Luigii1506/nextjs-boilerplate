import { vi } from "vitest";

export const createPrismaMock = () => {
  const cartFindFirst = vi.fn();
  const transactionFindFirst = vi.fn();
  const transactionCreate = vi.fn();
  const transactionUpdate = vi.fn();
  const productUpdate = vi.fn();
  const sessionFindByUser = vi.fn();

  const $transaction = vi.fn(async (callback: any) =>
    callback({
      pOSTransaction: {
        create: transactionCreate,
        update: transactionUpdate,
      },
      product: { update: productUpdate },
    })
  );

  vi.mock("@/core/database/prisma", () => ({
    prisma: {
      pOSCart: { findFirst: cartFindFirst },
      pOSTransaction: {
        findFirst: transactionFindFirst,
        create: transactionCreate,
        update: transactionUpdate,
      },
      pOSSession: {
        findFirst: sessionFindByUser,
      },
      $transaction,
      product: { update: productUpdate },
    },
  }));

  return {
    cartFindFirst,
    transactionFindFirst,
    transactionCreate,
    transactionUpdate,
    productUpdate,
    sessionFindByUser,
    $transaction,
  };
};
