import User from "#models/user.js";
import { Request, Response } from "express";

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Invalid or missing token" });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }, // not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalid or expired" });
    }

    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully. You may now log in.",
    });
  } catch (error) {
    return res.status(500).json({
      error,
      message: "Verification failed",
    });
  }
};
