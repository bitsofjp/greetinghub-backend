import cors from "cors";
import express, { Application, Request, Response } from "express";

import connectToMongo from "./DB/db.js";
import authRoutes from "./routes/auth.routes.js";

const app: Application = express();
const PORT = Number(process.env.PORT ?? 3000);

await connectToMongo();

//Middlewares
app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/", (req: Request, res: Response) => {
  res.send("API is working...");
});

app.use("/api", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${String(PORT)}`);
});
