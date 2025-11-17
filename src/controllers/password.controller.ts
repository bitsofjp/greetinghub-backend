import User from "#models/user.js";
import crypto from "crypto";
import { Request, Response } from "express";

interface ForgotPasswordBody {
  email: string;
}

export const forgotPassword = async (req: Request<Record<string, never>, Record<string, never>, ForgotPasswordBody>, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "If an account with this email exists, a reset link will be sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // expires in 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetExpiry;
    await user.save();

    return res.status(200).json({
      message: "Reset token generated. Please check your email.",
      resetToken,
    });
  } catch (error) {
    return res.status(500).json({
      error,
      message: "Failed to process password reset.",
    });
  }
};
