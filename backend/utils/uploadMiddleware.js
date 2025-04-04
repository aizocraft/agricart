import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Local storage for temporary uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG, WEBP) are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Maximum 5 files
  }
});

// Middleware to upload to Cloudinary and clean up local files
export const uploadToCloudinary = async (req, res, next) => {
  if (!req.files && !req.file) return next();

  try {
    // Handle single file
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'agriCart/uploads'
      });
      req.file.url = result.secure_url;
      fs.unlinkSync(req.file.path); // Remove local file
    }
    
    // Handle multiple files
    if (req.files) {
      const uploadPromises = req.files.map(async file => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'agriCart/uploads'
        });
        file.url = result.secure_url;
        fs.unlinkSync(file.path); // Remove local file
        return file;
      });
      await Promise.all(uploadPromises);
    }

    next();
  } catch (error) {
    // Clean up any uploaded files if error occurs
    if (req.file) fs.unlinkSync(req.file.path);
    if (req.files) req.files.forEach(file => fs.unlinkSync(file.path));
    next(error);
  }
};

export default upload;