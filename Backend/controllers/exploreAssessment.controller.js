import Assessment from "../models/assessment.model.js";

/**
 * Search assessments by query string across multiple fields
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAssessmentBySearchQuery = async (req, res) => {
    try {
        const { query = "", page = 1, limit = 10, difficulty, type } = req.query;
        
        // Create a regex pattern for case-insensitive search
        const searchRegex = new RegExp(query, "i");
        
        // Build filter object for MongoDB query
        const filter = {};
        
        // Only add search conditions if query is not empty
        if (query.trim() !== "") {
            filter.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { tags: searchRegex },
                { "questions.question": searchRegex },
                { "questions.options": searchRegex }
            ];
        }
        
        // Add optional filters if provided
        if (difficulty) {
            filter.difficulty = difficulty;
        }
        
        if (type) {
            filter.type = type;
        }
        
        // Convert pagination params to numbers
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        // Execute search query with pagination
        const assessments = await Assessment.find(filter)
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 })
            .select('title description type difficulty tags questionCount createdAt')
            .lean();
        
        // Get total count for pagination
        const total = await Assessment.countDocuments(filter);
        
        // Return formatted response
        return res.status(200).json({
            success: true,
            data: {
                assessments,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    } catch (error) {
        console.error("Error searching assessments:", error);
        return res.status(500).json({
            success: false,
            message: "Error searching assessments",
            error: error.message
        });
    }
};



/**
 * Get popular assessments (most attempted)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPopularAssessments = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        
        // Find assessments with most attempts
        const assessments = await Assessment.aggregate([
            {
                $addFields: {
                    attemptCount: { $size: "$attemptedBy" }
                }
            },
            { $sort: { attemptCount: -1 } },
            { $limit: parseInt(limit) },
            {
                $project: {
                    title: 1,
                    description: 1,
                    type: 1,
                    difficulty: 1,
                    tags: 1,
                    attemptCount: 1,
                    createdAt: 1
                }
            }
        ]);
        
        return res.status(200).json({
            success: true,
            data: assessments
        });
    } catch (error) {
        console.error("Error retrieving popular assessments:", error);
        return res.status(500).json({
            success: false,
            message: "Error retrieving popular assessments",
            error: error.message
        });
    }
};

const getAllAssessment = async (req, res) => {
    // return res all avilable assessment data

    try {
        const assessments = await Assessment.find();
        return res.status(200).json({
            success: true,
            data: assessments
        });
    }
    catch (error) {
        console.error("Error retrieving assessments:", error);
        return res.status(500).json({
            success: false,
            message: "Error retrieving assessments",
            error: error.message
        });
    }
    
}

export  {
    getAssessmentBySearchQuery,
    getPopularAssessments,
    getAllAssessment
};