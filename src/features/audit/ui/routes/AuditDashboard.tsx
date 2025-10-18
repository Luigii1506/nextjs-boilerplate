/**
 * ⚡ AUDIT DASHBOARD - ENHANCED WITH TABS
 * ======================================
 *
 * Dashboard principal de auditoría mejorado con sistema de tabs,
 * modales estándar y funcionalidad completa
 *
 * Enterprise: 2025-01-18 - Enhanced Audit Dashboard
 */

"use client";

// Import custom animations
import "../../../inventory/ui/styles/animations.css";

import React, { useState, useMemo } from "react";
import { useAuditDashboard } from "../../hooks/useAuditDashboard";
import { cn } from "@/shared/utils";
import {
  BarChart3,
  Activity,
  Users,
  Server,
  RefreshCw,
  AlertCircle,
  Shield,
  Settings,
} from "lucide-react";
import { ReusableTabs, type TabItem } from "@/shared/ui/components";
import { useScrollHeader } from "@/shared/hooks";

// Import tabs
import { OverviewTab, ActivitiesTab, UsersTab, SystemTab } from "../components/tabs";

// Import modal
import { AuditEventDetailsModal } from "../components/modals";

// Import types
import type { AuditDashboardTab, AuditEvent } from "../../types";

interface AuditDashboardProps {
  initialTab?: AuditDashboardTab;
}

// 🎨 Icon mapping for tabs
const ICON_MAP = {
  BarChart3,
  Activity,
  Users,
  Server,
} as const;

// 🎯 Tab Navigation Component
interface TabNavigationProps {
  isHeaderVisible: boolean;
  scrollY: number;
  isPastThreshold: boolean;
  activeTab: AuditDashboardTab;
  setActiveTab: (tab: AuditDashboardTab) => void;
  totalCount: number;
  userCount: number;
  isRefetching: boolean;
  onRefresh: () => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  isHeaderVisible,
  scrollY,
  isPastThreshold,
  activeTab,
  setActiveTab,
  totalCount,
  userCount,
  isRefetching,
  onRefresh,
}) => {
  // Tab configuration
  const auditTabs: TabItem[] = [
    {
      id: "overview",
      label: "Resumen",
      icon: <BarChart3 className="w-4 h-4" />,
      color: "blue",
    },
    {
      id: "activities",
      label: "Actividades",
      icon: <Activity className="w-4 h-4" />,
      color: "purple",
      hasNotification: totalCount > 0,
      notificationCount: totalCount > 999 ? 999 : totalCount,
    },
    {
      id: "users",
      label: "Usuarios",
      icon: <Users className="w-4 h-4" />,
      color: "green",
      hasNotification: userCount > 0,
      notificationCount: userCount,
    },
    {
      id: "system",
      label: "Sistema",
      icon: <Server className="w-4 h-4" />,
      color: "orange",
    },
  ];

  return (
    <div
      className={cn(
        "border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50",
        "transform-gpu transition-all duration-300",
        // Backdrop blur effect when scrolled
        isPastThreshold
          ? "header-backdrop scrolled"
          : "header-backdrop bg-white dark:bg-gray-800"
      )}
      style={{
        transform: `translateY(${
          scrollY > 0 ? Math.min(scrollY * 0.1, 10) : 0
        }px)`,
      }}
    >
      <div className="px-6 py-4 flex justify-center flex-col">
        {/* Smart Header with Scroll Animations */}
        <div
          id="header-tabs-container"
          className={cn(
            "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
            "transform-gpu transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            isHeaderVisible
              ? "opacity-100 translate-y-0 scale-y-100 mb-6 max-h-96"
              : "opacity-0 -translate-y-3 scale-y-90 mb-0 max-h-0 overflow-hidden pointer-events-none"
          )}
          style={{
            visibility: isHeaderVisible ? "visible" : "hidden",
            transitionProperty: "opacity, transform, margin-bottom, max-height",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            id="header-tabs"
            className={cn(
              "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
              isHeaderVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2"
            )}
          >
            <h1
              className={cn(
                "text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2",
                "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
                isHeaderVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-1"
              )}
            >
              <Shield
                className={cn(
                  "w-7 h-7 text-blue-600 dark:text-blue-400",
                  "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
                  isHeaderVisible
                    ? "opacity-100 scale-100 rotate-0"
                    : "opacity-0 scale-95 rotate-3"
                )}
              />
              <span
                className={cn(
                  "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
                  isHeaderVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-1"
                )}
              >
                Audit Trail
              </span>
            </h1>
            <p
              className={cn(
                "text-gray-600 dark:text-gray-300 mt-1",
                "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
                isHeaderVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-1"
              )}
            >
              Sistema de auditoría y seguimiento de actividades
            </p>
          </div>

          {/* Actions */}
          <div
            className={cn(
              "flex items-center space-x-3",
              "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
              isHeaderVisible
                ? "opacity-100 translate-x-0 scale-100"
                : "opacity-0 translate-x-4 scale-98"
            )}
          >
            <button
              onClick={onRefresh}
              disabled={isRefetching}
              className={cn(
                "px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg",
                "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700",
                "flex items-center space-x-2 transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98] transform-gpu",
                isRefetching && "opacity-50 cursor-not-allowed"
              )}
            >
              <RefreshCw
                className={cn("w-4 h-4", isRefetching && "animate-spin")}
              />
              <span>Actualizar</span>
            </button>

            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Enhanced Tab Navigation - Always Visible & Clean */}
        <div
          className={cn(
            "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
            isHeaderVisible ? "translate-y-0 pt-0" : "translate-y-0"
          )}
        >
          <ReusableTabs
            tabs={auditTabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as AuditDashboardTab)}
            variant="default"
            size="md"
            animated={true}
            scrollable={true}
            className="bg-transparent border-0 shadow-none p-0"
          />
        </div>
      </div>

      {/* Scroll Indicator */}
      {isPastThreshold && (
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{
            width: `${Math.min((scrollY / window.innerHeight) * 100, 100)}%`,
          }}
        />
      )}
    </div>
  );
};

/**
 * ⚡ ENHANCED AUDIT DASHBOARD COMPONENT
 */
export default function AuditDashboard({ initialTab = "overview" }: AuditDashboardProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<AuditDashboardTab>(initialTab);

  // Modal state
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // ⚡ TanStack Query optimized dashboard hook
  const {
    // Data
    events,
    stats,
    totalCount,
    currentPage,
    totalPages,

    // Filters
    filters,
    resetFilters,
    hasActiveFilters,

    // Loading states
    isEventsLoading,
    isStatsLoading,

    // Error states
    eventsError,
    statsError,
    hasErrors,

    // Actions
    handleFiltersChange,
    handlePageChange,
    handleRefresh,
    handleExport,
  } = useAuditDashboard({
    initialTab: "overview",
    enableAutoRefresh: true,
    refreshInterval: 30000,
  });

  // ✨ Scroll Detection Hook
  const { scrollY, isHeaderVisible, isPastThreshold } = useScrollHeader({
    threshold: 17,
    wheelSensitivity: 0.5,
    useWheelFallback: true,
    debug: false,
  });

  // Handle view event details
  const handleViewEvent = (event: AuditEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };

  // Calculate counts for badges
  const userCount = stats?.byUser.length || 0;
  const isRefetching = isEventsLoading || isStatsLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Navigation */}
      <TabNavigation
        isHeaderVisible={isHeaderVisible}
        scrollY={scrollY}
        isPastThreshold={isPastThreshold}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalCount={totalCount}
        userCount={userCount}
        isRefetching={isRefetching}
        onRefresh={handleRefresh}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative">
        <div
          className={cn(
            "max-w-full",
            "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
            isHeaderVisible ? "translate-y-0" : "-translate-y-6"
          )}
        >
          {/* ⚡ Professional Error Display */}
          {hasErrors && (
            <div className="px-6 pt-6">
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-3 text-red-800 dark:text-red-200">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium">Error al cargar datos</h3>
                    <div className="text-sm text-red-600 dark:text-red-300 mt-1 space-y-1">
                      {eventsError && <div>Eventos: {eventsError}</div>}
                      {statsError && <div>Estadísticas: {statsError}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRefresh}
                      className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      Reintentar
                    </button>
                    {hasActiveFilters && (
                      <button
                        onClick={resetFilters}
                        className="px-3 py-1 text-sm border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TRUE SPA Tab Content - Keep All Tabs Mounted */}
          <div className="relative min-h-screen">
            {/* Overview Tab - Always mounted */}
            <div
              className={cn(
                "transition-all duration-300 ease-out",
                activeTab === "overview"
                  ? "opacity-100 visible relative z-0"
                  : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
              )}
              style={{
                transform:
                  activeTab === "overview" ? "translateY(0)" : "translateY(20px)",
              }}
            >
              <OverviewTab
                stats={stats}
                isLoading={isStatsLoading}
                onNavigate={(tab) => setActiveTab(tab as AuditDashboardTab)}
              />
            </div>

            {/* Activities Tab - Always mounted */}
            <div
              className={cn(
                "transition-all duration-300 ease-out",
                activeTab === "activities"
                  ? "opacity-100 visible relative z-0"
                  : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
              )}
              style={{
                transform:
                  activeTab === "activities" ? "translateY(0)" : "translateY(20px)",
              }}
            >
              <ActivitiesTab
                events={events}
                filters={filters}
                totalCount={totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                isLoading={isEventsLoading}
                onFiltersChange={handleFiltersChange}
                onResetFilters={resetFilters}
                onPageChange={handlePageChange}
                onViewEvent={handleViewEvent}
                onExport={handleExport}
                onRefresh={handleRefresh}
              />
            </div>

            {/* Users Tab - Always mounted */}
            <div
              className={cn(
                "transition-all duration-300 ease-out",
                activeTab === "users"
                  ? "opacity-100 visible relative z-0"
                  : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
              )}
              style={{
                transform:
                  activeTab === "users" ? "translateY(0)" : "translateY(20px)",
              }}
            >
              <UsersTab
                stats={stats}
                isLoading={isStatsLoading}
                onViewUserDetails={(userId) => {
                  console.log("View user details:", userId);
                }}
              />
            </div>

            {/* System Tab - Always mounted */}
            <div
              className={cn(
                "transition-all duration-300 ease-out",
                activeTab === "system"
                  ? "opacity-100 visible relative z-0"
                  : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
              )}
              style={{
                transform:
                  activeTab === "system" ? "translateY(0)" : "translateY(20px)",
              }}
            >
              <SystemTab stats={stats} isLoading={isStatsLoading} />
            </div>
          </div>
        </div>
      </main>

      {/* ⚡ Event Details Modal */}
      <AuditEventDetailsModal
        isOpen={isEventModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
      />
    </div>
  );
}
