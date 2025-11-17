import { signin, signup } from "#controllers/auth.controller.js";
import { refreshToken } from "#controllers/refresh.controller.js";
import { getAllUsers, getMe } from "#controllers/user.controller.js";
import { checkAdmin, requireSignin } from "#middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);

router.get("/me", requireSignin, getMe);
router.get("/users", requireSignin, checkAdmin, getAllUsers);
router.post("/refresh", refreshToken);

router.get("/ping", (req, res) => {
  res.json({ message: "auth routes alive" });
});

export default router;
