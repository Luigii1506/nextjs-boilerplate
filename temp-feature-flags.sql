-- 🎛️ FEATURE FLAGS TABLES
-- ======================
-- Crear solo las tablas de feature flags sin afectar las existentes

CREATE TABLE IF NOT EXISTS "feature_flags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'module',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "envOverride" TEXT,
    "dependencies" TEXT[] DEFAULT '{}',
    "conflicts" TEXT[] DEFAULT '{}',
    "hasPrismaModels" BOOLEAN NOT NULL DEFAULT false,
    "prismaFile" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "author" TEXT,
    "docs" TEXT,
    "tags" TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rolloutPercentage" INTEGER NOT NULL DEFAULT 100,
    "targetUsers" TEXT[] DEFAULT '{}',
    "targetRoles" TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS "feature_flags_key_idx" ON "feature_flags"("key");
CREATE INDEX IF NOT EXISTS "feature_flags_category_idx" ON "feature_flags"("category");
CREATE INDEX IF NOT EXISTS "feature_flags_enabled_idx" ON "feature_flags"("enabled");

CREATE TABLE IF NOT EXISTS "feature_flag_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flagKey" TEXT NOT NULL,
    "previousValue" BOOLEAN NOT NULL,
    "newValue" BOOLEAN NOT NULL,
    "changedBy" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "feature_flag_history_flagKey_idx" ON "feature_flag_history"("flagKey");
CREATE INDEX IF NOT EXISTS "feature_flag_history_createdAt_idx" ON "feature_flag_history"("createdAt");

CREATE TABLE IF NOT EXISTS "module_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleKey" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "dependencies" TEXT[] DEFAULT '{}',
    "prismaModels" TEXT[] DEFAULT '{}',
    "apiRoutes" TEXT[] DEFAULT '{}',
    "requiredFlags" TEXT[] DEFAULT '{}',
    "componentPath" TEXT,
    "configPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "module_configs_moduleKey_idx" ON "module_configs"("moduleKey");

-- Insertar feature flags por defecto
INSERT INTO "feature_flags" (id, key, name, description, category, enabled, hasPrismaModels, version, tags)
VALUES 
    ('ff-fileupload', 'fileUpload', 'File Upload System', 'Complete file upload and management system with S3 support', 'module', true, true, '1.0.0', '{"files", "storage", "upload"}'),
    ('ff-analytics', 'analytics', 'Advanced Analytics', 'Enhanced analytics and reporting dashboard', 'module', false, false, '1.0.0', '{"analytics", "dashboard", "metrics"}'),
    ('ff-darkmode', 'darkMode', 'Dark Mode', 'Dark theme support for the application', 'ui', false, false, '1.0.0', '{"ui", "theme"}'),
    ('ff-beta', 'betaFeatures', 'Beta Features', 'Experimental features for testing', 'experimental', false, false, '0.1.0', '{"experimental", "beta"}')
ON CONFLICT (key) DO NOTHING;
