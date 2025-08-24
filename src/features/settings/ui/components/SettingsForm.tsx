/**
 * 📝 SETTINGS FORM COMPONENT
 * ==========================
 *
 * Formulario modular para configuraciones por sección
 * Maneja múltiples campos y validación
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/shared/utils";
import SettingField from "./SettingField";
import type { SettingWithValue, SettingsSection } from "../../types";

interface SettingsFormProps {
  section: SettingsSection;
  settings: SettingWithValue[];
  onUpdateSetting: (key: string, value: unknown) => Promise<void>;
  onBulkUpdate?: (updates: Record<string, unknown>) => Promise<void>;
  onReset?: () => Promise<void>;
  isUpdating?: boolean;
  className?: string;
}

export default function SettingsForm({
  section,
  settings,
  onUpdateSetting,
  onBulkUpdate,
  onReset,
  isUpdating = false,
  className,
}: SettingsFormProps) {
  const [formValues, setFormValues] = useState<Record<string, unknown>>(() =>
    settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, unknown>)
  );

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  // 🎯 Handle individual field changes
  const handleFieldChange = useCallback(
    (key: string, value: unknown) => {
      setFormValues((prev) => ({ ...prev, [key]: value }));
      setHasUnsavedChanges(true);

      // Clear validation error for this field
      if (validationErrors[key]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }

      setSaveStatus("idle");
    },
    [validationErrors]
  );

  // 🎯 Handle individual field save
  const handleFieldSave = useCallback(
    async (key: string, value: unknown) => {
      setSaveStatus("saving");

      try {
        await onUpdateSetting(key, value);
        setSaveStatus("success");

        // Auto-clear success status
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        setSaveStatus("error");
        setValidationErrors((prev) => ({
          ...prev,
          [key]: error instanceof Error ? error.message : "Save failed",
        }));
      }
    },
    [onUpdateSetting]
  );

  // 🎯 Handle bulk save
  const handleBulkSave = useCallback(async () => {
    if (!onBulkUpdate || !hasUnsavedChanges) return;

    setSaveStatus("saving");
    setValidationErrors({});

    try {
      // Get only changed values
      const changedValues = Object.entries(formValues).reduce(
        (acc, [key, value]) => {
          const originalSetting = settings.find((s) => s.key === key);
          if (originalSetting && originalSetting.value !== value) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, unknown>
      );

      if (Object.keys(changedValues).length === 0) {
        setHasUnsavedChanges(false);
        return;
      }

      await onBulkUpdate(changedValues);
      setHasUnsavedChanges(false);
      setSaveStatus("success");

      // Auto-clear success status
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
      setValidationErrors({
        _form: error instanceof Error ? error.message : "Save failed",
      });
    }
  }, [onBulkUpdate, hasUnsavedChanges, formValues, settings]);

  // 🎯 Handle reset
  const handleReset = useCallback(async () => {
    if (!onReset) return;

    setSaveStatus("saving");

    try {
      await onReset();

      // Reset form values to current settings
      setFormValues(
        settings.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, unknown>)
      );

      setHasUnsavedChanges(false);
      setValidationErrors({});
      setSaveStatus("success");

      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      setSaveStatus("error");
      setValidationErrors({
        _form: error instanceof Error ? error.message : "Reset failed",
      });
    }
  }, [onReset, settings]);

  // 🎯 Filter settings for this section
  const sectionSettings = settings.filter((setting) =>
    section.settings.includes(setting.key)
  );

  // 🎯 Check if there are any editable settings
  const hasEditableSettings = sectionSettings.some(
    (setting) => setting.canEdit
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {section.label}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {section.description}
          </p>
        </div>

        {/* Action Buttons */}
        {hasEditableSettings && (
          <div className="flex items-center gap-2">
            {onReset && (
              <button
                onClick={handleReset}
                disabled={saveStatus === "saving"}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors",
                  "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
                  "border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            )}

            {onBulkUpdate && hasUnsavedChanges && (
              <button
                onClick={handleBulkSave}
                disabled={saveStatus === "saving"}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors",
                  "bg-blue-600 hover:bg-blue-700 text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save All
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Form Status */}
      {saveStatus === "success" && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300">
            Settings saved successfully
          </span>
        </div>
      )}

      {saveStatus === "error" && validationErrors._form && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-700 dark:text-red-300">
            {validationErrors._form}
          </span>
        </div>
      )}

      {/* Settings Fields */}
      <div className="space-y-4">
        {sectionSettings.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No settings available for this section.
          </div>
        ) : (
          sectionSettings.map((setting) => (
            <SettingField
              key={setting.key}
              setting={setting}
              value={formValues[setting.key]}
              onChange={handleFieldChange}
              onSave={onBulkUpdate ? undefined : handleFieldSave}
              isUpdating={saveStatus === "saving"}
            />
          ))
        )}
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm text-amber-700 dark:text-amber-300">
            You have unsaved changes. Don&apos;t forget to save your settings.
          </span>
        </div>
      )}
    </div>
  );
}
