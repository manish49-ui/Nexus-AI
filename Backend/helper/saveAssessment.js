/**
 * Simple function to save assessment to the database
 */

import Assessment from '../models/assessment.model.js';


export const saveAssessment = async (assessmentData, sourceInfo, options = {}) => {
  try {
    // Extract questions from assessment data
    const questions = Array.isArray(assessmentData) 
      ? assessmentData 
      : (assessmentData.assessment || assessmentData.questions || []);
    
    if (!questions || questions.length === 0) {
      throw new Error('No questions found to save');
    }
    
    // Create assessment title
    let title = 'Generated Assessment';
    if (sourceInfo.videoId) {
      title = `YouTube Assessment (${sourceInfo.videoId.substring(0, 8)})`;
    } else if (sourceInfo.fileName) {
      title = `Assessment: ${sourceInfo.fileName.split('.')[0]}`;
    } else if (sourceInfo.documentType) {
      title = `${sourceInfo.documentType} Assessment`;
    }
    
    // Create assessment object
    const assessment = new Assessment({
      title: options.title || title,
      description: options.description || `${sourceInfo.type} assessment with ${questions.length} questions at ${sourceInfo.difficulty} difficulty.`,
      type: sourceInfo.type || 'MCQ',
      difficulty: sourceInfo.difficulty || 'medium',
      creator: options.userId || null,
      questions: questions,
      tags: [sourceInfo.difficulty, sourceInfo.type],
      isPublic: true,
      transcript: sourceInfo.transcript
    });
    
    // Save to database
    const savedAssessment = await assessment.save();
    console.log(`Assessment saved with ID: ${savedAssessment._id}`);
    return savedAssessment;
  } catch (error) {
    console.error('Error saving assessment to database:', error);
    return null;
  }
};