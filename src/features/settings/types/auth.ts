/**
 * 🔐 AUTHENTICATION CONFIGURATION TYPES
 * =====================================
 *
 * Tipos para la configuración de autenticación y seguridad.
 * Incluye providers OAuth, sesiones, y políticas de seguridad.
 */

// OAuth provider configuration
export interface OAuthProvider {
  id: string;
  name:
    | "google"
    | "github"
    | "discord"
    | "microsoft"
    | "apple"
    | "facebook"
    | "twitter";
  enabled: boolean;
  clientId?: string;
  clientSecret?: string; // Encrypted
  scopes: string[];
  redirectUri: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  configuration?: Record<string, unknown>;
}

// Session configuration
export interface SessionConfig {
  provider: "database" | "jwt" | "redis" | "memory";
  secret: string; // Encrypted
  maxAge: number; // seconds
  updateAge: number; // seconds
  cookieName: string;
  cookieSecure: boolean;
  cookieHttpOnly: boolean;
  cookieSameSite: "strict" | "lax" | "none";
  cookieDomain?: string;
  cookiePath: string;
}

// JWT configuration
export interface JwtConfig {
  secret: string; // Encrypted
  algorithm: "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512";
  expiresIn: string; // e.g., "1h", "7d"
  refreshTokenExpiresIn: string;
  issuer?: string;
  audience?: string;
  keyId?: string;
  privateKey?: string; // Encrypted for RS algorithms
  publicKey?: string;
}

// Password policy
export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  requireNonCommon: boolean;
  historyCount: number; // Number of previous passwords to check
  maxAge: number; // Days before password expires
  warningDays: number; // Days before expiry to warn user
}

// Account lockout policy
export interface LockoutPolicy {
  enabled: boolean;
  maxAttempts: number;
  lockoutDuration: number; // minutes
  resetAfterSuccess: boolean;
  incremental: boolean; // Increase lockout duration on repeated failures
  notifyUser: boolean;
  notifyAdmin: boolean;
}

// Two-factor authentication
export interface TwoFactorConfig {
  enabled: boolean;
  required: boolean; // Force 2FA for all users
  requiredForRoles: string[]; // Force 2FA for specific roles
  methods: {
    totp: boolean; // Time-based OTP (Google Authenticator, etc.)
    sms: boolean;
    email: boolean;
    backup: boolean; // Backup codes
  };
  totpIssuer: string;
  smsProvider?: "twilio" | "vonage" | "aws_sns";
  backupCodeCount: number;
}

// Security headers configuration
export interface SecurityHeaders {
  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  csp: {
    enabled: boolean;
    directives: Record<string, string>;
    reportUri?: string;
    reportOnly: boolean;
  };
  xFrame: {
    enabled: boolean;
    policy: "DENY" | "SAMEORIGIN" | "ALLOW-FROM";
    uri?: string;
  };
  xContentType: boolean;
  xXssProtection: boolean;
  referrerPolicy:
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
}

// Rate limiting configuration
export interface RateLimitConfig {
  enabled: boolean;
  global: {
    requests: number;
    window: number; // seconds
  };
  auth: {
    login: { requests: number; window: number };
    register: { requests: number; window: number };
    passwordReset: { requests: number; window: number };
    twoFactor: { requests: number; window: number };
  };
  api: {
    requests: number;
    window: number;
    keyBased: boolean;
  };
  storage: "memory" | "redis" | "database";
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

// CORS configuration
export interface CorsConfig {
  enabled: boolean;
  origins: string[] | "*";
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge: number; // seconds
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

// Email verification
export interface EmailVerificationConfig {
  enabled: boolean;
  required: boolean;
  tokenExpiry: number; // hours
  resendDelay: number; // minutes
  maxAttempts: number;
  template: string;
  fromEmail: string;
  fromName: string;
}

// Password reset
export interface PasswordResetConfig {
  enabled: boolean;
  tokenExpiry: number; // hours
  resendDelay: number; // minutes
  maxAttempts: number;
  template: string;
  requireOldPassword: boolean;
}

// Auth configuration combined
export interface AuthConfiguration {
  providers: OAuthProvider[];
  session: SessionConfig;
  jwt: JwtConfig;
  passwordPolicy: PasswordPolicy;
  lockoutPolicy: LockoutPolicy;
  twoFactor: TwoFactorConfig;
  securityHeaders: SecurityHeaders;
  rateLimit: RateLimitConfig;
  cors: CorsConfig;
  emailVerification: EmailVerificationConfig;
  passwordReset: PasswordResetConfig;
}

// Default auth configuration
export const DEFAULT_AUTH_CONFIG: AuthConfiguration = {
  providers: [
    {
      id: "google",
      name: "google",
      enabled: false,
      scopes: ["openid", "email", "profile"],
      redirectUri: "/api/auth/callback/google",
    },
    {
      id: "github",
      name: "github",
      enabled: false,
      scopes: ["read:user", "user:email"],
      redirectUri: "/api/auth/callback/github",
    },
  ],
  session: {
    provider: "database",
    secret: "", // To be set
    maxAge: 2592000, // 30 days
    updateAge: 86400, // 1 day
    cookieName: "next-auth.session-token",
    cookieSecure: true,
    cookieHttpOnly: true,
    cookieSameSite: "lax",
    cookiePath: "/",
  },
  jwt: {
    secret: "", // To be set
    algorithm: "HS256",
    expiresIn: "1h",
    refreshTokenExpiresIn: "7d",
  },
  passwordPolicy: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false,
    requireNonCommon: true,
    historyCount: 5,
    maxAge: 90, // days
    warningDays: 7,
  },
  lockoutPolicy: {
    enabled: true,
    maxAttempts: 5,
    lockoutDuration: 15, // minutes
    resetAfterSuccess: true,
    incremental: false,
    notifyUser: true,
    notifyAdmin: false,
  },
  twoFactor: {
    enabled: false,
    required: false,
    requiredForRoles: ["admin", "super_admin"],
    methods: {
      totp: true,
      sms: false,
      email: true,
      backup: true,
    },
    totpIssuer: "My App",
    backupCodeCount: 10,
  },
  securityHeaders: {
    hsts: {
      enabled: true,
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: false,
    },
    csp: {
      enabled: true,
      reportOnly: false,
      directives: {
        "default-src": "'self'",
        "script-src": "'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src": "'self' 'unsafe-inline'",
        "img-src": "'self' data: https:",
        "font-src": "'self' https:",
        "connect-src": "'self' https:",
        "frame-ancestors": "'none'",
      },
    },
    xFrame: {
      enabled: true,
      policy: "DENY",
    },
    xContentType: true,
    xXssProtection: true,
    referrerPolicy: "strict-origin-when-cross-origin",
  },
  rateLimit: {
    enabled: true,
    global: {
      requests: 1000,
      window: 900, // 15 minutes
    },
    auth: {
      login: { requests: 5, window: 900 }, // 5 attempts per 15 minutes
      register: { requests: 3, window: 3600 }, // 3 attempts per hour
      passwordReset: { requests: 3, window: 3600 }, // 3 attempts per hour
      twoFactor: { requests: 10, window: 300 }, // 10 attempts per 5 minutes
    },
    api: {
      requests: 100,
      window: 900, // 15 minutes
      keyBased: false,
    },
    storage: "memory",
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  cors: {
    enabled: true,
    origins: [],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
  emailVerification: {
    enabled: true,
    required: true,
    tokenExpiry: 24, // hours
    resendDelay: 5, // minutes
    maxAttempts: 3,
    template: "email-verification",
    fromEmail: "noreply@example.com",
    fromName: "My App",
  },
  passwordReset: {
    enabled: true,
    tokenExpiry: 1, // hour
    resendDelay: 5, // minutes
    maxAttempts: 3,
    template: "password-reset",
    requireOldPassword: false,
  },
};

// Auth settings sections for UI
export const AUTH_SETTINGS_SECTIONS = [
  {
    id: "providers",
    name: "providers",
    label: "OAuth Providers",
    description: "Configure social login providers",
    icon: "Users",
    order: 1,
  },
  {
    id: "sessions",
    name: "sessions",
    label: "Sessions",
    description: "Session management configuration",
    icon: "Clock",
    order: 2,
  },
  {
    id: "security",
    name: "security",
    label: "Security Policies",
    description: "Password policies and security settings",
    icon: "Shield",
    order: 3,
  },
  {
    id: "permissions",
    name: "permissions",
    label: "Permissions",
    description: "Role-based access control",
    icon: "Key",
    order: 4,
  },
] as const;

// OAuth provider templates
export const OAUTH_PROVIDER_TEMPLATES = {
  google: {
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    scopes: ["openid", "email", "profile"],
  },
  github: {
    authorizationUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    scopes: ["read:user", "user:email"],
  },
  discord: {
    authorizationUrl: "https://discord.com/api/oauth2/authorize",
    tokenUrl: "https://discord.com/api/oauth2/token",
    userInfoUrl: "https://discord.com/api/users/@me",
    scopes: ["identify", "email"],
  },
  microsoft: {
    authorizationUrl:
      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    userInfoUrl: "https://graph.microsoft.com/v1.0/me",
    scopes: ["openid", "email", "profile"],
  },
} as const;

