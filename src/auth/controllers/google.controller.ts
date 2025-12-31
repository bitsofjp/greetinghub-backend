import User from "#auth/models/user.js";
import { verifyGoogleToken } from "#auth/utils/googleAuth.js";
import { serializeUser } from "#auth/utils/serializer.js";
import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "default_secret";

interface GoogleLoginBody {
  idToken: string;
}

export const googleLogin = async (req: Request<Record<string, never>, Record<string, never>, GoogleLoginBody>, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Google ID token is required" });
    }

    // 1. Verify Google token
    const payload = await verifyGoogleToken(idToken);

    if (!payload?.email || !payload.sub) {
      return res.status(401).json({ message: "Google token invalid" });
    }

    const { email, sub: googleId } = payload;

    // 2. Find existing user by email
    let user = await User.findOne({ email }).exec();

    if (!user) {
      // -----------------------------
      // CASE A: New Google user
      // -----------------------------
      user = new User({
        email,
        googleId,
        hash_password: "", // No password for Google accounts
        verified: true, // Google = trusted provider
      });

      await user.save();
    } else {
      // -----------------------------
      // CASE B: Email already exists
      // -----------------------------
      if (!user.googleId) {
        // Link Google to existing email/password account
        user.googleId = googleId;
        user.verified = true;

        await user.save();
      } else if (user.googleId !== googleId) {
        // -----------------------------
        // CASE C: Mismatch (Security Issue)
        // -----------------------------
        return res.status(401).json({
          message: "Google account does not match the existing user",
        });
      }
      // Otherwise → CASE D: googleId matches → normal login
    }

    // 3. Generate access token
    const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "15m" });

    // 4. Refresh token rotation
    const refreshToken = crypto.randomBytes(40).toString("hex");
    user.sessions.push({
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ip: req.ip,
      token: refreshToken,
      userAgent: req.headers["user-agent"] ?? "unknown",
    });

    // Optional: limit token array size (max 5 tokens)
    if (user.sessions.length > 5) {
      user.sessions = user.sessions.slice(-5);
    }

    await user.save();

    return res.status(200).json({
      accessToken,
      message: "Google login successful",
      refreshToken,
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      error,
      message: "Google login failed",
    });
  }
};
