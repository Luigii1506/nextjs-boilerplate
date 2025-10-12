# 💳 Stripe Payment Integration Setup Guide

This guide will help you configure Stripe payment processing for your Next.js e-commerce store.

## 📋 Prerequisites

- A Stripe account (sign up at https://stripe.com)
- Node.js and npm installed
- Your Next.js boilerplate running

## 🚀 Step 1: Get Your Stripe API Keys

### Test Mode (Development)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test Mode** (toggle in the top right)
3. Navigate to **Developers** → **API keys**
4. Copy your keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"

### Live Mode (Production)

⚠️ **Only use live keys when you're ready to accept real payments!**

1. Complete your Stripe account activation
2. Switch to **Live Mode** in Stripe Dashboard
3. Get your live keys (start with `pk_live_` and `sk_live_`)

## 🔧 Step 2: Configure Environment Variables

Add your Stripe keys to your `.env.local` file:

```bash
# Stripe Configuration (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Important Notes:

- **Never commit your secret keys to git!**
- Use test keys in development
- Use live keys only in production
- The `NEXT_PUBLIC_` prefix makes the publishable key available in the browser (this is safe)

## 🧪 Step 3: Test Your Integration

### Test Cards

Stripe provides test card numbers for development:

| Card Number          | Scenario                    |
|---------------------|----------------------------|
| `4242 4242 4242 4242` | Successful payment         |
| `4000 0000 0000 9995` | Declined card              |
| `4000 0025 0000 3155` | Requires authentication    |
| `4000 0000 0000 0002` | Card declined              |

**For all test cards:**
- Use any future expiration date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any postal code (e.g., 12345)

### Testing the Checkout Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your storefront
3. Add items to cart
4. Go through checkout steps
5. On the payment step, use a test card number
6. Complete the payment

### Verify in Stripe Dashboard

1. Go to **Payments** in Stripe Dashboard
2. You should see your test payment
3. Click on it to see details

## 🔔 Step 4: Set Up Webhooks (Optional but Recommended)

Webhooks notify your app about payment events (succeeded, failed, refunded, etc.)

### For Development (Local Testing)

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   # or download from https://stripe.com/docs/stripe-cli
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. The CLI will show your webhook signing secret (starts with `whsec_`)
5. Add it to your `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

### For Production

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the webhook signing secret
6. Add it to your production environment variables

## 📊 Step 5: Monitor Payments

### Stripe Dashboard

- **Payments**: View all transactions
- **Customers**: Manage customer profiles
- **Reports**: Generate financial reports
- **Logs**: Debug API requests

### Your Application Logs

The checkout flow logs important events:
```
💳 [CHECKOUT ACTION] Creating payment intent
✅ [STRIPE SERVICE] Payment intent created
✅ Payment succeeded: pi_xxx
```

## 🔒 Security Best Practices

### ✅ Do:
- Use environment variables for API keys
- Validate webhooks with signing secrets
- Handle 3D Secure authentication
- Log payment events for debugging
- Use test mode in development
- Implement rate limiting

### ❌ Don't:
- Commit API keys to version control
- Use live keys in development
- Skip webhook signature verification
- Store full card numbers
- Rely only on client-side validation

## 💰 Currency and Amounts

The checkout system uses **cents** internally for accuracy:

```typescript
// $19.99 is stored as 1999 cents
const amountInCents = 1999;

// Convert to dollars for Stripe
const amountInDollars = amountInCents / 100; // 19.99
```

## 🌍 Supported Countries and Currencies

Stripe supports:
- **135+ currencies**
- **46+ countries**

Check [Stripe's global payments guide](https://stripe.com/global) for details.

## 🆘 Troubleshooting

### "Stripe not configured" error

**Solution**: Check your environment variables are set correctly and restart your dev server.

### Payment form not loading

**Solution**:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
3. Make sure you're using the correct test/live key

### "No such payment_intent" error

**Solution**: The payment intent might have expired (24 hours). Start a new checkout session.

### Webhooks not working locally

**Solution**:
1. Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Use the webhook secret from the CLI output
3. Restart your dev server after setting the webhook secret

### 3D Secure authentication fails in test mode

**Solution**: Use test card `4000 0025 0000 3155` and complete the test authentication dialog.

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)
- [Elements UI Components](https://stripe.com/docs/stripe-js)
- [Testing Guide](https://stripe.com/docs/testing)
- [Webhook Events](https://stripe.com/docs/webhooks)

## 🎯 Next Steps

Now that Stripe is integrated, you can:

1. **Customize the payment form** styling in `stripe-config.ts`
2. **Add more payment methods** (Apple Pay, Google Pay, etc.)
3. **Implement refunds** in the admin panel
4. **Add subscriptions** for recurring payments
5. **Set up fraud detection** with Stripe Radar

## 💡 Tips for Production

Before going live:

- [ ] Switch to live Stripe keys
- [ ] Set up production webhooks
- [ ] Enable Stripe Radar (fraud prevention)
- [ ] Test with small real transactions
- [ ] Set up email receipts
- [ ] Configure payout schedule
- [ ] Review Stripe pricing and fees
- [ ] Add terms of service and privacy policy
- [ ] Test refund process
- [ ] Monitor failed payments

---

## 🆘 Need Help?

- Check Stripe's status page: https://status.stripe.com
- Contact Stripe support: https://support.stripe.com
- Review error logs in Stripe Dashboard
- Check your server logs for detailed error messages
