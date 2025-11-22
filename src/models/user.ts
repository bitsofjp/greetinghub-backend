import bcrypt from "bcryptjs";
import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  // Methods
  authenticate(password: string): Promise<boolean>;

  contactNumber?: string;
  createdAt: Date;
  displayName: string;

  // Core identity
  email: string;
  // OAuth
  googleId?: string;
  // Auth & roles
  hash_password: string;

  profilePicture?: string;
  // Tokens
  refreshTokens: string[];
  resetPasswordExpiry?: Date;
  resetPasswordToken?: string;
  role: "admin" | "user";

  updatedAt: Date;
  username?: string; // <-- optional: email/password users must have it, Google users may not
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  verified: boolean;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    contactNumber: {
      type: String,
    },
    displayName: {
      required: true,
      trim: true,
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
      type: String,
    },
    profilePicture: {
      type: String,
    },
    refreshTokens: {
      default: [],
      type: [String],
    },
    resetPasswordExpiry: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    role: {
      default: "user",
      enum: ["user", "admin"],
      type: String,
    },
    username: {
      lowercase: true,
      sparse: true, // <-- allows some users to have null/undefined usernames
      trim: true,
      type: String,
      unique: true,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpiry: {
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
  return bcrypt.compare(password, this.hash_password);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
