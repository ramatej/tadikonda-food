# Mobile OTP & SMS Provider Integration Guide for Tadikonda Food

This document outlines the evaluation, architecture, and step-by-step external setup required for production Mobile OTP authentication in India.

---

## 1. Provider Comparison & Low-Budget Recommendation

| Criterion | Supabase Built-in Providers (Twilio, MessageBird, Vonage) | MSG91 (Recommended for India) |
| :--- | :--- | :--- |
| **Cost per SMS** | ~₹4.50 – ₹7.00 ($0.05 – $0.08 USD) per OTP | ~₹0.15 – ₹0.25 (fraction of a rupee) |
| **India DLT Compliance** | Complex international routing; frequent DND blocks | Direct Indian DLT integration, instant approvals |
| **Delivery Speed in India** | 5 – 25 seconds (international gateway latency) | 1 – 4 seconds via local telecom operators (Airtel, Jio) |
| **Built-in Supabase Dropdown** | Yes (Twilio / MessageBird) | Integrated via official **Supabase Send SMS Hook** |
| **Alternative Channels** | WhatsApp requires paid Twilio add-on | Native WhatsApp & Voice OTP fallback supported |

### Verdict:
For a local food delivery application in Tadikonda/Guntur (India), **MSG91** is overwhelmingly more cost-effective (more than 90% cheaper than Twilio) and has significantly higher delivery reliability on Indian mobile networks.

---

## 2. Architecture & Security Model

To protect user credentials and platform integrity:

1. **Zero Frontend Secrets**: No SMS API keys, Twilio Auth Tokens, or MSG91 Auth Keys are exposed in Vite, client bundles, or frontend code.
2. **Supabase Auth Hook Verification**: The Edge Function (`supabase/functions/send-sms/index.ts`) validates the cryptographic webhook signature (`SEND_SMS_HOOK_SECRET` via `standardwebhooks`) sent by Supabase Auth before dispatching any SMS.
3. **Role Safety**: All phone OTP sign-ups automatically provision as `customer` accounts. Restaurant Owner and Delivery Partner accounts require administrative onboarding and cannot be assumed via OTP.

---

## 3. Step-by-Step Production Configuration

### Step A: MSG91 & DLT Registration (Telecom Requirement in India)
1. Register on any Indian DLT portal (e.g. Jio DLT or Airtel DLT).
2. Register your Entity name: e.g., `Tadikonda Food Delivery`.
3. Register your 6-character Header (Sender ID): e.g., `TKDFOD`.
4. Create an OTP Content Template:
   - Template Content: `Your OTP for logging into Tadikonda Food is {#var#}. Valid for 10 minutes. Please do not share this OTP with anyone.`
   - Once approved, note down the **Template ID**.
5. In your [MSG91 Dashboard](https://msg91.com):
   - Go to **OTP** -> **Templates** -> Map your approved DLT Template ID.
   - Copy your **MSG91 Auth Key** from API settings.

### Step B: Deploy Supabase Edge Function
Run the following using the Supabase CLI:
```bash
# Link project
npx supabase link --project-ref hjbodrbnemlxembpojgo

# Deploy the send-sms Edge Function
npx supabase functions deploy send-sms --no-verify-jwt
```

### Step C: Set Edge Function Secrets in Supabase
Set the server-side environment variables in the Supabase Dashboard (`Project Settings` -> `Edge Functions` -> `Secrets`) or via CLI:
```bash
npx supabase secrets set SMS_PROVIDER="msg91"
npx supabase secrets set MSG91_AUTH_KEY="your_msg91_auth_key_here"
npx supabase secrets set MSG91_TEMPLATE_ID="your_approved_template_id"
npx supabase secrets set SEND_SMS_HOOK_SECRET="your_webhook_secret"
```

### Step D: Enable Send SMS Hook in Supabase Dashboard
1. Go to your Supabase Project Dashboard: [https://supabase.com/dashboard/project/hjbodrbnemlxembpojgo](https://supabase.com/dashboard/project/hjbodrbnemlxembpojgo)
2. Navigate to **Authentication** -> **Hooks**.
3. Locate **Send SMS** hook.
4. Select **HTTP Hook (Edge Function)**:
   - Function URL: `https://hjbodrbnemlxembpojgo.supabase.co/functions/v1/send-sms`
   - Copy the generated Webhook Secret (`v1,whsec_...`) and save it as `SEND_SMS_HOOK_SECRET` in Edge Function Secrets.
5. In **Authentication** -> **Providers** -> **Phone**:
   - Ensure **Enable Phone Provider** is toggled ON.
   - Toggle **Enable SMS confirmations** ON.

---

## 4. Local Development & Demo Fallback

When developing locally without live SMS credits:
- The app automatically recognizes when demo mode is active or when an SMS gateway notice occurs.
- Demo OTP `123456` can be used to test the flow end-to-end without spending SMS credits.
- Existing Email/Password authentication remains 100% functional side-by-side with 1-click tab switching.
