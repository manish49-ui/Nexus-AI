import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes/index.js"; // Main routes file
import { v2 as cloudinary } from 'cloudinary';

const app = express();

// Middleware Setup
const corsOptions = {
    origin: ["http://localhost:3000", "https://nexus-ai-frontend-nine.vercel.app"], // Allow your frontend domain and others
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Enable cookies in requests and responses
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json()); // Parse JSON requests

// Check for Cloudinary setup
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('Cloudinary configured successfully');
} else {
    console.warn('Cloudinary configuration missing. File uploads may not work correctly.');
}

// Detect serverless environment 
if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production') {
    process.env.IS_SERVERLESS = 'true';
    console.log('Running in serverless environment');
}

// Declare API routes
app.use("/api", apiRoutes); // Attach all API routes

// health check api
app.get("/", (req, res) => {
    res.send("API is runningg");
});

export { app };
