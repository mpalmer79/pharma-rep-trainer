export interface EmailAttachment {
  filename: string;
  contentBase64: string;
  mimeType: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  bodyText: string;
  attachments?: EmailAttachment[];
}

/**
 * Provider-agnostic email sender.
 * Replace internals with SendGrid, SES, etc.
 */
export async function sendEmail({
  to,
  subject,
  bodyText,
  attachments
}: SendEmailParams): Promise<void> {
  // Placeholder implementation
  // Replace with SendGrid or other provider

  console.log("Sending email to:", to);
  console.log("Subject:", subject);
  console.log("Body:", bodyText);
  console.log("Attachments:", attachments?.length ?? 0);

  // Simulate async send
  return;
}
