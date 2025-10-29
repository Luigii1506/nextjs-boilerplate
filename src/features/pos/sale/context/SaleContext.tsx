"use client";
/**
 * 🛒 POS Sale Context
 * ===================
 *
 * Context provider para gestionar el carrito de venta en POS.
 * Similar a CartContext pero optimizado para operaciones de punto de venta.
 *
 * @module pos/sale/context/SaleContext
 * @version 1.0.0
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { logger } from "@/shared/utils/logger";
import { useAuth } from "@/shared/hooks/useAuth";
import * as actions from "../server/actions";
import type { POSSaleContextValue, POSSaleItemWithProduct, POSSaleSummary } from "../types";

// ========================================
// CONTEXT
// ========================================

const SaleContext = createContext<POSSaleContextValue | null>(null);

// ========================================
// PROVIDER
// ========================================

interface SaleProviderProps {
  children: React.ReactNode;
  initialSessionId?: string;
}

export function SaleProvider({
  children,
  initialSessionId,
}: SaleProviderProps) {
  const { user, isAuthenticated } = useAuth();

  // ========================================
  // STATE
  // ========================================

  const [sessionId, setSessionId] = useState<string | null>(
    initialSessionId || null
  );
  const [items, setItems] = useState<POSSaleItemWithProduct[]>([]);
  const [summary, setSummary] = useState<POSSaleSummary>({
    itemCount: 0,
    subtotal: 0,
    discount: 0,
    tax: 0,
    taxRate: 0.16,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const total = useMemo(() => summary.total, [summary.total]);

  const hasItems = useMemo(() => items.length > 0, [items.length]);

  const canCheckout = useMemo(
    () => hasItems && !isLoading && itemCount > 0,
    [hasItems, isLoading, itemCount]
  );

  // ========================================
  // INITIALIZATION
  // ========================================

  /**
   * Inicializar sale desde el servidor
   */
  const initializeSale = useCallback(async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      const result = await actions.getActiveSaleAction(sessionId);

      if (result.success && result.data) {
        const { sale, summary: fetchedSummary } = result.data;

        if (sale?.items) {
          setItems(sale.items);
        } else {
          setItems([]);
        }

        if (fetchedSummary) {
          setSummary(fetchedSummary);
        }
      } else {
        // No hay venta activa, inicializar vacío
        setItems([]);
        setSummary({
          itemCount: 0,
          subtotal: 0,
          discount: 0,
          tax: 0,
          taxRate: 0.16,
          total: 0,
        });
      }
    } catch (error) {
    logger.error("SaleContext: initialize error", { error });
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [sessionId]);

  // Auto-initialize on mount or sessionId change
  useEffect(() => {
    if (sessionId && !isInitialized) {
      initializeSale();
    }
  }, [sessionId, isInitialized, initializeSale]);

  // ========================================
  // ACTIONS
  // ========================================

  /**
   * Agregar producto a la venta
   */
  const addItem = useCallback(
    async (productId: string, quantity: number = 1) => {
      if (!sessionId) {
        logger.warn("SaleContext: missing session id");
        return;
      }

      try {
        setIsLoading(true);

        const result = await actions.addToSaleAction(
          sessionId,
          productId,
          quantity
        );

        if (result.success && result.data) {
          const { sale, summary: updatedSummary } = result.data;

          if (sale?.items) {
            setItems(sale.items);
          }

          if (updatedSummary) {
            setSummary(updatedSummary);
          }

          // Success feedback could be handled here
          logger.debug("SaleContext: item added", {
            message: result.message,
          });
        } else {
          logger.error("SaleContext: add item failed", { error: result.error });
          throw new Error(result.error || "Failed to add item");
        }
      } catch (error) {
        logger.error("SaleContext: add item error", { error });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  /**
   * Actualizar cantidad de un item
   */
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!sessionId) {
        logger.warn("SaleContext: missing session id");
        return;
      }

      try {
        setIsLoading(true);

        const result = await actions.updateSaleQuantityAction(
          sessionId,
          itemId,
          quantity
        );

        if (result.success && result.data) {
          const { sale, summary: updatedSummary } = result.data;

          if (sale?.items) {
            setItems(sale.items);
          }

          if (updatedSummary) {
            setSummary(updatedSummary);
          }

          logger.debug("SaleContext: quantity updated", {
            message: result.message,
          });
        } else {
          logger.error("SaleContext: update quantity failed", { error: result.error });
          throw new Error(result.error || "Failed to update quantity");
        }
      } catch (error) {
        logger.error("SaleContext: update quantity error", { error });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  /**
   * Eliminar item de la venta
   */
  const removeItem = useCallback(
    async (itemId: string) => {
      if (!sessionId) {
        logger.warn("SaleContext: missing session id");
        return;
      }

      try {
        setIsLoading(true);

        const result = await actions.removeFromSaleAction(sessionId, itemId);

        if (result.success && result.data) {
          const { sale, summary: updatedSummary } = result.data;

          if (sale === null) {
            // Sale quedó vacía
            setItems([]);
          } else if (sale?.items) {
            setItems(sale.items);
          }

          if (updatedSummary) {
            setSummary(updatedSummary);
          }

          logger.debug("SaleContext: item removed", {
            message: result.message,
          });
        } else {
          logger.error("SaleContext: remove item failed", { error: result.error });
          throw new Error(result.error || "Failed to remove item");
        }
      } catch (error) {
        logger.error("SaleContext: remove item error", { error });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  /**
   * Limpiar toda la venta
   */
  const clearSale = useCallback(async () => {
    if (!sessionId) {
      logger.warn("SaleContext: missing session id");
      return;
    }

    try {
      setIsLoading(true);

      const result = await actions.clearSaleAction(sessionId);

      if (result.success) {
        setItems([]);
        setSummary({
          itemCount: 0,
          subtotal: 0,
          discount: 0,
          tax: 0,
          taxRate: 0.16,
          total: 0,
        });

          logger.debug("SaleContext: sale cleared", {
            message: result.message,
          });
      } else {
        logger.error("SaleContext: clear sale failed", { error: result.error });
        throw new Error(result.error || "Failed to clear sale");
      }
    } catch (error) {
      logger.error("SaleContext: clear sale error", { error });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  /**
   * Aplicar descuento a la venta
   */
  const applyDiscount = useCallback(
    async (type: "percentage" | "fixed", value: number) => {
      if (!sessionId) {
        logger.warn("SaleContext: missing session id");
        return;
      }

      try {
        setIsLoading(true);

        const result = await actions.applyDiscountAction(sessionId, type, value);

        if (result.success && result.data) {
          const { sale, summary: updatedSummary } = result.data;

          if (sale?.items) {
            setItems(sale.items);
          }

          if (updatedSummary) {
            setSummary(updatedSummary);
          }

          logger.debug("SaleContext: discount applied", {
            message: result.message,
          });
        } else {
          logger.error("SaleContext: apply discount failed", { error: result.error });
          throw new Error(result.error || "Failed to apply discount");
        }
      } catch (error) {
        logger.error("SaleContext: apply discount error", { error });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  /**
   * Validar venta para checkout
   */
  const validateForCheckout = useCallback(async () => {
    if (!sessionId) {
      logger.warn("SaleContext: missing session id");
      return { isValid: false, errors: ["No session ID"] };
    }

    try {
      const result = await actions.validateSaleForCheckoutAction(sessionId);

      if (result.success && result.data) {
        return result.data;
      } else {
        return {
          isValid: false,
          errors: [result.error || "Validation failed"],
        };
      }
    } catch (error) {
      logger.error("SaleContext: validate checkout error", { error });
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : "Validation failed"],
      };
    }
  }, [sessionId]);

  /**
   * Refrescar sale desde el servidor
   */
  const refreshSale = useCallback(async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      const result = await actions.getActiveSaleAction(sessionId);

      if (result.success && result.data) {
        const { sale, summary: fetchedSummary } = result.data;

        if (sale?.items) {
          setItems(sale.items);
        } else {
          setItems([]);
        }

        if (fetchedSummary) {
          setSummary(fetchedSummary);
        }
      }
    } catch (error) {
      logger.error("SaleContext: refresh error", { error });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value: POSSaleContextValue = {
    // State
    items,
    summary,
    itemCount,
    total,
    isLoading,
    sessionId,

    // Actions
    addItem,
    updateQuantity,
    removeItem,
    clearSale,
    applyDiscount,
    validateForCheckout,
    refreshSale,
    setSessionId,

    // Computed
    hasItems,
    canCheckout,
  };

  return <SaleContext.Provider value={value}>{children}</SaleContext.Provider>;
}

// ========================================
// HOOK
// ========================================

/**
 * Hook para acceder al contexto de Sale
 *
 * @throws Error si se usa fuera del SaleProvider
 */
export function useSaleContext(): POSSaleContextValue {
  const context = useContext(SaleContext);

  if (!context) {
    throw new Error("useSaleContext must be used within a SaleProvider");
  }

  return context;
}
