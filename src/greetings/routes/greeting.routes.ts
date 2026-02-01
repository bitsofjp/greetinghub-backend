import { requireSignin } from "#auth/middlewares/auth.middleware.js";
import { archiveGreeting, createGreeting, listMyGreetings } from "#greetings/controllers/greeting.controller.js";
import { Router } from "express";

const router = Router();

router.post("/", requireSignin, createGreeting);
router.get("/", requireSignin, listMyGreetings);
router.patch("/:id/archive", requireSignin, archiveGreeting);

export default router;
