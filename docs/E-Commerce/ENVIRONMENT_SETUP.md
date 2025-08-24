# 🔧 E-Commerce System - Environment Setup

> **Configuración de variables de entorno para el sistema de e-commerce completo**
> Versión: 1.0 | Fecha: 2025-01-17

---

## 🎛️ **FEATURE FLAGS CONFIGURATION**

### **E-Commerce Core Features:**
```bash
# Sistema de E-Commerce Base
FEATURE_INVENTORY=true
FEATURE_POS=true  
FEATURE_ECOMMERCE=true
FEATURE_SUPPLIERS=true

# Integraciones
FEATURE_PAYMENT_GATEWAYS=true
FEATURE_SHIPPING=true
FEATURE_EMAIL_NOTIFICATIONS=true
```

### **Dependencias Automáticas:**
```
🏪 INVENTORY (Base requerida para todos)
    ↓
🛒 POS (requiere FEATURE_INVENTORY=true)
    ↓
🌐 E-COMMERCE (requiere FEATURE_INVENTORY=true + FEATURE_PAYMENTS=true)
    ↓
🚛 SUPPLIERS (requiere FEATURE_INVENTORY=true)
```

---

## 💳 **PAYMENT PROVIDERS**

### **Stripe Configuration:**
```bash
# Stripe Keys (obtener desde https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx

# Para producción usar sk_live_ y pk_live_
```

### **PayPal Configuration:**
```bash
# PayPal (obtener desde https://developer.paypal.com)
PAYPAL_CLIENT_ID=Aexxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_CLIENT_SECRET=EMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_MODE=sandbox  # sandbox para desarrollo, live para producción
```

---

## 📧 **EMAIL SERVICE**

### **Gmail/G-Suite:**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password  # No usar contraseña normal
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME="Your Store Name"
```

### **Otros Proveedores:**
```bash
# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key

# Mailgun
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-smtp-password
```

---

## 📦 **SHIPPING INTEGRATION**

### **Shipping Providers:**
```bash
# Configuración genérica de shipping
SHIPPING_API_KEY=your_shipping_provider_api_key
SHIPPING_WEBHOOK_SECRET=your_shipping_webhook_secret

# Providers específicos (elegir uno)
# DHL
DHL_API_KEY=your_dhl_api_key
DHL_SECRET=your_dhl_secret

# FedEx
FEDEX_API_KEY=your_fedex_api_key
FEDEX_SECRET_KEY=your_fedex_secret

# UPS
UPS_ACCESS_LICENSE_NUMBER=your_ups_license
UPS_USER_ID=your_ups_user_id
UPS_PASSWORD=your_ups_password
```

---

## 🗄️ **DATABASE CONFIGURATION**

### **PostgreSQL (Recomendado):**
```bash
# Local Development
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"

# Production (ejemplo con Railway/Supabase/Neon)
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

### **MySQL (Alternativo):**
```bash
DATABASE_URL="mysql://username:password@localhost:3306/ecommerce_db"
```

---

## 🔐 **SECURITY & AUTH**

### **NextAuth.js:**
```bash
NEXTAUTH_SECRET="your-very-long-and-secure-secret-key-here-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"  # En producción usar tu dominio real
```

### **Encriptación de Datos Sensibles:**
```bash
# Para encriptar datos sensibles en la base de datos
ENCRYPTION_KEY="your-32-character-encryption-key-here"
```

---

## 🎛️ **OTHER FEATURE FLAGS**

### **Sistema Base:**
```bash
FEATURE_FILE_UPLOAD=true
FEATURE_PAYMENTS=true
FEATURE_ANALYTICS=true
FEATURE_DARK_MODE=true
FEATURE_AUDIT_TRAIL=true
FEATURE_SETTINGS=true
```

### **Experimentales:**
```bash
FEATURE_AI=false
FEATURE_I18N=false
FEATURE_SYSTEM_LOGS=false
FEATURE_DATA_EXPORT=false
```

---

## 🚀 **QUICK SETUP GUIDE**

### **Paso 1: Copiar Configuración Base**
```bash
# 1. Copia y pega en tu .env.local:

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nextjs_boilerplate"

# Auth
NEXTAUTH_SECRET="generate-a-secure-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# E-Commerce Features
FEATURE_INVENTORY=true
FEATURE_POS=true
FEATURE_ECOMMERCE=true
```

### **Paso 2: Configurar Pagos (Desarrollo)**
```bash
# Stripe Test Mode (gratis)
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
FEATURE_PAYMENT_GATEWAYS=true
```

### **Paso 3: Email (Opcional para desarrollo)**
```bash
# Solo si necesitas emails en desarrollo
FEATURE_EMAIL_NOTIFICATIONS=false  # Deshabilitar por ahora
```

### **Paso 4: Verificar Dependencies**
El sistema validará automáticamente que:
- `FEATURE_POS` requiere `FEATURE_INVENTORY=true`
- `FEATURE_ECOMMERCE` requiere `FEATURE_INVENTORY=true` + `FEATURE_PAYMENTS=true`

---

## 🔧 **DEVELOPMENT vs PRODUCTION**

### **Development (.env.local):**
```bash
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# Test mode para todos los servicios
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_MODE=sandbox
SMTP_HOST=smtp.gmail.com  # O usa MailHog para testing local
```

### **Production (.env.production):**
```bash
NODE_ENV=production

# Live mode
STRIPE_SECRET_KEY=sk_live_...
PAYPAL_MODE=live
NEXTAUTH_URL="https://yourdomain.com"

# Configuración de seguridad adicional
ENCRYPTION_KEY="production-encryption-key-32-chars"
```

---

## ⚠️ **SECURITY BEST PRACTICES**

### **DO's:**
- ✅ Usar variables de entorno para todas las keys sensibles
- ✅ Nunca hacer commit de `.env.local` o `.env.production`
- ✅ Generar `NEXTAUTH_SECRET` único y seguro (32+ caracteres)
- ✅ Usar test/sandbox mode en desarrollo
- ✅ Configurar webhooks con secrets únicos

### **DON'Ts:**
- ❌ Nunca hardcodear API keys en el código
- ❌ No usar las mismas keys de test en producción
- ❌ No compartir credentials en repositorios públicos
- ❌ No usar passwords débiles para SMTP

---

## 🧪 **TESTING CONFIGURATION**

### **Test Environment:**
```bash
# .env.test
NODE_ENV=test
DATABASE_URL="postgresql://test_user:test_pass@localhost:5432/test_db"

# Feature flags para testing
FEATURE_INVENTORY=true
FEATURE_POS=true
FEATURE_ECOMMERCE=true

# Mocks para servicios externos
STRIPE_SECRET_KEY=sk_test_mock_key
SMTP_HOST=localhost
SMTP_PORT=1025  # MailHog o similar
```

---

## 📊 **MONITORING & ANALYTICS**

### **Optional Integrations:**
```bash
# Google Analytics
NEXT_PUBLIC_GA_TRACKING_ID=GA_TRACKING_ID

# Sentry Error Tracking
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn

# LogRocket/FullStory
NEXT_PUBLIC_LOGROCKET_APP_ID=your_app_id
```

---

*Environment Setup v1.0 - Creado el 2025-01-17*
