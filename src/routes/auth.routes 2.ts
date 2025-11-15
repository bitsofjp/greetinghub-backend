import { Request, Response, Router } from "express";

const router = Router();

router.get("/ping", (req: Request, res: Response) => {
  res.json({ message: "auth routes alive" });
});

export default router;
