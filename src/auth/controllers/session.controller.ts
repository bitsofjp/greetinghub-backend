import { AuthenticatedRequest } from "#auth/middlewares/auth.middleware.js";
import User from "#auth/models/user.js";
import { Request, Response } from "express";

interface LogoutBody {
  refreshToken: string;
}

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

export const logoutCurrentSession = async (req: Request<Record<string, never>, Record<string, never>, LogoutBody>, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const user = await User.findOne({ "sessions.token": refreshToken });

    if (!user) {
      return res.status(403).json({ message: "Invalid session or already logged out" });
    }

    // Remove only this session
    user.sessions = user.sessions.filter((s) => s.token !== refreshToken);

    await user.save();

    return res.status(200).json({
      message: "Logged out from this device",
    });
  } catch (error) {
    return res.status(500).json({
      error,
      message: "Failed to logout session",
    });
  }
};
