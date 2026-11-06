import { Router } from "express";

import { adminLimiter } from "../../middleware/rateLimit.js";
import { requireAdmin, requireAuth } from "../../middleware/requireAuth.js";
import { adminCategoryRouter } from "./category.routes.js";
import { adminAuditRouter, adminDashboardRouter } from "./dashboard.routes.js";
import { adminDestinationRouter, adminUploadRouter } from "./destination.routes.js";
import { adminEnquiryRouter } from "./enquiry.routes.js";
import { adminReviewRouter } from "./review.routes.js";
import { adminUserRouter } from "./user.routes.js";

// Mounted at /api/admin. Every route below requires a logged-in ADMIN (role re-checked
// against the database on each request).
export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin, adminLimiter);

adminRouter.use("/dashboard", adminDashboardRouter);
adminRouter.use("/categories", adminCategoryRouter);
adminRouter.use("/destinations", adminDestinationRouter);
adminRouter.use("/uploads", adminUploadRouter);
adminRouter.use("/enquiries", adminEnquiryRouter);
adminRouter.use("/users", adminUserRouter);
adminRouter.use("/reviews", adminReviewRouter);
adminRouter.use("/audit-log", adminAuditRouter);
