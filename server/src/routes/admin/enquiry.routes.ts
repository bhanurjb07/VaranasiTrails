import { Router } from "express";

import * as enquiryController from "../../controllers/admin/enquiry.controller.js";

export const adminEnquiryRouter = Router();

adminEnquiryRouter.get("/", enquiryController.list);
// Declared before "/:id" so "export.csv" is not read as an id.
adminEnquiryRouter.get("/export.csv", enquiryController.exportCsv);
adminEnquiryRouter.get("/:id", enquiryController.get);
adminEnquiryRouter.patch("/:id", enquiryController.update);
adminEnquiryRouter.delete("/:id", enquiryController.remove);
