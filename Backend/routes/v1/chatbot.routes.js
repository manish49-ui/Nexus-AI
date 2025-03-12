import express from "express";
import { generateAssessment, getBotResponse, askAssessment } from "../../controllers/chatbot.controller.js";

const router = express.Router();

router.post("/bot-response", getBotResponse);
router.post("/generate-assessment", generateAssessment);

router.post("/ask-assessment/:assessmentId", askAssessment);


export default router;
