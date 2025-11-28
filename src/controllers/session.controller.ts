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

export const deleteSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const beforeCount = user.sessions.length;

    user.sessions = user.sessions.filter((s) => String(s._id) !== sessionId);

    if (user.sessions.length === beforeCount) {
      return res.status(404).json({ message: "Session not found" });
    }

    await user.save();

    return res.status(200).json({
      message: "Session deleted successfully",
      removedSessionId: sessionId,
    });
  } catch (error) {
    return res.status(500).json({
      error,
      message: "Failed to delete session",
    });
  }
};
