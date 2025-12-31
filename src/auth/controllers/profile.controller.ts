import { AuthenticatedRequest } from "#auth/middlewares/auth.middleware.js";
import User from "#auth/models/user.js";
import { serializeUser } from "#auth/utils/serializer.js";
import { Response } from "express";

interface UpdateProfileBody {
  contactNumber?: string;
  profilePicture?: string;
  username?: string;
}

export const updateProfile = async (req: AuthenticatedRequest & { body: UpdateProfileBody }, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { contactNumber, profilePicture, username } = req.body as UpdateProfileBody;

    const updates: Partial<{
      contactNumber: string;
      profilePicture: string;
      username: string;
    }> = {};

    if (username) updates.username = username;
    if (contactNumber) updates.contactNumber = contactNumber;
    if (profilePicture) updates.profilePicture = profilePicture;

    const updated = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }).exec();

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated",
      user: serializeUser(updated),
    });
  } catch (error) {
    res.status(500).json({
      error,
      message: "Failed to update profile",
    });
  }
};
