import { signin, signup } from "#controllers/auth.controller.js";
import { googleLogin } from "#controllers/google.controller.js";
import { logout } from "#controllers/logout.controller.js";
import { changePassword, forgotPassword, resetPassword, setPassword } from "#controllers/password.controller.js";
import { updateProfile } from "#controllers/profile.controller.js";
import { refreshToken } from "#controllers/refresh.controller.js";
import { deleteSession, listSessions, logoutCurrentSession } from "#controllers/session.controller.js";
import { getAllUsers, getMe } from "#controllers/user.controller.js";
import { verifyEmail } from "#controllers/verify.controller.js";
import { checkAdmin, requireSignin } from "#middlewares/auth.middleware.js";
import { googleLimiter, resetLimiter, signinLimiter, signupLimiter } from "#middlewares/rateLimit.js";
import { Router } from "express";

const router = Router();

router.post("/signin", signinLimiter, signin);
router.post("/signup", signupLimiter, signup);

router.get("/me", requireSignin, getMe);
router.get("/users", requireSignin, checkAdmin, getAllUsers);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", resetLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google", googleLimiter, googleLogin);
router.patch("/me", requireSignin, updateProfile);
router.post("/set-password", requireSignin, setPassword);
router.post("/change-password", requireSignin, changePassword);
router.get("/sessions", requireSignin, listSessions);
router.delete("/sessions/:sessionId", requireSignin, deleteSession);
router.post("/logout", logoutCurrentSession);

router.get("/ping", (req, res) => {
  res.json({ message: "auth routes alive" });
});

export default router;
