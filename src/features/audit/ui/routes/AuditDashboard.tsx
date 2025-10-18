/**
 * ⚡ AUDIT DASHBOARD - ELEGANT UX
 * ===============================
 *
 * Dashboard con UX elegante:
 * - Header que desaparece suavemente con scroll
 * - Tabs con bordes redondeados
 * - Transiciones smooth
 *
 * Enterprise: 2025-01-18 - Elegant UX
 */

"use client";

// Import custom animations
import "../../../inventory/ui/styles/animations.css";

import React, { useState, useEffect } from "react";
import { useAuditDashboard } from "../../hooks/useAuditDashboard";
import {
  BarChart3,
  Activity,
  Users,
  Server,
  AlertCircle,
  Shield,
} from "lucide-react";
import { ReusableTabs, type TabItem } from "@/shared/ui/components";

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

interface AuditDashboardProps {
  initialTab?: AuditDashboardTab;
}

/**
 * ⚡ OPTIMIZED AUDIT DASHBOARD
 *
 * Best practices:
 * - Header that fades out smoothly on scroll
 * - Rounded tabs container
 * - Professional spacing
 */
export default function AuditDashboard({
  initialTab = "overview",
}: AuditDashboardProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<AuditDashboardTab>(initialTab);

  // Scroll state for header visibility
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  // Calculate counts for badges
  const userCount = stats?.byUser.length || 0;

  // 🎯 Smooth scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up or at top
      // Hide header when scrolling down (after 50px)
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setShowHeader(true);
      } else if (currentScrollY > 50) {
        setShowHeader(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Handle tab change with smooth scroll to show header
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as AuditDashboardTab);

    // Scroll to position that triggers header visibility (just under 50px threshold)
    // This shows the header without scrolling all the way to absolute top
    window.scrollTo({
      top: 40,
      behavior: "smooth",
    });
  };

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
    <div className="bg-gray-50 dark:bg-gray-900">
      {/*
        🎯 HEADER - Smooth fade out on scroll down
        - NO sticky (se oculta completamente)
        - Aparece cuando: scroll up o en top
        - Desaparece cuando: scroll down > 50px
      */}
      {showHeader && (
        <div className="transition-all duration-300 ease-in-out animate-fadeIn">
          <div className="  border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="max-w-[1600px] mx-auto px-6 py-6">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Audit Trail
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sistema de auditoría y seguimiento de actividades
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*
        🎯 TABS - Sticky & Rounded
        - Sticky top-0 siempre
        - Bordes redondeados elegantes
        - Shadow para profundidad
      */}
      <div className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 pt-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
            <ReusableTabs
              tabs={auditTabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              variant="default"
              size="md"
              animated={true}
              scrollable={true}
              className="bg-transparent border-0 shadow-none p-0"
            />
          </div>
        </div>
      </div>

      {/*
        📦 CONTENT AREA - Professional Spacing
      */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
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

        {/*
          🎯 TAB CONTENT - Only Active Tab
        */}
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
      </div>

      {/* ⚡ Event Details Modal */}
      <AuditEventDetailsModal
        isOpen={isEventModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
      />
    </div>
  );
}
