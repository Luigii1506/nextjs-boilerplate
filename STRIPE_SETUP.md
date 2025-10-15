# 🎯 Stripe Webhook Setup

## Paso 1: Iniciar Stripe CLI

Abre una **NUEVA TERMINAL** y ejecuta:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Verás algo como:
```
> Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

## Paso 2: Copiar el Secret

Copia el valor `whsec_...` que aparece.

## Paso 3: Agregar a .env.local

Agrega esta línea a tu `.env.local`:
```
STRIPE_WEBHOOK_SECRET=whsec_tu_secret_aqui
```

## Paso 4: Reiniciar Servidor

Reinicia el servidor de Next.js (Ctrl+C y luego `npm run dev`)

## Paso 5: Probar

1. Ve al checkout
2. Completa un pago con: 4242 4242 4242 4242
3. Verás en la terminal de Stripe CLI los eventos
4. La orden se creará automáticamente

## ✅ Listo!

Tu webhook está configurado y funcionando.
