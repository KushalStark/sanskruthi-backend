import express from "express";
import { entryScan } from "../controllers/entry.controller.js";
import { adminAuth } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post("/scan", adminAuth, entryScan);

export default router;
