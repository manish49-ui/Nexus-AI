import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { generateQuizFromMediaUrl } from '../../../services/quiz/QuizService';

const DirectMediaUrlForm = () => {
  const [url, setUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState('5');
  
  const navigate = useNavigate();
  
  const validateUrl = (input) => {
    // Basic URL validation
    try {
      new URL(input);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setIsValid(null);
    setError(null);
  };
  
  const handleValidate = async () => {
    // Reset states
    setError(null);
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    
    if (!validateUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }
    
    setIsValidating(true);
    
    try {
      // Attempt to check if URL is accessible
      // Note: This might fail due to CORS, but we'll try anyway
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Check content type
        const contentType = response.headers.get('content-type') || '';
        const isMediaFile = contentType.includes('audio/') || 
                            contentType.includes('video/') || 
                            contentType.includes('application/octet-stream');
        
        if (!isMediaFile) {
          throw new Error('The URL does not point to a valid audio or video file');
        }
        
        setIsValid(true);
      } catch (fetchError) {
        // If fetch fails due to CORS or other reasons, we'll still allow the user to try
        console.warn('URL validation failed, but allowing user to try anyway:', fetchError);
        setIsValid(true);
      }
    } catch (err) {
      setIsValid(false);
      setError(err.message || 'Failed to validate URL');
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleGenerate = async () => {
    if (!isValid) {
      setError('Please validate the URL first');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateQuizFromMediaUrl(
        url,
        parseInt(questionCount),
        difficulty,
        'MCQ'
      );
      
      if (result?.assessmentId) {
        navigate(`/attemptquiz/${result.assessmentId}`);
      } else {
        throw new Error('Failed to generate quiz');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
      <h2 className="text-xl font-semibold text-slate-100 mb-4">
        Generate Quiz from Media URL
      </h2>
      
      <div className="space-y-6">
        {/* URL Input */}
        <div>
          <label htmlFor="mediaUrl" className="block text-sm font-medium text-slate-300 mb-1">
            Media URL
          </label>
          <div className="flex items-start gap-2">
            <div className="flex-grow">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus-within:border-cyan-500 transition-colors">
                <Globe size={18} className="text-slate-400" />
                <input
                  id="mediaUrl"
                  type="url"
                  placeholder="Enter direct URL to audio or video file"
                  value={url}
                  onChange={handleUrlChange}
                  className="bg-transparent border-none outline-none text-slate-200 w-full"
                />
              </div>
              
              <p className="mt-2 text-slate-400 text-sm flex items-center gap-1">
                <Link size={14} />
                URL must directly point to an audio or video file
              </p>
            </div>
            
            <button
              onClick={handleValidate}
              disabled={isValidating || !url.trim()}
              className={`px-4 py-2 rounded-md ${
                isValidating
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500'
              } transition-colors`}
            >
              {isValidating ? 'Checking...' : 'Validate'}
            </button>
          </div>
          
          {/* Validation feedback */}
          {error && (
            <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={14} />
              <p>{error}</p>
            </div>
          )}
          {isValid && (
            <div className="mt-2 flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle size={14} />
              <p>Valid media URL</p>
            </div>
          )}
        </div>
        
        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-slate-300 mb-1">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="questionCount" className="block text-sm font-medium text-slate-300 mb-1">
              Number of Questions
            </label>
            <select
              id="questionCount"
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-slate-200"
            >
              <option value="5">5 Questions</option>
              <option value="10">10 Questions</option>
              <option value="15">15 Questions</option>
            </select>
          </div>
        </div>
        
        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!isValid || isGenerating}
          className={`w-full py-3 rounded-lg font-medium ${
            !isValid || isGenerating
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:from-cyan-600 hover:to-indigo-700'
          } transition-colors`}
        >
          {isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}
        </button>
      </div>
    </div>
  );
};

export default DirectMediaUrlForm;
