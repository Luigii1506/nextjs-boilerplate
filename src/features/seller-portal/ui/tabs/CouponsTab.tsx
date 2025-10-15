/**
 * 🎟️ COUPONS TAB - Seller Portal
 * ================================
 *
 * CRUD de cupones de descuento
 * - Crear códigos de cupón
 * - Gestionar vigencia y límites
 * - Tracking de uso
 *
 * Created: 2025-01-17
 * Updated: 2025-01-17 - Full backend integration
 */

"use client";

import { useState } from "react";
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

// Helper function to get readable coupon type labels
function getCouponTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    GENERAL: "General",
    FIRST_PURCHASE: "Primera Compra",
    LOYALTY: "Fidelidad",
    SEASONAL: "Temporal",
    CART_ABANDONMENT: "Carrito Abandonado",
  };
  return labels[type] || type;
}

export function CouponsTab() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    isActive: undefined as boolean | undefined,
    type: undefined as CouponType | undefined,
  });
  const [page, setPage] = useState(1);

  // Form state
  const [formData, setFormData] = useState<Partial<CouponFormData>>({
    code: "",
    name: "",
    description: "",
    type: "GENERAL" as CouponType,
    discountType: "PERCENTAGE" as DiscountType,
    discountValue: 0,
    appliesTo: "ALL_PRODUCTS" as AppliesTo,
    startAt: new Date(),
    isActive: true,
    maxUsesPerUser: 1,
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

  // Handle form submission
  const handleCreateCoupon = async () => {
    if (!formData.code || !formData.name || !formData.type || !formData.discountType || !formData.appliesTo) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    const result = await createMutation.mutateAsync(formData as CouponFormData);

    if (result.success) {
      setShowCreateForm(false);
      // Reset form
      setFormData({
        code: "",
        name: "",
        description: "",
        type: "GENERAL" as CouponType,
        discountType: "PERCENTAGE" as DiscountType,
        discountValue: 0,
        appliesTo: "ALL_PRODUCTS" as AppliesTo,
        startAt: new Date(),
        isActive: true,
        maxUsesPerUser: 1,
        availableChannels: [],
      });
    } else {
      alert(result.error || "Error al crear cupón");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cupones de Descuento</h2>
          <p className="text-gray-600 dark:text-gray-300">Crea y gestiona códigos de cupón para tus clientes</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          + Nuevo Cupón
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">Activos</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-200">{stats?.active ?? 0}</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Usos Totales</div>
          <div className="text-2xl font-bold text-blue-700">{stats?.totalUsage ?? 0}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Expirados</div>
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
          <option value="">Todos los cupones</option>
          <option value="true">Solo activos</option>
          <option value="false">Solo inactivos</option>
        </select>

        <select
          value={filters.type || ""}
          onChange={(e) => setFilters({ ...filters, type: e.target.value as CouponType || undefined })}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todos los tipos</option>
          <option value="GENERAL">General</option>
          <option value="FIRST_PURCHASE">Primera Compra</option>
          <option value="LOYALTY">Fidelidad</option>
          <option value="SEASONAL">Temporal</option>
          <option value="CART_ABANDONMENT">Carrito Abandonado</option>
        </select>
      </div>

      {/* Coupons List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cupones</h3>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-2">Cargando cupones...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-12 text-center">
            <div className="text-red-600 mb-2">Error al cargar cupones</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!couponsData?.items || couponsData.items.length === 0) && (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🎟️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay cupones creados
            </h3>
            <p className="text-gray-500 mb-4">
              Crea cupones de descuento para tus campañas de marketing
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
        {!isLoading && !error && couponsData && couponsData.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Código</th>
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
                {couponsData.items.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-blue-600">{coupon.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{coupon.name}</div>
                      {coupon.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{coupon.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {getCouponTypeLabel(coupon.type)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {coupon.startAt && <div>{new Date(coupon.startAt).toLocaleDateString()}</div>}
                      {coupon.endAt && (
                        <div className="text-xs">{new Date(coupon.endAt).toLocaleDateString()}</div>
                      )}
                      {!coupon.startAt && !coupon.endAt && <div className="text-gray-400">Sin límite</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {coupon.usageCount} {coupon.maxUsesTotal && `/ ${coupon.maxUsesTotal}`}
                      <div className="text-xs text-gray-500 dark:text-gray-400">Máx. {coupon.maxUsesPerUser}/usuario</div>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.isActive ? (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-full">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => toggleActiveMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        disabled={toggleActiveMutation.isPending}
                      >
                        {coupon.isActive ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => duplicateMutation.mutate(coupon.id)}
                        className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-100"
                        disabled={duplicateMutation.isPending}
                      >
                        Duplicar
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar cupón ${coupon.code}?`)) {
                            deleteMutation.mutate(coupon.id);
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
            {couponsData.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Página {page} de {couponsData.totalPages}
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
                    onClick={() => setPage(p => Math.min(couponsData.totalPages, p + 1))}
                    disabled={page === couponsData.totalPages}
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

      {/* Coupon Examples */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          📚 Ejemplos de Cupones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="font-mono text-lg font-bold text-blue-600 mb-2">
              SUMMER2024
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              20% de descuento en toda la tienda
            </p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="font-mono text-lg font-bold text-green-600 mb-2">
              WELCOME10
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              $10 de descuento para nuevos clientes
            </p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="font-mono text-lg font-bold text-purple-600 mb-2">
              LOYALTY50
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              50% en productos seleccionados
            </p>
          </div>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black dark:bg-opacity-70 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nuevo Cupón</h3>
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
                  Código del Cupón * (mayúsculas, alfanumérico)
                </label>
                <input
                  type="text"
                  value={formData.code || ""}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono"
                  placeholder="SUMMER2024"
                  required
                  maxLength={20}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Mínimo 3 caracteres, solo letras y números
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre Interno *
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Promoción Verano 2024"
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
                  placeholder="Descripción para el cliente"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Cupón *
                  </label>
                  <select
                    value={formData.type || ""}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="GENERAL">General</option>
                    <option value="FIRST_PURCHASE">Primera Compra</option>
                    <option value="LOYALTY">Fidelidad</option>
                    <option value="SEASONAL">Temporal</option>
                    <option value="CART_ABANDONMENT">Carrito Abandonado</option>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Usos por Usuario *
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsesPerUser || 1}
                    onChange={(e) => setFormData({ ...formData, maxUsesPerUser: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1"
                    required
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
                  <span className="text-sm text-gray-700 dark:text-gray-200">Activar cupón inmediatamente</span>
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
                  onClick={handleCreateCoupon}
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:dark:bg-gray-800 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? "Creando..." : "Crear Cupón"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
