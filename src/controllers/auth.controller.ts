import bcrypt from "bcryptjs";
import { Request, Response } from "express";

import User from "../models/user.js";

interface SignupBody {
  email: string;
  password: string;
  role?: "admin" | "user";
}

export const signup = async (req: Request<Record<string, never>, Record<string, never>, SignupBody>, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash_password = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      hash_password,
      role: role ?? "user",
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        email: newUser.email,
        id: newUser._id,
        role: newUser.role,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown server error";

    return res.status(500).json({
      error: message,
      message: "Signup failed",
    });
  }
};
