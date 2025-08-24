/**
 * 📧 COMMUNICATIONS CONFIGURATION TYPES
 * ====================================
 *
 * Tipos para configuración de comunicaciones.
 * Incluye email, SMS, notificaciones y webhooks.
 */

// Email provider types
export type EmailProvider =
  | "sendgrid"
  | "mailgun"
  | "ses"
  | "postmark"
  | "mailjet"
  | "mandrill"
  | "smtp";

// Email configuration
export interface EmailConfig {
  enabled: boolean;
  provider: EmailProvider;
  apiKey?: string; // Encrypted
  apiSecret?: string; // Encrypted
  domain?: string;
  region?: string; // For AWS SES
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string; // Encrypted
  };
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  bounceEmail?: string;
  templates: {
    path: string;
    engine: "handlebars" | "mjml" | "html";
    cache: boolean;
  };
  rateLimiting: {
    enabled: boolean;
    perMinute: number;
    perHour: number;
    perDay: number;
  };
  tracking: {
    opens: boolean;
    clicks: boolean;
    deliveries: boolean;
    bounces: boolean;
  };
}

// SMS provider types
export type SmsProvider =
  | "twilio"
  | "vonage"
  | "aws_sns"
  | "messagebird"
  | "clickatell";

// SMS configuration
export interface SmsConfig {
  enabled: boolean;
  provider: SmsProvider;
  apiKey?: string; // Encrypted
  apiSecret?: string; // Encrypted
  accountSid?: string; // For Twilio
  authToken?: string; // Encrypted, for Twilio
  fromNumber: string;
  region?: string;
  rateLimiting: {
    enabled: boolean;
    perMinute: number;
    perHour: number;
    perDay: number;
  };
  templates: {
    path: string;
    cache: boolean;
  };
}

// Push notification configuration
export interface PushNotificationConfig {
  enabled: boolean;
  providers: {
    firebase: {
      enabled: boolean;
      serverKey?: string; // Encrypted
      projectId?: string;
    };
    apns: {
      enabled: boolean;
      keyId?: string;
      teamId?: string;
      privateKey?: string; // Encrypted
      production: boolean;
    };
    webPush: {
      enabled: boolean;
      publicKey?: string;
      privateKey?: string; // Encrypted
      subject: string;
    };
  };
  defaultSettings: {
    badge: boolean;
    sound: boolean;
    alert: boolean;
    priority: "high" | "normal" | "low";
  };
}

// Webhook configuration
export interface WebhookConfig {
  enabled: boolean;
  endpoints: Array<{
    id: string;
    name: string;
    url: string;
    events: string[]; // Event types to send
    secret?: string; // Encrypted, for signature verification
    headers?: Record<string, string>;
    timeout: number; // seconds
    retryAttempts: number;
    retryDelay: number; // seconds
    active: boolean;
  }>;
  security: {
    signatureHeader: string; // e.g., "X-Webhook-Signature"
    algorithm: "sha256" | "sha1" | "md5";
    includeTimestamp: boolean;
  };
  rateLimiting: {
    enabled: boolean;
    perMinute: number;
  };
}

// Notification channels
export interface NotificationChannels {
  email: {
    enabled: boolean;
    template: string;
    priority: 1 | 2 | 3; // 1 = high, 2 = medium, 3 = low
    delay?: number; // minutes
  };
  sms: {
    enabled: boolean;
    template: string;
    priority: 1 | 2 | 3;
    delay?: number; // minutes
  };
  push: {
    enabled: boolean;
    template: string;
    priority: 1 | 2 | 3;
    delay?: number; // minutes
  };
  webhook: {
    enabled: boolean;
    endpoints: string[]; // Webhook endpoint IDs
    priority: 1 | 2 | 3;
    delay?: number; // minutes
  };
  inApp: {
    enabled: boolean;
    persistent: boolean;
    priority: 1 | 2 | 3;
  };
}

// Notification templates
export interface NotificationTemplate {
  id: string;
  name: string;
  type: "email" | "sms" | "push" | "webhook" | "in_app";
  subject?: string; // For email and push
  body: string;
  variables: string[]; // Available template variables
  language: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Email template specifically
export interface EmailTemplate extends NotificationTemplate {
  type: "email";
  htmlBody?: string;
  textBody?: string;
  preheader?: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64 or path
    type: string; // MIME type
  }>;
}

// Notification rules
export interface NotificationRule {
  id: string;
  name: string;
  event: string; // Event type that triggers this notification
  condition?: string; // Optional condition (e.g., "user.role === 'admin'")
  channels: NotificationChannels;
  recipients: {
    users?: string[]; // User IDs
    roles?: string[]; // Role names
    emails?: string[]; // Direct email addresses
    custom?: string; // Custom recipient logic
  };
  throttling: {
    enabled: boolean;
    window: number; // minutes
    maxPerUser: number;
    maxGlobal: number;
  };
  active: boolean;
  priority: 1 | 2 | 3;
  createdAt: Date;
  updatedAt: Date;
}

// Communication analytics
export interface CommunicationAnalytics {
  email: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    complained: number;
    deliveryRate: number; // percentage
    openRate: number; // percentage
    clickRate: number; // percentage
    bounceRate: number; // percentage
  };
  sms: {
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number; // percentage
  };
  push: {
    sent: number;
    delivered: number;
    opened: number;
    failed: number;
    deliveryRate: number; // percentage
    openRate: number; // percentage
  };
  webhooks: {
    sent: number;
    successful: number;
    failed: number;
    avgResponseTime: number; // ms
    successRate: number; // percentage
  };
  period: {
    start: Date;
    end: Date;
  };
}

// Communications configuration combined
export interface CommunicationsConfiguration {
  email: EmailConfig;
  sms: SmsConfig;
  push: PushNotificationConfig;
  webhooks: WebhookConfig;
  templates: NotificationTemplate[];
  rules: NotificationRule[];
}

// Default communications configuration
export const DEFAULT_COMMUNICATIONS_CONFIG: CommunicationsConfiguration = {
  email: {
    enabled: false,
    provider: "smtp",
    fromEmail: "noreply@example.com",
    fromName: "My App",
    templates: {
      path: "./templates/emails",
      engine: "handlebars",
      cache: true,
    },
    rateLimiting: {
      enabled: true,
      perMinute: 60,
      perHour: 1000,
      perDay: 10000,
    },
    tracking: {
      opens: true,
      clicks: true,
      deliveries: true,
      bounces: true,
    },
  },
  sms: {
    enabled: false,
    provider: "twilio",
    fromNumber: "",
    rateLimiting: {
      enabled: true,
      perMinute: 10,
      perHour: 100,
      perDay: 1000,
    },
    templates: {
      path: "./templates/sms",
      cache: true,
    },
  },
  push: {
    enabled: false,
    providers: {
      firebase: {
        enabled: false,
      },
      apns: {
        enabled: false,
        production: false,
      },
      webPush: {
        enabled: false,
        subject: "mailto:noreply@example.com",
      },
    },
    defaultSettings: {
      badge: true,
      sound: true,
      alert: true,
      priority: "normal",
    },
  },
  webhooks: {
    enabled: false,
    endpoints: [],
    security: {
      signatureHeader: "X-Webhook-Signature",
      algorithm: "sha256",
      includeTimestamp: true,
    },
    rateLimiting: {
      enabled: true,
      perMinute: 60,
    },
  },
  templates: [],
  rules: [],
};

// Communications settings sections
export const COMMUNICATIONS_SETTINGS_SECTIONS = [
  {
    id: "email",
    name: "email",
    label: "Email Configuration",
    description: "Configure email providers and settings",
    icon: "Mail",
    order: 1,
  },
  {
    id: "notifications",
    name: "notifications",
    label: "Push Notifications",
    description: "Mobile and web push notification settings",
    icon: "Bell",
    order: 2,
  },
  {
    id: "sms",
    name: "sms",
    label: "SMS Configuration",
    description: "SMS provider and messaging settings",
    icon: "MessageSquare",
    order: 3,
  },
  {
    id: "webhooks",
    name: "webhooks",
    label: "Webhooks",
    description: "Webhook endpoints and event configuration",
    icon: "Webhook",
    order: 4,
  },
] as const;

// Email provider templates
export const EMAIL_PROVIDER_TEMPLATES = {
  sendgrid: {
    name: "SendGrid",
    docs: "https://docs.sendgrid.com/",
    requiredFields: ["apiKey"],
    optionalFields: ["domain"],
  },
  mailgun: {
    name: "Mailgun",
    docs: "https://documentation.mailgun.com/",
    requiredFields: ["apiKey", "domain"],
    optionalFields: ["region"],
  },
  ses: {
    name: "Amazon SES",
    docs: "https://docs.aws.amazon.com/ses/",
    requiredFields: ["apiKey", "apiSecret", "region"],
    optionalFields: [],
  },
  postmark: {
    name: "Postmark",
    docs: "https://postmarkapp.com/developer",
    requiredFields: ["apiKey"],
    optionalFields: [],
  },
  smtp: {
    name: "SMTP",
    docs: "https://nodemailer.com/smtp/",
    requiredFields: [
      "smtp.host",
      "smtp.port",
      "smtp.username",
      "smtp.password",
    ],
    optionalFields: ["smtp.secure"],
  },
} as const;

// SMS provider templates
export const SMS_PROVIDER_TEMPLATES = {
  twilio: {
    name: "Twilio",
    docs: "https://www.twilio.com/docs/sms",
    requiredFields: ["accountSid", "authToken", "fromNumber"],
    optionalFields: [],
  },
  vonage: {
    name: "Vonage (Nexmo)",
    docs: "https://developer.vonage.com/messaging/sms/overview",
    requiredFields: ["apiKey", "apiSecret", "fromNumber"],
    optionalFields: [],
  },
  aws_sns: {
    name: "Amazon SNS",
    docs: "https://docs.aws.amazon.com/sns/",
    requiredFields: ["apiKey", "apiSecret", "region"],
    optionalFields: [],
  },
} as const;

// Default notification templates
export const DEFAULT_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "welcome-email",
    name: "Welcome Email",
    type: "email",
    subject: "Welcome to {{appName}}!",
    body: "Hi {{userName}}, welcome to our platform!",
    variables: ["appName", "userName", "userEmail"],
    language: "en",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "password-reset",
    name: "Password Reset",
    type: "email",
    subject: "Reset your password",
    body: "Click here to reset your password: {{resetLink}}",
    variables: ["userName", "resetLink", "expiresAt"],
    language: "en",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "verification-sms",
    name: "Verification Code SMS",
    type: "sms",
    body: "Your verification code is: {{code}}. It expires in {{expiresIn}} minutes.",
    variables: ["code", "expiresIn"],
    language: "en",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Validation rules
export const COMMUNICATIONS_VALIDATION = {
  email: {
    fromEmail: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: "Must be a valid email address",
    },
    fromName: { required: true, minLength: 1, maxLength: 50 },
    smtp: {
      host: { required: true, minLength: 1 },
      port: { required: true, min: 1, max: 65535 },
      username: { required: true, minLength: 1 },
      password: { required: true, minLength: 1 },
    },
  },
  sms: {
    fromNumber: {
      required: true,
      pattern: /^\+?[1-9]\d{1,14}$/,
      errorMessage: "Must be a valid phone number with country code",
    },
  },
  webhooks: {
    url: {
      required: true,
      pattern: /^https?:\/\/.+/,
      errorMessage: "Must be a valid HTTP or HTTPS URL",
    },
    timeout: { min: 1, max: 300 },
    retryAttempts: { min: 0, max: 10 },
    retryDelay: { min: 1, max: 3600 },
  },
} as const;

