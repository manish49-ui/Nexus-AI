import axios from 'axios';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ytdl from '@distube/ytdl-core';
import fetchYouTubeAudio from '../helper/fetchYouTubeAudio.js';
import transcribeAudioVideo from '../helper/transcribeAudioVideo.js';
import generateAssessmentPromptCall from '../helper/generateAssessmentPromptCall.js';
import { extractTextFromPdfFile } from '../helper/pdfToText.js';
import { extractTextFromPptFile } from '../helper/pptToText.js';
import { saveAssessment } from '../helper/saveAssessment.js';
import User from "../models/user.model.js";
import { uploadBufferToCloudinary } from '../helper/cloudinaryHelper.js';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOAD_DIR = path.resolve(__dirname, '../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer storage
const storage = multer.memoryStorage();

// Create a more flexible file filter
const mediaFileFilter = (req, file, cb) => {
    // List of acceptable file types
    const videoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
    const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/x-m4a', 'audio/webm'];

    // Accept any video or audio file
    if ([...videoTypes, ...audioTypes].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only video or audio files are allowed'), false);
    }
};

// Add document file filter for PDFs and PPTs
const documentFileFilter = (req, file, cb) => {
    // List of acceptable document types
    const documentTypes = [
        'application/pdf',                     // PDF
        'application/vnd.ms-powerpoint',       // PPT
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' // PPTX
    ];

    if (documentTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and PowerPoint files are allowed'), false);
    }
};

// Export a single multer middleware that accepts both video and audio
const mediaUpload = multer({
    storage, // Use the memory storage
    fileFilter: mediaFileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB max for all media
});

// Create document upload middleware
const documentUpload = multer({
    storage, // Use the memory storage
    fileFilter: documentFileFilter,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB max for documents
});

// Create a fields array for multiple possible field names
const mediaFields = [
    { name: 'media', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'audioFile', maxCount: 1 },
    { name: 'videoFile', maxCount: 1 }
];

// Create fields array for document upload
const documentFields = [
    { name: 'document', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
    { name: 'ppt', maxCount: 1 },
    { name: 'pptx', maxCount: 1 }
];

/**
 * Generate assessment from YouTube video
 */
const generateAssessmentFromYoutube = async (req, res) => {
    try {
        const { videoUrl, numberOfQuestions = 5, difficulty = 'medium', type = 'MCQ' } = req.body;

        if (!videoUrl) {
            return res.status(400).json({
                success: false,
                message: 'YouTube URL is required'
            });
        }

        // Extract video ID
        const videoId = ytdl.getURLVideoID(videoUrl);
        let transcript;

        // Try Python service first
        try {
            const pythonResponse = await axios.get(`https://product-answer.vercel.app/api/transcript/${videoId}`, { timeout: 15000 });
            transcript = pythonResponse.data.transcript;
            transcript = transcript.map((obj) => obj.text).join('\n');
        } catch (error) {
            console.log('Python service failed, falling back to manual extraction');
        }

        // If Python service failed, extract manually
        if (!transcript) {
            const audioPath = await fetchYouTubeAudio(videoUrl);
            const transcriptionResult = await transcribeAudioVideo(audioPath);
            transcript = transcriptionResult.text;
        }

        if (!transcript) {
            return res.status(400).json({
                success: false,
                message: 'Failed to extract transcript'
            });
        }

        // Generate assessment
        const assessmentJson = await generateAssessmentPromptCall(transcript, type, numberOfQuestions, difficulty);
        let assessment;

        try {
            // Try to extract JSON from the response
            const match = assessmentJson.match(/\[[\s\S]*\]/);
            assessment = match ? JSON.parse(match[0]) : JSON.parse(assessmentJson);
        } catch (error) {
            assessment = { rawResponse: assessmentJson };
        }

        // Save to database if user ID is available
        let savedAssessment = null;
        const userId = req.user?._id;

        try {
            savedAssessment = await saveAssessment(
                assessment,
                {
                    videoId,
                    type,
                    difficulty,
                    source: 'youtube',
                    transcript: JSON.stringify(transcript)
                },
                { userId }
            );

            // Add assessment to user's created assessments
            await User.findByIdAndUpdate(
                userId,
                { $addToSet: { assessmentCreated: savedAssessment._id } }
            );
        } catch (dbError) {
            console.error('Failed to save to database:', dbError);
            // Continue even if database save fails
        }

        res.status(200).json({
            success: true,
            videoId,
            assessment,
            metadata: { type, difficulty, questionCount: numberOfQuestions },
            // Include assessment ID if saved successfully
            ...(savedAssessment && { assessmentId: savedAssessment._id })
        });

    } catch (error) {
        console.error('Error generating YouTube assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating assessment',
            error: error.message
        });
    }
};

/**
 * Generate assessment from media URL (direct URL or Cloudinary URL)
 */
const generateAssessmentFromMediaUrl = async (req, res) => {
    const timeoutId = setTimeout(() => {
        res.status(504).json({ success: false, message: 'Request timed out' });
    }, 300000); // 5 minutes timeout

    try {
        const {
            mediaUrl,
            numberOfQuestions = 5,
            difficulty = 'medium',
            type = 'MCQ',
            deleteAfterProcessing = false,
            cloudinaryPublicId = null,
            resourceType = 'video'  // Default resource type for media
        } = req.body;

        if (!mediaUrl) {
            clearTimeout(timeoutId);
            return res.status(400).json({
                success: false,
                message: 'Media URL is required'
            });
        }

        console.log(`Processing media from URL: ${mediaUrl}`);

        // Use Assembly AI API with the provided URL
        const ASSEMBLY_API_KEY = process.env.ASSEMBLY_API_KEY;
        if (!ASSEMBLY_API_KEY) {
            clearTimeout(timeoutId);
            throw new Error('ASSEMBLY_API_KEY is not set in environment variables');
        }

        // Submit transcription job using the URL
        const response = await axios.post(
            "https://api.assemblyai.com/v2/transcript",
            {
                audio_url: mediaUrl,
                punctuate: true,
                format_text: true,
                speaker_labels: true
            },
            { headers: { authorization: ASSEMBLY_API_KEY } }
        );

        const transcriptId = response.data.id;
        console.log(`Transcription job started with ID: ${transcriptId}`);

        // Poll for completion
        let isCompleted = false;
        let transcript = '';

        while (!isCompleted) {
            const statusResponse = await axios.get(
                `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
                { headers: { authorization: ASSEMBLY_API_KEY } }
            );

            const status = statusResponse.data.status;
            console.log(`Transcription status: ${status}`);

            if (status === "completed") {
                isCompleted = true;
                transcript = statusResponse.data.text;
            } else if (status === "failed") {
                clearTimeout(timeoutId);
                throw new Error("Transcription failed: " + (statusResponse.data.error || "Unknown error"));
            } else {
                // Wait before checking again
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        if (!transcript) {
            clearTimeout(timeoutId);
            throw new Error('Insufficient speech content in media');
        }

        console.log(`Generating ${numberOfQuestions} ${difficulty} ${type} questions...`);
        const assessmentJson = await generateAssessmentPromptCall(transcript, type, numberOfQuestions, difficulty);

        // Parse result
        let assessment;
        try {
            const match = assessmentJson.match(/\[[\s\S]*\]/);
            assessment = match ? JSON.parse(match[0]) : JSON.parse(assessmentJson);
        } catch (error) {
            assessment = { rawResponse: assessmentJson };
        }

        // Save to database if user ID is available
        let savedAssessment = null;
        const userId = req.user?._id;

        try {
            // Extract filename from URL if possible
            const urlParts = mediaUrl.split('/');
            const fileName = urlParts[urlParts.length - 1].split('?')[0] || 'media-file';

            savedAssessment = await saveAssessment(
                assessment,
                {
                    fileName,
                    type,
                    difficulty,
                    source: 'media-url',
                    transcript: JSON.stringify(transcript)
                },
                { userId }
            );

            // Add assessment to user's created assessments
            if (userId) {
                await User.findByIdAndUpdate(
                    userId,
                    { $addToSet: { assessmentCreated: savedAssessment._id } }
                );
            }
        } catch (dbError) {
            console.error('Failed to save to database:', dbError);
            // Continue even if database save fails
        }

        // Delete from Cloudinary if requested
        if (deleteAfterProcessing && cloudinaryPublicId) {
            try {
                await deleteFromCloudinary(cloudinaryPublicId, resourceType);
                console.log(`Deleted media from Cloudinary: ${cloudinaryPublicId}`);
            } catch (deleteError) {
                console.error('Failed to delete from Cloudinary:', deleteError);
                // Continue even if deletion fails
            }
        }

        clearTimeout(timeoutId);
        res.status(200).json({
            success: true,
            mediaUrl,
            assessment,
            metadata: {
                type,
                difficulty,
                questionCount: numberOfQuestions,
                transcriptLength: transcript.length
            },
            // Include assessment ID if saved successfully
            ...(savedAssessment && { assessmentId: savedAssessment._id })
        });

    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error generating assessment from media URL:', error);

        res.status(500).json({
            success: false,
            message: 'Error generating assessment',
            error: error.message
        });
    }
};

/**
 * Modified to handle media files - Now only uses Cloudinary + AssemblyAI approach
 */
const generateAssessmentFromMedia = async (req, res) => {
    // If the request contains a mediaUrl instead of a file, redirect to the URL handler

    try {
        if (req.body.mediaUrl) {
            return generateAssessmentFromMediaUrl(req, res);
        }

        return res.status(200).json({
            success: false,
            message: 'Media URL or file is required'
        });

    } catch (error) {
        console.error('Error generating assessment from media URL:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating assessment',
            error: error.message
        });

    }
};

/**
 * Generate assessment from uploaded document (PDF/PowerPoint)
 */
const generateAssessmentFromDocument = async (req, res) => {
    // If the request contains a documentUrl, redirect to the URL handler
    try {

        if (req.body.documentUrl) {
            return generateAssessmentFromDocumentUrl(req, res);

        }

        res.status(400).json({
            success: false,
            message: 'Document URL is required'
        });

    } catch (error) {
        console.error('Error generating assessment from document URL:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating assessment',
            error: error.message
        });
    }
};

/**
 * Generate assessment from document URL (PDF/PPT from Cloudinary or other source)
 */
const generateAssessmentFromDocumentUrl = async (req, res) => {
    const timeoutId = setTimeout(() => {
        res.status(504).json({ success: false, message: 'Request timed out' });
    }, 180000); // 3 minutes timeout

    try {
        const {
            documentUrl,
            numberOfQuestions = 5,
            difficulty = 'medium',
            type = 'MCQ',
            deleteAfterProcessing = false,
            cloudinaryPublicId = null,
            resourceType = 'raw'  // Default resource type for documents
        } = req.body;

        if (!documentUrl) {
            clearTimeout(timeoutId);
            return res.status(400).json({
                success: false,
                message: 'Document URL is required'
            });
        }

        console.log(`Processing document from URL: ${documentUrl}`);

        // Fetch the document from the URL
        let documentBuffer;
        try {
            const response = await axios({
                method: 'GET',
                url: documentUrl,
                responseType: 'arraybuffer'
            });

            documentBuffer = Buffer.from(response.data);
            console.log(`Downloaded document: ${documentBuffer.length} bytes`);
        } catch (fetchError) {
            clearTimeout(timeoutId);
            console.error('Error fetching document:', fetchError);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch document from URL',
                error: fetchError.message
            });
        }

        // Determine file type from URL
        const urlLower = documentUrl.toLowerCase();
        let fileType;
        let documentText;
        let documentMetadata = {};

        // Extract text based on detected file type
        if (urlLower.endsWith('.pdf')) {
            console.log('Processing PDF document...');
            fileType = 'application/pdf';
            const pdfResult = await extractTextFromPdfFile(documentBuffer, false);
            documentText = pdfResult.allText;
            documentMetadata = {
                pageCount: pdfResult.pageCount,
                documentType: 'PDF',
                cloudinaryUrl: documentUrl
            };
        }
        else if (urlLower.endsWith('.ppt') || urlLower.endsWith('.pptx')) {
            console.log('Processing PowerPoint document...');
            fileType = urlLower.endsWith('.ppt') ?
                'application/vnd.ms-powerpoint' :
                'application/vnd.openxmlformats-officedocument.presentationml.presentation';

            const pptResult = await extractTextFromPptFile(documentBuffer);
            documentText = pptResult.allText;
            documentMetadata = {
                slideCount: pptResult.slideCount,
                title: pptResult.title,
                documentType: urlLower.endsWith('.ppt') ? 'PPT' : 'PPTX',
                cloudinaryUrl: documentUrl
            };
        } else {
            clearTimeout(timeoutId);
            return res.status(400).json({
                success: false,
                message: 'Unsupported document type. Only PDF, PPT, and PPTX are supported.'
            });
        }

        // Get filename from URL
        const urlParts = documentUrl.split('/');
        const fileName = urlParts[urlParts.length - 1].split('?')[0] || 'document';

        // Validate that we have enough text to work with
        if (!documentText || documentText.length < 100) {
            clearTimeout(timeoutId);
            return res.status(400).json({
                success: false,
                message: 'Document contains insufficient text for assessment generation',
                error: 'The document has too little text content (minimum 100 characters required)'
            });
        }

        console.log(`Document text extracted, length: ${documentText.length} characters`);
        console.log(`Generating ${numberOfQuestions} ${difficulty} ${type} questions...`);

        // Generate assessment
        const assessmentJson = await generateAssessmentPromptCall(documentText, type, numberOfQuestions, difficulty);

        // Parse result
        let assessment;
        try {
            const match = assessmentJson.match(/\[[\s\S]*\]/);
            assessment = match ? JSON.parse(match[0]) : JSON.parse(assessmentJson);
        } catch (error) {
            console.error('Failed to parse assessment JSON:', error);
            assessment = { rawResponse: assessmentJson };
        }

        // Save to database if user ID is available
        let savedAssessment = null;
        const userId = req.user?._id;

        try {
            // For documents, use document metadata
            const title = documentMetadata.title || `${documentMetadata.documentType} Assessment`;

            savedAssessment = await saveAssessment(
                assessment,
                {
                    ...documentMetadata,
                    fileName,
                    type,
                    difficulty,
                    transcript: JSON.stringify(documentText)
                },
                {
                    userId,
                    title,
                    description: `Assessment based on ${documentMetadata.documentType} document with ${documentMetadata.pageCount || documentMetadata.slideCount || 'multiple'} pages.`
                }
            );

            // Add assessment to user's created assessments
            if (userId) {
                await User.findByIdAndUpdate(
                    userId,
                    { $addToSet: { assessmentCreated: savedAssessment._id } }
                );
            }
        } catch (dbError) {
            console.error('Failed to save to database:', dbError);
            // Continue even if database save fails
        }

        // Delete from Cloudinary if requested
        if (deleteAfterProcessing && cloudinaryPublicId) {
            try {
                await deleteFromCloudinary(cloudinaryPublicId, resourceType);
                console.log(`Deleted document from Cloudinary: ${cloudinaryPublicId}`);
            } catch (deleteError) {
                console.error('Failed to delete from Cloudinary:', deleteError);
                // Continue even if deletion fails
            }
        }

        clearTimeout(timeoutId);
        res.status(200).json({
            success: true,
            fileName,
            documentType: documentMetadata.documentType,
            assessment,
            metadata: {
                ...documentMetadata,
                type,
                difficulty,
                questionCount: numberOfQuestions,
                textLength: documentText.length
            },
            ...(savedAssessment && { assessmentId: savedAssessment._id })
        });
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error generating assessment from document URL:', error);

        res.status(500).json({
            success: false,
            message: 'Error generating assessment from document',
            error: error.message
        });
    }
};

/**
 * Helper function to delete media from Cloudinary
 * @param {string} publicId - The Cloudinary public ID to delete
 * @param {string} resourceType - Optional resource type (defaults to 'video' which handles both audio/video)
 */
const deleteFromCloudinary = async (publicId, resourceType = 'video') => {
    if (!publicId) {
        console.warn('No public ID provided for Cloudinary deletion');
        return null;
    }

    try {
        // Import the cloudinary library if not already imported
        const cloudinary = (await import('cloudinary')).v2;

        // Configure cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        console.log(`Attempting to delete from Cloudinary: ${publicId} (type: ${resourceType})`);

        // Delete the resource
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: true  // Invalidate any CDN caches
        });

        console.log(`Cloudinary deletion result for ${publicId}:`, result);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

// Export the functions
export {
    generateAssessmentFromYoutube,
    generateAssessmentFromMedia,
    generateAssessmentFromMediaUrl,
    generateAssessmentFromDocument,
    generateAssessmentFromDocumentUrl,
    mediaFields,
    documentFields,
    mediaUpload,
    documentUpload,
    deleteFromCloudinary  // Export for use in other controllers if needed
};