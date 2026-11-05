import { Router } from "express";

import { authRouter } from "./auth/auth.routes.js";
import { categoryRouter, destinationRouter } from "./destination/destination.routes.js";
import { enquiryRouter } from "./enquiry/enquiry.routes.js";
import { userRouter } from "./user/user.routes.js";
import { wishlistRouter } from "./wishlist/wishlist.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/destinations", destinationRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/wishlist", wishlistRouter);
apiRouter.use("/enquiries", enquiryRouter);
