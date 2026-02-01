import { AuthenticatedRequest } from "#auth/middlewares/auth.middleware.js";
import { Response } from "express";

import * as greetingService from "../services/greeting.service.js";

interface CreateGreetingBody {
  title?: string;
}

export async function archiveGreeting(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  if (!req.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = req.user._id;

  const page = await greetingService.archiveGreetingPage(id, userId);

  res.json(page);
}

export async function createGreeting(req: AuthenticatedRequest & { body: CreateGreetingBody }, res: Response) {
  const { title } = req.body as CreateGreetingBody;

  if (!req.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const page = await greetingService.createGreetingPage(req.user._id, title);

  res.status(201).json(page);
}

export async function listMyGreetings(req: AuthenticatedRequest, res: Response) {
  if (!req.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = req.user._id;

  const pages = await greetingService.listGreetingPagesByOwner(userId);

  res.json(pages);
}
