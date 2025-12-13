import express from "express";
import cors from "cors";

import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import entryRoutes from "./routes/entry.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

// Base health check
app.get("/", (req, res) => {
  res.send("Sanskruthi Backend Running");
});

// Route mounting
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/entry", entryRoutes);


export default app;
