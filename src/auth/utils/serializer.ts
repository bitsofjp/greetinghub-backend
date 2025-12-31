import { IUser } from "#auth/models/user.js";

export const serializeUser = (user: IUser) => ({
  contactNumber: user.contactNumber,
  createdAt: user.createdAt,
  email: user.email,
  hasPassword: user.hasPassword(),
  id: user._id,
  passwordSetAt: user.passwordSetAt,
  profilePicture: user.profilePicture,
  role: user.role,
  updatedAt: user.updatedAt,
  username: user.username,
  verified: user.verified,
});
