/**
 * Utility functions for Cloudinary operations
 */

/**
 * Upload a file directly to Cloudinary from the browser
 * 
 * @param {File} file - The file object to upload
 * @param {Object} options - Additional options
 * @param {string} options.uploadPreset - Cloudinary upload preset (required)
 * @param {string} options.folder - Cloudinary folder destination
 * @param {string} options.resourceType - Resource type ('auto', 'image', 'video', 'raw')
 * @returns {Promise<Object>} - Cloudinary response object
 */
export const uploadToCloudinary = async (file, options = {}) => {
  // Default options
  const {
    uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'nexus_ai_media',
    folder = 'media_uploads',
    resourceType = 'auto'
  } = options;

  // Cloudinary cloud name
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';
  
  if (!cloudName || !uploadPreset) {
    throw new Error('Missing Cloudinary configuration. Check your environment variables.');
  }

  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  
  try {
    // Upload to Cloudinary directly from the browser
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cloudinary upload failed: ${error.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Ensure the resource_type is included in the response
    return {
      url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
      resource_type: data.resource_type || resourceType, // Use the response's resource_type or fallback to our input
      original_filename: data.original_filename,
      ...data
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Calculate the optimal resource type for a file
 * @param {File} file - The file to analyze
 * @returns {string} - Resource type for Cloudinary
 */
export const getResourceType = (file) => {
  const type = file?.type || '';
  
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'video'; // Audio files use the video resource type in Cloudinary
  
  return 'auto';
};
