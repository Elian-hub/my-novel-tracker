import express from "express";
import {
  getReadingStats,
  resetBookForRereading,
  updateReadingProgress,
} from "../controllers/stats.js";

const router = express.Router();

router.get("/all", getReadingStats);
router.put("/update", updateReadingProgress);
router.put("/reset", resetBookForRereading);

export default router;
