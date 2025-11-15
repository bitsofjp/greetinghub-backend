import bcrypt from "bcryptjs";
import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  authenticate(password: string): Promise<boolean>;
  email: string;
  googleId?: string;
  hash_password: string;
  role: "admin" | "user";
  verified: boolean;
}

const userSchema = new mongoose.Schema<IUser>(
  {
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
      required: true,
      type: String,
    },

    role: {
      default: "user",
      enum: ["user", "admin"],
      type: String,
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
