import bcrypt from "bcryptjs";
import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  authenticate(password: string): Promise<boolean>;
  contactNumber?: string;
  createdAt: Date;
  email: string;
  failedLoginAttempts: number;
  googleId?: string;
  hash_password?: string; // <-- optional for Google login
  hasPassword(): boolean;
  lastVerificationEmailSentAt?: Date;
  lockUntil?: Date | null;
  passwordHistory?: string[];
  passwordSetAt?: Date;
  profilePicture?: string;
  resetPasswordExpiry?: Date;
  resetPasswordToken?: string;
  role: "admin" | "user";
  sessions: ISession[];
  updatedAt: Date;
  username?: null | string;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  verified: boolean;
}
interface ISession {
  _id?: string;
  createdAt: Date;
  expiresAt: Date;
  ip?: string;
  token: string;
  userAgent?: string;
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

    failedLoginAttempts: {
      default: 0,
      type: Number,
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

    lastVerificationEmailSentAt: {
      type: Date,
    },

    lockUntil: {
      default: null,
      type: Date,
    },

    passwordHistory: {
      default: [],
      type: [String],
    },

    passwordSetAt: {
      type: Date,
    },

    profilePicture: {
      type: String,
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

    sessions: [
      {
        createdAt: { default: Date.now, type: Date },
        expiresAt: { required: true, type: Date },
        ip: { type: String },
        token: { required: true, type: String },
        userAgent: { type: String },
      },
    ],

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

userSchema.methods.hasPassword = function (this: IUser) {
  return Boolean(this.hash_password && this.hash_password.length > 0);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
