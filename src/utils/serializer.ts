import { IUser } from "#models/user.js";

export const serializeUser = (user: IUser) => ({
  contactNumber: user.contactNumber,
  createdAt: user.createdAt,
  email: user.email,
  id: user._id,
  profilePicture: user.profilePicture,
  role: user.role,
  updatedAt: user.updatedAt,
  username: user.username,
  verified: user.verified,
});
