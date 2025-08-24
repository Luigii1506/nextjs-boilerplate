/**
 * 🔌 INTEGRATIONS CONFIGURATION TYPES
 * ===================================
 *
 * Tipos para configuración de integraciones con servicios externos.
 * Incluye APIs, payments, analytics y servicios de terceros.
 */

// Integration category types
export type IntegrationCategory =
  | "analytics"
  | "payments"
  | "social"
  | "storage"
  | "ai"
  | "maps"
  | "search"
  | "security"
  | "marketing";

// Analytics integrations
export interface AnalyticsIntegrations {
  googleAnalytics: {
    enabled: boolean;
    trackingId?: string; // GA4 Measurement ID
    gtmId?: string; // Google Tag Manager ID
    enhancedEcommerce: boolean;
    userId: boolean; // Track user IDs
    demographics: boolean;
    anonymizeIp: boolean;
    customDimensions: Array<{
      index: number;
      name: string;
      scope: "hit" | "session" | "user" | "product";
    }>;
  };
  mixpanel: {
    enabled: boolean;
    token?: string; // Encrypted
    trackAutomaticEvents: boolean;
    persistence: "localStorage" | "cookie";
    secureCookie: boolean;
    crossSubdomainCookie: boolean;
  };
  amplitude: {
    enabled: boolean;
    apiKey?: string; // Encrypted
    serverUrl?: string;
    userId: boolean;
    deviceId: boolean;
    sessionId: boolean;
    logLevel: "DISABLE" | "ERROR" | "WARN" | "INFO" | "DEBUG";
  };
  hotjar: {
    enabled: boolean;
    siteId?: string;
    version?: number;
    debug: boolean;
    suppressConsoleErrors: boolean;
  };
  posthog: {
    enabled: boolean;
    apiKey?: string; // Encrypted
    host?: string;
    capturePageview: boolean;
    capturePageleave: boolean;
    crossSubdomainCookie: boolean;
    persistence: "localStorage" | "cookie" | "memory";
  };
}

// Payment processor integrations
export interface PaymentIntegrations {
  stripe: {
    enabled: boolean;
    publishableKey?: string;
    secretKey?: string; // Encrypted
    webhookSecret?: string; // Encrypted
    currency: string;
    captureMethod: "automatic" | "manual";
    allowedPaymentMethods: Array<
      | "card"
      | "apple_pay"
      | "google_pay"
      | "paypal"
      | "bank_transfer"
      | "crypto"
    >;
    automaticTax: boolean;
    billingPortal: boolean;
    locale: string;
  };
  paypal: {
    enabled: boolean;
    clientId?: string;
    clientSecret?: string; // Encrypted
    mode: "sandbox" | "production";
    currency: string;
    locale: string;
    intent: "capture" | "authorize";
  };
  square: {
    enabled: boolean;
    applicationId?: string;
    accessToken?: string; // Encrypted
    webhookSignatureKey?: string; // Encrypted
    environment: "sandbox" | "production";
    currency: string;
  };
  razorpay: {
    enabled: boolean;
    keyId?: string;
    keySecret?: string; // Encrypted
    webhookSecret?: string; // Encrypted
    currency: string;
    theme: {
      color: string;
      backdrop_color?: string;
    };
  };
}

// Social media integrations
export interface SocialIntegrations {
  facebook: {
    enabled: boolean;
    appId?: string;
    appSecret?: string; // Encrypted
    pageId?: string;
    pixelId?: string;
    version: string;
    autoLogAppEvents: boolean;
    xfbml: boolean;
  };
  twitter: {
    enabled: boolean;
    bearerToken?: string; // Encrypted
    apiKey?: string;
    apiSecret?: string; // Encrypted
    accessToken?: string; // Encrypted
    accessTokenSecret?: string; // Encrypted
    webhookUrl?: string;
  };
  linkedin: {
    enabled: boolean;
    clientId?: string;
    clientSecret?: string; // Encrypted
    partnerId?: string;
    conversionId?: string;
  };
  instagram: {
    enabled: boolean;
    appId?: string;
    appSecret?: string; // Encrypted
    accessToken?: string; // Encrypted
    userId?: string;
  };
  youtube: {
    enabled: boolean;
    apiKey?: string; // Encrypted
    channelId?: string;
    embedPrivacyEnhanced: boolean;
  };
}

// Cloud storage integrations
export interface StorageIntegrations {
  aws: {
    enabled: boolean;
    accessKeyId?: string; // Encrypted
    secretAccessKey?: string; // Encrypted
    region: string;
    bucketName?: string;
    cloudfront?: {
      enabled: boolean;
      distributionId?: string;
      domainName?: string;
    };
  };
  googleCloud: {
    enabled: boolean;
    projectId?: string;
    keyFile?: string; // Encrypted JSON key
    bucketName?: string;
    region: string;
  };
  azure: {
    enabled: boolean;
    accountName?: string;
    accountKey?: string; // Encrypted
    containerName?: string;
  };
  cloudinary: {
    enabled: boolean;
    cloudName?: string;
    apiKey?: string;
    apiSecret?: string; // Encrypted
    secure: boolean;
    quality: "auto" | number;
    format: "auto" | "jpg" | "png" | "webp";
  };
  uploadcare: {
    enabled: boolean;
    publicKey?: string;
    secretKey?: string; // Encrypted
    cdnBase?: string;
    effects: string;
  };
}

// AI service integrations
export interface AiIntegrations {
  openai: {
    enabled: boolean;
    apiKey?: string; // Encrypted
    organization?: string;
    model: string;
    maxTokens: number;
    temperature: number;
    timeout: number;
  };
  anthropic: {
    enabled: boolean;
    apiKey?: string; // Encrypted
    model: string;
    maxTokens: number;
    temperature: number;
  };
  cohere: {
    enabled: boolean;
    apiKey?: string; // Encrypted
    model: string;
    maxTokens: number;
  };
  huggingface: {
    enabled: boolean;
    apiKey?: string; // Encrypted
    endpoint?: string;
    model: string;
  };
}

// Maps service integrations
export interface MapsIntegrations {
  googleMaps: {
    enabled: boolean;
    apiKey?: string; // Encrypted
    libraries: string[];
    language: string;
    region: string;
    restrictions?: {
      country: string[];
    };
  };
  mapbox: {
    enabled: boolean;
    accessToken?: string; // Encrypted
    style: string;
    optimizeForMobile: boolean;
  };
  here: {
    enabled: boolean;
    apiKey?: string; // Encrypted
    appId?: string;
    appCode?: string; // Encrypted
  };
}

// Search service integrations
export interface SearchIntegrations {
  algolia: {
    enabled: boolean;
    applicationId?: string;
    searchApiKey?: string;
    adminApiKey?: string; // Encrypted
    indexName: string;
    attributesToRetrieve: string[];
    hitsPerPage: number;
  };
  elasticsearch: {
    enabled: boolean;
    endpoint: string;
    username?: string;
    password?: string; // Encrypted
    cloudId?: string;
    apiKey?: string; // Encrypted
    index: string;
    protocol?: "http" | "https";
  };
  typesense: {
    enabled: boolean;
    host: string;
    port: number;
    protocol: "http" | "https";
    apiKey?: string; // Encrypted
    collectionName: string;
  };
}

// Security service integrations
export interface SecurityIntegrations {
  recaptcha: {
    enabled: boolean;
    version: 2 | 3;
    siteKey?: string;
    secretKey?: string; // Encrypted
    threshold?: number; // v3 only
    action?: string; // v3 only
  };
  turnstile: {
    enabled: boolean;
    siteKey?: string;
    secretKey?: string; // Encrypted
    theme: "light" | "dark" | "auto";
    size: "normal" | "compact";
  };
  auth0: {
    enabled: boolean;
    domain?: string;
    clientId?: string;
    clientSecret?: string; // Encrypted
    audience?: string;
    scope: string;
  };
  okta: {
    enabled: boolean;
    domain?: string;
    clientId?: string;
    clientSecret?: string; // Encrypted
    issuer?: string;
    audience?: string;
  };
}

// Marketing automation integrations
export interface MarketingIntegrations {
  mailchimp: {
    enabled: boolean;
    apiKey?: string; // Encrypted
    serverPrefix: string;
    audienceId?: string;
    doubleOptIn: boolean;
  };
  hubspot: {
    enabled: boolean;
    accessToken?: string; // Encrypted
    portalId?: string;
    formId?: string;
    trackingCode: boolean;
  };
  salesforce: {
    enabled: boolean;
    instanceUrl?: string;
    clientId?: string;
    clientSecret?: string; // Encrypted
    username?: string;
    password?: string; // Encrypted
    securityToken?: string; // Encrypted
  };
  intercom: {
    enabled: boolean;
    appId?: string;
    accessToken?: string; // Encrypted
    identityVerification: boolean;
    hideDefaultLauncher: boolean;
  };
  crisp: {
    enabled: boolean;
    websiteId?: string;
    tokenId?: string;
    tokenKey?: string; // Encrypted
    locale: string;
  };
}

// Integration configuration combined
export interface IntegrationsConfiguration {
  analytics: AnalyticsIntegrations;
  payments: PaymentIntegrations;
  social: SocialIntegrations;
  storage: StorageIntegrations;
  ai: AiIntegrations;
  maps: MapsIntegrations;
  search: SearchIntegrations;
  security: SecurityIntegrations;
  marketing: MarketingIntegrations;
}

// Default integrations configuration
export const DEFAULT_INTEGRATIONS_CONFIG: IntegrationsConfiguration = {
  analytics: {
    googleAnalytics: {
      enabled: false,
      enhancedEcommerce: false,
      userId: false,
      demographics: false,
      anonymizeIp: true,
      customDimensions: [],
    },
    mixpanel: {
      enabled: false,
      trackAutomaticEvents: true,
      persistence: "localStorage",
      secureCookie: true,
      crossSubdomainCookie: false,
    },
    amplitude: {
      enabled: false,
      userId: true,
      deviceId: true,
      sessionId: true,
      logLevel: "WARN",
    },
    hotjar: {
      enabled: false,
      version: 6,
      debug: false,
      suppressConsoleErrors: true,
    },
    posthog: {
      enabled: false,
      capturePageview: true,
      capturePageleave: false,
      crossSubdomainCookie: false,
      persistence: "localStorage",
    },
  },
  payments: {
    stripe: {
      enabled: false,
      currency: "USD",
      captureMethod: "automatic",
      allowedPaymentMethods: ["card"],
      automaticTax: false,
      billingPortal: false,
      locale: "en",
    },
    paypal: {
      enabled: false,
      mode: "sandbox",
      currency: "USD",
      locale: "en_US",
      intent: "capture",
    },
    square: {
      enabled: false,
      environment: "sandbox",
      currency: "USD",
    },
    razorpay: {
      enabled: false,
      currency: "USD",
      theme: {
        color: "#3B82F6",
      },
    },
  },
  social: {
    facebook: {
      enabled: false,
      version: "v18.0",
      autoLogAppEvents: true,
      xfbml: true,
    },
    twitter: {
      enabled: false,
    },
    linkedin: {
      enabled: false,
    },
    instagram: {
      enabled: false,
    },
    youtube: {
      enabled: false,
      embedPrivacyEnhanced: true,
    },
  },
  storage: {
    aws: {
      enabled: false,
      region: "us-east-1",
      cloudfront: {
        enabled: false,
      },
    },
    googleCloud: {
      enabled: false,
      region: "us-central1",
    },
    azure: {
      enabled: false,
    },
    cloudinary: {
      enabled: false,
      secure: true,
      quality: "auto",
      format: "auto",
    },
    uploadcare: {
      enabled: false,
      effects: "preview",
    },
  },
  ai: {
    openai: {
      enabled: false,
      model: "gpt-3.5-turbo",
      maxTokens: 1000,
      temperature: 0.7,
      timeout: 30000,
    },
    anthropic: {
      enabled: false,
      model: "claude-3-haiku-20240307",
      maxTokens: 1000,
      temperature: 0.7,
    },
    cohere: {
      enabled: false,
      model: "command",
      maxTokens: 1000,
    },
    huggingface: {
      enabled: false,
      model: "gpt2",
    },
  },
  maps: {
    googleMaps: {
      enabled: false,
      libraries: ["places"],
      language: "en",
      region: "US",
    },
    mapbox: {
      enabled: false,
      style: "mapbox://styles/mapbox/streets-v12",
      optimizeForMobile: true,
    },
    here: {
      enabled: false,
    },
  },
  search: {
    algolia: {
      enabled: false,
      indexName: "main",
      attributesToRetrieve: ["*"],
      hitsPerPage: 20,
    },
    elasticsearch: {
      enabled: false,
      endpoint: "",
      protocol: "https",
      index: "main",
    },
    typesense: {
      enabled: false,
      host: "",
      port: 8108,
      protocol: "https",
      collectionName: "main",
    },
  },
  security: {
    recaptcha: {
      enabled: false,
      version: 3,
      threshold: 0.5,
      action: "submit",
    },
    turnstile: {
      enabled: false,
      theme: "light",
      size: "normal",
    },
    auth0: {
      enabled: false,
      scope: "openid profile email",
    },
    okta: {
      enabled: false,
    },
  },
  marketing: {
    mailchimp: {
      enabled: false,
      serverPrefix: "us1",
      doubleOptIn: true,
    },
    hubspot: {
      enabled: false,
      trackingCode: false,
    },
    salesforce: {
      enabled: false,
    },
    intercom: {
      enabled: false,
      identityVerification: false,
      hideDefaultLauncher: false,
    },
    crisp: {
      enabled: false,
      locale: "en",
    },
  },
};

// Integrations settings sections
export const INTEGRATIONS_SETTINGS_SECTIONS = [
  {
    id: "analytics",
    name: "analytics",
    label: "Analytics & Tracking",
    description: "Web analytics and user tracking services",
    icon: "BarChart",
    order: 1,
  },
  {
    id: "payments",
    name: "payments",
    label: "Payment Processors",
    description: "Payment gateway integrations",
    icon: "CreditCard",
    order: 2,
  },
  {
    id: "services",
    name: "services",
    label: "External Services",
    description: "Third-party service integrations",
    icon: "Plug",
    order: 3,
  },
  {
    id: "apis",
    name: "apis",
    label: "API Keys",
    description: "External API key management",
    icon: "Key",
    order: 4,
  },
] as const;

// Integration templates with setup instructions
export const INTEGRATION_TEMPLATES = {
  stripe: {
    name: "Stripe",
    category: "payments",
    description: "Accept online payments with Stripe",
    docs: "https://stripe.com/docs",
    setupSteps: [
      "Create a Stripe account",
      "Get your publishable and secret keys",
      "Configure webhook endpoints",
      "Test with sample payments",
    ],
    requiredFields: ["publishableKey", "secretKey"],
    optionalFields: ["webhookSecret", "currency"],
  },
  googleAnalytics: {
    name: "Google Analytics",
    category: "analytics",
    description: "Track website traffic and user behavior",
    docs: "https://developers.google.com/analytics",
    setupSteps: [
      "Create a Google Analytics account",
      "Set up a new property",
      "Get your Measurement ID",
      "Configure enhanced ecommerce (optional)",
    ],
    requiredFields: ["trackingId"],
    optionalFields: ["gtmId", "enhancedEcommerce"],
  },
  openai: {
    name: "OpenAI",
    category: "ai",
    description: "Integrate GPT models for AI features",
    docs: "https://platform.openai.com/docs",
    setupSteps: [
      "Create an OpenAI account",
      "Generate an API key",
      "Choose your model",
      "Set usage limits",
    ],
    requiredFields: ["apiKey"],
    optionalFields: ["organization", "model", "maxTokens"],
  },
} as const;

// Integration validation rules
export const INTEGRATIONS_VALIDATION = {
  stripe: {
    publishableKey: {
      pattern: /^pk_(test|live)_[a-zA-Z0-9]{24,}$/,
      errorMessage: "Must be a valid Stripe publishable key",
    },
    secretKey: {
      pattern: /^sk_(test|live)_[a-zA-Z0-9]{24,}$/,
      errorMessage: "Must be a valid Stripe secret key",
    },
  },
  googleAnalytics: {
    trackingId: {
      pattern: /^G-[a-zA-Z0-9]+$/,
      errorMessage: "Must be a valid GA4 Measurement ID (G-XXXXXXXXXX)",
    },
  },
  recaptcha: {
    siteKey: {
      pattern: /^[a-zA-Z0-9_-]{40}$/,
      errorMessage: "Must be a valid reCAPTCHA site key",
    },
  },
} as const;
