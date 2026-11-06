import type { Request, Response } from "express";

import { listAuditSchema } from "../../schemas/admin/audit.schemas.js";
import * as auditService from "../../services/admin/audit.service.js";
import * as dashboardService from "../../services/admin/dashboard.service.js";

export const dashboard = async (_req: Request, res: Response) => {
  res.json(await dashboardService.getDashboard());
};

export const auditLog = async (req: Request, res: Response) => {
  res.json(await auditService.listAuditLog(listAuditSchema.parse(req.query)));
};
