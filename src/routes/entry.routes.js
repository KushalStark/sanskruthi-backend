import express from "express";

const router = express.Router();

// Entry scan health check
router.get("/health", (req, res) => {
  res.json({ status: "Entry routes working" });
});

export default router;
