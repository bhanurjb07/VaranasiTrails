import type { Request, Response } from "express";

import { createEnquirySchema } from "../../schemas/enquiry/enquiry.schemas.js";
import * as enquiryService from "../../services/enquiry/enquiry.service.js";

export const create = async (req: Request, res: Response) => {
  const enquiry = await enquiryService.createEnquiry(createEnquirySchema.parse(req.body));

  res.status(201).json({ id: enquiry.id, message: "Thanks! We will get back to you soon." });
};
