import express from "express";

import { getAssessmentBySearchQuery, getAllAssessment, getPopularAssessments } from "../../controllers/exploreAssessment.controller.js";

const router = express.Router();

router.get("/search", getAssessmentBySearchQuery);

router.get("/all", getAllAssessment);

router.get("/popular", getPopularAssessments);

export default router;

