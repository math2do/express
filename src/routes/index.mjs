import { Router } from "express";
import userRoutes from "./users.mjs";
import productRoutes from "./products.mjs";

const router = Router();
router.get("/", (_, res) => {
  res.status(200).send({ "msg": "Hello" });
});

// register all routers in single place and export
router.use(userRoutes);
router.use(productRoutes);

export default router;