import rateLimit from "express-rate-limit";

/**
 * Protect /auth/signin
 * Prevent brute force attempts
 */
export const signinLimiter = rateLimit({
  legacyHeaders: false,
  max: 5,
  message: {
    message: "Too many login attempts. Please wait before trying again.",
  },
  standardHeaders: true,
  windowMs: 60 * 1000,
});

/**
 * Protect /auth/signup
 * Prevent spam account creation
 */
export const signupLimiter = rateLimit({
  legacyHeaders: false,
  max: 20,
  message: {
    message: "Too many signup attempts. Please try again later.",
  },
  standardHeaders: true,
  windowMs: 10 * 60 * 1000, // 10 minutes
});

/**
 * Protect /auth/forgot-password
 * Prevent password reset abuse
 */
export const resetLimiter = rateLimit({
  legacyHeaders: false,
  max: 3,
  message: {
    message: "Too many password reset requests. Try again in 1 hour.",
  },
  standardHeaders: true,
  windowMs: 60 * 60 * 1000, // 1 hour
});

/**
 * Protect /auth/google
 * Moderate protection
 */
export const googleLimiter = rateLimit({
  legacyHeaders: false,
  max: 10,
  message: {
    message: "Too many Google login attempts. Please wait.",
  },
  standardHeaders: true,
  windowMs: 1 * 60 * 1000, // 1 minute
});
