const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const { sendErrorResponse } = require('../utils/response');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload service for Cloudinary integration
 * Handles profile avatars, trip cover images, and other media uploads
 */

/**
 * Upload image to Cloudinary with transformations
 * @param {Buffer|Readable} imageBuffer - Image buffer or stream
 * @param {Object} options - Upload options
 * @param {string} options.folder - Cloudinary folder path
 * @param {string} options.publicId - Custom public ID
 * @param {Object} options.transformations - Image transformations
 * @param {string} options.format - Output format (auto, jpg, png, webp)
 * @param {number} options.quality - Image quality (1-100)
 * @returns {Promise<Object>} Upload result with Cloudinary metadata
 */
const uploadImage = async (imageBuffer, options = {}) => {
  try {
    const {
      folder = 'globetrotter',
      publicId = null,
      transformations = {},
      format = 'auto',
      quality = 80,
    } = options;

    // Default transformations for responsive images
    const defaultTransformations = {
      quality: `q_${quality}`,
      format: format === 'auto' ? 'f_auto' : `f_${format}`,
      fetch_format: 'auto',
      flags: 'progressive',
    };

    // Merge custom transformations with defaults
    const finalTransformations = {
      ...defaultTransformations,
      ...transformations,
    };

    // Create upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        transformation: finalTransformations,
        resource_type: 'image',
        eager: [
          // Generate multiple sizes for responsive images
          { width: 400, height: 400, crop: 'fill', gravity: 'auto' },
          { width: 800, height: 800, crop: 'fill', gravity: 'auto' },
          { width: 1200, height: 1200, crop: 'fill', gravity: 'auto' },
        ],
        eager_async: true,
        eager_notification_url: process.env.CLOUDINARY_NOTIFICATION_URL,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          throw new Error(`Upload failed: ${error.message}`);
        }
        return result;
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    if (Buffer.isBuffer(imageBuffer)) {
      const stream = Readable.from(imageBuffer);
      stream.pipe(uploadStream);
    } else if (imageBuffer instanceof Readable) {
      imageBuffer.pipe(uploadStream);
    } else {
      throw new Error('Invalid image data: must be Buffer or Readable stream');
    }

    // Return promise that resolves with upload result
    return new Promise((resolve, reject) => {
      uploadStream.on('error', reject);
      uploadStream.on('result', resolve);
    });
  } catch (error) {
    console.error('Upload service error:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Upload profile avatar with specific transformations
 * @param {Buffer|Readable} imageBuffer - Image buffer or stream
 * @param {string} userId - User ID for public ID
 * @returns {Promise<Object>} Avatar upload result
 */
const uploadAvatar = async (imageBuffer, userId) => {
  try {
    const publicId = `avatars/user_${userId}`;

    const transformations = {
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face', // Auto-detect and focus on face
      radius: 'max', // Circular avatar
      border: '2px_solid_white',
      effect: 'shadow',
    };

    const result = await uploadImage(imageBuffer, {
      folder: 'globetrotter/avatars',
      publicId,
      transformations,
      quality: 90,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      version: result.version,
      provider: 'cloudinary',
      transformations: {
        original: result.secure_url,
        thumbnail: result.eager?.[0]?.secure_url,
        medium: result.eager?.[1]?.secure_url,
        large: result.eager?.[2]?.secure_url,
      },
    };
  } catch (error) {
    console.error('Avatar upload error:', error);
    throw new Error(`Avatar upload failed: ${error.message}`);
  }
};

/**
 * Upload trip cover image with landscape transformations
 * @param {Buffer|Readable} imageBuffer - Image buffer or stream
 * @param {string} tripId - Trip ID for public ID
 * @returns {Promise<Object>} Cover image upload result
 */
const uploadTripCover = async (imageBuffer, tripId) => {
  try {
    const publicId = `trips/cover_${tripId}`;

    const transformations = {
      width: 1200,
      height: 600,
      crop: 'fill',
      gravity: 'auto',
      effect: 'enhance',
      saturation: 20,
    };

    const result = await uploadImage(imageBuffer, {
      folder: 'globetrotter/trips',
      publicId,
      transformations,
      quality: 85,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      version: result.version,
      provider: 'cloudinary',
      transformations: {
        original: result.secure_url,
        thumbnail: result.eager?.[0]?.secure_url,
        medium: result.eager?.[1]?.secure_url,
        large: result.eager?.[2]?.secure_url,
      },
    };
  } catch (error) {
    console.error('Trip cover upload error:', error);
    throw new Error(`Trip cover upload failed: ${error.message}`);
  }
};

/**
 * Upload place/activity image
 * @param {Buffer|Readable} imageBuffer - Image buffer or stream
 * @param {string} placeId - Place ID for public ID
 * @param {string} category - Image category (attraction, restaurant, etc.)
 * @returns {Promise<Object>} Place image upload result
 */
const uploadPlaceImage = async (imageBuffer, placeId, category = 'general') => {
  try {
    const publicId = `places/${category}_${placeId}`;

    const transformations = {
      width: 800,
      height: 600,
      crop: 'fill',
      gravity: 'auto',
      effect: 'auto_brightness',
    };

    const result = await uploadImage(imageBuffer, {
      folder: `globetrotter/places/${category}`,
      publicId,
      transformations,
      quality: 80,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      version: result.version,
      provider: 'cloudinary',
      transformations: {
        original: result.secure_url,
        thumbnail: result.eager?.[0]?.secure_url,
        medium: result.eager?.[1]?.secure_url,
        large: result.eager?.[2]?.secure_url,
      },
    };
  } catch (error) {
    console.error('Place image upload error:', error);
    throw new Error(`Place image upload failed: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<Object>} Deletion result
 */
const deleteImage = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true, // Invalidate CDN cache
    });

    return {
      success: result.result === 'ok',
      publicId: result.public_id,
      result: result.result,
    };
  } catch (error) {
    console.error('Image deletion error:', error);
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

/**
 * Generate responsive image URLs for different screen sizes
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {Object} Object with different size URLs
 */
const generateResponsiveUrls = (publicId, options = {}) => {
  const {
    baseUrl = 'https://res.cloudinary.com',
    cloudName = process.env.CLOUDINARY_CLOUD_NAME,
    format = 'auto',
    quality = 'auto',
  } = options;

  const basePath = `${baseUrl}/${cloudName}/image/upload`;

  const sizes = {
    xs: { width: 200, height: 200, crop: 'fill' },
    sm: { width: 400, height: 400, crop: 'fill' },
    md: { width: 800, height: 800, crop: 'fill' },
    lg: { width: 1200, height: 1200, crop: 'fill' },
    xl: { width: 1600, height: 1600, crop: 'fill' },
  };

  const urls = {};

  Object.entries(sizes).forEach(([size, transformation]) => {
    const params = new URLSearchParams({
      f: format,
      q: quality,
      w: transformation.width,
      h: transformation.height,
      c: transformation.crop,
    });

    urls[size] = `${basePath}/${params.toString()}/${publicId}`;
  });

  return urls;
};

/**
 * Generate srcset for responsive images
 * @param {string} publicId - Cloudinary public ID
 * @param {Array} breakpoints - Array of width breakpoints
 * @returns {string} Srcset string for HTML img tag
 */
const generateSrcset = (publicId, breakpoints = [200, 400, 800, 1200, 1600]) => {
  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

  return breakpoints
    .map(width => {
      const url = `${baseUrl}/w_${width},c_fill,q_auto,f_auto/${publicId}`;
      return `${url} ${width}w`;
    })
    .join(', ');
};

/**
 * Apply transformations to existing image
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Transformation parameters
 * @returns {Promise<Object>} Transformed image result
 */
const transformImage = async (publicId, transformations) => {
  try {
    const result = await cloudinary.url(publicId, {
      transformation: transformations,
      secure: true,
    });

    return {
      url: result,
      publicId,
      transformations,
    };
  } catch (error) {
    console.error('Image transformation error:', error);
    throw new Error(`Image transformation failed: ${error.message}`);
  }
};

/**
 * Get image information from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Image information
 */
const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'image',
    });

    return {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      createdAt: result.created_at,
      tags: result.tags || [],
      context: result.context || {},
    };
  } catch (error) {
    console.error('Get image info error:', error);
    throw new Error(`Failed to get image info: ${error.message}`);
  }
};

/**
 * Upload multiple images in parallel
 * @param {Array} images - Array of image objects with buffer and options
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleImages = async (images) => {
  try {
    const uploadPromises = images.map(async (image) => {
      const { buffer, options } = image;
      return await uploadImage(buffer, options);
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple images upload error:', error);
    throw new Error(`Multiple images upload failed: ${error.message}`);
  }
};

module.exports = {
  uploadImage,
  uploadAvatar,
  uploadTripCover,
  uploadPlaceImage,
  deleteImage,
  generateResponsiveUrls,
  generateSrcset,
  transformImage,
  getImageInfo,
  uploadMultipleImages,
};
