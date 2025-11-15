import { signup } from "#controllers/auth.controller.js";
import { Router } from "express";

const router = Router();

router.post("/signup", signup);

router.get("/ping", (req, res) => {
  res.json({ message: "auth routes alive" });
});

export default router;
