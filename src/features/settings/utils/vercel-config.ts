/**
 * 🚀 VERCEL CONFIGURATION UTILITIES
 * =================================
 *
 * Utilidades para integración con Vercel.
 * Sincronización automática de variables de entorno y deployment.
 */

import type {
  VercelConfig,
  EnvironmentVariable,
  DeploymentEnvironment,
} from "../types";

// Vercel API endpoints
const VERCEL_API_BASE = "https://api.vercel.com";

export interface VercelApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Vercel project configuration
export interface VercelProjectConfig {
  id: string;
  name: string;
  framework: string;
  targets?: Record<string, string>;
  envs: VercelEnvironmentVariable[];
}

export interface VercelEnvironmentVariable {
  id: string;
  key: string;
  value: string;
  target: ("production" | "preview" | "development")[];
  type: "system" | "secret" | "encrypted" | "plain";
}

/**
 * Get Vercel project information
 */
export async function getVercelProject(
  projectId: string,
  accessToken: string
): Promise<VercelApiResponse<VercelProjectConfig>> {
  try {
    const response = await fetch(
      `${VERCEL_API_BASE}/v9/projects/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.statusText}`);
    }

    const project = await response.json();

    return {
      success: true,
      data: {
        id: project.id,
        name: project.name,
        framework: project.framework || "nextjs",
        targets: project.targets,
        envs: project.env || [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch project",
    };
  }
}

/**
 * Create or update environment variable in Vercel
 */
export async function setVercelEnvironmentVariable(
  projectId: string,
  accessToken: string,
  envVar: {
    key: string;
    value: string;
    target: ("production" | "preview" | "development")[];
    type?: "system" | "secret" | "encrypted" | "plain";
  }
): Promise<VercelApiResponse<VercelEnvironmentVariable>> {
  try {
    const response = await fetch(
      `${VERCEL_API_BASE}/v10/projects/${projectId}/env`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: envVar.key,
          value: envVar.value,
          target: envVar.target,
          type: envVar.type || "encrypted",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to set environment variable: ${response.statusText}`
      );
    }

    const result = await response.json();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to set environment variable",
    };
  }
}

/**
 * Delete environment variable from Vercel
 */
export async function deleteVercelEnvironmentVariable(
  projectId: string,
  accessToken: string,
  envId: string
): Promise<VercelApiResponse> {
  try {
    const response = await fetch(
      `${VERCEL_API_BASE}/v9/projects/${projectId}/env/${envId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to delete environment variable: ${response.statusText}`
      );
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete environment variable",
    };
  }
}

/**
 * Sync environment variables to Vercel
 */
export async function syncEnvironmentVariablesToVercel(
  config: VercelConfig,
  variables: EnvironmentVariable[]
): Promise<
  VercelApiResponse<{ synced: number; failed: number; errors: string[] }>
> {
  if (!config.enabled || !config.projectId || !config.accessToken) {
    return {
      success: false,
      error: "Vercel configuration is incomplete",
    };
  }

  const results = {
    synced: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Filter variables that should be deployed to Vercel
  const vercelVariables = variables.filter(
    (variable) => variable.deployment?.vercel === true
  );

  for (const variable of vercelVariables) {
    try {
      // Map environment to Vercel targets
      const targets = mapEnvironmentToVercelTargets(variable.environment);

      const result = await setVercelEnvironmentVariable(
        config.projectId,
        config.accessToken,
        {
          key: variable.key,
          value: variable.value || "",
          target: targets,
          type: variable.sensitive ? "encrypted" : "plain",
        }
      );

      if (result.success) {
        results.synced++;
      } else {
        results.failed++;
        results.errors.push(`${variable.key}: ${result.error}`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(
        `${variable.key}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  return {
    success: results.failed === 0,
    data: results,
    error:
      results.failed > 0
        ? `${results.failed} variables failed to sync`
        : undefined,
  };
}

/**
 * Map deployment environment to Vercel targets
 */
function mapEnvironmentToVercelTargets(
  environment: DeploymentEnvironment
): ("production" | "preview" | "development")[] {
  switch (environment) {
    case "production":
      return ["production"];
    case "staging":
      return ["preview"];
    case "development":
      return ["development"];
    default:
      return ["production", "preview", "development"];
  }
}

/**
 * Generate Vercel deployment configuration
 */
export function generateVercelConfig(
  config: VercelConfig,
  variables: EnvironmentVariable[]
): Record<string, unknown> {
  const vercelJson: Record<string, unknown> = {
    version: 2,
    framework: config.framework || "nextjs",
    buildCommand: config.buildCommand,
    outputDirectory: config.outputDirectory,
    installCommand: config.installCommand,
    devCommand: config.devCommand,
  };

  // Add environment variables
  const env: Record<string, string> = {};
  variables
    .filter((v) => v.deployment?.vercel === true)
    .forEach((variable) => {
      if (variable.value) {
        env[variable.key] = variable.value;
      }
    });

  if (Object.keys(env).length > 0) {
    vercelJson.env = env;
  }

  // Add redirects
  const redirects = config.environments.production?.redirects;
  if (redirects && redirects.length > 0) {
    vercelJson.redirects = redirects.map((redirect) => ({
      source: redirect.source,
      destination: redirect.destination,
      permanent: redirect.permanent,
    }));
  }

  // Add headers
  const headers = config.environments.production?.headers;
  if (headers && headers.length > 0) {
    vercelJson.headers = headers.map((header) => ({
      source: header.source,
      headers: Object.entries(header.headers).map(([key, value]) => ({
        key,
        value,
      })),
    }));
  }

  // Add functions configuration
  const functions = config.environments.production?.functions;
  if (functions) {
    vercelJson.functions = {
      "pages/api/**/*.{js,ts}": {
        memory: functions.memory,
        maxDuration: functions.maxDuration,
      },
    };
  }

  return vercelJson;
}

/**
 * Validate Vercel access token
 */
export async function validateVercelToken(
  accessToken: string
): Promise<VercelApiResponse<{ user: string; teams: string[] }>> {
  try {
    const response = await fetch(`${VERCEL_API_BASE}/v2/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Invalid access token");
    }

    const user = await response.json();

    return {
      success: true,
      data: {
        user: user.username || user.email,
        teams: user.teams || [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to validate token",
    };
  }
}

/**
 * Get Vercel project domains
 */
export async function getVercelDomains(
  projectId: string,
  accessToken: string
): Promise<VercelApiResponse<string[]>> {
  try {
    const response = await fetch(
      `${VERCEL_API_BASE}/v9/projects/${projectId}/domains`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch domains: ${response.statusText}`);
    }

    const data = await response.json();
    const domains = data.domains ? data.domains.map((d: { name: string }) => d.name) : [];

    return {
      success: true,
      data: domains,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch domains",
    };
  }
}

/**
 * Create Vercel deployment
 */
export async function createVercelDeployment(
  projectId: string,
  accessToken: string,
  options: {
    name?: string;
    target?: "production" | "staging";
    gitSource?: {
      type: "github" | "gitlab" | "bitbucket";
      repo: string;
      ref: string;
    };
  } = {}
): Promise<VercelApiResponse<{ id: string; url: string; status: string }>> {
  try {
    const response = await fetch(`${VERCEL_API_BASE}/v13/deployments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: options.name,
        project: projectId,
        target: options.target || "production",
        gitSource: options.gitSource,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create deployment: ${response.statusText}`);
    }

    const deployment = await response.json();

    return {
      success: true,
      data: {
        id: deployment.id,
        url: deployment.url,
        status: deployment.readyState || deployment.status,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create deployment",
    };
  }
}

// Default Vercel configuration template
export const DEFAULT_VERCEL_TEMPLATE: VercelConfig = {
  enabled: false,
  framework: "nextjs",
  buildCommand: "npm run build",
  outputDirectory: ".next",
  installCommand: "npm ci",
  devCommand: "npm run dev",
  environments: {
    development: {
      environmentVariables: {},
      domains: [],
      functions: {
        memory: 128,
        maxDuration: 10,
      },
    },
    preview: {
      environmentVariables: {},
      domains: [],
      functions: {
        memory: 256,
        maxDuration: 30,
      },
    },
    staging: {
      environmentVariables: {},
      domains: [],
      functions: {
        memory: 512,
        maxDuration: 60,
      },
    },
    production: {
      environmentVariables: {},
      domains: [],
      functions: {
        memory: 1024,
        maxDuration: 60,
      },
      redirects: [],
      headers: [
        {
          source: "/(.*)",
          headers: {
            "X-Frame-Options": "DENY",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "strict-origin-when-cross-origin",
          },
        },
      ],
    },
  },
  deployHooks: [],
  analytics: {
    enabled: true,
    webVitals: true,
  },
  speedInsights: true,
};

