import { Router } from "express";

import * as wishlistController from "../../controllers/wishlist/wishlist.controller.js";
import { requireAuth } from "../../middleware/requireAuth.js";

export const wishlistRouter = Router();

wishlistRouter.use(requireAuth);

wishlistRouter.get("/", wishlistController.list);
wishlistRouter.put("/:destinationId", wishlistController.add);
wishlistRouter.delete("/:destinationId", wishlistController.remove);
