import User from "#models/user.js";
import { Request, Response } from "express";

interface LogoutRequestBody {
  refreshToken: string;
}

export const logout = async (req: Request<Record<string, never>, Record<string, never>, LogoutRequestBody>, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    // Find user with the matching session token
    const user = await User.findOne({ "sessions.token": refreshToken });

    if (!user) {
      // Even if the token doesn't exist, logout is "successful"
      return res.status(200).json({ message: "Logged out successfully" });
    }

    // Remove the session
    user.sessions = user.sessions.filter((session) => session.token !== refreshToken);

    await user.save();

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({
      error,
      message: "Logout failed",
    });
  }
};
