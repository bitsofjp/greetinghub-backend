import User from "#models/user.js";
import { verifyGoogleToken } from "#utils/googleAuth.js";
import { serializeUser } from "#utils/serializer.js";
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

    const payload = await verifyGoogleToken(idToken);

    console.log(payload);

    if (!payload?.email) {
      return res.status(401).json({ message: "Google token invalid" });
    }

    const { email, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        googleId,
        hash_password: "",
        verified: true,
      });

      await user.save();
    }

    const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "15m" });

    const refreshToken = crypto.randomBytes(40).toString("hex");

    user.refreshTokens.push(refreshToken);
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
