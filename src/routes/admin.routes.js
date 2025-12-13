import express from "express";

const router = express.Router();

// Health test for admin routes
router.get("/health", (req, res) => {
  res.json({ status: "Admin routes working" });
});

export default router;
