/**
 * 🚀 DEPLOYMENT CONFIGURATION TYPES
 * =================================
 *
 * Tipos para configuración de deployment e infraestructura.
 * Incluye Vercel, AWS, Railway, Docker y configuraciones de monitoreo.
 */

// Deployment platform types
export type DeploymentPlatform =
  | "vercel"
  | "aws"
  | "railway"
  | "netlify"
  | "heroku"
  | "digitalocean"
  | "docker"
  | "kubernetes";

export type DeploymentEnvironment =
  | "development"
  | "preview"
  | "staging"
  | "production";

// Vercel configuration
export interface VercelConfig {
  enabled: boolean;
  teamId?: string;
  projectId?: string;
  accessToken?: string; // Encrypted
  framework?: "nextjs" | "react" | "vue" | "angular" | "svelte";
  buildCommand?: string;
  outputDirectory?: string;
  installCommand?: string;
  devCommand?: string;
  environments: Record<
    DeploymentEnvironment,
    {
      environmentVariables: Record<string, string>;
      domains: string[];
      functions?: {
        memory?: number; // MB
        maxDuration?: number; // seconds
      };
      redirects?: Array<{
        source: string;
        destination: string;
        permanent: boolean;
      }>;
      headers?: Array<{
        source: string;
        headers: Record<string, string>;
      }>;
    }
  >;
  deployHooks: Array<{
    id: string;
    name: string;
    url: string;
    ref: string; // branch
  }>;
  analytics: {
    enabled: boolean;
    webVitals: boolean;
  };
  speedInsights: boolean;
}

// AWS configuration
export interface AwsConfig {
  enabled: boolean;
  region: string;
  accessKeyId?: string; // Encrypted
  secretAccessKey?: string; // Encrypted
  profile?: string;
  services: {
    ec2: {
      enabled: boolean;
      instanceType: string;
      keyPairName: string;
      securityGroups: string[];
      subnet?: string;
      userData?: string;
    };
    ecs: {
      enabled: boolean;
      clusterName: string;
      serviceName: string;
      taskDefinition: string;
      desiredCount: number;
    };
    lambda: {
      enabled: boolean;
      runtime: string;
      handler: string;
      timeout: number;
      memorySize: number;
      environmentVariables: Record<string, string>;
    };
    s3: {
      enabled: boolean;
      bucketName: string;
      region: string;
      publicRead: boolean;
      versioning: boolean;
    };
    rds: {
      enabled: boolean;
      dbInstanceClass: string;
      engine: string;
      engineVersion: string;
      allocatedStorage: number;
      multiAz: boolean;
      backupRetention: number;
    };
    elasticache: {
      enabled: boolean;
      nodeType: string;
      numCacheNodes: number;
      engine: "redis" | "memcached";
    };
  };
  cloudformation: {
    enabled: boolean;
    stackName: string;
    templatePath: string;
    parameters: Record<string, string>;
  };
}

// Railway configuration
export interface RailwayConfig {
  enabled: boolean;
  projectId?: string;
  token?: string; // Encrypted
  environments: Record<
    DeploymentEnvironment,
    {
      serviceId?: string;
      environmentVariables: Record<string, string>;
      domains: string[];
      resources: {
        cpu: number; // vCPU
        memory: number; // MB
      };
      buildCommand?: string;
      startCommand?: string;
    }
  >;
  services: Array<{
    id: string;
    name: string;
    type: "web" | "worker" | "database" | "redis";
    source: {
      type: "github" | "gitlab" | "docker";
      repository?: string;
      branch?: string;
      dockerImage?: string;
    };
  }>;
}

// Netlify configuration
export interface NetlifyConfig {
  enabled: boolean;
  siteId?: string;
  accessToken?: string; // Encrypted
  buildSettings: {
    buildCommand: string;
    publishDirectory: string;
    functionsDirectory?: string;
    environment: Record<string, string>;
  };
  deploySettings: {
    branchDeploy: boolean;
    splitTesting: boolean;
    deployPreviews: boolean;
    contextualEnv: boolean;
  };
  functions: {
    enabled: boolean;
    runtime: "nodejs14.x" | "nodejs16.x" | "nodejs18.x" | "go";
    timeout: number;
  };
  forms: {
    enabled: boolean;
    notifications: string[]; // email addresses
  };
  analytics: boolean;
}

// Docker configuration
export interface DockerConfig {
  enabled: boolean;
  dockerfile: string;
  buildArgs: Record<string, string>;
  ports: number[];
  volumes: Array<{
    host: string;
    container: string;
    mode: "ro" | "rw";
  }>;
  environment: Record<string, string>;
  networks: string[];
  restart: "no" | "always" | "unless-stopped" | "on-failure";
  healthcheck: {
    enabled: boolean;
    command: string;
    interval: string;
    timeout: string;
    retries: number;
  };
  registry: {
    url?: string;
    username?: string;
    password?: string; // Encrypted
  };
  compose: {
    enabled: boolean;
    file: string;
    services: Record<string, unknown>;
  };
}

// Kubernetes configuration
export interface KubernetesConfig {
  enabled: boolean;
  cluster: {
    name: string;
    endpoint: string;
    token?: string; // Encrypted
    certificate?: string; // Encrypted
  };
  namespace: string;
  deployments: Array<{
    name: string;
    image: string;
    replicas: number;
    resources: {
      requests: {
        memory: string;
        cpu: string;
      };
      limits: {
        memory: string;
        cpu: string;
      };
    };
    ports: number[];
    environmentVariables: Record<string, string>;
  }>;
  services: Array<{
    name: string;
    type: "ClusterIP" | "NodePort" | "LoadBalancer";
    ports: Array<{
      port: number;
      targetPort: number;
      protocol: "TCP" | "UDP";
    }>;
  }>;
  ingress: {
    enabled: boolean;
    host: string;
    paths: Array<{
      path: string;
      service: string;
      port: number;
    }>;
    tls: {
      enabled: boolean;
      secretName?: string;
    };
  };
}

// Monitoring configuration
export interface MonitoringConfig {
  enabled: boolean;
  providers: {
    sentry: {
      enabled: boolean;
      dsn?: string; // Encrypted
      environment: string;
      release?: string;
      tracesSampleRate: number;
      profilesSampleRate: number;
    };
    datadog: {
      enabled: boolean;
      apiKey?: string; // Encrypted
      applicationKey?: string; // Encrypted
      service: string;
      env: string;
      logs: boolean;
      metrics: boolean;
      traces: boolean;
    };
    newrelic: {
      enabled: boolean;
      licenseKey?: string; // Encrypted
      appName: string;
      distributed_tracing: boolean;
    };
    prometheus: {
      enabled: boolean;
      endpoint: string;
      interval: string;
      metrics: string[];
    };
  };
  alerts: {
    enabled: boolean;
    channels: string[]; // email, slack, etc.
    rules: Array<{
      name: string;
      condition: string;
      threshold: number;
      duration: string;
      severity: "info" | "warning" | "error" | "critical";
    }>;
  };
}

// CI/CD configuration
export interface CiCdConfig {
  enabled: boolean;
  provider: "github_actions" | "gitlab_ci" | "jenkins" | "circleci" | "travis";
  workflows: Array<{
    name: string;
    trigger: "push" | "pull_request" | "schedule" | "manual";
    branches?: string[];
    schedule?: string; // cron expression
    steps: Array<{
      name: string;
      action: string;
      with?: Record<string, unknown>;
      env?: Record<string, string>;
    }>;
  }>;
  secrets: Record<string, string>; // Encrypted
  environments: Record<
    string,
    {
      url?: string;
      secrets?: Record<string, string>;
    }
  >;
}

// Backup configuration
export interface BackupConfig {
  enabled: boolean;
  schedule: string; // cron expression
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  storage: {
    provider: "s3" | "gcs" | "azure" | "backblaze";
    bucket: string;
    region?: string;
    credentials?: Record<string, string>; // Encrypted
  };
  database: {
    enabled: boolean;
    compress: boolean;
    encrypt: boolean;
  };
  files: {
    enabled: boolean;
    paths: string[];
    exclude: string[];
    compress: boolean;
  };
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    channels: string[];
  };
}

// Deployment configuration combined
export interface DeploymentConfiguration {
  vercel: VercelConfig;
  aws: AwsConfig;
  railway: RailwayConfig;
  netlify: NetlifyConfig;
  docker: DockerConfig;
  kubernetes: KubernetesConfig;
  monitoring: MonitoringConfig;
  cicd: CiCdConfig;
  backup: BackupConfig;
}

// Default deployment configuration
export const DEFAULT_DEPLOYMENT_CONFIG: DeploymentConfiguration = {
  vercel: {
    enabled: false,
    framework: "nextjs",
    environments: {
      development: {
        environmentVariables: {},
        domains: [],
      },
      preview: {
        environmentVariables: {},
        domains: [],
      },
      staging: {
        environmentVariables: {},
        domains: [],
      },
      production: {
        environmentVariables: {},
        domains: [],
      },
    },
    deployHooks: [],
    analytics: {
      enabled: false,
      webVitals: false,
    },
    speedInsights: false,
  },
  aws: {
    enabled: false,
    region: "us-east-1",
    services: {
      ec2: {
        enabled: false,
        instanceType: "t3.micro",
        keyPairName: "",
        securityGroups: [],
      },
      ecs: {
        enabled: false,
        clusterName: "",
        serviceName: "",
        taskDefinition: "",
        desiredCount: 1,
      },
      lambda: {
        enabled: false,
        runtime: "nodejs18.x",
        handler: "index.handler",
        timeout: 30,
        memorySize: 128,
        environmentVariables: {},
      },
      s3: {
        enabled: false,
        bucketName: "",
        region: "us-east-1",
        publicRead: false,
        versioning: false,
      },
      rds: {
        enabled: false,
        dbInstanceClass: "db.t3.micro",
        engine: "postgres",
        engineVersion: "14",
        allocatedStorage: 20,
        multiAz: false,
        backupRetention: 7,
      },
      elasticache: {
        enabled: false,
        nodeType: "cache.t3.micro",
        numCacheNodes: 1,
        engine: "redis",
      },
    },
    cloudformation: {
      enabled: false,
      stackName: "",
      templatePath: "",
      parameters: {},
    },
  },
  railway: {
    enabled: false,
    environments: {
      development: {
        environmentVariables: {},
        domains: [],
        resources: {
          cpu: 1,
          memory: 512,
        },
      },
      preview: {
        environmentVariables: {},
        domains: [],
        resources: {
          cpu: 1,
          memory: 512,
        },
      },
      staging: {
        environmentVariables: {},
        domains: [],
        resources: {
          cpu: 1,
          memory: 512,
        },
      },
      production: {
        environmentVariables: {},
        domains: [],
        resources: {
          cpu: 2,
          memory: 1024,
        },
      },
    },
    services: [],
  },
  netlify: {
    enabled: false,
    buildSettings: {
      buildCommand: "npm run build",
      publishDirectory: "dist",
      environment: {},
    },
    deploySettings: {
      branchDeploy: true,
      splitTesting: false,
      deployPreviews: true,
      contextualEnv: true,
    },
    functions: {
      enabled: false,
      runtime: "nodejs18.x",
      timeout: 10,
    },
    forms: {
      enabled: false,
      notifications: [],
    },
    analytics: false,
  },
  docker: {
    enabled: false,
    dockerfile: "Dockerfile",
    buildArgs: {},
    ports: [3000],
    volumes: [],
    environment: {},
    networks: [],
    restart: "unless-stopped",
    healthcheck: {
      enabled: false,
      command: "curl -f http://localhost:3000/health",
      interval: "30s",
      timeout: "10s",
      retries: 3,
    },
    registry: {},
    compose: {
      enabled: false,
      file: "docker-compose.yml",
      services: {},
    },
  },
  kubernetes: {
    enabled: false,
    cluster: {
      name: "",
      endpoint: "",
    },
    namespace: "default",
    deployments: [],
    services: [],
    ingress: {
      enabled: false,
      host: "",
      paths: [],
      tls: {
        enabled: false,
      },
    },
  },
  monitoring: {
    enabled: false,
    providers: {
      sentry: {
        enabled: false,
        environment: "production",
        tracesSampleRate: 0.1,
        profilesSampleRate: 0.1,
      },
      datadog: {
        enabled: false,
        service: "my-app",
        env: "production",
        logs: false,
        metrics: false,
        traces: false,
      },
      newrelic: {
        enabled: false,
        appName: "My App",
        distributed_tracing: false,
      },
      prometheus: {
        enabled: false,
        endpoint: "",
        interval: "15s",
        metrics: [],
      },
    },
    alerts: {
      enabled: false,
      channels: [],
      rules: [],
    },
  },
  cicd: {
    enabled: false,
    provider: "github_actions",
    workflows: [],
    secrets: {},
    environments: {},
  },
  backup: {
    enabled: false,
    schedule: "0 2 * * *", // Daily at 2 AM
    retention: {
      daily: 7,
      weekly: 4,
      monthly: 12,
    },
    storage: {
      provider: "s3",
      bucket: "",
    },
    database: {
      enabled: false,
      compress: true,
      encrypt: true,
    },
    files: {
      enabled: false,
      paths: [],
      exclude: [],
      compress: true,
    },
    notifications: {
      onSuccess: false,
      onFailure: true,
      channels: [],
    },
  },
};

// Deployment settings sections
export const DEPLOYMENT_SETTINGS_SECTIONS = [
  {
    id: "vercel",
    name: "vercel",
    label: "Vercel",
    description: "Vercel deployment and hosting configuration",
    icon: "Triangle",
    order: 1,
  },
  {
    id: "aws",
    name: "aws",
    label: "Amazon Web Services",
    description: "AWS cloud infrastructure settings",
    icon: "Cloud",
    order: 2,
  },
  {
    id: "docker",
    name: "docker",
    label: "Docker",
    description: "Docker containerization settings",
    icon: "Container",
    order: 3,
  },
  {
    id: "monitoring",
    name: "monitoring",
    label: "Monitoring",
    description: "Application monitoring and alerts",
    icon: "Activity",
    order: 4,
  },
] as const;

// Platform-specific validation rules
export const DEPLOYMENT_VALIDATION = {
  vercel: {
    teamId: { pattern: /^team_[a-zA-Z0-9]+$/ },
    projectId: { pattern: /^prj_[a-zA-Z0-9]+$/ },
    domains: {
      pattern: /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/,
      errorMessage: "Must be a valid domain name",
    },
  },
  aws: {
    region: {
      enum: [
        "us-east-1",
        "us-east-2",
        "us-west-1",
        "us-west-2",
        "eu-west-1",
        "eu-west-2",
        "eu-central-1",
        "ap-southeast-1",
      ],
    },
    instanceType: {
      enum: ["t3.micro", "t3.small", "t3.medium", "t3.large", "t3.xlarge"],
    },
  },
  docker: {
    ports: { min: 1, max: 65535 },
    memoryLimit: { pattern: /^\d+[kmg]$/i },
  },
} as const;

