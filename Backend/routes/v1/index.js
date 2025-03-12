import express from "express";
import usersRoutes from "./users.routes.js";
import chatbotRoutes from "./chatbot.routes.js";
import mediaRoutes from "./media.routes.js";
import assessmentGenerateRoutes from "./assessmentGenerate.routes.js";
import assessmentFetchRoutes from "./assessmentFetch.routes.js";
import assessmentResultRoutes from "./assessmentResult.routes.js";
import exploreAssessmentRoutes from "./exploreAssessment.routes.js";

const router = express.Router();

router.use("/users", usersRoutes);
router.use("/chatbot", chatbotRoutes);
router.use("/media", mediaRoutes);
router.use("/assessment", assessmentGenerateRoutes); // backwards compatibility
router.use("/assessmentGenerate", assessmentGenerateRoutes);
router.use("/assessmentFetch", assessmentFetchRoutes);
router.use("/assessmentResult", assessmentResultRoutes);
router.use("/exploreAssessment", exploreAssessmentRoutes);

export default router;
