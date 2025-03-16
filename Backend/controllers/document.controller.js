import fs from 'fs';
import path from 'path';
import { extractTextFromPdfFile } from '../helper/pdfToText.js';
import { extractTextFromPptFile } from '../helper/pptToText.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { uploadBufferToCloudinary } from '../helper/cloudinaryHelper.js';

// Set up file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer storage for memory storage instead of disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept PDF and PowerPoint files
    const allowedMimeTypes = [
        'application/pdf',                     // PDF
        'application/vnd.ms-powerpoint',       // PPT
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' // PPTX
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and PowerPoint files are allowed'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15 MB file size limit
    }
});

/**
 * Controller function to handle document upload and text extraction
 */
export const processDocument = async (req, res) => {
    const timeoutId = setTimeout(() => {
        res.status(504).json({
            success: false,
            message: 'Processing timed out',
            error: 'The request took too long to process. Please try with a smaller file.'
        });
    }, 180000); // 3 minute timeout for large files

    try {
        // Check if file was uploaded
        if (!req.file) {
            clearTimeout(timeoutId);
            return res.status(400).json({
                success: false,
                message: 'No document file provided',
                error: 'Please upload a PDF or PowerPoint file'
            });
        }

        const fileBuffer = req.file.buffer;
        const fileType = req.file.mimetype;
        const fileName = req.file.originalname;
        const useOcr = req.body.useOcr === 'true' || req.body.useOcr === true;

        console.log(`Processing document: ${fileName}, Type: ${fileType}, OCR: ${useOcr}`);

        // Upload to Cloudinary
        let cloudinaryResult;
        try {
            cloudinaryResult = await uploadBufferToCloudinary(
                fileBuffer, 
                'documents',
                { 
                    public_id: `doc_${uuidv4()}`,
                    resource_type: 'auto'
                }
            );
            console.log(`File uploaded to Cloudinary: ${cloudinaryResult.secure_url}`);
        } catch (uploadError) {
            console.error('Error uploading to Cloudinary:', uploadError);
            // Continue with processing even if Cloudinary upload fails
        }

        let result;

        // Extract text based on file type
        if (fileType === 'application/pdf') {
            // Get page-by-page text extraction directly from buffer
            const pdfResult = await extractTextFromPdfFile(fileBuffer, useOcr);
            result = {
                ...pdfResult,
                format: 'pdf',
                fileName: fileName,
                text: pdfResult.allText, // For backward compatibility
                cloudinaryUrl: cloudinaryResult?.secure_url
            };
        } 
        else if (fileType === 'application/vnd.ms-powerpoint' || 
                 fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            // PowerPoint extraction already gives slide-by-slide results
            const pptResult = await extractTextFromPptFile(fileBuffer);
            result = {
                ...pptResult,
                format: fileType === 'application/vnd.ms-powerpoint' ? 'ppt' : 'pptx',
                fileName: fileName,
                length: pptResult.allText.length,
                text: pptResult.allText, // For backward compatibility
                cloudinaryUrl: cloudinaryResult?.secure_url
            };
        }
        else {
            throw new Error(`Unsupported file type: ${fileType}`);
        }

        clearTimeout(timeoutId);

        // Send response with extracted text
        res.status(200).json({
            success: true,
            message: 'Document processed successfully',
            ...result
        });
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error processing document:', error);

        res.status(500).json({
            success: false,
            message: 'Error processing document',
            error: error.message
        });
    }
};

// Maintain backward compatibility with the old PDF-specific endpoint
export const processPdf = async (req, res) => {
    return processDocument(req, res);
};

/**
 * Get information about supported file formats
 */
export const getSupportedFormats = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            formats: [
                {
                    type: 'pdf',
                    extensions: ['.pdf'],
                    mimeTypes: ['application/pdf'],
                    maxSize: '15MB',
                    description: 'PDF documents (text-based and scanned)'
                },
                {
                    type: 'ppt',
                    extensions: ['.ppt'],
                    mimeTypes: ['application/vnd.ms-powerpoint'],
                    maxSize: '15MB',
                    description: 'PowerPoint presentations (older format)'
                },
                {
                    type: 'pptx',
                    extensions: ['.pptx'],
                    mimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
                    maxSize: '15MB',
                    description: 'PowerPoint presentations (modern format)'
                }
            ]
        });
    } catch (error) {
        console.error('Error retrieving supported formats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving supported formats',
            error: error.message
        });
    }
};
