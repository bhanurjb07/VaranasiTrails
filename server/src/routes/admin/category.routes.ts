import { Router } from "express";

import * as categoryController from "../../controllers/admin/category.controller.js";

export const adminCategoryRouter = Router();

adminCategoryRouter.get("/", categoryController.list);
adminCategoryRouter.post("/", categoryController.create);
// Declared before "/:id" so "reorder" is not read as an id.
adminCategoryRouter.patch("/reorder", categoryController.reorder);
adminCategoryRouter.patch("/:id", categoryController.update);
adminCategoryRouter.delete("/:id", categoryController.remove);
