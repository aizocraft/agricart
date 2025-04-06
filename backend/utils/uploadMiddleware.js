import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary configuration with safe initialization
let cloudinaryConfigured = false;

const configureCloudinary = () => {
  if (!cloudinaryConfigured) {
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.warn('⚠️ Cloudinary environment variables not loaded yet');
      return false;
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
    cloudinaryConfigured = true;
    console.log('✅ Cloudinary configured successfully');
    return true;
  }
  return true;
};

// Local storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    
    try {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    } catch (err) {
      console.error('❌ Storage setup error:', err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File type validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${allowedTypes.join(', ')} are allowed.`), false);
  }
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  }
});

// Enhanced Cloudinary upload with debugging and preset support
export const uploadToCloudinary = async (req, res, next) => {
  if (!req.files?.length) {
    console.log('ℹ️ No files to upload');
    return next();
  }

  if (!configureCloudinary()) {
    return next(new Error('Cloudinary configuration not ready'));
  }

  console.log(`⬆️ Starting upload of ${req.files.length} file(s)`);

  try {
    const uploadResults = await Promise.all(
      req.files.map(async (file) => {
        try {
          console.log(`↗️ Uploading ${file.originalname}...`);
          
          const uploadOptions = {
            folder: process.env.CLOUDINARY_FOLDER || 'agriCart/products',
            quality: 'auto:good',
            resource_type: 'image',
            timeout: parseInt(process.env.CLOUDINARY_TIMEOUT) || 30000
          };

          // Add upload preset if configured
          if (process.env.CLOUDINARY_UPLOAD_PRESET) {
            uploadOptions.upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;
          }

          const result = await cloudinary.uploader.upload(file.path, uploadOptions);

          console.log(`✅ Uploaded ${file.originalname}`, {
            url: result.secure_url,
            bytes: result.bytes,
            public_id: result.public_id
          });

          // Cleanup local file
          try {
            fs.unlinkSync(file.path);
          } catch (cleanupErr) {
            console.warn(`⚠️ Could not delete ${file.path}:`, cleanupErr);
          }

          return {
            url: result.secure_url,
            public_id: result.public_id
          };
        } catch (fileError) {
          console.error(`❌ Failed to upload ${file.originalname}:`, {
            message: fileError.message,
            code: fileError.http_code || 'N/A'
          });
          throw fileError;
        }
      })
    );

    req.files = uploadResults;
    next();
  } catch (error) {
    console.error('💥 Critical upload error:', {
      message: error.message,
      code: error.http_code || 'N/A',
      stack: error.stack
    });
    
    // Cleanup all files if error occurs
    req.files?.forEach(file => {
      try {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch (cleanupErr) {
        console.warn('Cleanup failed:', cleanupErr);
      }
    });

    next(new Error(`Image upload failed: ${error.message}`));
  }
};