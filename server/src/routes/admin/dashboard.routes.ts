import { Router } from "express";

import * as dashboardController from "../../controllers/admin/dashboard.controller.js";

export const adminDashboardRouter = Router();

adminDashboardRouter.get("/", dashboardController.dashboard);

export const adminAuditRouter = Router();

adminAuditRouter.get("/", dashboardController.auditLog);
