import { generateBotResponse } from "../services/chatbot.service.js";
import Assessment from "../models/assessment.model.js";
import { askAssessmentService } from "../services/chatbot.service.js";
import axios from 'axios';



const getBotResponse = async (req, res) => {
    try {
        const response = await generateBotResponse();
        res.status(200).json({ response });
    } catch (error) {
        console.error('Error in chatbot response:', error);
        res.status(500).json({
            message: 'Error generating response'
        });
    }
};

const askAssessment = async (req, res) => {
    try {
        const { question, reference } = req.body;
        
        // Format the reference data
        const formattedReference = {
            score: reference.result.score,
            maxScore: reference.result.maxScore,
            percentage: reference.result.percentage,
            timeTaken: reference.result.timeTaken,
            transcript: reference.result.transcript,
            questions: reference.result.questions
        };

        // extract transcript from assessment model
        const response = await askAssessmentService(formattedReference, question);

        res.status(200).json({
            response,
            status: 200,
            success: true
        });
    } catch (error) {
        console.error('Error in generating assessment:', error);
        res.status(500).json({
            message: 'Error generating assessment'
        });
    }
};


const generateAssessment = async (req, res) => {
    try {
        const assessment = await generateBotResponse();
        res.status(200).json({ assessment });
    } catch (error) {
        console.error('Error in generating assessment:', error);
        res.status(500).json({
            message: 'Error generating assessment'
        });
    }
};


export { getBotResponse, generateAssessment, askAssessment };

