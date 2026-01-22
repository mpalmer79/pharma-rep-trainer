import { NextResponse } from "next/server";
import { buildCoachingSummary } from "@/lib/exports/coachingSummary";
import { exportCoachingSummaryToPDF } from "@/lib/exports/pdfExport";
import { sendCRMWebhook } from "@/lib/crm/webhookClient";

interface RequestPayload {
  userId: string;
  sessionId: string;
  includePdf?: boolean;
}

export async function POST(req: Request) {
  try {
    const body: RequestPayload = await req.json();

    const summary = buildCoachingSummary(
      {
        userId: body.userId,
        sessionId: body.sessionId,
        generatedAt: new Date().toISOString()
      },
      [], // patterns – wire real data later
      []  // journey adjustments – wire real data later
    );

    let pdfBase64: string | undefined;

    if (body.includePdf) {
      const pdfBlob = exportCoachingSummaryToPDF(summary);
      const buffer = Buffer.from(
        await pdfBlob.arrayBuffer()
      );
      pdfBase64 = buffer.toString("base64");
    }

    await sendCRMWebhook({
      endpoint: process.env.CRM_WEBHOOK_URL!,
      apiKey: process.env.CRM_API_KEY,
      payload: {
        version: "1.0",
        userId: summary.metadata.userId,
        sessionId: summary.metadata.sessionId,
        generatedAt: summary.metadata.generatedAt,
        highlights: summary.highlights,
        concerns: summary.concerns,
        adjustments: summary.adjustments,
        recommendedNextAction:
          summary.recommendedNextAction,
        pdfBase64
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CRM webhook failed:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
