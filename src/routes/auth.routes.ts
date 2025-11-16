import { signin, signup } from "#controllers/auth.controller.js";
import { AuthenticatedRequest, checkAdmin, requireSignin } from "#middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);

// Temporary protected test route
router.get("/protected", requireSignin, (req: AuthenticatedRequest, res) => {
  res.json({ message: "You are authorized!", user: req.user });
});

// Temporary admin test route
router.get("/admin-only", requireSignin, checkAdmin, (req, res) => {
  res.json({ message: "Admin access granted" });
});

router.get("/ping", (req, res) => {
  res.json({ message: "auth routes alive" });
});

export default router;
