import express from "express";

const router = express.Router();

// Auth health check
router.get("/health", (req, res) => {
  res.json({ status: "Auth routes working" });
});

export default router;
