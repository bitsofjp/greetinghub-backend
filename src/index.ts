import cors from "cors";
import express, { Application, Request, Response } from "express";

import authRoutes from "./auth/routes/auth.routes.js";
import connectToMongo from "./DB/db.js";
import userRoutes from "./users/routes/user.routes.js";

const app: Application = express();
const PORT = Number(process.env.PORT ?? 3000);

await connectToMongo();

// Middlewares
app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/", (_req: Request, res: Response) => {
  res.send("API is working...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${String(PORT)}`);
});
