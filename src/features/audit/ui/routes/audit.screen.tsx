/**
 * 🔍 AUDIT SCREEN
 * ================
 *
 * Sistema de auditoría y seguimiento de actividades empresariales
 * con dashboard optimizado y tabs consistentes
 *
 * REFACTORED: 2025-01-27 - Standardized with shared layout components
 * - PageHeader for consistent header with stats
 * - StickyTabsContainer for sticky tabs
 * - ContentContainer for content area
 * - Removed custom scroll detection
 * - Consistent with inventory/users/suppliers pattern
 *
 * Created: 2025-01-18 - Audit Dashboard
 */

"use client";

// Import custom animations
import "../../../inventory/ui/styles/animations.css";

import React, { useState, useMemo } from "react";
import { useAuditDashboard } from "../../hooks/useAuditDashboard";
import {
  BarChart3,
  Activity,
  Users,
  Server,
  AlertCircle,
  Shield,
} from "lucide-react";
import {
  ReusableTabs,
  type TabItem,
  PageHeader,
  type StatItem,
  StickyTabsContainer,
  ContentContainer,
} from "@/shared/ui/components";

// Import tabs
import {
  OverviewTab,
  ActivitiesTab,
  UsersTab,
  SystemTab,
} from "../components/tabs";

// Import modal
import { AuditEventDetailsModal } from "../components/modals";

// Import types
import type { AuditDashboardTab, AuditEvent } from "../../types";

interface AuditScreenProps {
  initialTab?: AuditDashboardTab;
}

/**
 * 🔍 AUDIT SCREEN
 *
 * Standardized screen with:
 * - PageHeader with stats
 * - StickyTabsContainer for tabs
 * - ContentContainer for content
 * - Consistent spacing and layout
 */
export default function AuditScreen({
  initialTab = "overview",
}: AuditScreenProps) {
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

  // Calculate counts for stats
  const userCount = stats?.byUser.length || 0;
  const criticalEvents = stats?.bySeverity.critical || 0;

  // 🎨 Prepare stats for PageHeader
  const headerStats: StatItem[] = useMemo(
    () => [
      {
        icon: <Activity className="w-4 h-4" />,
        label: `${totalCount.toLocaleString()} Eventos`,
        color: "blue" as const,
        value: totalCount,
      },
      {
        icon: <Users className="w-4 h-4" />,
        label: `${userCount} Usuarios`,
        color: "green" as const,
        value: userCount,
      },
      {
        icon: <AlertCircle className="w-4 h-4" />,
        label: `${criticalEvents} Críticos`,
        color: "red" as const,
        value: criticalEvents,
      },
    ],
    [totalCount, userCount, criticalEvents]
  );

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
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      {/* 🎨 PageHeader - Standardized header with stats */}
      <PageHeader
        icon={<Shield className="w-6 h-6 sm:w-8 sm:h-8" />}
        title="Audit Trail"
        description="Sistema de auditoría y seguimiento de actividades"
        stats={headerStats}
      />

      {/* 🎨 Sticky Tabs Container */}
      <StickyTabsContainer responsive={true} zIndex={20}>
        <ReusableTabs
          tabs={auditTabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as AuditDashboardTab)}
          variant="default"
          size="md"
          animated={true}
          scrollable={true}
        />
      </StickyTabsContainer>

      {/* 🎨 Content Container */}
      <ContentContainer responsive={true}>
        {/* ⚡ Professional Error Display */}
        {hasErrors && (
          <div className="mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
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
                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Reintentar
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="px-3 py-1 text-sm border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🎯 TAB CONTENT - Only Active Tab */}
        <div className="transition-opacity duration-200">
          {activeTab === "overview" && (
            <div className="animate-fadeIn">
              <OverviewTab
                stats={stats}
                isLoading={isStatsLoading}
                onNavigate={(tab) => setActiveTab(tab as AuditDashboardTab)}
              />
            </div>
          )}

          {activeTab === "activities" && (
            <div className="animate-fadeIn">
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
          )}

          {activeTab === "users" && (
            <div className="animate-fadeIn">
              <UsersTab
                stats={stats}
                isLoading={isStatsLoading}
                onViewUserDetails={(userId) => {
                  console.log("View user details:", userId);
                }}
              />
            </div>
          )}

          {activeTab === "system" && (
            <div className="animate-fadeIn">
              <SystemTab stats={stats} isLoading={isStatsLoading} />
            </div>
          )}
        </div>
      </ContentContainer>

      {/* ⚡ Event Details Modal */}
      <AuditEventDetailsModal
        isOpen={isEventModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
      />
    </div>
  );
}
