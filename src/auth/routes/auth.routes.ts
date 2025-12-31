import { signin, signup } from "#auth/controllers/auth.controller.js";
import { googleLogin } from "#auth/controllers/google.controller.js";
import { logout } from "#auth/controllers/logout.controller.js";
import { changePassword, forgotPassword, resetPassword, setPassword } from "#auth/controllers/password.controller.js";
import { refreshToken } from "#auth/controllers/refresh.controller.js";
import { deleteSession, listSessions, logoutCurrentSession } from "#auth/controllers/session.controller.js";
import { verifyEmail } from "#auth/controllers/verify.controller.js";
import { requireSignin } from "#auth/middlewares/auth.middleware.js";
import { googleLimiter, resetLimiter, signinLimiter, signupLimiter } from "#auth/middlewares/rateLimit.middleware.js";
import { Router } from "express";

const router = Router();

/* ================= AUTH ================= */

router.post("/signin", signinLimiter, signin);
router.post("/signup", signupLimiter, signup);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

router.post("/google", googleLimiter, googleLogin);

router.get("/verify-email", verifyEmail);

router.post("/forgot-password", resetLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/set-password", requireSignin, setPassword);
router.post("/change-password", requireSignin, changePassword);

/* ================= SESSIONS ================= */

router.get("/sessions", requireSignin, listSessions);
router.delete("/sessions/:sessionId", requireSignin, deleteSession);
router.post("/logout-current", requireSignin, logoutCurrentSession);

/* ================= HEALTH ================= */

router.get("/ping", (_req, res) => {
  res.json({ message: "auth routes alive" });
});

export default router;
