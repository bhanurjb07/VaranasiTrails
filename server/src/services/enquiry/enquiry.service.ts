import { config } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { sendEmail } from "../../lib/mailer.js";
import type { CreateEnquiryInput } from "../../schemas/enquiry/enquiry.schemas.js";
import { escapeHtml } from "../../utils/emailTemplates.js";
import { notFound } from "../../utils/errors.js";

export const createEnquiry = async (input: CreateEnquiryInput) => {
  let destinationTitle: string | null = null;
  if (input.destinationId) {
    const destination = await prisma.destination.findUnique({
      where: { id: input.destinationId },
      select: { title: true },
    });
    if (!destination) throw notFound("Destination not found");
    destinationTitle = destination.title;
  }

  const enquiry = await prisma.enquiry.create({ data: input, select: { id: true } });

  // The enquiry is already saved; a mail failure must not lose it or fail the request.
  if (config.enquiryNotifyEmail) {
    const lines = [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Phone: ${input.phone}`,
      `Destination: ${destinationTitle ?? "-"}`,
      "",
      input.message,
    ];
    try {
      await sendEmail({
        to: config.enquiryNotifyEmail,
        subject: `New enquiry from ${input.name}`,
        text: lines.join("\n"),
        html: `<p>${lines.map(escapeHtml).join("<br>")}</p>`,
      });
    } catch (error) {
      console.error("[enquiry] notification email failed", error);
    }
  }

  return enquiry;
};

