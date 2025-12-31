import { AuthenticatedRequest } from "#auth/middlewares/auth.middleware.js";
import User from "#auth/models/user.js";
import { serializeUser } from "#auth/utils/serializer.js";
import { Response } from "express";

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.find().select("_id email role verified createdAt");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error, message: "Failed to fetch users" });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user._id)
      .select("-hash_password -refreshTokens -verificationToken -verificationTokenExpiry -resetPasswordToken -resetPasswordExpiry -__v")
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: serializeUser(user),
    });
  } catch (error) {
    res.status(500).json({
      error,
      message: "Failed to fetch user profile",
    });
  }
};
