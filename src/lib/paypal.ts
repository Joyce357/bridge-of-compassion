// ─── PayPal Server Integration Module ───────────────────────────────────────
// Handles server-to-server OAuth, order creation, capture verification, and webhook verification.
// NEVER import this file in client-side code.

interface PayPalTokenCache {
  token: string
  expiresAt: number
}

let cachedToken: PayPalTokenCache | null = null

export function isPayPalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
}

export function getPayPalBaseUrl(): string {
  const env = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase()
  return env === 'live' || env === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

/**
 * Obtain an OAuth2 access token for PayPal REST APIs using client credentials.
 * Automatically caches token until 60 seconds before expiration.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env.local.')
  }

  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const baseUrl = getPayPalBaseUrl()

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error('[PayPal OAuth] Failed to obtain access token:', res.status, errorText)
    throw new Error(`PayPal authentication failed: ${res.statusText}`)
  }

  const data = await res.json()
  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 3600

  cachedToken = {
    token: data.access_token,
    expiresAt: now + expiresIn * 1000,
  }

  return cachedToken.token
}

export interface CreateOrderParams {
  amount: number
  currency: string
  donationId: string
  donorName?: string | null
  donorEmail: string
  isAnonymous?: boolean
}

export interface PayPalOrderResult {
  orderId: string
  status: string
}

/**
 * Creates a server-side PayPal order for one-time donation capture.
 */
export async function createPayPalOrder(params: CreateOrderParams): Promise<PayPalOrderResult> {
  const token = await getPayPalAccessToken()
  const baseUrl = getPayPalBaseUrl()

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: params.donationId,
        custom_id: params.donationId,
        description: 'Bridge of Compassion Donation',
        amount: {
          currency_code: params.currency,
          value: params.amount.toFixed(2),
        },
      },
    ],
    application_context: {
      brand_name: 'Bridge of Compassion',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
    },
  }

  const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  if (!res.ok) {
    const errBody = await res.text()
    console.error('[PayPal Create Order] API error:', res.status, errBody)
    throw new Error(`Failed to create PayPal order (${res.status})`)
  }

  const data = await res.json()
  return {
    orderId: data.id,
    status: data.status,
  }
}

export interface PayPalCaptureDetails {
  orderId: string
  captureId?: string
  status: string
  capturedAmount?: string
  capturedCurrency?: string
  payerId?: string
  payerEmail?: string
  customId?: string
  rawStatus?: string
}

/**
 * Server-authoritative capture of a PayPal order.
 */
export async function capturePayPalOrder(orderId: string): Promise<PayPalCaptureDetails> {
  const token = await getPayPalAccessToken()
  const baseUrl = getPayPalBaseUrl()

  const res = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('[PayPal Capture Order] API error:', res.status, data)
    const issue = data.details?.[0]?.issue || data.message || res.statusText
    throw new Error(`PayPal capture failed: ${issue}`)
  }

  const purchaseUnit = data.purchase_units?.[0]
  const capture = purchaseUnit?.payments?.captures?.[0]
  const payer = data.payer

  return {
    orderId: data.id,
    captureId: capture?.id,
    status: capture?.status || data.status,
    capturedAmount: capture?.amount?.value,
    capturedCurrency: capture?.amount?.currency_code,
    payerId: payer?.payer_id,
    payerEmail: payer?.email_address,
    customId: capture?.custom_id || purchaseUnit?.custom_id || purchaseUnit?.reference_id,
    rawStatus: data.status,
  }
}

export interface WebhookVerificationParams {
  authAlgo: string | null
  certUrl: string | null
  transmissionId: string | null
  transmissionSig: string | null
  transmissionTime: string | null
  webhookEvent: Record<string, unknown>
}

/**
 * Verifies the authenticity of an incoming PayPal webhook payload using the PayPal API.
 * Never trust an unverified webhook payload.
 */
export async function verifyPayPalWebhookSignature(params: WebhookVerificationParams): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    console.warn('[PayPal Webhook] PAYPAL_WEBHOOK_ID is not configured. Webhook verification cannot run.')
    return false
  }

  if (
    !params.authAlgo ||
    !params.certUrl ||
    !params.transmissionId ||
    !params.transmissionSig ||
    !params.transmissionTime
  ) {
    console.warn('[PayPal Webhook] Missing required PayPal transmission signature headers.')
    return false
  }

  try {
    const token = await getPayPalAccessToken()
    const baseUrl = getPayPalBaseUrl()

    const body = {
      auth_algo: params.authAlgo,
      cert_url: params.certUrl,
      transmission_id: params.transmissionId,
      transmission_sig: params.transmissionSig,
      transmission_time: params.transmissionTime,
      webhook_id: webhookId,
      webhook_event: params.webhookEvent,
    }

    const res = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('[PayPal Webhook] Signature verification endpoint returned error:', res.status)
      return false
    }

    const data = await res.json()
    return data.verification_status === 'SUCCESS'
  } catch (err) {
    console.error('[PayPal Webhook] Verification error:', (err as Error)?.message)
    return false
  }
}
