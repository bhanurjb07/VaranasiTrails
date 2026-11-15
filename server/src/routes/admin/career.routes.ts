import { Router } from "express";

import * as careerController from "../../controllers/admin/career.controller.js";

export const adminCareerRouter = Router();

adminCareerRouter.get("/", careerController.list);
adminCareerRouter.post("/", careerController.create);
// Declared before "/:id" so "departments" is not read as an id.
adminCareerRouter.get("/departments", careerController.departments);
adminCareerRouter.get("/:id", careerController.get);
adminCareerRouter.patch("/:id", careerController.update);
adminCareerRouter.delete("/:id", careerController.remove);
