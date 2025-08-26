/**
 * 💖 WishlistTab - Professional E-commerce Wishlist Management
 *
 * Amazon/eBay-inspired wishlist with:
 * - Complete wishlist management
 * - Add/Remove from favorites
 * - Move to cart functionality
 * - Professional filtering
 * - Beautiful animations
 * - Responsive design
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
  Heart,
  Package,
  ArrowRight,
  ShoppingCart,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Sparkles,
  HeartOff,
} from "lucide-react";

// Import Context and Types
import { useStorefrontContext } from "../../..";
import { ProductForCustomer } from "../../../types";

// Define interface for wishlist filters
interface WishlistFilters {
  searchTerm: string;
  sortBy: "date_added" | "name" | "price_asc" | "price_desc" | "rating";
  priceRange: [number, number];
  categories: string[];
  onSale: boolean;
  inStock: boolean;
}

interface WishlistSortOption {
  id: string;
  label: string;
  value: string;
}

const WISHLIST_SORT_OPTIONS: WishlistSortOption[] = [
  { id: "date_added", label: "Agregado Recientemente", value: "date_added" },
  { id: "name", label: "Nombre A-Z", value: "name" },
  { id: "price_asc", label: "Precio: Menor a Mayor", value: "price_asc" },
  { id: "price_desc", label: "Precio: Mayor a Menor", value: "price_desc" },
  { id: "rating", label: "Mejor Valorados", value: "rating" },
];

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48];

/**
 * 💖 Main WishlistTab Component
 */
const WishlistTab: React.FC = () => {
  const {
    isAuthenticated,
    toggleWishlist,
    addToCartOptimistic,
    categories,
    globalSearchTerm,
    setGlobalSearchTerm,
    customer,
    wishlist,
    openLoginModal,
  } = useStorefrontContext();

  // 🎯 Component State
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [allowAnimations, setAllowAnimations] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearchTerm, setLocalSearchTerm] = useState(globalSearchTerm);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Filters State
  const [filters, setFilters] = useState<WishlistFilters>({
    searchTerm: "",
    sortBy: "date_added",
    priceRange: [0, 10000],
    categories: [],
    onSale: false,
    inStock: true,
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

  // 📊 Real wishlist products from context
  const wishlistProducts = useMemo(() => {
    // Convert wishlist items to ProductForCustomer format
    return (wishlist || []).map((item) => ({
      ...item.product,
      dateAddedToWishlist: item.addedAt,
      isWishlisted: true, // All items in wishlist are wishlisted
    }));
  }, [wishlist]);

  // 📊 Processed Products with Filtering & Sorting
  const processedProducts = useMemo(() => {
    let results = [...wishlistProducts];

    // Apply search filter
    if (localSearchTerm.trim()) {
      const searchLower = localSearchTerm.toLowerCase();
      results = results.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      results = results.filter((product) =>
        filters.categories.includes(product.category)
      );
    }

    // Apply price range filter
    results = results.filter(
      (product) =>
        product.currentPrice >= filters.priceRange[0] &&
        product.currentPrice <= filters.priceRange[1]
    );

    // Apply sale filter
    if (filters.onSale) {
      results = results.filter((product) => product.isOnSale);
    }

    // Apply stock filter
    if (filters.inStock) {
      results = results.filter((product) => product.stock > 0);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "name":
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price_asc":
        results.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case "price_desc":
        results.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case "rating":
        results.sort((a, b) => b.rating - a.rating);
        break;
      default: // date_added
        results.sort(
          (a, b) =>
            new Date(b.dateAddedToWishlist || "").getTime() -
            new Date(a.dateAddedToWishlist || "").getTime()
        );
        break;
    }

    return results;
  }, [wishlistProducts, localSearchTerm, filters]);

  // 📄 Pagination
  const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = processedProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // 🔧 Filter Handlers
  const handleSortChange = useCallback((sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as WishlistFilters["sortBy"],
    }));
    setCurrentPage(1);
  }, []);

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

  const handleSpecialFilterChange = useCallback(
    (
      key: keyof WishlistFilters,
      value: string | number | boolean | string[] | [number, number]
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      sortBy: "date_added",
      priceRange: [0, 10000],
      categories: [],
      onSale: false,
      inStock: true,
    });
    setLocalSearchTerm("");
    setGlobalSearchTerm("");
    setCurrentPage(1);
  }, [setGlobalSearchTerm]);

  // 🛒 Wishlist Actions
  const handleRemoveFromWishlist = useCallback(
    async (product: ProductForCustomer) => {
      await toggleWishlist(product);
    },
    [toggleWishlist]
  );

  const handleAddToCart = useCallback(
    (product: ProductForCustomer) => {
      addToCartOptimistic(product, 1);
    },
    [addToCartOptimistic]
  );

  const handleMoveToCart = useCallback(
    async (product: ProductForCustomer) => {
      // Add to cart and remove from wishlist
      addToCartOptimistic(product, 1);
      await toggleWishlist(product);
    },
    [addToCartOptimistic, toggleWishlist]
  );

  // 🎯 Bulk Actions
  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === paginatedProducts.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginatedProducts.map((p) => p.id)));
    }
  }, [selectedItems.size, paginatedProducts]);

  const handleBulkAddToCart = useCallback(() => {
    paginatedProducts.forEach((product) => {
      if (selectedItems.has(product.id)) {
        addToCartOptimistic(product, 1);
      }
    });
    setSelectedItems(new Set());
  }, [selectedItems, paginatedProducts, addToCartOptimistic]);

  const handleBulkRemoveFromWishlist = useCallback(async () => {
    for (const product of paginatedProducts) {
      if (selectedItems.has(product.id)) {
        await toggleWishlist(product);
      }
    }
    setSelectedItems(new Set());
  }, [selectedItems, paginatedProducts, toggleWishlist]);

  // 📄 Pagination Handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setSelectedItems(new Set()); // Clear selections on page change
    // Scroll to top of wishlist
    document.getElementById("wishlist-grid")?.scrollIntoView({
      behavior: "smooth",
    });
  }, []);

  // 🔐 Login Check - Use Real Authentication
  if (!isAuthenticated) {
    return <WishlistLoginPrompt onLogin={openLoginModal} />;
  }

  // Loading State for empty first render
  if (isFirstRender) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-red-600 rounded-full animate-pulse flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-white fill-current animate-heartBeat" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Cargando Wishlist...
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Preparando tus productos favoritos
          </p>
        </div>
      </div>
    );
  }

  // Empty Wishlist State
  if (
    processedProducts.length === 0 &&
    !localSearchTerm &&
    filters.categories.length === 0
  ) {
    return <EmptyWishlist />;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Wishlist Header */}
      <WishlistHeader
        searchTerm={localSearchTerm}
        onSearchChange={setLocalSearchTerm}
        sortBy={filters.sortBy}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalProducts={processedProducts.length}
        selectedCount={selectedItems.size}
        onSelectAll={handleSelectAll}
        onBulkAddToCart={handleBulkAddToCart}
        onBulkRemove={handleBulkRemoveFromWishlist}
        allowAnimations={allowAnimations}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wishlist Stats */}
        <WishlistStats
          totalItems={processedProducts.length}
          totalValue={processedProducts.reduce(
            (sum, p) => sum + p.currentPrice,
            0
          )}
          onSaleItems={processedProducts.filter((p) => p.isOnSale).length}
          allowAnimations={allowAnimations}
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Filters Sidebar */}
          <WishlistFilters
            filters={filters}
            categories={categories || []}
            onCategoryFilter={handleCategoryFilter}
            onPriceRangeFilter={handlePriceRangeFilter}
            onSpecialFilterChange={handleSpecialFilterChange}
            onClearFilters={clearAllFilters}
            allowAnimations={allowAnimations}
          />

          {/* Wishlist Content */}
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
                  {processedProducts.length} productos en tu wishlist
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

            {/* Wishlist Grid */}
            <WishlistGrid
              products={paginatedProducts}
              viewMode={viewMode}
              selectedItems={selectedItems}
              onSelectItem={(id) => {
                const newSelected = new Set(selectedItems);
                if (newSelected.has(id)) {
                  newSelected.delete(id);
                } else {
                  newSelected.add(id);
                }
                setSelectedItems(newSelected);
              }}
              onRemoveFromWishlist={handleRemoveFromWishlist}
              onAddToCart={handleAddToCart}
              onMoveToCart={handleMoveToCart}
              allowAnimations={allowAnimations}
            />

            {/* Pagination */}
            <WishlistPagination
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

// 🔐 Wishlist Login Prompt Component
interface WishlistLoginPromptProps {
  onLogin: () => void;
}

const WishlistLoginPrompt: React.FC<WishlistLoginPromptProps> = ({
  onLogin,
}) => {
  return (
    <div className="min-h-[60vh] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/20 dark:to-red-900/20 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-12 h-12 text-pink-500 dark:text-pink-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Inicia Sesión para Ver tu Wishlist
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Guarda tus productos favoritos y accede a ellos desde cualquier
            dispositivo
          </p>
        </div>
        <button
          onClick={onLogin}
          className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl"
        >
          <Heart className="w-5 h-5" />
          <span>Iniciar Sesión</span>
        </button>
      </div>
    </div>
  );
};

// 💔 Empty Wishlist Component
const EmptyWishlist: React.FC = () => {
  return (
    <div className="min-h-[60vh] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto">
          <HeartOff className="w-12 h-12 text-gray-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Tu Wishlist Está Vacía
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Explora nuestros productos y guarda tus favoritos haciendo clic en
            el ícono del corazón
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Explorar Productos</span>
          </button>
          <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold transition-all duration-300">
            Ver Categorías
          </button>
        </div>
      </div>
    </div>
  );
};

// 🎯 Wishlist Header Component
interface WishlistHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  totalProducts: number;
  selectedCount: number;
  onSelectAll: () => void;
  onBulkAddToCart: () => void;
  onBulkRemove: () => void;
  allowAnimations: boolean;
}

const WishlistHeader: React.FC<WishlistHeaderProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalProducts,
  selectedCount,
  onSelectAll,
  onBulkAddToCart,
  onBulkRemove,
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
              <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-red-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-current animate-heartBeat" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Mi Wishlist
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tus productos favoritos guardados
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
                    ? "bg-white dark:bg-gray-800 shadow-sm text-pink-600 dark:text-pink-400"
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
                    ? "bg-white dark:bg-gray-800 shadow-sm text-pink-600 dark:text-pink-400"
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
                placeholder="Buscar en tu wishlist..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-pink-500 focus:border-transparent
                         placeholder:text-gray-500 dark:placeholder:text-gray-400
                         transition-all duration-200"
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-3">
              {/* Bulk Actions */}
              {selectedCount > 0 && (
                <div className="flex items-center space-x-2 bg-pink-50 dark:bg-pink-900/20 px-3 py-2 rounded-lg">
                  <span className="text-sm text-pink-700 dark:text-pink-300">
                    {selectedCount} seleccionados
                  </span>
                  <button
                    onClick={onBulkAddToCart}
                    className="text-xs bg-pink-600 text-white px-2 py-1 rounded hover:bg-pink-700 transition-colors"
                  >
                    + Carrito
                  </button>
                  <button
                    onClick={onBulkRemove}
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              )}

              {/* Select All */}
              <button
                onClick={onSelectAll}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {selectedCount === totalProducts
                  ? "Deseleccionar"
                  : "Seleccionar"}{" "}
                Todo
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                           text-gray-900 dark:text-gray-100 px-4 py-3 pr-10 rounded-lg
                           focus:ring-2 focus:ring-pink-500 focus:border-transparent
                           transition-all duration-200"
                >
                  {WISHLIST_SORT_OPTIONS.map((option) => (
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
                <span className="ml-1">favoritos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 📊 Wishlist Stats Component
interface WishlistStatsProps {
  totalItems: number;
  totalValue: number;
  onSaleItems: number;
  allowAnimations: boolean;
}

const WishlistStats: React.FC<WishlistStatsProps> = ({
  totalItems,
  totalValue,
  onSaleItems,
  allowAnimations,
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-3 gap-6",
        allowAnimations && "animate-customerFadeInUp customer-stagger-1"
      )}
    >
      {/* Total Items */}
      <div className="bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 rounded-xl p-6 border border-pink-200 dark:border-pink-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
            <Heart className="w-6 h-6 text-white fill-current animate-heartBeat" />
          </div>
          <div>
            <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">
              {totalItems}
            </p>
            <p className="text-sm text-pink-700 dark:text-pink-300">
              Productos Favoritos
            </p>
          </div>
        </div>
      </div>

      {/* Total Value */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              ${totalValue.toLocaleString()}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Valor Total
            </p>
          </div>
        </div>
      </div>

      {/* On Sale Items */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {onSaleItems}
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              En Oferta 🔥
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎛️ Wishlist Filters Sidebar
interface WishlistFiltersProps {
  filters: WishlistFilters;
  categories: { id: string; name: string; slug: string }[];
  onCategoryFilter: (category: string) => void;
  onPriceRangeFilter: (range: [number, number]) => void;
  onSpecialFilterChange: (
    key: keyof WishlistFilters,
    value: string | number | boolean | string[] | [number, number]
  ) => void;
  onClearFilters: () => void;
  allowAnimations: boolean;
}

const WishlistFilters: React.FC<WishlistFiltersProps> = ({
  filters,
  categories,
  onCategoryFilter,
  onPriceRangeFilter,
  onSpecialFilterChange,
  onClearFilters,
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
    (filters.onSale ? 1 : 0) +
    (!filters.inStock ? 1 : 0);

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
              <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filters Content */}
      <div className="p-6 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Categorías
            </h4>
            <div className="space-y-2">
              {categories.slice(0, 6).map((category) => (
                <label
                  key={category.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.name)}
                    onChange={() => onCategoryFilter(category.name)}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

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
                  className="text-pink-600 focus:ring-pink-500"
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
            Estado de Productos
          </h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg">
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={(e) =>
                  onSpecialFilterChange("onSale", e.target.checked)
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
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
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                En Stock
              </span>
            </label>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Acciones Rápidas
          </h4>
          <div className="space-y-2">
            <button className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors">
              Ver solo productos disponibles
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors">
              Productos agregados esta semana
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors">
              Productos con descuento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🛍️ Wishlist Grid Component
interface WishlistGridProps {
  products: ProductForCustomer[];
  viewMode: "grid" | "list";
  selectedItems: Set<string>;
  onSelectItem: (id: string) => void;
  onRemoveFromWishlist: (product: ProductForCustomer) => void;
  onAddToCart: (product: ProductForCustomer) => void;
  onMoveToCart: (product: ProductForCustomer) => void;
  allowAnimations: boolean;
}

const WishlistGrid: React.FC<WishlistGridProps> = ({
  products,
  viewMode,
  selectedItems,
  onSelectItem,
  onRemoveFromWishlist,
  onAddToCart,
  onMoveToCart,
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
          <Heart className="w-8 h-8 text-gray-400" />
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
    <div id="wishlist-grid">
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <WishlistProductCard
              key={product.id}
              product={product}
              isSelected={selectedItems.has(product.id)}
              onSelect={() => onSelectItem(product.id)}
              onRemoveFromWishlist={() => onRemoveFromWishlist(product)}
              onAddToCart={() => onAddToCart(product)}
              onMoveToCart={() => onMoveToCart(product)}
              className={cn(
                allowAnimations && `customer-stagger-${(index % 4) + 1}`
              )}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product, index) => (
            <WishlistProductCardList
              key={product.id}
              product={product}
              isSelected={selectedItems.has(product.id)}
              onSelect={() => onSelectItem(product.id)}
              onRemoveFromWishlist={() => onRemoveFromWishlist(product)}
              onAddToCart={() => onAddToCart(product)}
              onMoveToCart={() => onMoveToCart(product)}
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

// 💝 Wishlist Product Card (Grid Version)
interface WishlistProductCardProps {
  product: ProductForCustomer;
  isSelected: boolean;
  onSelect: () => void;
  onRemoveFromWishlist: () => void;
  onAddToCart: () => void;
  onMoveToCart: () => void;
  className?: string;
}

const WishlistProductCard: React.FC<WishlistProductCardProps> = ({
  product,
  isSelected,
  onSelect,
  onRemoveFromWishlist,
  onAddToCart,
  onMoveToCart,
  className,
}) => {
  const formattedDate = product.dateAddedToWishlist
    ? new Date(product.dateAddedToWishlist).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div
      className={cn(
        "group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700",
        "hover:border-gray-200 dark:hover:border-gray-600 hover:scale-105",
        isSelected && "ring-2 ring-pink-500 border-pink-300",
        className
      )}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500 bg-white dark:bg-gray-800 shadow-lg"
        />
      </div>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
        {/* Sale Badge */}
        {product.isOnSale && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            -{product.discountPercentage}%
          </div>
        )}

        {/* Wishlist Date */}
        {formattedDate && (
          <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded z-10">
            <Calendar className="w-3 h-3 inline mr-1" />
            {formattedDate}
          </div>
        )}

        {/* Product Image Placeholder */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-red-400 rounded-2xl flex items-center justify-center">
            <Package className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Hover Overlay with Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
            <button
              onClick={onMoveToCart}
              className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-lg shadow-lg transition-colors"
              title="Mover al carrito"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Vista rápida"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand/Category */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
          {product.brand} • {product.category}
        </p>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300 dark:text-gray-600"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            ${product.currentPrice.toLocaleString()}
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
            <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              En stock ({product.stock} disponibles)
            </span>
          ) : (
            <span className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Agotado
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={onAddToCart}
            disabled={product.stock === 0}
            className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm">Agregar</span>
          </button>
          <button
            onClick={onRemoveFromWishlist}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg transition-all duration-200"
            title="Remover del wishlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 📋 Wishlist Product Card (List Version)
const WishlistProductCardList: React.FC<WishlistProductCardProps> = ({
  product,
  isSelected,
  onSelect,
  onRemoveFromWishlist,
  onAddToCart,
  onMoveToCart,
  className,
}) => {
  const formattedDate = product.dateAddedToWishlist
    ? new Date(product.dateAddedToWishlist).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700",
        "hover:border-gray-200 dark:hover:border-gray-600",
        isSelected && "ring-2 ring-pink-500 border-pink-300",
        className
      )}
    >
      <div className="flex">
        {/* Selection Checkbox */}
        <div className="p-4 flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
          />
        </div>

        {/* Product Image */}
        <div className="relative w-24 h-24 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
          {/* Sale Badge */}
          {product.isOnSale && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full z-10">
              -{product.discountPercentage}%
            </div>
          )}

          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-400 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Brand/Category & Date */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {product.brand} • {product.category}
                </p>
                {formattedDate && (
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formattedDate}
                  </div>
                )}
              </div>

              {/* Product Name & Rating */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate mr-4">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.rating}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 text-sm">
                {product.description}
              </p>

              {/* Price & Stock */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    ${product.currentPrice.toLocaleString()}
                  </span>
                  {product.isOnSale && product.originalPrice && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      ${product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="text-sm">
                  {product.stock > 0 ? (
                    <span className="text-green-600 dark:text-green-400">
                      ✓ En stock
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">
                      ✗ Agotado
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="ml-4 flex flex-col space-y-2">
              <button
                onClick={onMoveToCart}
                disabled={product.stock === 0}
                className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Mover</span>
              </button>
              <button
                onClick={onAddToCart}
                disabled={product.stock === 0}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Agregar</span>
              </button>
              <button
                onClick={onRemoveFromWishlist}
                className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2 transition-all duration-200 flex items-center justify-center"
                title="Remover del wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 📄 Wishlist Pagination Component
interface WishlistPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  allowAnimations: boolean;
}

const WishlistPagination: React.FC<WishlistPaginationProps> = ({
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
              ? "bg-pink-600 border-pink-600 text-white shadow-lg"
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

export default WishlistTab;
