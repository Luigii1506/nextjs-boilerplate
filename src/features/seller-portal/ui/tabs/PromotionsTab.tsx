/**
 * 🎁 PROMOTIONS TAB - Seller Portal
 * ==================================
 *
 * CRUD de promociones automáticas
 * - 2x1, 3x2, BOGO
 * - Descuentos por porcentaje o monto fijo
 * - Gestión de vigencia y canales
 *
 * Created: 2025-01-17
 */

"use client";

import { useState } from "react";
import {
  usePromotions,
  usePromotionsStats,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  useTogglePromotionActive,
  useDuplicatePromotion,
} from "../../hooks/usePromotions";
import { PromotionType, DiscountType, AppliesTo } from "../../types";
import type { PromotionFormData } from "../../types";

// Helper function to get readable promotion type labels
function getPromotionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    BUY_X_GET_Y: "2x1 / 3x2",
    PERCENTAGE_DISCOUNT: "Descuento %",
    FIXED_DISCOUNT: "Descuento Fijo",
    BUNDLE: "Bundle",
    FREE_SHIPPING: "Envío Gratis",
  };
  return labels[type] || type;
}

export function PromotionsTab() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<string | null>(null);
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
  const { data: promotionsData, isLoading, error } = usePromotions(filters, page, 20);
  const { data: stats } = usePromotionsStats();

  // Mutations
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();
  const deleteMutation = useDeletePromotion();
  const toggleActiveMutation = useTogglePromotionActive();
  const duplicateMutation = useDuplicatePromotion();

  // Handle form submission
  const handleCreatePromotion = async () => {
    if (!formData.name || !formData.type || !formData.discountType || !formData.appliesTo || !formData.startAt) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    const result = await createMutation.mutateAsync(formData as PromotionFormData);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Promociones</h2>
          <p className="text-gray-600 dark:text-gray-300">Gestiona promociones automáticas (2x1, 3x2, descuentos)</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          + Nueva Promoción
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">Activas</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-200">{stats?.active ?? 0}</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Programadas</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-200">{stats?.scheduled ?? 0}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Expiradas</div>
          <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{stats?.expired ?? 0}</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total</div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-200">{stats?.total ?? 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filters.isActive === undefined ? "" : filters.isActive.toString()}
          onChange={(e) => setFilters({ ...filters, isActive: e.target.value === "" ? undefined : e.target.value === "true" })}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todas las promociones</option>
          <option value="true">Solo activas</option>
          <option value="false">Solo inactivas</option>
        </select>

        <select
          value={filters.type || ""}
          onChange={(e) => setFilters({ ...filters, type: e.target.value as PromotionType || undefined })}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todos los tipos</option>
          <option value="BUY_X_GET_Y">2x1 / 3x2</option>
          <option value="PERCENTAGE_DISCOUNT">Descuento Porcentaje</option>
          <option value="FIXED_DISCOUNT">Descuento Fijo</option>
          <option value="BUNDLE">Bundle</option>
          <option value="FREE_SHIPPING">Envío Gratis</option>
        </select>
      </div>

      {/* Promotions List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Promociones {filters.isActive === true && "Activas"} {filters.isActive === false && "Inactivas"}
          </h3>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-2">Cargando promociones...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-12 text-center">
            <div className="text-red-600 mb-2">Error al cargar promociones</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!promotionsData?.items || promotionsData.items.length === 0) && (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay promociones creadas
            </h3>
            <p className="text-gray-500 mb-4">
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
        {!isLoading && !error && promotionsData && promotionsData.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Descuento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vigencia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Usos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {promotionsData.items.map((promotion) => (
                  <tr key={promotion.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{promotion.name}</div>
                      {promotion.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{promotion.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {getPromotionTypeLabel(promotion.type)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {promotion.discountType === "PERCENTAGE" ? `${promotion.discountValue}%` : `$${promotion.discountValue}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <div>{new Date(promotion.startAt).toLocaleDateString()}</div>
                      {promotion.endAt && (
                        <div className="text-xs">{new Date(promotion.endAt).toLocaleDateString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {promotion.usageCount} {promotion.maxUsesTotal && `/ ${promotion.maxUsesTotal}`}
                    </td>
                    <td className="px-6 py-4">
                      {promotion.isActive ? (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                          Activa
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-full">
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => toggleActiveMutation.mutate({ id: promotion.id, isActive: !promotion.isActive })}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        disabled={toggleActiveMutation.isPending}
                      >
                        {promotion.isActive ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => duplicateMutation.mutate(promotion.id)}
                        className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-100"
                        disabled={duplicateMutation.isPending}
                      >
                        Duplicar
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("¿Eliminar esta promoción?")) {
                            deleteMutation.mutate(promotion.id);
                          }
                        }}
                        className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        disabled={deleteMutation.isPending}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {promotionsData.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Página {page} de {promotionsData.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(promotionsData.totalPages, p + 1))}
                    disabled={page === promotionsData.totalPages}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Promotion Types Examples */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          📚 Tipos de Promociones Disponibles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-semibold text-gray-900 mb-1">BOGO & 2x1</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Compra X y lleva Y gratis o con descuento
            </p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="text-2xl mb-2">💰</div>
            <h4 className="font-semibold text-gray-900 mb-1">Descuentos</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Porcentaje o monto fijo en productos/categorías
            </p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="text-2xl mb-2">📦</div>
            <h4 className="font-semibold text-gray-900 mb-1">Bundles</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Paquetes de productos con precio especial
            </p>
          </div>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black dark:bg-opacity-70 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nueva Promoción</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre de la Promoción *
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="ej: Black Friday 2x1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                  placeholder="Descripción de la promoción"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Promoción *
                  </label>
                  <select
                    value={formData.type || ""}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="BUY_X_GET_Y">2x1 / 3x2</option>
                    <option value="PERCENTAGE_DISCOUNT">Descuento por Porcentaje</option>
                    <option value="FIXED_DISCOUNT">Descuento Monto Fijo</option>
                    <option value="FREE_SHIPPING">Envío Gratis</option>
                    <option value="BUNDLE">Bundle de Productos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Descuento *
                  </label>
                  <select
                    value={formData.discountType || ""}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="PERCENTAGE">Porcentaje</option>
                    <option value="FIXED_AMOUNT">Monto Fijo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valor del Descuento *
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue || 0}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Se Aplica A *
                  </label>
                  <select
                    value={formData.appliesTo || ""}
                    onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value as AppliesTo })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="ALL_PRODUCTS">Todos los Productos</option>
                    <option value="SPECIFIC_PRODUCTS">Productos Específicos</option>
                    <option value="SPECIFIC_CATEGORIES">Categorías Específicas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha Inicio *
                  </label>
                  <input
                    type="date"
                    value={formData.startAt ? new Date(formData.startAt).toISOString().split('T')[0] : ""}
                    onChange={(e) => setFormData({ ...formData, startAt: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha Fin (Opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.endAt ? new Date(formData.endAt).toISOString().split('T')[0] : ""}
                    onChange={(e) => setFormData({ ...formData, endAt: e.target.value ? new Date(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Monto Mínimo de Compra
                  </label>
                  <input
                    type="number"
                    value={formData.minPurchaseAmount || ""}
                    onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Usos Máximos Totales
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsesTotal || ""}
                    onChange={(e) => setFormData({ ...formData, maxUsesTotal: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                    placeholder="Ilimitado"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">Activar promoción inmediatamente</span>
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  disabled={createMutation.isPending}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePromotion}
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? "Creando..." : "Crear Promoción"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
