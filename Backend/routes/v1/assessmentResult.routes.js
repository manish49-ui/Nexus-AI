import express from "express";
import { 
  submitAssessmentResult,
  getAssessmentResult,
  getUserResults,
  getAssessmentResults,
  getResultByUserAndAssessmentId
} from "../../controllers/assessmentResult.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

/**
 * @route POST /api/v1/assessment-results/:assessmentId/submit
 * @desc Submit answers for an assessment
 */
router.post("/submit/:assessmentId", submitAssessmentResult);

router.get("/getResult/:assessmentId", getResultByUserAndAssessmentId);













/**
 * @route GET /api/v1/assessment-results/result/:resultId
 * @desc Get a specific assessment result by ID
 */
router.get("/result/:resultId", getAssessmentResult);

/**
 * @route GET /api/v1/assessment-results/user
 * @desc Get all assessment results for the current user
 */
router.get("/user", getUserResults);

/**
 * @route GET /api/v1/assessment-results/assessment/:assessmentId
 * @desc Get all results for a specific assessment for the current user
 */
router.get("/assessment/:assessmentId", getAssessmentResults);





export default router;
