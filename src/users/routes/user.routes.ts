import { checkAdmin, requireSignin } from "#auth/middlewares/auth.middleware.js";
import { getAllUsers, getMe } from "#users/controllers/user.controller.js";
import { Router } from "express";

const router = Router();

/* ================= USERS ================= */

// current authenticated user
router.get("/me", requireSignin, getMe);

// admin: list all users
router.get("/", requireSignin, checkAdmin, getAllUsers);

export default router;
