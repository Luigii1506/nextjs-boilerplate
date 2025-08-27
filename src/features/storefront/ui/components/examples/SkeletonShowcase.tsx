/**
 * 💀 SKELETON LOADERS SHOWCASE
 * ============================
 *
 * Demonstración de todos los skeleton loaders elegantes
 * implementados para el storefront
 *
 * Enterprise: 2025-01-26 - Skeleton loaders showcase
 */

"use client";

import React, { useState } from "react";
import { cn } from "@/shared/utils";
import {
  ProductSkeleton,
  ProductSkeletonGrid,
  CategorySkeleton,
  CategorySkeletonGrid,
  StorefrontPageSkeleton,
  OverviewPageSkeleton,
  CategoriesPageSkeleton,
} from "../shared/ProductSkeleton";

interface ShowcaseCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

const ShowcaseCard: React.FC<ShowcaseCardProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6",
        className
      )}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {description}
        </p>
      </div>
      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {children}
      </div>
    </div>
  );
};

export const SkeletonShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>("products");

  const demos = [
    {
      id: "products",
      name: "Product Cards",
      description: "Elegant product loading states",
    },
    {
      id: "categories",
      name: "Category Cards",
      description: "Category loading placeholders",
    },
    {
      id: "page-overview",
      name: "Overview Page",
      description: "Complete homepage skeleton",
    },
    {
      id: "page-storefront",
      name: "Products Page",
      description: "Full products page skeleton",
    },
    {
      id: "page-categories",
      name: "Categories Page",
      description: "Categories page skeleton",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            💀 Skeleton Loaders Showcase
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Elegant loading states que mejoran la UX eliminando spinners y
            proporcionando preview del contenido real
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {demos.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                  activeDemo === demo.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                {demo.name}
              </button>
            ))}
          </div>
        </div>

        {/* Showcase Content */}
        <div className="space-y-8">
          {activeDemo === "products" && (
            <>
              <ShowcaseCard
                title="Single Product Card - Grid"
                description="Skeleton para tarjeta de producto individual en vista grid"
              >
                <div className="p-6 bg-gray-50 dark:bg-gray-900">
                  <div className="max-w-sm mx-auto">
                    <ProductSkeleton variant="grid" />
                  </div>
                </div>
              </ShowcaseCard>

              <ShowcaseCard
                title="Single Product Card - List"
                description="Skeleton para tarjeta de producto individual en vista lista"
              >
                <div className="p-6 bg-gray-50 dark:bg-gray-900">
                  <ProductSkeleton variant="list" />
                </div>
              </ShowcaseCard>

              <ShowcaseCard
                title="Products Grid"
                description="Grid completo de productos con skeleton loading"
              >
                <div className="p-6 bg-gray-50 dark:bg-gray-900">
                  <ProductSkeletonGrid count={6} variant="grid" />
                </div>
              </ShowcaseCard>

              <ShowcaseCard
                title="Products List"
                description="Lista de productos con skeleton loading"
              >
                <div className="p-6 bg-gray-50 dark:bg-gray-900">
                  <ProductSkeletonGrid count={4} variant="list" />
                </div>
              </ShowcaseCard>
            </>
          )}

          {activeDemo === "categories" && (
            <>
              <ShowcaseCard
                title="Single Category Card"
                description="Skeleton para tarjeta de categoría individual"
              >
                <div className="p-6 bg-gray-50 dark:bg-gray-900">
                  <div className="max-w-sm mx-auto">
                    <CategorySkeleton />
                  </div>
                </div>
              </ShowcaseCard>

              <ShowcaseCard
                title="Categories Grid"
                description="Grid completo de categorías con skeleton loading"
              >
                <div className="p-6 bg-gray-50 dark:bg-gray-900">
                  <CategorySkeletonGrid count={6} />
                </div>
              </ShowcaseCard>
            </>
          )}

          {activeDemo === "page-overview" && (
            <ShowcaseCard
              title="Overview Page Skeleton"
              description="Skeleton completo para la página de overview con hero, productos destacados y categorías"
              className="max-w-none"
            >
              <div className="max-h-96 overflow-y-auto">
                <OverviewPageSkeleton />
              </div>
            </ShowcaseCard>
          )}

          {activeDemo === "page-storefront" && (
            <ShowcaseCard
              title="Storefront Page Skeleton"
              description="Skeleton completo para la página de productos con filtros y grid"
              className="max-w-none"
            >
              <div className="max-h-96 overflow-y-auto">
                <StorefrontPageSkeleton
                  showFilters={true}
                  productCount={8}
                  variant="grid"
                />
              </div>
            </ShowcaseCard>
          )}

          {activeDemo === "page-categories" && (
            <ShowcaseCard
              title="Categories Page Skeleton"
              description="Skeleton completo para la página de categorías con stats"
              className="max-w-none"
            >
              <div className="max-h-96 overflow-y-auto">
                <CategoriesPageSkeleton />
              </div>
            </ShowcaseCard>
          )}
        </div>

        {/* Features */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            ✨ Características de los Skeleton Loaders
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 dark:text-blue-400 text-xl">
                  🎨
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Diseño Fiel
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Imitan exactamente el diseño de las tarjetas reales
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 dark:text-green-400 text-xl">
                  ⚡
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Sin Parpadeos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Eliminan el "flash" de contenido vacío durante la carga
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 dark:text-purple-400 text-xl">
                  🔄
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Animación Sutil
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Pulso suave que indica que el contenido se está cargando
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 dark:text-orange-400 text-xl">
                  📱
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Responsive
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Se adaptan perfectamente a todos los tamaños de pantalla
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-red-600 dark:text-red-400 text-xl">
                  🌙
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Dark Mode
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Soporte completo para tema claro y oscuro
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 dark:text-indigo-400 text-xl">
                  🎯
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                UX Premium
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Mejora percibida de velocidad y profesionalismo
              </p>
            </div>
          </div>
        </div>

        {/* Implementation Note */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Implementación Automática
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Los skeleton loaders se activan automáticamente en el storefront
                durante:
                <br />• <strong>Carga inicial</strong> de productos, categorías
                y overview
                <br />• <strong>Navegación</strong> entre tabs del storefront
                <br />• <strong>Filtrado y búsqueda</strong> de productos
                <br />
                Reemplazando completamente los spinners tradicionales por una
                experiencia más elegante.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonShowcase;
