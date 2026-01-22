export interface CRMWebhookPayload {
  version: "1.0";
  userId: string;
  sessionId: string;
  generatedAt: string;

  highlights: string[];
  concerns: string[];
  adjustments: string[];
  recommendedNextAction: string;

  pdfBase64?: string;
}

export interface SendCRMWebhookParams {
  endpoint: string;
  apiKey?: string;
  payload: CRMWebhookPayload;
}

/**
 * Send a coaching summary to an external CRM via webhook.
 */
export async function sendCRMWebhook({
  endpoint,
  apiKey,
  payload
}: SendCRMWebhookParams): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `CRM webhook failed (${res.status}): ${text}`
    );
  }
}
