import { signin, signup } from "#controllers/auth.controller.js";
import { logout } from "#controllers/logout.controller.js";
import { forgotPassword } from "#controllers/password.controller.js";
import { refreshToken } from "#controllers/refresh.controller.js";
import { getAllUsers, getMe } from "#controllers/user.controller.js";
import { verifyEmail } from "#controllers/verify.controller.js";
import { checkAdmin, requireSignin } from "#middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);

router.get("/me", requireSignin, getMe);
router.get("/users", requireSignin, checkAdmin, getAllUsers);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);

router.get("/ping", (req, res) => {
  res.json({ message: "auth routes alive" });
});

export default router;
