/**
 * 🛒 ProductsTab - Professional E-commerce Products Page
 *
 * Amazon/eBay-inspired products catalog with:
 * - Advanced filtering & search
 * - Professional grid layouts
 * - Responsive design
 * - Beautiful animations
 * - Sorting & pagination
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
  Star,
  Package,
  X,
  Sliders,
  Eye,
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Import Context and Types
import { useStorefrontContext } from "../../..";
import { ProductForCustomer, CategoryForCustomer } from "../../../types";
import { AnimatedHeartButton } from "../shared/AnimatedHeartButton";
import { ProfessionalProductCard } from "../shared/ProfessionalProductCard";
import { StorefrontPageSkeleton } from "../shared/ProductSkeleton";

// Define interface for filters
interface ProductFilters {
  categories: string[];
  priceRange: [number, number];
  ratings: number[];
  brands: string[];
  inStock: boolean;
  onSale: boolean;
}

interface SortOption {
  id: string;
  label: string;
  value: string;
}

const SORT_OPTIONS: SortOption[] = [
  { id: "relevance", label: "Más Relevantes", value: "relevance" },
  { id: "price-asc", label: "Precio: Menor a Mayor", value: "price_asc" },
  { id: "price-desc", label: "Precio: Mayor a Menor", value: "price_desc" },
  { id: "rating", label: "Mejor Valorados", value: "rating" },
  { id: "newest", label: "Más Nuevos", value: "newest" },
  { id: "bestseller", label: "Más Vendidos", value: "bestseller" },
];

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];

/**
 * 🛒 Main ProductsTab Component
 */
const ProductsTab: React.FC = () => {
  const {
    products: filteredProducts,
    categories,
    globalSearchTerm,
    setGlobalSearchTerm,
    addToCartOptimistic,
    toggleWishlist,
    addToWishlist,
    openProductQuickView,
    isAddingToWishlist,
  } = useStorefrontContext();

  // 🎯 Component State
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [allowAnimations, setAllowAnimations] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearchTerm, setLocalSearchTerm] = useState(globalSearchTerm);

  // 💖 Wishlist Actions
  const onAddToWishlist = useCallback(
    async (product: ProductForCustomer) => {
      console.log("❤️ [ProductsTab] onAddToWishlist clicked", {
        productId: product.id,
        productName: product.name,
        isWishlisted: product.isWishlisted,
      });

      const result = await toggleWishlist(product);

      console.log("❤️ [ProductsTab] toggleWishlist result:", result);

      return result; // Return the result for AnimatedHeartButton
    },
    [toggleWishlist]
  );

  const onQuickView = useCallback(
    (product: ProductForCustomer) => {
      openProductQuickView(product);
    },
    [openProductQuickView]
  );

  const onAddToCart = useCallback(
    async (product: ProductForCustomer) => {
      await addToCartOptimistic(product, 1);
    },
    [addToCartOptimistic]
  );

  // Filters State
  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    priceRange: [0, 100000], // ← ARREGLADO: Rango más amplio para productos del seed
    ratings: [],
    brands: [],
    inStock: false, // ← ARREGLADO: No filtrar por stock por defecto
    onSale: false,
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
  }, [globalSearchTerm]);

  // 📊 Processed Products with Filtering & Sorting
  const processedProducts = useMemo(() => {
    // Safety check: ensure filteredProducts is an array
    if (!filteredProducts || !Array.isArray(filteredProducts)) {
      return [];
    }

    let results = [...filteredProducts];

    // Apply search filter
    if (localSearchTerm.trim()) {
      const searchLower = localSearchTerm.toLowerCase();
      results = results.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          (product.description?.toLowerCase() || "").includes(searchLower) ||
          (product.category?.toLowerCase() || "").includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower)
      );
      console.log("[ProductsTab DEBUG] After search filter:", results.length);
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      results = results.filter(
        (product) =>
          product.category && filters.categories.includes(product.category)
      );
      console.log("[ProductsTab DEBUG] After category filter:", results.length);
    }

    // Apply price range filter
    console.log("[ProductsTab DEBUG] Price range filter values:", {
      priceRange0: filters.priceRange[0],
      priceRange1: filters.priceRange[1],
      firstProduct: results[0],
      firstProductPrice: results[0]?.price,
      firstProductPublicPrice: results[0]?.publicPrice,
      firstProductCurrentPrice: results[0]?.currentPrice,
    });

    results = results.filter((product) => {
      // Use publicPrice, price, or currentPrice (whatever exists)
      const productPrice =
        product.publicPrice || product.price || product.currentPrice || 0;
      return (
        productPrice >= filters.priceRange[0] &&
        productPrice <= filters.priceRange[1]
      );
    });
    console.log("[ProductsTab DEBUG] After price filter:", results.length);

    // Apply rating filter
    if (filters.ratings.length > 0) {
      results = results.filter(
        (product) =>
          product.rating &&
          filters.ratings.some((rating) => product.rating! >= rating)
      );
    }

    // Apply stock filter
    if (filters.inStock) {
      results = results.filter((product) => product.stock && product.stock > 0);
      console.log("[ProductsTab DEBUG] After stock filter:", results.length);
    }

    // Apply sale filter
    if (filters.onSale) {
      results = results.filter((product) => product.isOnSale);
      console.log("[ProductsTab DEBUG] After sale filter:", results.length);
    }

    // Apply sorting
    const getProductPrice = (product: ProductForCustomer) =>
      product.publicPrice || product.price || product.currentPrice || 0;

    switch (sortBy) {
      case "price_asc":
        results.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        break;
      case "price_desc":
        results.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        break;
      case "rating":
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        results.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "bestseller":
        results.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      default: // relevance
        break;
    }

    console.log("[ProductsTab DEBUG] Returning processed results:", {
      count: results.length,
      firstProduct: results[0]?.name,
      searchTerm: localSearchTerm,
    });

    return results;
  }, [filteredProducts, localSearchTerm, filters, sortBy]);

  // 📄 Pagination
  const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = processedProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  console.log("[ProductsTab DEBUG] Pagination:", {
    totalPages,
    currentPage,
    startIndex,
    itemsPerPage,
    paginatedProducts: paginatedProducts.length,
    totalProducts: processedProducts.length,
  });

  // 🔧 Filter Handlers
  const handleCategoryFilter = useCallback((category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
    setCurrentPage(1);
  }, []);

  const handlePriceRangeFilter = useCallback((range: [number, number]) => {
    setFilters((prev) => ({ ...prev, priceRange: range }));
    setCurrentPage(1);
  }, []);

  const handleRatingFilter = useCallback((rating: number) => {
    setFilters((prev) => ({
      ...prev,
      ratings: prev.ratings.includes(rating)
        ? prev.ratings.filter((r) => r !== rating)
        : [...prev.ratings, rating],
    }));
    setCurrentPage(1);
  }, []);

  const handleSpecialFilterChange = useCallback(
    (
      key: keyof ProductFilters,
      value: boolean | string[] | [number, number]
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    setFilters({
      categories: [],
      priceRange: [0, 10000],
      ratings: [],
      brands: [],
      inStock: true,
      onSale: false,
    });
    setLocalSearchTerm("");
    setGlobalSearchTerm("");
    setCurrentPage(1);
  }, [setGlobalSearchTerm]);

  // 📄 Pagination Handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top of products
    document.getElementById("products-grid")?.scrollIntoView({
      behavior: "smooth",
    });
  }, []);

  // Loading State with elegant skeleton
  if (isFirstRender) {
    return (
      <StorefrontPageSkeleton
        showFilters={true}
        productCount={12}
        variant={viewMode}
      />
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Products Header */}
      <ProductsHeader
        searchTerm={localSearchTerm}
        onSearchChange={setLocalSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isFiltersOpen={isFiltersOpen}
        onFiltersToggle={() => setIsFiltersOpen(!isFiltersOpen)}
        totalProducts={processedProducts.length}
        allowAnimations={allowAnimations}
      />

      <div className="mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <ProductsFilters
            filters={filters}
            categories={categories}
            onCategoryFilter={handleCategoryFilter}
            onPriceRangeFilter={handlePriceRangeFilter}
            onRatingFilter={handleRatingFilter}
            onSpecialFilterChange={handleSpecialFilterChange}
            onClearFilters={clearAllFilters}
            isOpen={isFiltersOpen}
            onClose={() => setIsFiltersOpen(false)}
            allowAnimations={allowAnimations}
          />

          {/* Products Content */}
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
                  {processedProducts.length} productos encontrados
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

            {/* Products Grid */}
            <ProductsGrid
              products={paginatedProducts}
              viewMode={viewMode}
              onAddToCart={(product) => addToCartOptimistic(product, 1)}
              onAddToWishlist={onAddToWishlist}
              onQuickView={openProductQuickView}
              isAddingToWishlist={isAddingToWishlist}
              allowAnimations={allowAnimations}
            />

            {/* Pagination */}
            <ProductsPagination
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

// 🎯 Products Header Component
interface ProductsHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  isFiltersOpen: boolean;
  onFiltersToggle: () => void;
  totalProducts: number;
  allowAnimations: boolean;
}

const ProductsHeader: React.FC<ProductsHeaderProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  isFiltersOpen,
  onFiltersToggle,
  totalProducts,
  allowAnimations,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6">
        <div
          className={cn(
            "space-y-4",
            allowAnimations && "animate-customerFadeInUp"
          )}
        >
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Productos
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Descubre nuestra amplia selección de productos
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
                    ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400"
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
                    ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400"
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
                placeholder="Buscar productos por nombre, marca, categoría..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder:text-gray-500 dark:placeholder:text-gray-400
                         transition-all duration-200"
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-3">
              {/* Filters Toggle */}
              <button
                onClick={onFiltersToggle}
                className={cn(
                  "flex items-center space-x-2 px-4 py-3 border rounded-lg transition-all duration-200",
                  isFiltersOpen
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
                )}
              >
                <Sliders className="w-5 h-5" />
                <span className="hidden sm:inline">Filtros</span>
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                           text-gray-900 dark:text-gray-100 px-4 py-3 pr-10 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200"
                >
                  {SORT_OPTIONS.map((option) => (
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
                <span className="font-medium">{totalProducts}</span>
                <span className="ml-1">resultados</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎛️ Products Filters Sidebar
interface ProductsFiltersProps {
  filters: ProductFilters;
  categories: CategoryForCustomer[];
  onCategoryFilter: (category: string) => void;
  onPriceRangeFilter: (range: [number, number]) => void;
  onRatingFilter: (rating: number) => void;
  onSpecialFilterChange: (
    key: keyof ProductFilters,
    value: boolean | string[] | [number, number]
  ) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
  allowAnimations: boolean;
}

const ProductsFilters: React.FC<ProductsFiltersProps> = ({
  filters,
  categories,
  onCategoryFilter,
  onPriceRangeFilter,
  onRatingFilter,
  onSpecialFilterChange,
  onClearFilters,
  isOpen,
  onClose,
  allowAnimations,
}) => {
  const priceRanges = [
    { label: "Menos de $500", min: 0, max: 500 },
    { label: "$500 - $1,000", min: 500, max: 1000 },
    { label: "$1,000 - $2,500", min: 1000, max: 2500 },
    { label: "$2,500 - $5,000", min: 2500, max: 5000 },
    { label: "Más de $5,000", min: 5000, max: 10000 },
  ];

  const activeFiltersCount =
    filters.categories.length +
    filters.ratings.length +
    (filters.onSale ? 1 : 0) +
    (!filters.inStock ? 1 : 0);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Filters Sidebar */}
      <div
        className={cn(
          "w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm h-fit",
          "fixed lg:relative top-0 left-0 z-50 lg:z-auto",
          "transform transition-transform duration-300 lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
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
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {activeFiltersCount > 0 && (
                <button
                  onClick={onClearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Limpiar
                </button>
              )}
              <button
                onClick={onClose}
                className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Content */}
        <div className="p-6 space-y-8 max-h-[calc(100vh-120px)] overflow-y-auto">
          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Categorías
            </h4>
            <div className="space-y-2">
              {(categories || []).slice(0, 6).map((category) => (
                <label
                  key={category.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.name)}
                    onChange={() => onCategoryFilter(category.name)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    ({category.productCount})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Rango de Precio
            </h4>
            <div className="space-y-2">
              {priceRanges.map((range, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg"
                >
                  <input
                    type="radio"
                    name="priceRange"
                    checked={
                      filters.priceRange[0] === range.min &&
                      filters.priceRange[1] === range.max
                    }
                    onChange={() => onPriceRangeFilter([range.min, range.max])}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {range.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Calificación
            </h4>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <label
                  key={rating}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={filters.ratings.includes(rating)}
                    onChange={() => onRatingFilter(rating)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                      y más
                    </span>
                  </div>
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
                  checked={filters.onSale}
                  onChange={(e) =>
                    onSpecialFilterChange("onSale", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  En Oferta
                </span>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full ml-auto">
                  🔥 HOT
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) =>
                    onSpecialFilterChange("inStock", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  En Stock
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// 🛍️ Products Grid Component
interface ProductsGridProps {
  products: ProductForCustomer[];
  viewMode: "grid" | "list";
  onAddToCart: (product: ProductForCustomer) => void;
  onAddToWishlist: (
    product: ProductForCustomer
  ) => Promise<{ success: boolean; message: string }>;
  onQuickView: (product: ProductForCustomer) => void;
  isAddingToWishlist?: boolean;
  allowAnimations: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  viewMode,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  isAddingToWishlist = false,
  allowAnimations,
}) => {
  if (products.length === 0) {
    return (
      <div
        className={cn(
          "text-center py-16 bg-white dark:bg-gray-800 rounded-lg",
          allowAnimations && "animate-customerFadeInUp"
        )}
      >
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No se encontraron productos
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Intenta ajustar tus filtros o términos de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div id="products-grid">
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProfessionalProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
              onQuickView={onQuickView}
              isAddingToWishlist={isAddingToWishlist}
              variant="grid"
              className={cn(
                allowAnimations && `customer-stagger-${(index % 4) + 1}`,
                "transform-gpu will-change-transform"
              )}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {products.map((product, index) => (
            <ProfessionalProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
              onQuickView={onQuickView}
              isAddingToWishlist={isAddingToWishlist}
              variant="list"
              className={cn(
                allowAnimations && `customer-stagger-${(index % 3) + 1}`,
                "transform-gpu will-change-transform"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 📄 Products Pagination Component
interface ProductsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  allowAnimations: boolean;
}

const ProductsPagination: React.FC<ProductsPaginationProps> = ({
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
              ? "bg-blue-600 border-blue-600 text-white shadow-lg"
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

// 🛒 Customer Product Card (Grid Version)
interface CustomerProductCardProps {
  product: ProductForCustomer;
  onAddToCart: (product: ProductForCustomer) => void;
  onAddToWishlist: (product: ProductForCustomer) => void;
  onQuickView: (product: ProductForCustomer) => void;
  isAddingToWishlist?: boolean;
  className?: string;
}

const CustomerProductCard: React.FC<CustomerProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  isAddingToWishlist = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700",
        "hover:border-gray-200 dark:hover:border-gray-600",
        className
      )}
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-t-xl">
        {/* Sale Badge */}
        {product.isOnSale && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            -{product.discountPercentage}%
          </div>
        )}

        {/* Animated Wishlist Button */}
        <div
          className={cn(
            "transition-opacity duration-300 z-50",
            product.isWishlisted
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          )}
        >
          <AnimatedHeartButton
            product={product}
            isWishlisted={product.isWishlisted}
            isLoading={isAddingToWishlist}
            onToggle={onAddToWishlist}
            size="sm"
            variant="overlay"
            showSparkles={true}
          />
        </div>

        {/* Product Image Placeholder */}
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center rounded-t-xl overflow-hidden">
          <Package className="w-12 h-12 text-gray-400" />
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={() => onQuickView(product)}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Vista rápida</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand & Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {product.brand || product.category}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {product.rating}
            </span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            $
            {(
              product.publicPrice ||
              product.price ||
              product.currentPrice ||
              0
            ).toLocaleString()}
          </span>
          {product.isOnSale && product.originalPrice && (
            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
              ${product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-4">
          {product.stock > 0 ? (
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
              En stock ({product.stock} disponibles)
            </span>
          ) : (
            <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded-full">
              Sin stock
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className={cn(
            "w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2",
            product.stock > 0
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{product.stock > 0 ? "Agregar al carrito" : "Sin stock"}</span>
        </button>
      </div>
    </div>
  );
};

// 📋 Customer Product Card (List Version)
const CustomerProductCardList: React.FC<CustomerProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  isAddingToWishlist = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700",
        "hover:border-gray-200 dark:hover:border-gray-600",
        className
      )}
    >
      <div className="flex">
        {/* Product Image */}
        <div className="relative w-48 h-48 flex-shrink-0 bg-gray-100 dark:bg-gray-700">
          {product.isOnSale && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
              -{product.discountPercentage}%
            </div>
          )}
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Brand & Category */}
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {product.brand || product.category}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.rating} ({product.reviewCount || 0} reseñas)
                  </span>
                </div>
              </div>

              {/* Product Name */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {product.name}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {product.description}
              </p>

              {/* Price & Stock */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    $
                    {(
                      product.publicPrice ||
                      product.price ||
                      product.currentPrice ||
                      0
                    ).toLocaleString()}
                  </span>
                  {product.isOnSale && product.originalPrice && (
                    <span className="text-gray-500 dark:text-gray-400 line-through">
                      ${product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {product.stock > 0 ? (
                  <span className="text-sm text-green-600 dark:text-green-400">
                    En stock ({product.stock} disponibles)
                  </span>
                ) : (
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Sin stock
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-2 ml-6">
              <AnimatedHeartButton
                product={product}
                isWishlisted={product.isWishlisted}
                isLoading={isAddingToWishlist}
                onToggle={onAddToWishlist}
                size="md"
                variant="inline"
                showSparkles={true}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              />
              <button
                onClick={() => onQuickView(product)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
              className={cn(
                "px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2",
                product.stock > 0
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              )}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>
                {product.stock > 0 ? "Agregar al carrito" : "Sin stock"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsTab;
