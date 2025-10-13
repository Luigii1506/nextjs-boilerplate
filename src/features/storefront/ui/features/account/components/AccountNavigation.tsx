/**
 * 🧭 ACCOUNT NAVIGATION
 * =====================
 *
 * Sidebar navigation for account sections
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { User, ChevronRight } from "lucide-react";
import type { AccountSection } from "../types";

interface AccountNavigationProps {
  sections: AccountSection[];
  activeSection: AccountSection["id"];
  onSectionChange: (sectionId: AccountSection["id"]) => void;
  allowAnimations: boolean;
}

export const AccountNavigation: React.FC<AccountNavigationProps> = ({
  sections,
  activeSection,
  onSectionChange,
  allowAnimations,
}) => {
  return (
    <div
      className={cn(
        "w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm h-fit",
        allowAnimations && "animate-customerFadeInUp customer-stagger-1"
      )}
    >
      {/* Navigation Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <span>Mi Cuenta</span>
        </h3>
      </div>

      {/* Navigation Items */}
      <div className="p-4">
        <nav className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-left",
                  isActive
                    ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isActive
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  />
                  <span className="font-medium">{section.label}</span>
                </div>

                <div className="flex items-center space-x-2">
                  {section.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      {section.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isActive ? "rotate-90 text-orange-600" : "text-gray-400"
                    )}
                  />
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
