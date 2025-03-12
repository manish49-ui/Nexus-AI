
import express from 'express';
import { getAssessmentById } from '../../controllers/assessmentFetch.controller.js'; 
import { verifyJWT } from '../../middlewares/auth.middleware.js';


const router = express.Router();

/**
 * @ngdoc controller
 * @name
 * getAssessmentById
 * @description
 * Get the assessment
 * @param {string} id - Required. Assessment id
 * @returns {Object} Response object containing assessment questions and metadata
 */
// router.get("/:id", verifyJWT, getAssessmentById);
router.get("/:id", getAssessmentById);

export default router;
