/**
 * 🛒 CategoriesTab - Professional E-commerce Categories Page
 *
 * Amazon/eBay-inspired categories catalog with:
 * - Advanced category browsing
 * - Professional grid layouts
 * - Category statistics
 * - Beautiful animations
 * - Responsive design
 * - Search and filtering
 *
 * @version 2.0.0
 * @author Storefront Team
 */

"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Filter,
  Grid,
  List,
  ChevronDown,
  Package,
  TrendingUp,
  ArrowRight,
  Layers,
  Eye,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Sparkles,
} from "lucide-react";

// Import Context and Types
import { useStorefrontContext } from "../../..";
import { CategoryForCustomer } from "../../../types";
import { CategoriesPageSkeleton } from "../shared/ProductSkeleton";

// Define interface for category filters
interface CategoryFilters {
  searchTerm: string;
  sortBy: "name" | "popularity" | "product_count" | "newest";
  productCountRange: [number, number];
  showFeatured: boolean;
  showPopular: boolean;
}

interface CategorySortOption {
  id: string;
  label: string;
  value: string;
}

const CATEGORY_SORT_OPTIONS: CategorySortOption[] = [
  { id: "popularity", label: "Más Populares", value: "popularity" },
  { id: "name", label: "Nombre A-Z", value: "name" },
  {
    id: "product_count",
    label: "Mayor Cantidad de Productos",
    value: "product_count",
  },
  { id: "newest", label: "Más Recientes", value: "newest" },
];

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48];

/**
 * 🛒 Main CategoriesTab Component
 */
const CategoriesTab: React.FC = () => {
  const {
    categories,
    stats,
    setActiveTab,
    globalSearchTerm,
    setGlobalSearchTerm,
  } = useStorefrontContext();

  // 🎯 Component State
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [allowAnimations, setAllowAnimations] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearchTerm, setLocalSearchTerm] = useState(globalSearchTerm);

  // Filters State
  const [filters, setFilters] = useState<CategoryFilters>({
    searchTerm: "",
    sortBy: "popularity",
    productCountRange: [0, 1000],
    showFeatured: false,
    showPopular: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🎨 Anti-flicker Animation Setup
  useEffect(() => {
    if (isFirstRender) {
      timeoutRef.current = setTimeout(() => {
        setAllowAnimations(true);
        setIsFirstRender(false);
      }, 100);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isFirstRender]);

  // 🔍 Search Term Sync
  useEffect(() => {
    setLocalSearchTerm(globalSearchTerm);
    setFilters((prev) => ({ ...prev, searchTerm: globalSearchTerm }));
  }, [globalSearchTerm]);

  // 📊 Processed Categories with Filtering & Sorting
  const processedCategories = useMemo(() => {
    // Safety check: ensure categories is an array
    if (!categories || !Array.isArray(categories)) {
      console.warn("CategoriesTab: categories is not an array:", categories);
      return [];
    }

    let results = [...categories];

    // Apply search filter
    if (localSearchTerm.trim()) {
      const searchLower = localSearchTerm.toLowerCase();
      results = results.filter(
        (category) =>
          category.name.toLowerCase().includes(searchLower) ||
          category.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply product count range filter
    results = results.filter(
      (category) =>
        (category.productCount || 0) >= filters.productCountRange[0] &&
        (category.productCount || 0) <= filters.productCountRange[1]
    );

    // Apply featured filter
    if (filters.showFeatured) {
      results = results.filter((category) => category.featured);
    }

    // Apply popular filter
    if (filters.showPopular) {
      results = results.filter((category) => category.isPopular);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "name":
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "product_count":
        results.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
        break;
      case "newest":
        results.sort(
          (a, b) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        );
        break;
      default: // popularity
        results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
    }

    return results;
  }, [categories, localSearchTerm, filters]);

  // 📄 Pagination
  const totalPages = Math.ceil(processedCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = processedCategories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // 🔧 Filter Handlers
  const handleSortChange = useCallback((sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as CategoryFilters["sortBy"],
    }));
    setCurrentPage(1);
  }, []);

  const handleProductCountRangeFilter = useCallback(
    (range: [number, number]) => {
      setFilters((prev) => ({ ...prev, productCountRange: range }));
      setCurrentPage(1);
    },
    []
  );

  const handleSpecialFilterChange = useCallback(
    (key: keyof CategoryFilters, value: boolean | string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      sortBy: "popularity",
      productCountRange: [0, 1000],
      showFeatured: false,
      showPopular: false,
    });
    setLocalSearchTerm("");
    setGlobalSearchTerm("");
    setCurrentPage(1);
  }, [setGlobalSearchTerm]);

  // 📄 Pagination Handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top of categories
    document.getElementById("categories-grid")?.scrollIntoView({
      behavior: "smooth",
    });
  }, []);

  // 🎯 Category Navigation Handler
  const handleCategoryClick = useCallback(
    (_category: CategoryForCustomer) => {
      // Navigate to products tab with category filter
      // TODO: Implement category filtering in products tab
      setActiveTab("products");
    },
    [setActiveTab]
  );

  // Loading State with elegant skeleton
  if (isFirstRender) {
    return <CategoriesPageSkeleton />;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Categories Header */}
      <CategoriesHeader
        searchTerm={localSearchTerm}
        onSearchChange={setLocalSearchTerm}
        sortBy={filters.sortBy}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCategories={processedCategories.length}
        allowAnimations={allowAnimations}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Stats */}
        <CategoriesStats
          stats={{
            featuredCategoriesCount: stats?.featuredCategoriesCount ?? 0,
            avgProductsPerCategory: stats?.avgProductsPerCategory ?? 0,
            mostPopularCategory: stats?.mostPopularCategory ?? "",
          }}
          totalCategories={processedCategories.length}
          allowAnimations={allowAnimations}
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Filters Sidebar */}
          <CategoriesFilters
            filters={filters}
            onProductCountRangeFilter={handleProductCountRangeFilter}
            onSpecialFilterChange={handleSpecialFilterChange}
            onClearFilters={clearAllFilters}
            allowAnimations={allowAnimations}
          />

          {/* Categories Content */}
          <div className="flex-1">
            {/* Results Summary */}
            <div
              className={cn(
                "flex items-center justify-between mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm",
                allowAnimations && "animate-customerFadeInUp"
              )}
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {processedCategories.length} categorías disponibles
                </h2>
                {localSearchTerm && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Resultados para:{" "}
                    <span className="font-medium">
                      &ldquo;{localSearchTerm}&rdquo;
                    </span>
                  </p>
                )}
              </div>

              {/* Items Per Page */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrar:
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option} por página
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Categories Grid */}
            <CategoriesGrid
              categories={paginatedCategories}
              viewMode={viewMode}
              onCategoryClick={handleCategoryClick}
              allowAnimations={allowAnimations}
            />

            {/* Pagination */}
            <CategoriesPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              allowAnimations={allowAnimations}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎯 Categories Header Component
interface CategoriesHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  totalCategories: number;
  allowAnimations: boolean;
}

const CategoriesHeader: React.FC<CategoriesHeaderProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalCategories,
  allowAnimations,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          className={cn(
            "space-y-4",
            allowAnimations && "animate-customerFadeInUp"
          )}
        >
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Categorías
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explora por categorías de productos
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange("grid")}
                className={cn(
                  "p-2 rounded-md transition-all duration-200",
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-800 shadow-sm text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => onViewModeChange("list")}
                className={cn(
                  "p-2 rounded-md transition-all duration-200",
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-800 shadow-sm text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                )}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search & Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar categorías por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-green-500 focus:border-transparent
                         placeholder:text-gray-500 dark:placeholder:text-gray-400
                         transition-all duration-200"
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                           text-gray-900 dark:text-gray-100 px-4 py-3 pr-10 rounded-lg
                           focus:ring-2 focus:ring-green-500 focus:border-transparent
                           transition-all duration-200"
                >
                  {CATEGORY_SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Results Count */}
              <div className="hidden lg:flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{totalCategories}</span>
                <span className="ml-1">categorías</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 📊 Categories Stats Component
interface CategoriesStatsProps {
  stats: {
    featuredCategoriesCount: number;
    avgProductsPerCategory: number;
    mostPopularCategory: string;
  };
  totalCategories: number;
  allowAnimations: boolean;
}

const CategoriesStats: React.FC<CategoriesStatsProps> = ({
  stats,
  totalCategories,
  allowAnimations,
}) => {
  const categoryStats = useMemo(() => {
    return {
      totalCategories: totalCategories,
      featuredCategories: stats?.featuredCategoriesCount || 0,
      avgProductsPerCategory: stats?.avgProductsPerCategory || 0,
      mostPopularCategory: stats?.mostPopularCategory || "Electrónicos",
    };
  }, [stats, totalCategories]);

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
        allowAnimations && "animate-customerFadeInUp customer-stagger-1"
      )}
    >
      {/* Total Categories */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {categoryStats.totalCategories}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Categorías Totales
            </p>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {categoryStats.featuredCategories}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Destacadas
            </p>
          </div>
        </div>
      </div>

      {/* Avg Products */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {categoryStats.avgProductsPerCategory}
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Promedio por Categoría
            </p>
          </div>
        </div>
      </div>

      {/* Most Popular */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-orange-900 dark:text-orange-100 truncate">
              {categoryStats.mostPopularCategory}
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Más Popular
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎛️ Categories Filters Sidebar
interface CategoriesFiltersProps {
  filters: CategoryFilters;
  onProductCountRangeFilter: (range: [number, number]) => void;
  onSpecialFilterChange: (
    key: keyof CategoryFilters,
    value: string | number | boolean | [number, number]
  ) => void;
  onClearFilters: () => void;
  allowAnimations: boolean;
}

const CategoriesFilters: React.FC<CategoriesFiltersProps> = ({
  filters,
  onProductCountRangeFilter,
  onSpecialFilterChange,
  onClearFilters,
  allowAnimations,
}) => {
  const productCountRanges = [
    { label: "1-10 productos", min: 1, max: 10 },
    { label: "11-50 productos", min: 11, max: 50 },
    { label: "51-100 productos", min: 51, max: 100 },
    { label: "100+ productos", min: 100, max: 1000 },
  ];

  const activeFiltersCount =
    (filters.showFeatured ? 1 : 0) + (filters.showPopular ? 1 : 0);

  return (
    <div
      className={cn(
        "w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm h-fit",
        allowAnimations && "animate-customerFadeInUp customer-stagger-1"
      )}
    >
      {/* Filters Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Filtros
            </h3>
            {activeFiltersCount > 0 && (
              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filters Content */}
      <div className="p-6 space-y-8">
        {/* Product Count Range */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Cantidad de Productos
          </h4>
          <div className="space-y-2">
            {productCountRanges.map((range, index) => (
              <label
                key={index}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg"
              >
                <input
                  type="radio"
                  name="productCountRange"
                  checked={
                    filters.productCountRange[0] === range.min &&
                    filters.productCountRange[1] === range.max
                  }
                  onChange={() =>
                    onProductCountRangeFilter([range.min, range.max])
                  }
                  className="text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Special Filters */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Características
          </h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg">
              <input
                type="checkbox"
                checked={filters.showFeatured}
                onChange={(e) =>
                  onSpecialFilterChange("showFeatured", e.target.checked)
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Categorías Destacadas
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-auto">
                ⭐ STAR
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg">
              <input
                type="checkbox"
                checked={filters.showPopular}
                onChange={(e) =>
                  onSpecialFilterChange("showPopular", e.target.checked)
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Más Populares
              </span>
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full ml-auto">
                🔥 HOT
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🛍️ Categories Grid Component
interface CategoriesGridProps {
  categories: CategoryForCustomer[];
  viewMode: "grid" | "list";
  onCategoryClick: (category: CategoryForCustomer) => void;
  allowAnimations: boolean;
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories,
  viewMode,
  onCategoryClick,
  allowAnimations,
}) => {
  if (categories.length === 0) {
    return (
      <div
        className={cn(
          "text-center py-16 bg-white dark:bg-gray-800 rounded-lg",
          allowAnimations && "animate-customerFadeInUp"
        )}
      >
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No se encontraron categorías
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Intenta ajustar tus filtros o términos de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div id="categories-grid">
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={onCategoryClick}
              className={cn(
                allowAnimations && `customer-stagger-${(index % 4) + 1}`
              )}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category, index) => (
            <CategoryCardList
              key={category.id}
              category={category}
              onClick={onCategoryClick}
              className={cn(
                allowAnimations && `customer-stagger-${(index % 3) + 1}`
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 📄 Categories Pagination Component
interface CategoriesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  allowAnimations: boolean;
}

const CategoriesPagination: React.FC<CategoriesPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  allowAnimations,
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const maxVisible = 7;
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const showLeftEllipsis = visiblePages[0] > 1;
  const showRightEllipsis = visiblePages[visiblePages.length - 1] < totalPages;

  return (
    <div
      className={cn(
        "flex items-center justify-center space-x-2 mt-12 py-8",
        allowAnimations && "animate-customerFadeInUp"
      )}
    >
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200",
          currentPage === 1
            ? "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      {/* First Page */}
      {showLeftEllipsis && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            1
          </button>
          <span className="text-gray-400">...</span>
        </>
      )}

      {/* Visible Pages */}
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            "w-10 h-10 rounded-lg border transition-all duration-200",
            page === currentPage
              ? "bg-green-600 border-green-600 text-white shadow-lg"
              : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          )}
        >
          {page}
        </button>
      ))}

      {/* Last Page */}
      {showRightEllipsis && (
        <>
          <span className="text-gray-400">...</span>
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200",
          currentPage === totalPages
            ? "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        )}
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// 🛒 Category Card (Grid Version)
interface CategoryCardProps {
  category: CategoryForCustomer;
  onClick: (category: CategoryForCustomer) => void;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onClick,
  className,
}) => {
  return (
    <div
      className={cn(
        "group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer",
        "hover:border-gray-200 dark:hover:border-gray-600 hover:scale-105",
        className
      )}
      onClick={() => onClick(category)}
    >
      {/* Category Image/Icon */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
        {/* Featured Badge */}
        {category.featured && (
          <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            ⭐ Destacada
          </div>
        )}

        {/* Popular Badge */}
        {category.isPopular && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            🔥 Popular
          </div>
        )}

        {/* Category Icon Placeholder */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-400 rounded-xl flex items-center justify-center">
            <Layers className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <button className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>Ver productos</span>
          </button>
        </div>
      </div>

      {/* Category Info */}
      <div className="p-4">
        {/* Category Name */}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
          {category.name}
        </h3>

        {/* Description */}
        {category.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {category.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {category.productCount} productos
              </span>
            </div>
            {category.popularity && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  {category.popularity}% popular
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(category);
          }}
          className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
        >
          <span>Explorar Categoría</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// 📋 Category Card (List Version)
const CategoryCardList: React.FC<CategoryCardProps> = ({
  category,
  onClick,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer",
        "hover:border-gray-200 dark:hover:border-gray-600",
        className
      )}
      onClick={() => onClick(category)}
    >
      <div className="flex">
        {/* Category Image */}
        <div className="relative w-32 h-32 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
          {/* Badges */}
          {category.featured && (
            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
              ⭐
            </div>
          )}
          {category.isPopular && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
              🔥
            </div>
          )}

          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Category Info */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Category Name & Stats */}
              <div className="flex items-center space-x-4 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  {category.name}
                </h3>
                <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Package className="w-4 h-4" />
                    <span>{category.productCount} productos</span>
                  </span>
                  {category.popularity && (
                    <span className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                      <TrendingUp className="w-4 h-4" />
                      <span>{category.popularity}% popular</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {category.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {category.featured && (
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                    ⭐ Destacada
                  </span>
                )}
                {category.isPopular && (
                  <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs px-2 py-1 rounded-full">
                    🔥 Popular
                  </span>
                )}
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                  {category.productCount} productos
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(category);
                }}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <span>Explorar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesTab;
