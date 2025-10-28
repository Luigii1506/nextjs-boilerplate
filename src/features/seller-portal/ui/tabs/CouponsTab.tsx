/**
 * 🎟️ COUPONS TAB - Seller Portal
 * ================================
 *
 * CRUD de cupones de descuento
 *
 * REFACTORED: 2025-01-27
 * - Using shared Tab components (TabHeader, TabWrapper, TabLoadingSkeleton)
 * - Standardized with inventory/users pattern
 */

"use client";

import { useState } from "react";
import { Ticket, Plus } from "lucide-react";
import {
  useCoupons,
  useCouponsStats,
  useCreateCoupon,
  useDeleteCoupon,
  useToggleCouponActive,
  useDuplicateCoupon,
} from "../../hooks/useCoupons";
import { CouponType, DiscountType, AppliesTo } from "../../types";
import type { CouponFormData } from "../../types";
import {
  CouponStats,
  CouponFilters,
  CouponTable,
  CouponFormModal,
  type CouponFiltersState,
} from "../components/coupons";
import {
  TabHeader,
  TabWrapper,
  TabLoadingSkeleton,
} from "@/shared/ui/components/tabs";

export function CouponsTab() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<CouponFiltersState>({
    isActive: undefined,
    type: undefined,
  });
  const [page, setPage] = useState(1);

  // Form state
  const [formData, setFormData] = useState<Partial<CouponFormData>>({
    code: "",
    description: "",
    type: "PERCENTAGE" as CouponType,
    discountType: "PERCENTAGE" as DiscountType,
    discountValue: 0,
    appliesTo: "ALL_PRODUCTS" as AppliesTo,
    startAt: new Date(),
    isActive: true,
    availableChannels: [],
  });

  // Queries
  const { data: couponsData, isLoading, error } = useCoupons(filters, page, 20);
  const { data: stats } = useCouponsStats();

  // Mutations
  const createMutation = useCreateCoupon();
  const deleteMutation = useDeleteCoupon();
  const toggleActiveMutation = useToggleCouponActive();
  const duplicateMutation = useDuplicateCoupon();

  // Handlers
  const handleCreateCoupon = async () => {
    if (
      !formData.code ||
      !formData.type ||
      !formData.discountType ||
      !formData.appliesTo ||
      !formData.startAt
    ) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    const result = await createMutation.mutateAsync(formData as CouponFormData);

    if (result.success) {
      setShowCreateForm(false);
      setFormData({
        code: "",
        description: "",
        type: "PERCENTAGE" as CouponType,
        discountType: "PERCENTAGE" as DiscountType,
        discountValue: 0,
        appliesTo: "ALL_PRODUCTS" as AppliesTo,
        startAt: new Date(),
        isActive: true,
        availableChannels: [],
      });
    } else {
      alert(result.error || "Error al crear cupón");
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive });
  };

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <TabWrapper>
      <TabHeader
        icon={<Ticket className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
        title="Cupones"
        description="Gestiona códigos de descuento y promociones"
        actions={[
          {
            label: "Nuevo Cupón",
            icon: <Plus className="w-4 h-4" />,
            onClick: () => setShowCreateForm(true),
            variant: "primary",
          },
        ]}
      />

      {/* Quick Stats */}
      <CouponStats stats={stats} />

      {/* Filters */}
      <CouponFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Coupons List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cupones {filters.isActive === true && "Activos"}{" "}
            {filters.isActive === false && "Inactivos"}
          </h3>
        </div>

        {/* Loading State */}
        {isLoading && <TabLoadingSkeleton type="table" count={5} showHeader={false} />}

        {/* Error State */}
        {error && (
          <div className="p-12 text-center">
            <div className="text-red-600 mb-2">Error al cargar cupones</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading &&
          !error &&
          (!couponsData?.items || couponsData.items.length === 0) && (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🎟️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No hay cupones creados
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Crea tu primer cupón para ofrecer descuentos
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                Crear Primer Cupón
              </button>
            </div>
          )}

        {/* Coupons Table */}
        {!isLoading &&
          !error &&
          couponsData &&
          couponsData.items.length > 0 && (
            <>
              <CouponTable
                coupons={couponsData.items}
                onToggleActive={handleToggleActive}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                isTogglingActive={toggleActiveMutation.isPending}
                isDuplicating={duplicateMutation.isPending}
                isDeleting={deleteMutation.isPending}
              />

              {/* Pagination */}
              {couponsData.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Página {page} de {couponsData.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(couponsData.totalPages, p + 1))
                      }
                      disabled={page === couponsData.totalPages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
      </div>

      {/* Create Form Modal */}
      <CouponFormModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateCoupon}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={createMutation.isPending}
      />
    </TabWrapper>
  );
}
