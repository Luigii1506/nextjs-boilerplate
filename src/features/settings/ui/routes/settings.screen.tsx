/**
 * ⚙️ SETTINGS SCREEN
 * ==================
 *
 * Pantalla principal de configuración del sistema.
 * Dashboard completo con navegación por categorías y secciones.
 */

"use client";

import React, { useState, Suspense } from "react";
import {
  Settings,
  Shield,
  Database,
  Mail,
  Rocket,
  Plug,
  Key,
  Monitor,
  AlertCircle,
  CheckCircle,
  Clock,
  Palette,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type {
  SettingCategory,
  SettingsDashboardProps,
  SettingsGroup,
} from "../../types";

// Settings categories configuration
const SETTINGS_CATEGORIES: SettingsGroup[] = [
  {
    category: "app",
    label: "Application",
    description: "General app configuration and branding",
    icon: "Settings",
    order: 1,
    permissions: ["settings.view", "settings.edit.app"],
    sections: [
      {
        id: "general",
        name: "general",
        label: "General Settings",
        description: "Basic application configuration",
        settings: ["app.name", "app.description", "app.version"],
        permissions: ["settings.edit.app"],
        order: 1,
      },
      {
        id: "branding",
        name: "branding",
        label: "Branding & UI",
        description: "Visual appearance and branding",
        settings: ["app.primaryColor", "app.logoUrl"],
        permissions: ["settings.edit.app"],
        order: 2,
      },
      {
        id: "features",
        name: "features",
        label: "Feature Flags",
        description: "Enable or disable application features",
        settings: ["app.userRegistration", "app.darkMode"],
        permissions: ["settings.edit.app"],
        order: 3,
      },
    ],
  },
  {
    category: "auth",
    label: "Authentication",
    description: "User authentication and security settings",
    icon: "Shield",
    order: 2,
    permissions: ["settings.view", "settings.edit.auth"],
    sections: [
      {
        id: "providers",
        name: "providers",
        label: "OAuth Providers",
        description: "Configure social login providers",
        settings: ["auth.google", "auth.github"],
        permissions: ["settings.edit.auth"],
        order: 1,
      },
      {
        id: "security",
        name: "security",
        label: "Security Policies",
        description: "Password policies and security settings",
        settings: ["auth.passwordPolicy", "auth.lockoutPolicy"],
        permissions: ["settings.edit.auth"],
        order: 2,
      },
    ],
  },
  {
    category: "database",
    label: "Database",
    description: "Database connections and optimization",
    icon: "Database",
    order: 3,
    permissions: ["settings.view", "settings.edit.database"],
    sections: [
      {
        id: "connection",
        name: "connection",
        label: "Database Connections",
        description: "Configure database connections and pooling",
        settings: ["db.primaryConnection"],
        permissions: ["settings.edit.database"],
        order: 1,
      },
    ],
  },
  {
    category: "communications",
    label: "Communications",
    description: "Email, SMS and notification settings",
    icon: "Mail",
    order: 4,
    permissions: ["settings.view", "settings.edit.communications"],
    sections: [
      {
        id: "email",
        name: "email",
        label: "Email Configuration",
        description: "Configure email providers and settings",
        settings: ["email.provider", "email.fromEmail"],
        permissions: ["settings.edit.communications"],
        order: 1,
      },
    ],
  },
  {
    category: "deployment",
    label: "Deployment",
    description: "Deployment and infrastructure settings",
    icon: "Rocket",
    order: 5,
    permissions: ["settings.view", "settings.edit.deployment"],
    sections: [
      {
        id: "vercel",
        name: "vercel",
        label: "Vercel",
        description: "Vercel deployment configuration",
        settings: ["vercel.projectId", "vercel.accessToken"],
        permissions: ["settings.edit.deployment"],
        order: 1,
      },
    ],
  },
  {
    category: "integrations",
    label: "Integrations",
    description: "Third-party service integrations",
    icon: "Plug",
    order: 6,
    permissions: ["settings.view", "settings.edit.integrations"],
    sections: [
      {
        id: "analytics",
        name: "analytics",
        label: "Analytics",
        description: "Web analytics and tracking services",
        settings: ["analytics.googleAnalytics"],
        permissions: ["settings.edit.integrations"],
        order: 1,
      },
    ],
  },
];

// Icon mapping
const ICON_MAP = {
  Settings,
  Shield,
  Database,
  Mail,
  Rocket,
  Plug,
  Key,
  Monitor,
  Palette,
};

interface SettingsNavigationProps {
  categories: SettingsGroup[];
  activeCategory: SettingCategory;
  onCategoryChange: (category: SettingCategory) => void;
  userPermissions: string[];
}

function SettingsNavigation({
  categories,
  activeCategory,
  onCategoryChange,
  userPermissions,
}: SettingsNavigationProps) {
  return (
    <nav className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Settings
          </h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configure your application
        </p>
      </div>

      <div className="p-4 space-y-2">
        {categories
          .filter((category) =>
            category.permissions.some((permission) =>
              userPermissions.includes(permission)
            )
          )
          .sort((a, b) => a.order - b.order)
          .map((category) => {
            const IconComponent =
              ICON_MAP[category.icon as keyof typeof ICON_MAP];
            const isActive = activeCategory === category.category;

            return (
              <button
                key={category.category}
                onClick={() => onCategoryChange(category.category)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                )}
              >
                {IconComponent && (
                  <IconComponent
                    className={cn(
                      "w-5 h-5",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-500"
                    )}
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium">{category.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {category.description}
                  </div>
                </div>
              </button>
            );
          })}
      </div>

      {/* Environment Variables Section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          onClick={() => {
            /* Handle env vars */
          }}
        >
          <Key className="w-5 h-5 text-slate-500" />
          <div className="flex-1">
            <div className="font-medium">Environment Variables</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage environment variables
            </div>
          </div>
        </button>
      </div>
    </nav>
  );
}

interface SettingsContentProps {
  category: SettingCategory;
  userRole: string;
}

function SettingsContent({ category, userRole }: SettingsContentProps) {
  const categoryConfig = SETTINGS_CATEGORIES.find(
    (c) => c.category === category
  );

  if (!categoryConfig) {
    return (
      <div className="flex-1 p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">
            Category not found
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            The selected settings category could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl">
        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            {(() => {
              const IconComponent =
                ICON_MAP[categoryConfig.icon as keyof typeof ICON_MAP];
              return (
                IconComponent && (
                  <IconComponent className="w-6 h-6 text-blue-600" />
                )
              );
            })()}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {categoryConfig.label}
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {categoryConfig.description}
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {categoryConfig.sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div
                key={section.id}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {section.label}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {section.description}
                  </p>
                </div>

                <div className="p-6">
                  {/* Settings Form Component will go here */}
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500 dark:text-slate-400">
                        Settings form for {section.label} coming soon...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

interface SettingsStatsProps {
  stats: {
    totalSettings: number;
    configuredSettings: number;
    healthScore: number;
    lastUpdated?: Date;
  };
}

function SettingsStats({ stats }: SettingsStatsProps) {
  const configurationPercent = Math.round(
    (stats.configuredSettings / stats.totalSettings) * 100
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Configuration Status
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Settings */}
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.totalSettings}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total Settings
          </div>
        </div>

        {/* Configured Settings */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.configuredSettings}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Configured ({configurationPercent}%)
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${configurationPercent}%` }}
            />
          </div>
        </div>

        {/* Health Score */}
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.healthScore}/100
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Health Score
          </div>
          <div className="flex items-center justify-center mt-2">
            <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-xs text-green-600">Good</span>
          </div>
        </div>
      </div>

      {stats.lastUpdated && (
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
          Last updated: {stats.lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default function SettingsScreen({
  initialCategory = "app",
  userId,
  userRole,
}: SettingsDashboardProps) {
  const [activeCategory, setActiveCategory] =
    useState<SettingCategory>(initialCategory);

  // Mock user permissions - in real app, get from auth context
  const userPermissions = [
    "settings.view",
    "settings.edit.app",
    "settings.edit.auth",
    "settings.edit.database",
    "settings.edit.communications",
    "settings.edit.deployment",
    "settings.edit.integrations",
  ];

  // Mock stats - in real app, get from API
  const mockStats = {
    totalSettings: 45,
    configuredSettings: 28,
    healthScore: 85,
    lastUpdated: new Date(),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Settings Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                System Configuration
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your application settings and integrations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Signed in as {userRole}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Settings Navigation */}
        <SettingsNavigation
          categories={SETTINGS_CATEGORIES}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          userPermissions={userPermissions}
        />

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-8">
            {/* Configuration Stats */}
            <SettingsStats stats={mockStats} />

            {/* Settings Content */}
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64">
                  <Clock className="w-8 h-8 text-slate-400 animate-spin" />
                </div>
              }
            >
              <SettingsContent category={activeCategory} userRole={userRole} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

