import User from "#models/user.js";
import { sendEmail } from "#utils/sendEmail.js";
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

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const newUser = new User({
      email,
      hash_password,
      role: role ?? "user",
      verificationToken,
      verificationTokenExpiry,
      verified: false,
    });

    await newUser.save();

    const frontendUrl = process.env.FRONTEND_URL ?? "";
    const verifyUrl = `${frontendUrl}/verify?token=${verificationToken}`;

    await sendEmail(
      email,
      "Verify your GreetingHub account",
      `
        <p>Welcome!</p>
        <p>Please click the link below to verify your account:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link expires in 1 hour.</p>
      `,
    );

    return res.status(201).json({
      message: "User registered. Please verify your email.",
      userId: newUser._id,
    });
  } catch (error) {
    res.status(500).json({ error, message: "Signup failed" });
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

    if (!user.verified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
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
