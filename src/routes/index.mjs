import { Router } from "express";
import userRoutes from "./users.mjs";
import productRoutes from "./products.mjs";

const router = Router();

// register all routers in single place and export
router.use(userRoutes);
router.use(productRoutes);

export default router;