import User from "#models/user.js";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "default_secret";

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

interface AuthUser {
  _id: string;
  email: string;
  role: "admin" | "user";
  verified: boolean;
}

export const requireSignin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization required" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await User.findById(decoded.id).select("_id email role verified createdAt");

    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }

    req.user = {
      _id: String(user._id),
      email: user.email,
      role: user.role,
      verified: user.verified,
    };

    next();
  } catch (error) {
    res.status(401).json({ error, message: "Invalid or expired token" });
  }
};

export const checkAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin privilege required" });
  }
  next();
};
