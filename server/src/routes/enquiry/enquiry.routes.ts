import { Router } from "express";

import * as enquiryController from "../../controllers/enquiry/enquiry.controller.js";
import { enquiryLimiter } from "../../middleware/rateLimit.js";

export const enquiryRouter = Router();

enquiryRouter.post("/", enquiryLimiter, enquiryController.create);
