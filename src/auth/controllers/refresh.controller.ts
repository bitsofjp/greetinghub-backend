import User from "#auth/models/user.js";
import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "default_secret";

interface RefreshRequestBody {
  refreshToken: string;
}

export const refreshToken = async (req: Request<Record<string, never>, Record<string, never>, RefreshRequestBody>, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    // Find user with a matching session token
    const user = await User.findOne({ "sessions.token": refreshToken });

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Find the specific session
    const session = user.sessions.find((s) => s.token === refreshToken);

    if (!session) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Check session expiry
    if (session.expiresAt < new Date()) {
      return res.status(403).json({ message: "Session expired. Please log in again." });
    }

    // ROTATE refresh token
    const newRefreshToken = crypto.randomBytes(40).toString("hex");

    session.token = newRefreshToken;
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await user.save();

    // Generate new access token
    const newAccessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "15m" });

    return res.status(200).json({
      accessToken: newAccessToken,
      message: "Token refreshed",
      refreshToken: newRefreshToken,
      sessionId: session._id,
    });
  } catch (error) {
    return res.status(500).json({
      error,
      message: "Failed to refresh token",
    });
  }
};
