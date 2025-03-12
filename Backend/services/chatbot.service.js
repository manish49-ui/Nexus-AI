import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateBotResponse = async () => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Create a context-aware prompt with language instruction
        const prompt = "hello world";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating chatbot response:', error);
        return "I apologize, but I'm having trouble processing your question. Please try asking in a different way or contact support for assistance.";
    }
};

export const askAssessmentService = async (reference, question) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        // Check if all required data is present
        if (!reference || !reference.questions || !Array.isArray(reference.questions)) {
            throw new Error('Invalid reference data structure');
        }

        // Format the reference data into a readable string
        const formattedReference = `
Context Information:

ASSESSMENT OVERVIEW:
- Score: ${reference.score || 0} out of ${reference.maxScore || 0}
- Percentage: ${reference.percentage || 0}%
- Time Taken: ${reference.timeTaken || 0} seconds

TRANSCRIPT:
${reference.transcript || 'No transcript available'}

QUESTIONS AND ANSWERS:
${reference.questions.map((q, index) => `
Question ${index + 1}: ${q.question}
${q.options ? `Options:
${q.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}` : ''}
User's Answer: ${q.userAnswer || 'Not answered'}
Correct Answer: ${q.correctAnswer}
${q.explanation ? `Explanation: ${q.explanation}` : ''}
Result: ${q.isCorrect ? 'Correct' : 'Incorrect'}
`).join('\n')}

Based on the above context, please answer the following question:
${question.question}
`;

        console.log('Formatted reference:', formattedReference);
        const result = await model.generateContent(formattedReference);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating assessment:', error);
        throw new Error('Failed to generate assessment. Please try again later.');
    }
};
