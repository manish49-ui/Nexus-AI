import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import JSZip from 'jszip';
import xml2js from 'xml2js';

// Initialize environment variables and paths
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMP_DIR = path.resolve(__dirname, '../temp');

// Ensure temp directory exists if not in serverless mode
const IS_SERVERLESS = process.env.IS_SERVERLESS === 'true';
if (!IS_SERVERLESS && !fs.existsSync(TEMP_DIR)) {
  try {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  } catch (err) {
    console.warn('Unable to create temp directory:', err.message);
  }
}

/**
 * Extract text from PPT/PPTX file
 * @param {Buffer|string} pptInput - PowerPoint file buffer or path
 * @returns {Promise<object>} Object containing extracted text and metadata
 */
export const extractTextFromPptFile = async (pptInput) => {
  try {
    // Determine if input is a buffer or a path
    let pptBuffer;
    
    if (Buffer.isBuffer(pptInput)) {
      // Input is already a buffer
      pptBuffer = pptInput;
    } else if (typeof pptInput === 'string') {
      // Input is a path
      if (!fs.existsSync(pptInput)) {
        throw new Error(`PowerPoint file not found at: ${pptInput}`);
      }
      pptBuffer = fs.readFileSync(pptInput);
    } else {
      throw new Error('Invalid input: must be a buffer or file path');
    }
    
    // Check if it's a PPTX (ZIP-based) file by examining the first few bytes
    const isPptx = pptBuffer[0] === 0x50 && pptBuffer[1] === 0x4B;
    
    // Process based on file type
    if (isPptx) {
      return await extractFromPptxBuffer(pptBuffer);
    } else {
      return await extractFromBinaryPpt(pptBuffer);
    }
  } catch (error) {
    console.error('Error extracting text from PowerPoint:', error);
    throw new Error(`Failed to extract text from PowerPoint: ${error.message}`);
  }
};

/**
 * Extract text from PPTX buffer (newer XML-based format)
 * @param {Buffer} buffer - PPTX file buffer
 * @returns {Promise<object>} Extracted text by slide
 */
async function extractFromPptxBuffer(buffer) {
  try {
    console.log('Processing PPTX from buffer...');
    
    // Load the buffer as a ZIP archive
    const zip = await JSZip.loadAsync(buffer);
    
    // Extract text from slides
    const slideTexts = [];
    const parser = new xml2js.Parser({ explicitArray: false });
    const parseXml = (data) => new Promise((resolve, reject) => {
      parser.parseString(data, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    // Find all slide files in the PPTX
    const slideFiles = Object.keys(zip.files)
      .filter(name => name.match(/^ppt\/slides\/slide[0-9]+\.xml$/))
      .sort();
    
    // Process each slide
    for (const slideFile of slideFiles) {
      try {
        const slideXml = await zip.file(slideFile).async('string');
        const slideObj = await parseXml(slideXml);
        const slideNumber = parseInt(slideFile.match(/slide([0-9]+)\.xml/)[1]);
        
        // Extract text from slide
        const slideText = extractTextFromSlideXml(slideObj);
        
        slideTexts.push({
          slideNumber,
          text: slideText
        });
      } catch (slideError) {
        console.warn(`Error processing slide ${slideFile}:`, slideError);
        // Continue with other slides even if one fails
      }
    }
    
    // Extract any notes if available
    const noteTexts = [];
    const noteFiles = Object.keys(zip.files)
      .filter(name => name.match(/^ppt\/notesSlides\/notesSlide[0-9]+\.xml$/))
      .sort();
    
    for (const noteFile of noteFiles) {
      try {
        const noteXml = await zip.file(noteFile).async('string');
        const noteObj = await parseXml(noteXml);
        const slideNumber = parseInt(noteFile.match(/notesSlide([0-9]+)\.xml/)[1]);
        const noteText = extractTextFromSlideXml(noteObj);
        
        if (noteText.trim()) {
          noteTexts.push({
            slideNumber,
            text: noteText
          });
        }
      } catch (noteError) {
        console.warn(`Error processing note ${noteFile}:`, noteError);
      }
    }
    
    // Extract presentation metadata
    let title = '';
    let description = '';
    try {
      if (zip.files['docProps/core.xml']) {
        const coreXml = await zip.file('docProps/core.xml').async('string');
        const coreObj = await parseXml(coreXml);
        
        if (coreObj['cp:coreProperties']) {
          const props = coreObj['cp:coreProperties'];
          title = props['dc:title'] || '';
          description = props['dc:description'] || '';
        }
      }
    } catch (metaError) {
      console.warn('Error extracting metadata:', metaError);
    }
    
    // Combine all text
    const allText = slideTexts.map(slide => slide.text).join('\n\n');
    
    return {
      title,
      description,
      slideCount: slideTexts.length,
      allText,
      slides: slideTexts,
      notes: noteTexts
    };
  } catch (error) {
    console.error('Error extracting text from PPTX buffer:', error);
    throw error;
  }
}

/**
 * Extract text from binary PPT buffer (older format)
 * @param {Buffer} buffer - PPT file buffer
 * @returns {Promise<object>} Extracted text
 */
async function extractFromBinaryPpt(buffer) {
  try {
    console.log('Processing binary PPT from buffer...');
    
    // For binary PPT, we'll use simple text extraction
    // Convert to string
    const str = buffer.toString('binary');
    
    // Extract text using regex - basic approach
    const textChunks = [];
    let regex = /[\u0020-\u007E\u00A0-\u00FF]{4,}/g;
    let match;
    
    while ((match = regex.exec(str)) !== null) {
      if (match[0].length > 10 && !match[0].includes('PPTX') && !match[0].includes('\u0000')) {
        textChunks.push(match[0]);
      }
    }
    
    const extractedText = textChunks.join('\n');
    
    return {
      title: 'PPT Document',
      description: '',
      slideCount: 1,
      allText: extractedText,
      slides: [{ slideNumber: 1, text: extractedText }],
      notes: []
    };
  } catch (error) {
    console.error('Error extracting text from binary PPT:', error);
    throw error;
  }
}

/**
 * Extract text from slide XML
 * @param {object} slideObj - Parsed slide XML object
 * @returns {string} Extracted text
 */
function extractTextFromSlideXml(slideObj) {
  try {
    let result = '';
    
    // Navigate through the slide object to find text
    if (slideObj && slideObj['p:sld'] && slideObj['p:sld']['p:cSld']) {
      const content = slideObj['p:sld']['p:cSld'];
      
      if (content['p:spTree']) {
        const shapes = content['p:spTree'];
        
        // Process shape tree
        if (shapes['p:sp']) {
          const textShapes = Array.isArray(shapes['p:sp']) ? shapes['p:sp'] : [shapes['p:sp']];
          
          for (const shape of textShapes) {
            if (shape['p:txBody']) {
              result += extractTextFromTextBody(shape['p:txBody']) + '\n';
            }
          }
        }
        
        // Process group shapes
        if (shapes['p:grpSp']) {
          const groupShapes = Array.isArray(shapes['p:grpSp']) ? shapes['p:grpSp'] : [shapes['p:grpSp']];
          
          for (const group of groupShapes) {
            if (group['p:sp']) {
              const subShapes = Array.isArray(group['p:sp']) ? group['p:sp'] : [group['p:sp']];
              
              for (const shape of subShapes) {
                if (shape['p:txBody']) {
                  result += extractTextFromTextBody(shape['p:txBody']) + '\n';
                }
              }
            }
          }
        }
      }
    }
    
    return result.trim();
  } catch (error) {
    console.error('Error extracting text from slide XML:', error);
    return '';
  }
}

/**
 * Extract text from text body XML
 * @param {object} txBody - Text body XML object
 * @returns {string} Extracted text
 */
function extractTextFromTextBody(txBody) {
  try {
    let result = '';
    
    if (txBody['a:p']) {
      const paragraphs = Array.isArray(txBody['a:p']) ? txBody['a:p'] : [txBody['a:p']];
      
      for (const paragraph of paragraphs) {
        if (paragraph['a:r']) {
          const runs = Array.isArray(paragraph['a:r']) ? paragraph['a:r'] : [paragraph['a:r']];
          
          for (const run of runs) {
            if (run['a:t']) {
              result += run['a:t'] + ' ';
            }
          }
        } else if (paragraph['a:fld'] && paragraph['a:fld']['a:t']) {
          result += paragraph['a:fld']['a:t'] + ' ';
        } else if (paragraph['a:t']) {
          // Direct text in paragraph
          result += paragraph['a:t'] + ' ';
        } else if (typeof paragraph === 'string') {
          // Sometimes text is directly in the paragraph
          result += paragraph + ' ';
        }
        
        result += '\n';
      }
    }
    
    return result.trim();
  } catch (error) {
    console.error('Error extracting text from text body:', error);
    return '';
  }
}

export default extractTextFromPptFile;
