import { AuthenticatedRequest } from "#middlewares/auth.middleware.js";
import User from "#models/user.js";
import { Response } from "express";

export const listSessions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select("sessions");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      sessions: user.sessions,
    });
  } catch (error) {
    return res.status(500).json({
      error,
      message: "Failed to fetch sessions",
    });
  }
};
