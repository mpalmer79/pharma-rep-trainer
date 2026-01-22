import { NextResponse } from "next/server";
import { buildCoachingSummary } from "@/lib/exports/coachingSummary";
import { exportCoachingSummaryToPDF } from "@/lib/exports/pdfExport";
import { sendEmail } from "@/lib/email/emailClient";

interface RequestPayload {
  to: string;
  metadata: {
    userId: string;
    sessionId: string;
  };
}

export async function POST(req: Request) {
  try {
    const body: RequestPayload = await req.json();

    const summary = buildCoachingSummary(
      {
        userId: body.metadata.userId,
        sessionId: body.metadata.sessionId,
        generatedAt: new Date().toISOString()
      },
      [], // patterns – inject real data later
      []  // journey adjustments – inject real data later
    );

    // Generate PDF in memory
    const pdfBlob = exportCoachingSummaryToPDF(summary);

    // Convert PDF Blob to base64
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    await sendEmail({
      to: body.to,
      subject: "Coaching Summary",
      bodyText:
        "Attached is the coaching summary for the recent training session.",
      attachments: [
        {
          filename: `coaching-summary-${summary.metadata.sessionId}.pdf`,
          contentBase64: base64,
          mimeType: "application/pdf"
        }
      ]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send failed:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
