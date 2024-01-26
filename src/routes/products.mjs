import { Router } from "express";

const router = Router();

router.get("/api/products", (req, res) => {
  if (req.cookies.hello && req.cookies.hello == "world") {
    return res.send([{ id: 123, name: "Chicken Breast", price: 1.23 }]);
  }

  return res.status(403).send({ msg: "Sorry. You need the correct cookie" });
});

export default router;