import express from "express";
import {
  createVIP,
  deleteUser,
  getAllUsers
} from "../controllers/admin.controller.js";
import { adminAuth } from "../middlewares/admin.middleware.js";
import express from "express";
import { adminAuth } from "../middlewares/admin.middleware.js";
import {
  getStats,
  listUsers,
  promoteUser,
  deleteUser,
  createVIP,
  exportCSV
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/stats", adminAuth, getStats);
router.get("/users", adminAuth, listUsers);
router.post("/promote/:userId", adminAuth, promoteUser);
router.delete("/delete/:userId", adminAuth, deleteUser);
router.post("/create-vip", adminAuth, createVIP);
router.get("/export", adminAuth, exportCSV);



export default router;
