import { AuthenticatedRequest } from "#middlewares/auth.middleware.js";
import User from "#models/user.js";
import { Response } from "express";

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.find().select("_id email role verified createdAt");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error, message: "Failed to fetch users" });
  }
};

export const getMe = (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      // user: {
      //   email: req.user.email,
      //   id: req.user._id,
      //   role: req.user.role,
      //   verified: req.user.verified,
      // },
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ error, message: "Failed to fetch user profile" });
  }
};
