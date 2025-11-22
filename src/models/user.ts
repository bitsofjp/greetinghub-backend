import bcrypt from "bcryptjs";
import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  authenticate(password: string): Promise<boolean>;

  contactNumber?: string;
  createdAt: Date;
  email: string;

  googleId?: string;

  hash_password?: string; // <-- optional for Google login
  profilePicture?: string;

  refreshTokens: string[];
  resetPasswordExpiry?: Date;

  resetPasswordToken?: string;

  role: "admin" | "user";
  updatedAt: Date;

  username?: null | string;
  verificationToken?: string;

  verificationTokenExpiry?: Date;
  verified: boolean;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    contactNumber: {
      type: String,
    },

    email: {
      lowercase: true,
      required: true,
      trim: true,
      type: String,
      unique: true,
    },

    googleId: {
      type: String,
    },

    hash_password: {
      required: function (this: IUser) {
        return !this.googleId;
      },
      select: false,
      type: String,
    },

    profilePicture: {
      type: String,
    },

    refreshTokens: {
      default: [],
      select: false,
      type: [String],
    },

    resetPasswordExpiry: {
      select: false,
      type: Date,
    },

    resetPasswordToken: {
      select: false,
      type: String,
    },

    role: {
      default: "user",
      enum: ["user", "admin"],
      type: String,
    },

    username: {
      lowercase: true,
      sparse: true,
      trim: true,
      type: String,
      unique: true,
    },

    verificationToken: {
      select: false,
      type: String,
    },

    verificationTokenExpiry: {
      select: false,
      type: Date,
    },

    verified: {
      default: false,
      type: Boolean,
    },
  },
  { timestamps: true },
);

userSchema.methods.authenticate = async function (this: IUser, password: string) {
  return bcrypt.compare(password, this.hash_password ?? "");
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
