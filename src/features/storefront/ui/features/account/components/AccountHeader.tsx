/**
 * 🎯 ACCOUNT HEADER
 * =================
 *
 * Header component displaying user info and tier badge
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { User, Award } from "lucide-react";
import type { UserProfile } from "../types";
import { getTierColor, getTierLabel } from "../utils/formatters";

interface AccountHeaderProps {
  user: UserProfile;
  allowAnimations: boolean;
}

export const AccountHeader: React.FC<AccountHeaderProps> = ({
  user,
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
          {/* User Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>

              {/* User Details */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Miembro desde{" "}
                  {user.joinDate.toLocaleDateString("es-ES", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Tier Badge */}
            <div
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r text-white shadow-lg",
                getTierColor(user.tier)
              )}
            >
              <Award className="w-5 h-5" />
              <span className="font-semibold">{getTierLabel(user.tier)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
