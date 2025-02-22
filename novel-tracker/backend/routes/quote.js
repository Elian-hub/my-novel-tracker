import express from "express";
import { getQuote } from "../controllers/quote.js";

const router = express.Router();

router.get("/get", getQuote);

export default router;
