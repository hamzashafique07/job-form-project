//server/src/routes/uploadRoute.ts
/** @format */
import express from "express";
import { uploadSignature } from "../controllers/uploadController";

const router = express.Router();
router.post("/signature", uploadSignature);
export default router;
