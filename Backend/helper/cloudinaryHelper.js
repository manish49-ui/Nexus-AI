import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Destination folder in Cloudinary
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadBufferToCloudinary = async (buffer, folder = 'media', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'auto',
      ...options
    };

    // Upload stream to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    // Using ES6 stream.Readable.from instead of require
    const bufferStream = Readable.from(buffer);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the file
 * @param {string} resourceType - The resource type (default: 'auto')
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'auto') => {
  try {
    console.log(`Deleting from Cloudinary: ${publicId} (${resourceType})`);
    const result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: resourceType,
      invalidate: true
    });
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

/**
 * Get Cloudinary URL for a public ID
 * @param {string} publicId - The public ID of the file
 * @param {Object} options - Additional transformation options
 * @returns {string} - The Cloudinary URL
 */
export const getCloudinaryUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, options);
};

export default {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  getCloudinaryUrl
};
