import type { Request, Response } from "express";

import { idParamSchema } from "../../schemas/admin/common.schemas.js";
import {
  exportEnquiriesSchema,
  listEnquiriesSchema,
  updateEnquirySchema,
} from "../../schemas/admin/enquiry.schemas.js";
import * as enquiryService from "../../services/admin/enquiry.service.js";

const idOf = (req: Request) => idParamSchema.parse(req.params).id;

export const list = async (req: Request, res: Response) => {
  res.json(await enquiryService.listEnquiries(listEnquiriesSchema.parse(req.query)));
};

export const exportCsv = async (req: Request, res: Response) => {
  const csv = await enquiryService.exportEnquiriesCsv(req.user!.sub, exportEnquiriesSchema.parse(req.query));
  const stamp = new Date().toISOString().slice(0, 10);

  res
    .type("text/csv; charset=utf-8")
    .set("Content-Disposition", `attachment; filename="enquiries-${stamp}.csv"`)
    .send(csv);
};

export const get = async (req: Request, res: Response) => {
  res.json({ enquiry: await enquiryService.getEnquiry(idOf(req)) });
};

export const update = async (req: Request, res: Response) => {
  const enquiry = await enquiryService.updateEnquiry(req.user!.sub, idOf(req), updateEnquirySchema.parse(req.body));

  res.json({ enquiry });
};

export const remove = async (req: Request, res: Response) => {
  await enquiryService.deleteEnquiry(req.user!.sub, idOf(req));

  res.status(204).end();
};
