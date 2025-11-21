import { signin, signup } from "#controllers/auth.controller.js";
import { googleLogin } from "#controllers/google.controller.js";
import { logout } from "#controllers/logout.controller.js";
import { forgotPassword, resetPassword } from "#controllers/password.controller.js";
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
router.post("/reset-password", resetPassword);
router.post("/google", googleLogin);

router.get("/ping", (req, res) => {
  res.json({ message: "auth routes alive" });
});

export default router;
