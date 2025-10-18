/**
 * 👥 AUDIT USERS TAB
 * ==================
 *
 * Vista de actividad por usuario con métricas,
 * rankings y análisis de comportamiento
 *
 * Created: 2025-01-18 - Audit Users Tab
 */

"use client";

import React, { useMemo, useState } from "react";
import {
  Users,
  TrendingUp,
  Activity,
  Shield,
  AlertTriangle,
  Search,
  Eye,
  BarChart3,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type { AuditStats } from "../../../types";

interface UsersTabProps {
  stats: AuditStats | undefined;
  isLoading?: boolean;
  onViewUserDetails?: (userId: string) => void;
}

/**
 * 👤 User Activity Card Component
 */
interface UserCardProps {
  userId: string;
  userName: string | null;
  userEmail: string;
  eventCount: number;
  rank: number;
  onView?: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  userId,
  userName,
  userEmail,
  eventCount,
  rank,
  onView,
}) => {
  const rankColors = {
    1: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",
    2: "bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-600",
    3: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700",
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return rankColors[rank as keyof typeof rankColors];
    return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
  };

  return (
    <div
      className={cn(
        "relative bg-white dark:bg-gray-800 border-2 rounded-lg p-5",
        "hover:shadow-lg transition-all duration-200",
        "group cursor-pointer",
        getRankColor(rank)
      )}
      onClick={() => onView?.(userId)}
    >
      {/* Rank Badge */}
      <div className="absolute top-3 right-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center font-bold text-sm">
          #{rank}
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-start gap-4 pr-10">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {(userName?.[0] || userEmail[0]).toUpperCase()}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {userName || "Usuario sin nombre"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {userEmail}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {eventCount.toLocaleString()} eventos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* View Button (appears on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onView?.(userId);
        }}
        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );
};

/**
 * 🎯 Main Users Tab Component
 */
export default function UsersTab({
  stats,
  isLoading,
  onViewUserDetails,
}: UsersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    if (!stats?.byUser) return [];

    let users = [...stats.byUser];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      users = users.filter(
        (user) =>
          user.userName?.toLowerCase().includes(query) ||
          user.userEmail.toLowerCase().includes(query)
      );
    }

    // Sort by event count (descending)
    users.sort((a, b) => b.eventCount - a.eventCount);

    return users;
  }, [stats, searchQuery]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!stats?.byUser) {
      return {
        totalUsers: 0,
        avgEventsPerUser: 0,
        mostActiveUser: null,
        totalEvents: 0,
      };
    }

    const totalUsers = stats.byUser.length;
    const totalEvents = stats.byUser.reduce(
      (sum, user) => sum + user.eventCount,
      0
    );
    const avgEventsPerUser =
      totalUsers > 0 ? Math.round(totalEvents / totalUsers) : 0;
    const mostActiveUser =
      stats.byUser.length > 0
        ? stats.byUser.reduce((prev, current) =>
            prev.eventCount > current.eventCount ? prev : current
          )
        : null;

    return {
      totalUsers,
      avgEventsPerUser,
      mostActiveUser,
      totalEvents,
    };
  }, [stats]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-700 rounded-lg h-24"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          Actividad por Usuario
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Análisis de comportamiento y métricas de usuarios
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Usuarios
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {metrics.totalUsers}
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Promedio Eventos
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {metrics.avgEventsPerUser}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Por usuario
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Usuario Más Activo
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-2 truncate">
                {metrics.mostActiveUser?.userName || "N/A"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {metrics.mostActiveUser?.eventCount || 0} eventos
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Eventos
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {metrics.totalEvents.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar usuarios por nombre o email..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Top Users Section */}
      {filteredUsers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Ranking de Usuarios
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user, index) => (
              <UserCard
                key={user.userId}
                userId={user.userId}
                userName={user.userName}
                userEmail={user.userEmail}
                eventCount={user.eventCount}
                rank={index + 1}
                onView={onViewUserDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
          {searchQuery ? (
            <>
              <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No se encontraron usuarios
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Intenta con otro término de búsqueda
              </p>
            </>
          ) : (
            <>
              <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No hay datos de usuarios
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Los datos de actividad de usuarios aparecerán aquí
              </p>
            </>
          )}
        </div>
      )}

      {/* Activity Distribution Chart Placeholder */}
      {filteredUsers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Distribución de Actividad
            </h3>
          </div>

          {/* Simple bar chart representation */}
          <div className="space-y-3">
            {filteredUsers.slice(0, 10).map((user, index) => {
              const maxCount = filteredUsers[0].eventCount;
              const percentage = (user.eventCount / maxCount) * 100;

              return (
                <div key={user.userId} className="flex items-center gap-3">
                  <div className="w-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {user.userName || user.userEmail}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {user.eventCount}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
