import User from "#models/user.js";
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

    const user = await User.findOne({ refreshTokens: refreshToken });

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);

    const newRefreshToken = crypto.randomBytes(40).toString("hex");
    user.refreshTokens.push(newRefreshToken);

    await user.save();

    const newAccessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "15m" });

    return res.status(200).json({
      accessToken: newAccessToken,
      message: "Token refreshed",
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(500).json({
      error,
      message: "Failed to refresh token",
    });
  }
};
