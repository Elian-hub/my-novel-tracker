import express from "express";
import { refreshAccessToken } from "../controllers/token.js";

const router = express.Router();

router.post("/token/refresh", refreshAccessToken);

export default router;
