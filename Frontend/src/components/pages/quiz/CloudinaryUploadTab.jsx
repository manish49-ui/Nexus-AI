import { useState } from 'react';
import MediaUploadPreview from '../../ui/MediaUploadPreview';
import { generateQuizFromMediaUrl } from '../../../services/quiz/QuizService';

const CloudinaryUploadTab = ({ 
  onQuizGenerated, 
  onError, 
  difficultyLevel = 'medium',
  questionCount = 5 
}) => {
  const [uploadResult, setUploadResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleUploadComplete = (result) => {
    setUploadResult(result);
  };
  
  const handleError = (error) => {
    if (onError) {
      onError(error.message || 'Upload failed');
    }
  };
  
  const handleGenerateQuiz = async () => {
    if (!uploadResult?.url) {
      if (onError) onError('Please upload a file first');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Generate quiz using the Cloudinary URL
      const result = await generateQuizFromMediaUrl(
        uploadResult.url,
        questionCount,
        difficultyLevel,
        'MCQ',
        {
          deleteAfterProcessing: true,
          cloudinaryPublicId: uploadResult.public_id,
          resourceType: uploadResult.resource_type || 'video'
        }
      );
      
      // Notify parent component of successful generation
      if (onQuizGenerated) {
        onQuizGenerated(result);
      }
    } catch (error) {
      if (onError) {
        onError(error.message || 'Failed to generate quiz');
      }
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/50">
        <h3 className="text-sm text-cyan-400 font-medium mb-3">Cloud Upload</h3>
        <p className="text-slate-400 text-sm mb-4">
          Upload your media file to the cloud for faster processing. 
          We'll automatically remove the file after processing is complete.
        </p>
        
        <MediaUploadPreview
          onFileChange={() => setUploadResult(null)}
          onUploadComplete={handleUploadComplete}
          onError={handleError}
          maxSizeMB={100}
          uploadToCloudinary={true}
        />
      </div>
      
      {uploadResult?.url && (
        <button
          onClick={handleGenerateQuiz}
          disabled={isGenerating}
          className={`w-full py-3 rounded-lg font-medium 
            ${isGenerating 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:from-cyan-600 hover:to-indigo-700'
            } transition-colors`}
        >
          {isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}
        </button>
      )}
    </div>
  );
};

export default CloudinaryUploadTab;
