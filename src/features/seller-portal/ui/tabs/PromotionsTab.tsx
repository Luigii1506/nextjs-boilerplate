/**
 * 🎁 PROMOTIONS TAB - Seller Portal
 * ==================================
 *
 * CRUD de promociones automáticas
 * - 2x1, 3x2, BOGO
 * - Descuentos por porcentaje o monto fijo
 * - Gestión de vigencia y canales
 *
 * REFACTORED: 2025-01-27
 * - Using shared Tab components (TabHeader, TabWrapper, TabLoadingSkeleton)
 * - Reduced from 547 to ~230 lines (58% reduction)
 * - Extracted 6 components
 * - Extracted promotions helpers
 * - Clean orchestration pattern
 *
 * Created: 2025-01-17
 * Last Updated: 2025-01-27
 */

"use client";

import { useState } from "react";
import { Gift, Plus } from "lucide-react";
import {
  usePromotions,
  usePromotionsStats,
  useCreatePromotion,
  useDeletePromotion,
  useTogglePromotionActive,
  useDuplicatePromotion,
} from "../../hooks/usePromotions";
import { PromotionType, DiscountType, AppliesTo } from "../../types";
import type { PromotionFormData } from "../../types";
import {
  PromotionStats,
  PromotionFilters,
  PromotionTable,
  PromotionFormModal,
  PromotionTypesInfo,
} from "../components/promotions";
import {
  TabHeader,
  TabWrapper,
  TabLoadingSkeleton,
} from "@/shared/ui/components/tabs";

export function PromotionsTab() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    isActive: undefined as boolean | undefined,
    type: undefined as PromotionType | undefined,
  });
  const [page, setPage] = useState(1);

  // Form state
  const [formData, setFormData] = useState<Partial<PromotionFormData>>({
    name: "",
    description: "",
    type: "BUY_X_GET_Y" as PromotionType,
    discountType: "PERCENTAGE" as DiscountType,
    discountValue: 0,
    appliesTo: "ALL_PRODUCTS" as AppliesTo,
    startAt: new Date(),
    isActive: true,
    isPriority: false,
    availableChannels: [],
  });

  // Queries
  const {
    data: promotionsData,
    isLoading,
    error,
  } = usePromotions(filters, page, 20);
  const { data: stats } = usePromotionsStats();

  // Mutations
  const createMutation = useCreatePromotion();
  const deleteMutation = useDeletePromotion();
  const toggleActiveMutation = useTogglePromotionActive();
  const duplicateMutation = useDuplicatePromotion();

  // Handlers
  const handleCreatePromotion = async () => {
    if (
      !formData.name ||
      !formData.type ||
      !formData.discountType ||
      !formData.appliesTo ||
      !formData.startAt
    ) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    const result = await createMutation.mutateAsync(
      formData as PromotionFormData
    );

    if (result.success) {
      setShowCreateForm(false);
      // Reset form
      setFormData({
        name: "",
        description: "",
        type: "BUY_X_GET_Y" as PromotionType,
        discountType: "PERCENTAGE" as DiscountType,
        discountValue: 0,
        appliesTo: "ALL_PRODUCTS" as AppliesTo,
        startAt: new Date(),
        isActive: true,
        isPriority: false,
        availableChannels: [],
      });
    } else {
      alert(result.error || "Error al crear promoción");
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

  const handleIsActiveFilterChange = (isActive: boolean | undefined) => {
    setFilters({ ...filters, isActive });
  };

  const handleTypeFilterChange = (type: PromotionType | undefined) => {
    setFilters({ ...filters, type });
  };

  return (
    <TabWrapper>
      <TabHeader
        icon={<Gift className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
        title="Promociones"
        description="Gestiona promociones automáticas (2x1, 3x2, descuentos)"
        actions={[
          {
            label: "Nueva Promoción",
            icon: <Plus className="w-4 h-4" />,
            onClick: () => setShowCreateForm(true),
            variant: "primary",
          },
        ]}
      />

      {/* Quick Stats */}
      <PromotionStats stats={stats} />

      {/* Filters */}
      <PromotionFilters
        isActiveFilter={filters.isActive}
        typeFilter={filters.type}
        onIsActiveChange={handleIsActiveFilterChange}
        onTypeChange={handleTypeFilterChange}
      />

      {/* Promotions List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Promociones {filters.isActive === true && "Activas"}{" "}
            {filters.isActive === false && "Inactivas"}
          </h3>
        </div>

        {/* Loading State */}
        {isLoading && (
          <TabLoadingSkeleton type="table" count={5} showHeader={false} />
        )}

        {/* Error State */}
        {error && (
          <div className="p-12 text-center">
            <div className="text-red-600 mb-2">Error al cargar promociones</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading &&
          !error &&
          (!promotionsData?.items || promotionsData.items.length === 0) && (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No hay promociones creadas
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Crea tu primera promoción para aumentar tus ventas
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                Crear Primera Promoción
              </button>
            </div>
          )}

        {/* Promotions Table */}
        {!isLoading &&
          !error &&
          promotionsData &&
          promotionsData.items.length > 0 && (
            <>
              <PromotionTable
                promotions={promotionsData.items}
                onToggleActive={handleToggleActive}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                isTogglingActive={toggleActiveMutation.isPending}
                isDuplicating={duplicateMutation.isPending}
                isDeleting={deleteMutation.isPending}
              />

              {/* Pagination */}
              {promotionsData.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Página {page} de {promotionsData.totalPages}
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
                        setPage((p) =>
                          Math.min(promotionsData.totalPages, p + 1)
                        )
                      }
                      disabled={page === promotionsData.totalPages}
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

      {/* Promotion Types Examples */}
      <PromotionTypesInfo />

      {/* Create Form Modal */}
      <PromotionFormModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreatePromotion}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={createMutation.isPending}
      />
    </TabWrapper>
  );
}
