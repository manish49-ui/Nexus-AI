import Assessment from "../models/assessment.model.js";
import AssessmentResult from "../models/assessmentResult.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";

/**
 * Submit user's assessment result and save to database
 */
export const submitAssessmentResult = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user._id;
    const { answers, timeTaken } = req.body;

    // Validate essential inputs
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers array is required",
      });
    }

    // Find the assessment
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    // Process each answer and calculate score
    let score = 0;
    const questionAnswers = [];

    for (const answer of answers) {
      // Find the question in the assessment
      const question = assessment.questions.find(
        (q) => q.id === answer.questionId
      );

      if (!question) continue; // Skip if question not found

      // Check if the answer is correct
      const isCorrect = question.correctAnswer === answer.userAnswer;
      if (isCorrect) score++;

      // Create the question answer record
      questionAnswers.push({
        questionId: answer.questionId,
        question: question.question,
        userAnswer: answer.userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
      });
    }

    // Calculate percentage
    const maxScore = questionAnswers.length;
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    // Create new result document
    const assessmentResult = new AssessmentResult({
      user: userId,
      assessment: assessmentId,
      score,
      maxScore,
      token: score, // Token equals score by default
      percentage,
      timeTaken: timeTaken || 0,
      answers: questionAnswers,
    });

    // Save result to database
    const savedResult = await assessmentResult.save();

    // Update the token in user too
    const user = await User.findById(userId);
    if (user) {
        user.tokens = (user.tokens || 0) + score; // Add new tokens to existing tokens
        user.assessmentAttempted = [...new Set([...user.assessmentAttempted || [], assessmentId])]; // Add to attempted array
        await user.save();
    }

    // Update assessment's attemptedBy array if user hasn't attempted before
    if (!assessment.attemptedBy.includes(userId)) {
      assessment.attemptedBy.push(userId);
      await assessment.save();
    }

    // Return result data
    res.status(201).json({
      success: true,
      message: "Assessment result saved successfully",
      result: {
        id: savedResult._id,
        score,
        maxScore,
        percentage,
        correctAnswers: questionAnswers.filter((a) => a.isCorrect).length,
        incorrectAnswers: questionAnswers.filter((a) => !a.isCorrect).length,
        passed: percentage >= 60,
      },
    });
  } catch (error) {
    console.error("Error submitting assessment result:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save assessment result",
      error: error.message,
    });
  }
};

export const getResultByUserAndAssessmentId = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user._id;

    const result = await AssessmentResult.findOne({
      user: userId,
      assessment: assessmentId,
    });

    if (!result) {
      return res.status(405).json({
        success: false,
        message: "Result not found",
      });
    }

    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      return res.status(405).json({
        success: false,
        message: "Assessment not found",
      });
    }

    const flatResult = {
      score: result.score,
      maxScore: result.maxScore,
      token: result.token,
      percentage: result.percentage,
      timeTaken: result.timeTaken,
      transcript: assessment.transcript,
      questions: result.answers.map(answer => {
        const question = assessment.questions.find(q => q.id === answer.questionId);
        return {
          questionId: answer.questionId,
          question: question.question,
          options: question.options,
          userAnswer: answer.userAnswer,
          correctAnswer: answer.correctAnswer,
          explanation: question.explanation,
          isCorrect: answer.isCorrect,
        };
      }),
    };

    res.status(200).json({
      success: true,
      result: flatResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch result",
      error: error.message,
    });
  }
};

/**
 * Get assessment result by ID
 */
export const getAssessmentResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const userId = req.user._id;

    const result = await AssessmentResult.findById(resultId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    // Verify ownership
    if (result.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this result",
      });
    }

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch result",
      error: error.message,
    });
  }
};

/**
 * Get all results for the current user
 */
export const getUserResults = async (req, res) => {
  try {
    const userId = req.user._id;
    const results = await AssessmentResult.find({ user: userId })
      .populate("assessment", "title type difficulty")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch results",
      error: error.message,
    });
  }
};

/**
 * Get results for specific assessment
 */
export const getAssessmentResults = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user._id;

    const results = await AssessmentResult.find({
      assessment: assessmentId,
      user: userId,
    }).sort("-createdAt");

    res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assessment results",
      error: error.message,
    });
  }
};
