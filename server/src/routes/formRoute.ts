/** @format */
// server/src/routes/formRoute.ts
import { Router } from "express";
import { validateStep } from "../controllers/formController";

const formRoute = Router();

// POST /api/forms/validate-step
formRoute.post("/validate-step", validateStep);

export { formRoute };
