import { Router } from "express";

import * as destinationController from "../../controllers/admin/destination.controller.js";
import * as mediaController from "../../controllers/admin/media.controller.js";

export const adminDestinationRouter = Router();

adminDestinationRouter.get("/", destinationController.list);
adminDestinationRouter.post("/", destinationController.create);
// Declared before "/:id" so "bulk" is not read as an id.
adminDestinationRouter.post("/bulk", destinationController.bulk);

adminDestinationRouter.get("/:id", destinationController.get);
adminDestinationRouter.patch("/:id", destinationController.update);
adminDestinationRouter.delete("/:id", destinationController.remove);

adminDestinationRouter.post("/:id/publish", destinationController.publish);
adminDestinationRouter.post("/:id/unpublish", destinationController.unpublish);
adminDestinationRouter.patch("/:id/featured", destinationController.setFeatured);
adminDestinationRouter.post("/:id/duplicate", destinationController.duplicate);
adminDestinationRouter.post("/:id/archive", destinationController.archive);
adminDestinationRouter.post("/:id/restore", destinationController.restore);

adminDestinationRouter.post("/:id/images", mediaController.addImage);
adminDestinationRouter.patch("/:id/images/reorder", mediaController.reorderImages);
adminDestinationRouter.patch("/:id/images/:imageId", mediaController.updateImage);
adminDestinationRouter.delete("/:id/images/:imageId", mediaController.deleteImage);

adminDestinationRouter.put("/:id/video", mediaController.setVideo);
adminDestinationRouter.delete("/:id/video", mediaController.removeVideo);

export const adminUploadRouter = Router();

adminUploadRouter.post("/presign", mediaController.presign);
