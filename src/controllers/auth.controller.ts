import User from "#models/user.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

interface SigninBody {
  email: string;
  password: string;
}

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

export const signin = async (req: Request<Record<string, never>, Record<string, never>, SigninBody>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.authenticate(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET ?? "default_secret",
      { expiresIn: "1h" },
    );

    const refreshToken = crypto.randomBytes(40).toString("hex");

    user.refreshTokens.push(refreshToken);
    await user.save();

    return res.status(200).json({
      accessToken,
      message: "Login successful",
      refreshToken,
      user: {
        email: user.email,
        id: user._id,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      error,
      message: "Signin failed",
    });
  }
};
