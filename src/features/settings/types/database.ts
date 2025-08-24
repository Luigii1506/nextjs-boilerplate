/**
 * 💾 DATABASE CONFIGURATION TYPES
 * ===============================
 *
 * Tipos para configuración de base de datos y almacenamiento.
 * Incluye conexiones, backup, optimización y migraciones.
 */

// Database provider types
export type DatabaseProvider =
  | "postgresql"
  | "mysql"
  | "sqlite"
  | "mongodb"
  | "redis"
  | "prisma";

export type DatabaseEnvironment = "development" | "staging" | "production";

// Database connection configuration
export interface DatabaseConnection {
  id: string;
  name: string;
  provider: DatabaseProvider;
  environment: DatabaseEnvironment;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string; // Encrypted
  ssl: boolean;
  sslCert?: string;
  connectionString?: string; // Encrypted, alternative to individual fields
  poolSize?: number;
  connectionTimeout?: number; // seconds
  idleTimeout?: number; // seconds
  maxConnections?: number;
  retryAttempts?: number;
  retryDelay?: number; // seconds
  options?: Record<string, unknown>;
  isActive: boolean;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Database backup configuration
export interface DatabaseBackup {
  enabled: boolean;
  schedule: string; // Cron expression
  retention: {
    daily: number; // days
    weekly: number; // weeks
    monthly: number; // months
  };
  compression: boolean;
  encryption: boolean;
  storage: {
    provider: "local" | "s3" | "gcs" | "azure" | "dropbox";
    path: string;
    credentials?: Record<string, string>; // Encrypted
  };
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    channels: string[]; // Email addresses or webhook URLs
  };
  excludeTables?: string[];
  includeTables?: string[];
  customScript?: string;
}

// Database optimization settings
export interface DatabaseOptimization {
  indexOptimization: boolean;
  queryOptimization: boolean;
  connectionPooling: boolean;
  queryCache: {
    enabled: boolean;
    size: string; // e.g., "128MB"
    ttl: number; // seconds
  };
  slowQueryLog: {
    enabled: boolean;
    threshold: number; // seconds
    maxSize: string; // e.g., "100MB"
  };
  performanceSchema: boolean;
  autoVacuum: boolean; // PostgreSQL
  autoAnalyze: boolean;
  maintenance: {
    schedule: string; // Cron expression
    operations: string[]; // e.g., ["VACUUM", "ANALYZE", "REINDEX"]
  };
}

// Migration configuration
export interface DatabaseMigration {
  enabled: boolean;
  autoMigrate: boolean;
  migrationPath: string;
  backupBeforeMigration: boolean;
  rollbackSupport: boolean;
  dryRun: boolean;
  notifications: {
    onStart: boolean;
    onComplete: boolean;
    onError: boolean;
    channels: string[];
  };
  customCommands?: {
    before: string[];
    after: string[];
  };
}

// Database monitoring
export interface DatabaseMonitoring {
  enabled: boolean;
  metrics: {
    connections: boolean;
    queries: boolean;
    performance: boolean;
    storage: boolean;
    replication: boolean;
  };
  alerts: {
    connectionThreshold: number; // percentage
    slowQueryThreshold: number; // seconds
    storageThreshold: number; // percentage
    errorRateThreshold: number; // percentage
    channels: string[];
  };
  logging: {
    level: "error" | "warn" | "info" | "debug";
    maxSize: string;
    retention: number; // days
  };
}

// Read replica configuration
export interface DatabaseReplica {
  enabled: boolean;
  replicas: Array<{
    id: string;
    name: string;
    host: string;
    port: number;
    priority: number;
    readOnly: boolean;
    lagThreshold: number; // seconds
  }>;
  loadBalancing: "round_robin" | "least_connections" | "weighted";
  failover: {
    enabled: boolean;
    timeout: number; // seconds
    maxRetries: number;
  };
}

// Database security settings
export interface DatabaseSecurity {
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  accessControl: {
    ipWhitelist: string[];
    requireVPN: boolean;
    multiFactorAuth: boolean;
  };
  auditing: {
    enabled: boolean;
    logAllQueries: boolean;
    logDataChanges: boolean;
    logSchemaChanges: boolean;
    retention: number; // days
  };
  sensitiveDataMasking: {
    enabled: boolean;
    fields: string[];
    maskingStrategy: "partial" | "full" | "hash";
  };
}

// Database configuration combined
export interface DatabaseConfiguration {
  connections: DatabaseConnection[];
  backup: DatabaseBackup;
  optimization: DatabaseOptimization;
  migration: DatabaseMigration;
  monitoring: DatabaseMonitoring;
  replica: DatabaseReplica;
  security: DatabaseSecurity;
}

// Database health check
export interface DatabaseHealth {
  status: "healthy" | "warning" | "error";
  connections: {
    active: number;
    idle: number;
    max: number;
    utilization: number; // percentage
  };
  performance: {
    avgQueryTime: number; // ms
    slowQueries: number;
    errorRate: number; // percentage
  };
  storage: {
    used: string;
    available: string;
    utilization: number; // percentage
  };
  replication: {
    status: "synced" | "lagging" | "error";
    lag: number; // seconds
  };
  lastChecked: Date;
}

// Database operation result
export interface DatabaseOperationResult {
  success: boolean;
  operation: "backup" | "restore" | "migrate" | "optimize" | "test_connection";
  duration: number; // seconds
  recordsAffected?: number;
  message?: string;
  error?: string;
  timestamp: Date;
}

// Default database configuration
export const DEFAULT_DATABASE_CONFIG: DatabaseConfiguration = {
  connections: [],
  backup: {
    enabled: false,
    schedule: "0 2 * * *", // Daily at 2 AM
    retention: {
      daily: 7,
      weekly: 4,
      monthly: 12,
    },
    compression: true,
    encryption: true,
    storage: {
      provider: "local",
      path: "./backups",
    },
    notifications: {
      onSuccess: false,
      onFailure: true,
      channels: [],
    },
  },
  optimization: {
    indexOptimization: true,
    queryOptimization: true,
    connectionPooling: true,
    queryCache: {
      enabled: true,
      size: "64MB",
      ttl: 300, // 5 minutes
    },
    slowQueryLog: {
      enabled: true,
      threshold: 1, // 1 second
      maxSize: "50MB",
    },
    performanceSchema: false,
    autoVacuum: true,
    autoAnalyze: true,
    maintenance: {
      schedule: "0 3 * * 0", // Weekly on Sunday at 3 AM
      operations: ["VACUUM", "ANALYZE"],
    },
  },
  migration: {
    enabled: true,
    autoMigrate: false,
    migrationPath: "./prisma/migrations",
    backupBeforeMigration: true,
    rollbackSupport: true,
    dryRun: false,
    notifications: {
      onStart: true,
      onComplete: true,
      onError: true,
      channels: [],
    },
  },
  monitoring: {
    enabled: false,
    metrics: {
      connections: true,
      queries: true,
      performance: true,
      storage: true,
      replication: false,
    },
    alerts: {
      connectionThreshold: 80,
      slowQueryThreshold: 5,
      storageThreshold: 85,
      errorRateThreshold: 5,
      channels: [],
    },
    logging: {
      level: "warn",
      maxSize: "100MB",
      retention: 30,
    },
  },
  replica: {
    enabled: false,
    replicas: [],
    loadBalancing: "round_robin",
    failover: {
      enabled: false,
      timeout: 30,
      maxRetries: 3,
    },
  },
  security: {
    encryptionAtRest: false,
    encryptionInTransit: true,
    accessControl: {
      ipWhitelist: [],
      requireVPN: false,
      multiFactorAuth: false,
    },
    auditing: {
      enabled: false,
      logAllQueries: false,
      logDataChanges: true,
      logSchemaChanges: true,
      retention: 90,
    },
    sensitiveDataMasking: {
      enabled: false,
      fields: [],
      maskingStrategy: "partial",
    },
  },
};

// Database settings sections
export const DATABASE_SETTINGS_SECTIONS = [
  {
    id: "connection",
    name: "connection",
    label: "Database Connections",
    description: "Configure database connections and pooling",
    icon: "Database",
    order: 1,
  },
  {
    id: "backup",
    name: "backup",
    label: "Backup & Recovery",
    description: "Automated backup and recovery settings",
    icon: "Archive",
    order: 2,
  },
  {
    id: "optimization",
    name: "optimization",
    label: "Performance Optimization",
    description: "Query optimization and caching settings",
    icon: "Zap",
    order: 3,
  },
  {
    id: "migrations",
    name: "migrations",
    label: "Database Migrations",
    description: "Schema migration configuration",
    icon: "GitBranch",
    order: 4,
  },
] as const;

// Database connection templates
export const DATABASE_CONNECTION_TEMPLATES = {
  postgresql: {
    port: 5432,
    ssl: true,
    poolSize: 10,
    connectionTimeout: 30,
    idleTimeout: 300,
  },
  mysql: {
    port: 3306,
    ssl: true,
    poolSize: 10,
    connectionTimeout: 30,
    idleTimeout: 300,
  },
  sqlite: {
    port: 0,
    ssl: false,
    poolSize: 1,
    connectionTimeout: 10,
    idleTimeout: 60,
  },
  mongodb: {
    port: 27017,
    ssl: true,
    poolSize: 10,
    connectionTimeout: 30,
    idleTimeout: 300,
  },
  redis: {
    port: 6379,
    ssl: false,
    poolSize: 10,
    connectionTimeout: 10,
    idleTimeout: 60,
  },
} as const;

// Validation rules for database settings
export const DATABASE_SETTINGS_VALIDATION = {
  connection: {
    host: { required: true, pattern: /^[a-zA-Z0-9.-]+$/ },
    port: { required: true, min: 1, max: 65535 },
    database: { required: true, minLength: 1, maxLength: 63 },
    username: { required: true, minLength: 1, maxLength: 63 },
    poolSize: { min: 1, max: 100 },
    connectionTimeout: { min: 1, max: 300 },
    idleTimeout: { min: 30, max: 3600 },
  },
  backup: {
    schedule: {
      required: true,
      pattern:
        /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/,
      errorMessage: "Must be a valid cron expression",
    },
    retention: {
      daily: { min: 1, max: 30 },
      weekly: { min: 1, max: 52 },
      monthly: { min: 1, max: 24 },
    },
  },
} as const;

