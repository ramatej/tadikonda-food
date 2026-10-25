import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';

/**
 * Supabase Send SMS Auth Hook (Edge Function)
 *
 * This function integrates Supabase Phone OTP with Indian SMS providers (e.g. MSG91)
 * without exposing API keys to the browser/frontend.
 *
 * Environment variables required in Supabase Edge Functions:
 * - SEND_SMS_HOOK_SECRET: Generated in Supabase Dashboard (Authentication -> Hooks -> Send SMS)
 *                         Format: v1,whsec_...
 * - SMS_PROVIDER: 'msg91' (default) or 'twilio'
 *
 * For MSG91 (Low-budget Indian DLT Compliant Provider):
 * - MSG91_AUTH_KEY: Your MSG91 Auth Key
 * - MSG91_TEMPLATE_ID: Approved DLT OTP Template ID in MSG91
 *
 * For Twilio (Optional fallback):
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 */

interface SendSmsPayload {
  user: {
    id: string;
    phone: string;
  };
  sms: {
    otp: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rawSecret = Deno.env.get('SEND_SMS_HOOK_SECRET');
  if (!rawSecret) {
    console.error('Missing SEND_SMS_HOOK_SECRET environment variable');
    return new Response(
      JSON.stringify({ error: { message: 'SMS Hook secret is not configured on server' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const hookSecret = rawSecret.replace('v1,whsec_', '');

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    const wh = new Webhook(hookSecret);

    // Verify cryptographic signature from Supabase GoTrue Auth
    const { user, sms } = wh.verify(payload, headers) as SendSmsPayload;

    const phone = user?.phone;
    const otp = sms?.otp;

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: { message: 'Missing phone number or OTP code in payload' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const provider = Deno.env.get('SMS_PROVIDER') || 'msg91';

    if (provider === 'msg91') {
      const authKey = Deno.env.get('MSG91_AUTH_KEY');
      const templateId = Deno.env.get('MSG91_TEMPLATE_ID');

      if (!authKey || !templateId) {
        console.error('Missing MSG91_AUTH_KEY or MSG91_TEMPLATE_ID');
        return new Response(
          JSON.stringify({
            error: {
              http_code: 500,
              message: 'MSG91 credentials or template ID not configured in Supabase Secrets',
            },
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Format mobile without '+' for MSG91: e.g. 919440123456
      const formattedMobile = phone.replace(/\D/g, '');

      // MSG91 Flow API / OTP API
      const msg91Url = `https://control.msg91.com/api/v5/otp?template_id=${encodeURIComponent(
        templateId
      )}&mobile=${encodeURIComponent(formattedMobile)}&authkey=${encodeURIComponent(
        authKey
      )}&otp=${encodeURIComponent(otp)}`;

      const response = await fetch(msg91Url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();

      if (!response.ok || responseData.type === 'error') {
        console.error('MSG91 Delivery Error:', responseData);
        return new Response(
          JSON.stringify({
            error: {
              http_code: response.status,
              message: responseData.message || 'Failed to dispatch SMS via MSG91',
            },
          }),
          { status: response.status, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Successfully sent OTP to ${phone} via MSG91`);
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (provider === 'twilio') {
      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

      if (!accountSid || !authToken || !fromNumber) {
        return new Response(
          JSON.stringify({
            error: {
              http_code: 500,
              message: 'Twilio credentials not configured in Supabase Secrets',
            },
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const credentials = btoa(`${accountSid}:${authToken}`);

      const body = new URLSearchParams({
        To: phone,
        From: fromNumber,
        Body: `Your Tadikonda Food verification OTP is ${otp}. Valid for 10 minutes.`,
      });

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
        body,
      });

      const data = await response.json();
      if (!response.ok) {
        return new Response(
          JSON.stringify({
            error: {
              http_code: response.status,
              message: data.message || 'Failed to dispatch SMS via Twilio',
            },
          }),
          { status: response.status, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: { message: `Unsupported SMS provider: ${provider}` } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Send SMS Hook Error:', errorMsg);
    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message: `SMS Hook processing failure: ${errorMsg}`,
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
