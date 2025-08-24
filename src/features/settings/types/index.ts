/**
 * 🎛️ SETTINGS SYSTEM TYPES
 * ========================
 *
 * Tipos centralizados para el sistema de configuración enterprise.
 * Incluye todas las categorías de settings con type safety completo.
 */

// Re-export all setting types
export * from "./app";
export * from "./auth";
export * from "./database";
export * from "./communications";
export * from "./deployment";
export * from "./integrations";

// Core settings types
export type SettingType =
  | "string"
  | "number"
  | "boolean"
  | "json"
  | "array"
  | "encrypted";

export type EncryptionLevel = "public" | "internal" | "secret" | "vault";

export type SettingCategory =
  | "app"
  | "auth"
  | "database"
  | "communications"
  | "deployment"
  | "integrations";

export type SettingEnvironment =
  | "development"
  | "staging"
  | "production"
  | "all";

// Base setting interface
export interface BaseSetting {
  id: string;
  key: string;
  value: unknown;
  type: SettingType;
  category: SettingCategory;
  section: string;
  label: string;
  description?: string;
  required: boolean;
  sensitive: boolean;
  encryptionLevel: EncryptionLevel;
  environment: SettingEnvironment;
  defaultValue?: unknown;
  validation?: SettingValidation;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// Validation rules
export interface SettingValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: string[];
  custom?: string; // Custom validation function name
  errorMessage?: string;
}

// Setting with decrypted value (for display)
export interface SettingWithValue extends BaseSetting {
  displayValue: string;
  isEncrypted: boolean;
  canView: boolean;
  canEdit: boolean;
}

// Settings configuration schema
export interface SettingSchema {
  category: SettingCategory;
  section: string;
  name: string;
  label: string;
  description?: string;
  type: SettingType;
  required: boolean;
  sensitive: boolean;
  encryptionLevel: EncryptionLevel;
  environment: SettingEnvironment;
  defaultValue?: unknown;
  validation?: SettingValidation;
  dependsOn?: string[]; // Other setting keys this depends on
  order?: number;
}

// Environment variable
export interface EnvironmentVariable {
  id: string;
  key: string;
  value?: string; // Encrypted in storage
  environment: SettingEnvironment;
  category: SettingCategory;
  description?: string;
  required: boolean;
  sensitive: boolean;
  linkedSetting?: string; // Associated setting ID
  deployment?: {
    vercel?: boolean;
    aws?: boolean;
    railway?: boolean;
    netlify?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// Settings group for UI organization
export interface SettingsGroup {
  category: SettingCategory;
  label: string;
  description?: string;
  icon: string;
  sections: SettingsSection[];
  permissions: string[];
  order: number;
}

export interface SettingsSection {
  id: string;
  name: string;
  label: string;
  description?: string;
  settings: string[]; // Setting IDs
  collapsed?: boolean;
  permissions: string[];
  order: number;
}

// Settings operation results
export interface SettingsOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  validationErrors?: Record<string, string>;
}

// Settings query filters
export interface SettingsFilters {
  category?: SettingCategory;
  section?: string;
  environment?: SettingEnvironment;
  sensitive?: boolean;
  required?: boolean;
  search?: string;
}

// Settings export/import
export interface SettingsExport {
  version: string;
  timestamp: Date;
  environment: SettingEnvironment;
  categories: SettingCategory[];
  settings: Record<string, unknown>;
  metadata: {
    exportedBy: string;
    totalSettings: number;
    sensitiveSettings: number;
  };
}

export interface SettingsImport {
  file: File | string;
  environment: SettingEnvironment;
  overwriteExisting: boolean;
  categories?: SettingCategory[];
}

// Settings deployment
export interface DeploymentConfig {
  platform: "vercel" | "aws" | "railway" | "netlify" | "docker";
  environment: SettingEnvironment;
  settings: Record<string, unknown>;
  environmentVariables: Record<string, string>;
  secrets: string[]; // Keys of sensitive values
}

// Audit trail for settings changes
export interface SettingsAuditEvent {
  id: string;
  settingId: string;
  settingKey: string;
  action: "create" | "update" | "delete" | "view" | "export" | "import";
  oldValue?: unknown;
  newValue?: unknown;
  userId: string;
  userEmail: string;
  environment: SettingEnvironment;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Settings dashboard stats
export interface SettingsDashboardStats {
  totalSettings: number;
  settingsByCategory: Record<SettingCategory, number>;
  settingsByEnvironment: Record<SettingEnvironment, number>;
  sensitiveSettings: number;
  requiredSettings: number;
  configurationHealth: {
    score: number; // 0-100
    issues: SettingsHealthIssue[];
  };
  recentChanges: SettingsAuditEvent[];
}

export interface SettingsHealthIssue {
  id: string;
  type: "missing_required" | "invalid_value" | "security_risk" | "deprecated";
  severity: "low" | "medium" | "high" | "critical";
  settingKey: string;
  message: string;
  recommendation: string;
}

// Hook return types
export interface UseSettingsReturn {
  settings: SettingWithValue[];
  isLoading: boolean;
  error: string | null;
  updateSetting: (key: string, value: unknown) => Promise<void>;
  deleteSetting: (key: string) => Promise<void>;
  createSetting: (setting: Partial<BaseSetting>) => Promise<void>;
  refresh: () => Promise<void>;
}

export interface UseEnvironmentVariablesReturn {
  variables: EnvironmentVariable[];
  isLoading: boolean;
  error: string | null;
  createVariable: (variable: Partial<EnvironmentVariable>) => Promise<void>;
  updateVariable: (
    id: string,
    updates: Partial<EnvironmentVariable>
  ) => Promise<void>;
  deleteVariable: (id: string) => Promise<void>;
  syncToDeployment: (platform: string) => Promise<void>;
  refresh: () => Promise<void>;
}

// Component props
export interface SettingsDashboardProps {
  initialCategory?: SettingCategory;
  userId: string;
  userRole: string;
}

export interface SettingsFormProps {
  category: SettingCategory;
  section: string;
  settings: SettingWithValue[];
  onSave: (values: Record<string, unknown>) => Promise<void>;
  isLoading?: boolean;
}

export interface EnvManagerProps {
  environment: SettingEnvironment;
  category?: SettingCategory;
  onVariableCreate: (variable: Partial<EnvironmentVariable>) => Promise<void>;
  onVariableUpdate: (
    id: string,
    updates: Partial<EnvironmentVariable>
  ) => Promise<void>;
  onVariableDelete: (id: string) => Promise<void>;
}
