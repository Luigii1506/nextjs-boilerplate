/**
 * ⚙️ SETTING FIELD COMPONENT
 * =========================
 *
 * Componente reutilizable para campos de configuración
 * Maneja diferentes tipos de inputs y validación
 */

"use client";

import React, { useState, useCallback } from "react";
import { AlertCircle, Check, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/shared/utils";
import type { SettingWithValue } from "../../types";

interface SettingFieldProps {
  setting: SettingWithValue;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
  onSave?: (key: string, value: unknown) => Promise<void>;
  isUpdating?: boolean;
  className?: string;
}

export default function SettingField({
  setting,
  value,
  onChange,
  onSave,
  isUpdating = false,
  className,
}: SettingFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationError, setValidationError] = useState<string>();

  // 🎯 Handle value changes
  const handleChange = useCallback(
    (newValue: unknown) => {
      onChange(setting.key, newValue);
      setHasUnsavedChanges(true);
      setValidationError(undefined);
    },
    [onChange, setting.key]
  );

  // 🎯 Handle save
  const handleSave = useCallback(async () => {
    if (!onSave || !hasUnsavedChanges) return;

    try {
      await onSave(setting.key, value);
      setHasUnsavedChanges(false);
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : "Save failed"
      );
    }
  }, [onSave, setting.key, value, hasUnsavedChanges]);

  // 🎯 Render input based on type
  const renderInput = () => {
    const baseInputClasses = cn(
      "w-full px-3 py-2 border rounded-lg transition-colors",
      "bg-white dark:bg-slate-800",
      "border-slate-300 dark:border-slate-600",
      "text-slate-900 dark:text-white",
      "placeholder-slate-500 dark:placeholder-slate-400",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
      validationError &&
        "border-red-500 focus:ring-red-500 focus:border-red-500",
      !setting.canEdit && "bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
    );

    switch (setting.type) {
      case "boolean":
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleChange(e.target.checked)}
              disabled={!setting.canEdit}
              className={cn(
                "h-4 w-4 text-blue-600 bg-white dark:bg-slate-800",
                "border-slate-300 dark:border-slate-600 rounded",
                "focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2",
                !setting.canEdit && "opacity-50 cursor-not-allowed"
              )}
            />
            <label className="ml-2 text-sm text-slate-700 dark:text-slate-300">
              {setting.name}
            </label>
          </div>
        );

      case "password":
        return (
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={String(value || "")}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={`Enter ${setting.name.toLowerCase()}`}
              disabled={!setting.canEdit}
              className={cn(baseInputClasses, "pr-10")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={!setting.canEdit}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2",
                "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300",
                !setting.canEdit && "opacity-50 cursor-not-allowed"
              )}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        );

      case "number":
        return (
          <input
            type="number"
            value={Number(value) || ""}
            onChange={(e) => handleChange(Number(e.target.value) || 0)}
            placeholder={`Enter ${setting.name.toLowerCase()}`}
            disabled={!setting.canEdit}
            min={setting.validation?.min}
            max={setting.validation?.max}
            className={baseInputClasses}
          />
        );

      case "text":
        return (
          <textarea
            value={String(value || "")}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${setting.name.toLowerCase()}`}
            disabled={!setting.canEdit}
            rows={3}
            className={cn(baseInputClasses, "resize-vertical")}
          />
        );

      case "email":
        return (
          <input
            type="email"
            value={String(value || "")}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${setting.name.toLowerCase()}`}
            disabled={!setting.canEdit}
            className={baseInputClasses}
          />
        );

      case "url":
        return (
          <input
            type="url"
            value={String(value || "")}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${setting.name.toLowerCase()}`}
            disabled={!setting.canEdit}
            className={baseInputClasses}
          />
        );

      case "json":
        return (
          <textarea
            value={
              typeof value === "string" ? value : JSON.stringify(value, null, 2)
            }
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleChange(parsed);
              } catch {
                handleChange(e.target.value);
              }
            }}
            placeholder="Enter valid JSON"
            disabled={!setting.canEdit}
            rows={4}
            className={cn(
              baseInputClasses,
              "font-mono text-sm resize-vertical"
            )}
          />
        );

      default:
        return (
          <input
            type="text"
            value={String(value || "")}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${setting.name.toLowerCase()}`}
            disabled={!setting.canEdit}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Field Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-slate-900 dark:text-white">
            {setting.name}
            {setting.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          {setting.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {setting.description}
            </p>
          )}
        </div>

        {/* Save button for fields with unsaved changes */}
        {hasUnsavedChanges && onSave && (
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className={cn(
              "flex items-center gap-1 px-2 py-1 text-xs rounded",
              "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
              "hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving
              </>
            ) : (
              <>
                <Check className="w-3 h-3" />
                Save
              </>
            )}
          </button>
        )}
      </div>

      {/* Input Field */}
      <div className="space-y-1">
        {renderInput()}

        {/* Field Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {/* Default Value */}
            {setting.defaultValue && (
              <span className="text-slate-500 dark:text-slate-400">
                Default: {String(setting.defaultValue)}
              </span>
            )}

            {/* Secret indicator */}
            {setting.isSecret && (
              <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded text-xs">
                Secret
              </span>
            )}

            {/* Environment indicator */}
            {setting.environment !== "all" && (
              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                {setting.environment}
              </span>
            )}
          </div>

          {/* Unsaved changes indicator */}
          {hasUnsavedChanges && (
            <span className="text-blue-600 dark:text-blue-400">
              Unsaved changes
            </span>
          )}
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-3 h-3" />
            {validationError}
          </div>
        )}

        {/* Validation Rules */}
        {setting.validation && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {setting.validation.minLength && (
              <span>Min length: {setting.validation.minLength}. </span>
            )}
            {setting.validation.maxLength && (
              <span>Max length: {setting.validation.maxLength}. </span>
            )}
            {setting.validation.min && (
              <span>Min value: {setting.validation.min}. </span>
            )}
            {setting.validation.max && (
              <span>Max value: {setting.validation.max}. </span>
            )}
            {setting.validation.pattern && (
              <span>Pattern: {setting.validation.pattern}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
