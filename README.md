# Nexus-AI

Nexus-AI is an intelligent assessment platform that transforms learning materials into interactive quizzes using AI. Create, take, and analyze assessments from various content formats including YouTube videos, documents, and audio files.

## Features

- **Content-to-Quiz Generation**: Convert YouTube videos, PDFs, PPTs, and audio/video files into quizzes
- **Chrome Extension**: Generate assessments directly from web content without leaving your current tab
- **Multilingual Support**: Generate assessments in multiple languages
- **Rich Assessment Types**: MCQ, True/False, Fill-in-the-blank, and more
- **Interactive Dashboard**: Track progress and view performance metrics
- **AI-Powered Insights**: Get personalized feedback on assessment performance
- **Token-Based Rewards**: Earn tokens for completing assessments
- **Customizable Difficulty**: Choose from easy, medium, or hard questions
- **Social Learning**: Share assessments with peers and track community engagement
- **Responsive Design**: Seamless experience across desktop and mobile devices

## Components

### Web Application
The main web application provides a comprehensive interface for assessment creation, management, and analysis.

### Chrome Extension
Located in the `/filter` folder, our Chrome extension allows users to:
- Generate assessments from any webpage or YouTube video without switching tabs
- Summarize content and create quizzes with a single click
- Access their Nexus-AI account and assessments directly from the browser
- Save assessments for later use or share them instantly
- Control assessment parameters (difficulty, question count, type) directly in the extension

## Technical Stack

### Frontend
- React.js
- Tailwind CSS for styling
- Lucide icons for UI elements
- React Router for navigation
- Axios for API integration
- Custom UI components

### Backend
- Node.js with Express framework
- MongoDB with Mongoose ODM
- JWT authentication and authorization
- Google's Generative AI (Gemini) for assessment generation
- AssemblyAI for audio/video transcription
- RESTful API architecture
- YouTube data extraction

### Chrome Extension
- JavaScript/HTML/CSS for extension UI
- Chrome Extension Manifest V3
- Content scripts for web page interaction
- Background service workers for API communication
- Integration with Nexus-AI backend services

### Key AI Features
- Content analysis and question generation
- Speech-to-text conversion
- Content summarization
- PDF and PowerPoint text extraction
- Assessment performance analysis

## Setup Instructions

### Main Application
1. Clone the repository
```bash
git clone https://github.com/yourusername/Nexus-AI.git
cd Nexus-AI
```

2. Frontend Setup
```bash
cd Frontend
npm install
```

3. Backend Setup
```bash
cd Backend
npm install
```

4. Environment Variables
Create .env file in Backend directory with:
```
PORT=5000
MONGODB_URL=your_mongodb_uri
NODE_ENV=development
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
GEMINI_API_KEY=your_gemini_api_key
ASSEMBLY_API_KEY=your_assembly_api_key
OCR_API_KEY=your_ocr_api_key
```

5. Start Backend Server
```bash
cd Backend
npm start
```

6. Start Frontend
```bash
cd Frontend
npm start
```

### Chrome Extension Setup
1. Navigate to the extension directory
```bash
cd filter
```

2. Build the extension (if needed)
```bash
npm install
npm run build
```

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `/filter` directory
   - The Nexus-AI extension icon should appear in your browser toolbar

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login and get tokens
- `POST /api/v1/users/refresh-token` - Refresh access token
- `GET /api/v1/users/profile` - Get user profile

### Assessment Generation
- `POST /api/v1/assessmentGenerate/youtube` - Generate quiz from YouTube video
- `POST /api/v1/assessmentGenerate/media` - Generate quiz from audio/video file
- `POST /api/v1/assessmentGenerate/document` - Generate quiz from PDF/PPT

### Assessment Management
- `GET /api/v1/exploreAssessment/all` - Get all assessments
- `GET /api/v1/exploreAssessment/search` - Search assessments
- `POST /api/v1/assessmentResult/:assessmentId/submit` - Submit assessment answers
- `GET /api/v1/assessmentResult/user` - Get user's assessment results

### Chatbot
- `POST /api/v1/chatbot/ask-assessment/:assessmentId` - Ask questions about an assessment

## Using the Chrome Extension

1. **Installation**: After loading the extension, click the Nexus-AI icon in your browser toolbar
2. **Open Youtube Video**: There will be a panel on right side of video with quick features.

## Features in Development
- Educator Login
- Progressive Web App
- Multilingual Support
- Real-time collaborative quiz taking
- Enhanced analytics dashboard
- Mobile application
- Mix quiz templates
- More assessment types (coding exercises, etc.)
- LMS integration
- Extension support for more browsers (Firefox, Edge, Safari)

## Contributing

To contribute to Nexus-AI:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.