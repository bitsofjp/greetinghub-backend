import { AuthenticatedRequest } from "#auth/middlewares/auth.middleware.js";
import User from "#auth/models/user.js";
import { sendEmail } from "#auth/utils/sendEmail.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";

interface ChangePasswordBody {
  newPassword: string;
  oldPassword: string;
}
interface ForgotPasswordBody {
  email: string;
}
interface ResetPasswordBody {
  newPassword: string;
  token: string;
}

interface SetPasswordBody {
  newPassword: string;
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

    const resetPasswordUrl = process.env.RESET_PASSWORD_URL ?? "";
    const resetUrl = `${resetPasswordUrl}?token=${resetToken}`;

    await sendEmail(
      email,
      "Reset your GreetingHub password",
      `
        <p>Hello,</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `,
      `Reset your password by visiting this link: ${resetUrl}`,
    );

    return res.status(200).json({
      message: "If an account with this email exists, a reset link will be sent.",
    });
  } catch (error) {
    return res.status(500).json({
      error,
      message: "Failed to process password reset.",
    });
  }
};

export const resetPassword = async (req: Request<Record<string, never>, Record<string, never>, ResetPasswordBody>, res: Response) => {
  try {
    const { newPassword, token } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    const user = await User.findOne({
      resetPasswordExpiry: { $gt: new Date() },
      resetPasswordToken: token,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.hash_password = hashed;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password has been reset successfully. You may now login.",
    });
  } catch (error) {
    return res.status(500).json({
      error,
      message: "Failed to reset password",
    });
  }
};

export const setPassword = async (req: AuthenticatedRequest & { body: SetPasswordBody }, res: Response) => {
  try {
    const userId = req.user?._id;
    const { newPassword } = req.body as SetPasswordBody;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.hasPassword()) {
      return res.status(400).json({
        message: "Password already set. Update password instead.",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    if (user.hash_password) {
      user.passwordHistory?.push(user.hash_password);
    }

    user.hash_password = hashed;
    user.passwordSetAt = new Date();

    user.sessions = [];

    await user.save();

    return res.status(200).json({
      message: "Password set successfully. Please log in again.",
    });
  } catch (error) {
    return res.status(500).json({
      error,
      message: "Failed to set password",
    });
  }
};

export const changePassword = async (req: AuthenticatedRequest & { body: ChangePasswordBody }, res: Response) => {
  try {
    const userId = req.user?._id;
    const { newPassword, oldPassword } = req.body as ChangePasswordBody;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "oldPassword and newPassword are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(423).json({
        message: "Account locked due to too many failed attempts. Try again later.",
      });
    }

    // Cannot change password if none exists
    if (!user.hasPassword()) {
      return res.status(400).json({
        message: "No existing password. Use set password instead.",
      });
    }

    // Validate old password
    const isMatch = await user.authenticate(oldPassword);
    if (!isMatch) {
      user.failedLoginAttempts += 1;

      // Lockout threshold
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      await user.save();

      return res.status(401).json({
        message: "Incorrect old password",
      });
    }

    // Reset lock + failed attempts on success
    user.failedLoginAttempts = 0;
    user.lockUntil = null;

    if (user.passwordHistory?.length) {
      const recentHashes = user.passwordHistory.slice(-5); // last 5

      for (const oldHash of recentHashes) {
        const isReuse = await bcrypt.compare(newPassword, oldHash);
        if (isReuse) {
          return res.status(400).json({
            message: "New password cannot be the same as your last 5 passwords.",
          });
        }
      }
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // Store previous password in history
    if (user.hash_password) {
      user.passwordHistory?.push(user.hash_password);
    }

    // Keep only last 10 stored passwords
    if (user.passwordHistory?.length && user.passwordHistory.length > 10) {
      user.passwordHistory = user.passwordHistory.slice(-10);
    }

    user.hash_password = newHash;
    user.passwordSetAt = new Date();

    // Invalidate all refresh tokens → force re-login everywhere
    user.sessions = [];

    await user.save();

    return res.status(200).json({
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    return res.status(500).json({
      error,
      message: "Failed to change password",
    });
  }
};
