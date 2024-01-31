import { Router } from "express";

const router = Router();

router.get("/api/products", (req, res) => {
  return res.send([{ id: 123, name: "Chicken Breast", price: 1.23 }]);
});

export default router;