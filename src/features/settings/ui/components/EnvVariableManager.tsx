/**
 * 🔑 ENVIRONMENT VARIABLE MANAGER
 * ===============================
 *
 * Componente para gestionar variables de entorno de forma segura.
 * Incluye creación, edición, eliminación y sincronización con deployment.
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Shield,
  Key,
  Globe,
  Server,
  Upload,
  Download,
  RefreshCw,
  Search,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type {
  EnvironmentVariable,
  SettingEnvironment,
  SettingCategory,
  EnvManagerProps,
} from "../../types";

// Mock data - in real app, this would come from API
const MOCK_ENV_VARIABLES: EnvironmentVariable[] = [
  {
    id: "1",
    key: "DATABASE_URL",
    environment: "production",
    category: "database",
    description: "Primary database connection string",
    required: true,
    sensitive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    createdBy: "admin",
    updatedBy: "admin",
    deployment: {
      vercel: true,
      aws: false,
      railway: false,
      netlify: false,
    },
  },
  {
    id: "2",
    key: "NEXTAUTH_SECRET",
    environment: "all",
    category: "auth",
    description: "NextAuth.js secret key",
    required: true,
    sensitive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    createdBy: "admin",
    updatedBy: "admin",
    deployment: {
      vercel: true,
      aws: true,
      railway: false,
      netlify: false,
    },
  },
  {
    id: "3",
    key: "GOOGLE_ANALYTICS_ID",
    environment: "production",
    category: "integrations",
    description: "Google Analytics tracking ID",
    required: false,
    sensitive: false,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
    createdBy: "admin",
    updatedBy: "admin",
    deployment: {
      vercel: true,
      aws: false,
      railway: false,
      netlify: true,
    },
  },
];

const ENVIRONMENT_OPTIONS: {
  value: SettingEnvironment;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "development",
    label: "Development",
    icon: <Server className="w-4 h-4" />,
  },
  { value: "staging", label: "Staging", icon: <Globe className="w-4 h-4" /> },
  {
    value: "production",
    label: "Production",
    icon: <Shield className="w-4 h-4" />,
  },
  {
    value: "all",
    label: "All Environments",
    icon: <RefreshCw className="w-4 h-4" />,
  },
];

const CATEGORY_OPTIONS: {
  value: SettingCategory;
  label: string;
  color: string;
}[] = [
  { value: "app", label: "Application", color: "blue" },
  { value: "auth", label: "Authentication", color: "green" },
  { value: "database", label: "Database", color: "purple" },
  { value: "communications", label: "Communications", color: "orange" },
  { value: "deployment", label: "Deployment", color: "red" },
  { value: "integrations", label: "Integrations", color: "pink" },
];

interface EnvVariableItemProps {
  variable: EnvironmentVariable;
  onEdit: (variable: EnvironmentVariable) => void;
  onDelete: (id: string) => void;
  onCopy: (key: string) => void;
}

function EnvVariableItem({
  variable,
  onEdit,
  onDelete,
  onCopy,
}: EnvVariableItemProps) {
  const [showValue, setShowValue] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    onCopy(variable.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [variable.key, onCopy]);

  const categoryConfig = CATEGORY_OPTIONS.find(
    (c) => c.value === variable.category
  );
  const environmentConfig = ENVIRONMENT_OPTIONS.find(
    (e) => e.value === variable.environment
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Variable Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-500" />
              <code className="text-sm font-mono font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                {variable.key}
              </code>
            </div>

            {/* Required Badge */}
            {variable.required && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                Required
              </span>
            )}

            {/* Sensitive Badge */}
            {variable.sensitive && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                <Shield className="w-3 h-3 mr-1" />
                Sensitive
              </span>
            )}
          </div>

          {/* Description */}
          {variable.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {variable.description}
            </p>
          )}

          {/* Environment and Category */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              {environmentConfig?.icon}
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {environmentConfig?.label}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "inline-block w-2 h-2 rounded-full",
                  categoryConfig?.color === "blue" && "bg-blue-500",
                  categoryConfig?.color === "green" && "bg-green-500",
                  categoryConfig?.color === "purple" && "bg-purple-500",
                  categoryConfig?.color === "orange" && "bg-orange-500",
                  categoryConfig?.color === "red" && "bg-red-500",
                  categoryConfig?.color === "pink" && "bg-pink-500"
                )}
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {categoryConfig?.label}
              </span>
            </div>
          </div>

          {/* Deployment Platforms */}
          {variable.deployment && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Deployed to:
              </span>
              {variable.deployment.vercel && (
                <span className="text-xs px-2 py-1 bg-black text-white rounded">
                  Vercel
                </span>
              )}
              {variable.deployment.aws && (
                <span className="text-xs px-2 py-1 bg-orange-500 text-white rounded">
                  AWS
                </span>
              )}
              {variable.deployment.railway && (
                <span className="text-xs px-2 py-1 bg-purple-500 text-white rounded">
                  Railway
                </span>
              )}
              {variable.deployment.netlify && (
                <span className="text-xs px-2 py-1 bg-teal-500 text-white rounded">
                  Netlify
                </span>
              )}
            </div>
          )}

          {/* Value Display */}
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded border">
              {variable.sensitive
                ? showValue
                  ? "actual_secret_value"
                  : "••••••••••••••••"
                : "PUBLIC_VALUE_EXAMPLE"}
            </code>

            {variable.sensitive && (
              <button
                onClick={() => setShowValue(!showValue)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                {showValue ? (
                  <EyeOff className="w-4 h-4 text-slate-500" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-500" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            title="Copy variable name"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-slate-500" />
            )}
          </button>

          <button
            onClick={() => onEdit(variable)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            title="Edit variable"
          >
            <Edit2 className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => onDelete(variable.id)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            title="Delete variable"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface EnvVariableFormProps {
  variable?: EnvironmentVariable;
  onSave: (variable: Partial<EnvironmentVariable>) => void;
  onCancel: () => void;
}

function EnvVariableForm({ variable, onSave, onCancel }: EnvVariableFormProps) {
  const [formData, setFormData] = useState({
    key: variable?.key || "",
    value: "",
    environment: variable?.environment || ("development" as SettingEnvironment),
    category: variable?.category || ("app" as SettingCategory),
    description: variable?.description || "",
    required: variable?.required || false,
    sensitive: variable?.sensitive || false,
    deployment: variable?.deployment || {
      vercel: false,
      aws: false,
      railway: false,
      netlify: false,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 w-full max-w-2xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {variable ? "Edit" : "Add"} Environment Variable
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Variable Key */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Variable Name *
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, key: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder="DATABASE_URL"
              required
            />
          </div>

          {/* Variable Value */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Value {formData.required && "*"}
            </label>
            <input
              type={formData.sensitive ? "password" : "text"}
              value={formData.value}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, value: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder="Enter variable value"
              required={formData.required}
            />
          </div>

          {/* Environment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Environment *
            </label>
            <select
              value={formData.environment}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  environment: e.target.value as SettingEnvironment,
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              required
            >
              {ENVIRONMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value as SettingCategory,
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              required
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              rows={3}
              placeholder="Optional description for this variable"
            />
          </div>

          {/* Flags */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.required}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    required: e.target.checked,
                  }))
                }
                className="mr-2"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Required variable
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.sensitive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sensitive: e.target.checked,
                  }))
                }
                className="mr-2"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Sensitive data (encrypt)
              </span>
            </label>
          </div>

          {/* Deployment Platforms */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Deploy to Platforms
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(formData.deployment).map(
                ([platform, enabled]) => (
                  <label key={platform} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          deployment: {
                            ...prev.deployment,
                            [platform]: e.target.checked,
                          },
                        }))
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                      {platform}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
            >
              {variable ? "Update" : "Create"} Variable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EnvVariableManager({
  environment = "all",
  category,
  onVariableCreate,
  onVariableUpdate,
  onVariableDelete,
}: EnvManagerProps) {
  const [variables, setVariables] =
    useState<EnvironmentVariable[]>(MOCK_ENV_VARIABLES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<SettingEnvironment>(environment);
  const [selectedCategory, setSelectedCategory] = useState<
    SettingCategory | "all"
  >(category || "all");
  const [showForm, setShowForm] = useState(false);
  const [editingVariable, setEditingVariable] = useState<
    EnvironmentVariable | undefined
  >();

  // Filter variables
  const filteredVariables = variables.filter((variable) => {
    if (
      searchQuery &&
      !variable.key.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (
      selectedEnvironment !== "all" &&
      variable.environment !== "all" &&
      variable.environment !== selectedEnvironment
    ) {
      return false;
    }
    if (selectedCategory !== "all" && variable.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const handleCreateVariable = useCallback(
    async (data: Partial<EnvironmentVariable>) => {
      try {
        await onVariableCreate(data);
        setShowForm(false);
        // Refresh variables list
      } catch (error) {
        console.error("Failed to create variable:", error);
      }
    },
    [onVariableCreate]
  );

  const handleUpdateVariable = useCallback(
    async (data: Partial<EnvironmentVariable>) => {
      if (!editingVariable) return;

      try {
        await onVariableUpdate(editingVariable.id, data);
        setEditingVariable(undefined);
        setShowForm(false);
        // Refresh variables list
      } catch (error) {
        console.error("Failed to update variable:", error);
      }
    },
    [editingVariable, onVariableUpdate]
  );

  const handleDeleteVariable = useCallback(
    async (id: string) => {
      if (
        !confirm("Are you sure you want to delete this environment variable?")
      ) {
        return;
      }

      try {
        await onVariableDelete(id);
        setVariables((prev) => prev.filter((v) => v.id !== id));
      } catch (error) {
        console.error("Failed to delete variable:", error);
      }
    },
    [onVariableDelete]
  );

  const handleCopyVariable = useCallback((key: string) => {
    navigator.clipboard.writeText(key);
  }, []);

  const handleEditVariable = useCallback((variable: EnvironmentVariable) => {
    setEditingVariable(variable);
    setShowForm(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Environment Variables
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage environment variables and deployment configuration
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Variable
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search variables..."
            className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
        </div>

        {/* Environment Filter */}
        <select
          value={selectedEnvironment}
          onChange={(e) =>
            setSelectedEnvironment(e.target.value as SettingEnvironment)
          }
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
        >
          <option value="all">All Environments</option>
          {ENVIRONMENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) =>
            setSelectedCategory(e.target.value as SettingCategory | "all")
          }
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
        >
          <option value="all">All Categories</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Variables List */}
      <div className="space-y-4">
        {filteredVariables.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <Key className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
              No environment variables found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {searchQuery
                ? "Try adjusting your search or filters."
                : "Get started by adding your first environment variable."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
              >
                Add Variable
              </button>
            )}
          </div>
        ) : (
          filteredVariables.map((variable) => (
            <EnvVariableItem
              key={variable.id}
              variable={variable}
              onEdit={handleEditVariable}
              onDelete={handleDeleteVariable}
              onCopy={handleCopyVariable}
            />
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <EnvVariableForm
          variable={editingVariable}
          onSave={editingVariable ? handleUpdateVariable : handleCreateVariable}
          onCancel={() => {
            setShowForm(false);
            setEditingVariable(undefined);
          }}
        />
      )}

      {/* Warning Notice */}
      <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
            Security Notice
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
            Sensitive environment variables are encrypted at rest and only
            accessible to authorized users. Never commit sensitive values to
            version control.
          </p>
        </div>
      </div>
    </div>
  );
}

