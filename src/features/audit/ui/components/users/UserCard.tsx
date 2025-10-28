/**
 * 👤 USER CARD COMPONENT
 * =======================
 *
 * Card component para mostrar información de usuario
 * con ranking y cantidad de eventos
 *
 * Created: 2025-01-27 - Extracted from UsersTab
 */

"use client";

import React from "react";
import { Activity, Eye } from "lucide-react";
import { cn } from "@/shared/utils";

export interface UserCardProps {
  userId: string;
  userName: string | null;
  userEmail: string;
  eventCount: number;
  rank: number;
  onView?: (userId: string) => void;
}

const rankColors = {
  1: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",
  2: "bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-600",
  3: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700",
};

const getRankColor = (rank: number) => {
  if (rank <= 3) return rankColors[rank as keyof typeof rankColors];
  return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
};

/**
 * UserCard - Card para mostrar usuario con ranking
 */
export const UserCard: React.FC<UserCardProps> = ({
  userId,
  userName,
  userEmail,
  eventCount,
  rank,
  onView,
}) => {
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

export default UserCard;
