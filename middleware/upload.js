const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

// Use memory storage - files are buffered in RAM then streamed to Cloudinary
// This avoids saving anything to Render's ephemeral local disk
const storage = multer.memoryStorage();

const upload = multer({ storage });

/**
 * Upload a buffer to Cloudinary and return the secure URL.
 * @param {Buffer} buffer - The file buffer from multer
 * @param {string} folder - Cloudinary folder name
 * @param {string} resourceType - "video", "image", or "auto"
 */
const uploadToCloudinary = (buffer, folder, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

module.exports = { upload, uploadToCloudinary };
