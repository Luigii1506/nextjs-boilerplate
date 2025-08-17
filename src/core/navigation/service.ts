/**
 * 🏗️ CORE NAVIGATION SERVICE - INFRASTRUCTURE
 * ============================================
 *
 * Servicio de navegación para infraestructura del sistema.
 * Manejo de permisos, feature flags, y filtrado de elementos de navegación.
 *
 * Created: 2025-01-17 - Core navigation service
 */

import type { NavigationItem, UserRole, FeatureFlag } from "./constants";
import type { NavigationContext } from "./config";
import { NAVIGATION_REGISTRY, NAVIGATION_CATEGORIES } from "./constants";

// 🎯 Feature Flag Checker Interface
export interface FeatureFlagChecker {
  isEnabled(feature: FeatureFlag): boolean;
}

// 📊 Navigation Filter Options
export interface NavigationFilterOptions {
  userRole: UserRole;
  isAuthenticated: boolean;
  featureFlagChecker: FeatureFlagChecker;
  category?: keyof typeof NAVIGATION_CATEGORIES | "all";
  includeDisabled?: boolean;
  maxItems?: number;
}

// 🎯 Navigation Service Result
export interface NavigationServiceResult {
  items: NavigationItem[];
  totalItems: number;
  filteredItems: number;
  categories: Record<string, NavigationItem[]>;
  hasMoreItems: boolean;
}

// 🏗️ CORE NAVIGATION SERVICE (Infraestructura)
export class CoreNavigationService {
  // 🎯 Get filtered navigation items for user
  async getNavigationForUser(
    context: NavigationContext,
    options: NavigationFilterOptions
  ): Promise<NavigationServiceResult> {
    try {
      // 🔍 Filter navigation items
      const filtered = this.filterNavigationItems(NAVIGATION_REGISTRY, options);

      // 📋 Organize by categories
      const categories = this.organizeByCategories(filtered);

      // 🎯 Apply limits
      const maxItems = options.maxItems || 20;
      const limitedItems = filtered.slice(0, maxItems);

      const result: NavigationServiceResult = {
        items: limitedItems,
        totalItems: NAVIGATION_REGISTRY.length,
        filteredItems: filtered.length,
        categories,
        hasMoreItems: filtered.length > maxItems,
      };

      return result;
    } catch (error) {
      console.error("Error getting navigation for user:", error);

      return {
        items: [],
        totalItems: 0,
        filteredItems: 0,
        categories: { core: [], feature: [], admin: [] },
        hasMoreItems: false,
      };
    }
  }

  // 🔍 Filter navigation items based on permissions and features
  private filterNavigationItems(
    items: readonly NavigationItem[],
    options: NavigationFilterOptions
  ): NavigationItem[] {
    const filtered: NavigationItem[] = [];

    for (const item of items) {
      try {
        // 🛡️ Check authentication
        if (item.requiresAuth && !options.isAuthenticated) {
          continue;
        }

        // 🎭 Check role requirements
        if (
          item.requiredRole &&
          !this.hasRequiredRole(options.userRole, item.requiredRole)
        ) {
          continue;
        }

        // 🎛️ Check feature flag requirements
        if (
          item.requiredFeature &&
          !options.featureFlagChecker.isEnabled(item.requiredFeature)
        ) {
          continue;
        }

        // 📂 Check category filter
        if (
          options.category &&
          options.category !== "all" &&
          item.category !== options.category
        ) {
          continue;
        }

        // ✅ All checks passed
        filtered.push(item);
      } catch (error) {
        console.error(`Error filtering navigation item: ${item.id}`, error);
      }
    }

    // 🔄 Sort by order
    filtered.sort((a, b) => a.order - b.order);
    return filtered;
  }

  // 🎭 Check if user has required role
  private hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      user: 1,
      admin: 2,
      super_admin: 3,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  // 📂 Organize items by categories
  private organizeByCategories(
    items: NavigationItem[]
  ): Record<string, NavigationItem[]> {
    const categories: Record<string, NavigationItem[]> = {
      core: [],
      feature: [],
      admin: [],
    };

    for (const item of items) {
      if (categories[item.category]) {
        categories[item.category].push(item);
      }
    }

    // Sort each category by order
    Object.keys(categories).forEach((category) => {
      categories[category].sort((a, b) => a.order - b.order);
    });

    return categories;
  }

  // 🔍 Get navigation item by ID
  getNavigationItemById(id: string): NavigationItem | null {
    const item = NAVIGATION_REGISTRY.find((item) => item.id === id);
    return item || null;
  }

  // 📊 Get navigation statistics
  getNavigationStats(): Record<string, unknown> {
    return {
      totalItems: NAVIGATION_REGISTRY.length,
      coreItems: NAVIGATION_REGISTRY.filter((item) => item.isCore).length,
      featureItems: NAVIGATION_REGISTRY.filter((item) => !item.isCore).length,
      categoryCounts: {
        core: NAVIGATION_REGISTRY.filter((item) => item.category === "core")
          .length,
        feature: NAVIGATION_REGISTRY.filter(
          (item) => item.category === "feature"
        ).length,
        admin: NAVIGATION_REGISTRY.filter((item) => item.category === "admin")
          .length,
      },
    };
  }
}

// 🚀 Singleton instance
export const coreNavigationService = new CoreNavigationService();
