import express from "express";

const router = express.Router();

// User health check
router.get("/health", (req, res) => {
  res.json({ status: "User routes working" });
});

export default router;
