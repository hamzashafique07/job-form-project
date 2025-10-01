/** @format */
// server/src/routes/formRoute.ts
import { Router } from "express";
import {
  validateStep,
  saveForm,
  submitForm,
} from "../controllers/formController";

const formRoute = Router();

// POST /api/forms/validate-step
formRoute.post("/validate-step", validateStep);

// POST /api/forms/save
formRoute.post("/save", saveForm);

// POST /api/forms/submit
formRoute.post("/submit", submitForm);

export { formRoute };
