/**
 * 🛍️ PRODUCT SKELETON LOADERS
 * ============================
 *
 * Skeleton loaders elegantes para productos del storefront
 * Imitan el diseño exacto de ProfessionalProductCard
 *
 * Enterprise: 2025-01-26 - Elegant loading states
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";
import { Skeleton } from "@/shared/ui/components";

interface ProductSkeletonProps {
  variant?: "grid" | "list";
  className?: string;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({
  variant = "grid",
  className,
}) => {
  if (variant === "list") {
    return (
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4",
          "hover:shadow-md transition-all duration-300",
          className
        )}
      >
        <div className="flex gap-4">
          {/* Image skeleton */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>

          {/* Content skeleton */}
          <div className="flex-1 min-w-0">
            <div className="space-y-3">
              {/* Brand + Title */}
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="w-3 h-3 rounded-full" />
                  ))}
                </div>
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-12" />
              </div>

              {/* Price */}
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>

          {/* Action skeleton */}
          <div className="flex flex-col justify-between">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-24 h-8 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700",
        "overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1 transform-gpu",
        className
      )}
    >
      {/* Image container skeleton */}
      <div className="relative aspect-square">
        <Skeleton className="w-full h-full" />

        {/* Badge skeleton */}
        <div className="absolute top-3 left-3">
          <Skeleton className="w-16 h-5 rounded-full" />
        </div>

        {/* Wishlist button skeleton */}
        <div className="absolute top-3 right-3">
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>

        {/* Stock indicator skeleton */}
        <div className="absolute bottom-3 left-3">
          <Skeleton className="w-20 h-5 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Brand + Title */}
        <div>
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-5 w-full mb-1" />
          <Skeleton className="h-5 w-3/4" />
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-4 h-4 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-12" />
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* Add to cart button */}
        <Skeleton className="w-full h-12 rounded-xl" />

        {/* Delivery info */}
        <Skeleton className="h-3 w-32 mx-auto" />
      </div>
    </div>
  );
};

// Grid of product skeletons
interface ProductSkeletonGridProps {
  count?: number;
  variant?: "grid" | "list";
  className?: string;
}

export const ProductSkeletonGrid: React.FC<ProductSkeletonGridProps> = ({
  count = 8,
  variant = "grid",
  className,
}) => {
  if (variant === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <ProductSkeleton key={i} variant="list" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} variant="grid" />
      ))}
    </div>
  );
};

// Category skeleton
export const CategorySkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700",
        "p-6 transition-all duration-300 hover:shadow-md",
        className
      )}
    >
      {/* Icon + Title */}
      <div className="flex items-start space-x-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>

      {/* Popularity indicator */}
      <div className="mt-3">
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
};

// Category grid skeleton
export const CategorySkeletonGrid: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 6, className }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CategorySkeleton key={i} />
      ))}
    </div>
  );
};

// Full page skeleton for storefront
export const StorefrontPageSkeleton: React.FC<{
  showFilters?: boolean;
  productCount?: number;
  variant?: "grid" | "list";
}> = ({ showFilters = true, productCount = 8, variant = "grid" }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Header skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search + title */}
            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-10 w-full max-w-md" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          {showFilters && (
            <div className="w-full lg:w-80 space-y-6">
              {/* Filter sections */}
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3"
                >
                  <Skeleton className="h-5 w-24 mb-3" />
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="flex items-center space-x-2">
                        <Skeleton className="w-4 h-4 rounded-sm" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-6 ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Products grid */}
          <div className="flex-1">
            <ProductSkeletonGrid count={productCount} variant={variant} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Overview page skeleton (Hero + Featured products + Categories)
export const OverviewPageSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Hero Section Skeleton */}
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
          {/* Hero content */}
          <div className="relative z-10 py-24 lg:py-32">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-12 w-96 mx-auto" />
                <Skeleton className="h-6 w-128 mx-auto" />
                <Skeleton className="h-6 w-96 mx-auto" />
              </div>

              {/* Search bar */}
              <div className="max-w-2xl mx-auto">
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center space-x-8 text-white/80">
                <div className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-16 space-y-16">
        {/* Featured Products Section */}
        <section>
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <ProductSkeletonGrid count={4} variant="grid" />
        </section>

        {/* Popular Categories Section */}
        <section>
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-72 mx-auto mb-4" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
          <CategorySkeletonGrid count={6} />
        </section>

        {/* Features/Benefits Section */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4">
                  <Skeleton className="w-full h-full rounded-full" />
                </div>
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-48 mx-auto mb-1" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-12">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <Skeleton className="h-8 w-80 mx-auto" />
            <Skeleton className="h-5 w-96 mx-auto" />
            <div className="flex max-w-md mx-auto gap-3">
              <Skeleton className="flex-1 h-12 rounded-lg" />
              <Skeleton className="w-32 h-12 rounded-lg" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// Categories page skeleton
export const CategoriesPageSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Header skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title + search */}
            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-10 w-full max-w-md" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-16 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Categories grid */}
        <CategorySkeletonGrid count={12} />
      </div>
    </div>
  );
};

export default ProductSkeleton;
