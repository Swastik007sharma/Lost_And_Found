const cloudinary = require('../config/cloudinary');

/**
 * Extract public_id from Cloudinary URL
 * Example URL: https://res.cloudinary.com/xxx/image/upload/v123/folder/image.jpg
 * Extract: folder/image
 */
function extractPublicId(url) {
  if (!url) return null;
  const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Delete single image from Cloudinary
 */
async function deleteCloudinaryImage(publicId) {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error(`Failed to delete Cloudinary image: ${publicId}`, error);
    throw error;
  }
}

/**
 * Delete multiple images (batch)
 */
async function deleteCloudinaryImages(publicIds) {
  const results = [];
  for (const publicId of publicIds) {
    try {
      const result = await deleteCloudinaryImage(publicId);
      results.push({ publicId, success: true, result });
    } catch (error) {
      results.push({ publicId, success: false, error: error.message });
    }
  }
  return results;
}

module.exports = {
  extractPublicId,
  deleteCloudinaryImage,
  deleteCloudinaryImages,
};
