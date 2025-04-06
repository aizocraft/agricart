import express from 'express';
import { 
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFarmerProducts
} from '../controllers/productController.js';
import { protect, farmerOnly } from '../middleware/authMiddleware.js';
import { upload, uploadToCloudinary } from '../utils/uploadMiddleware.js';

const router = express.Router();

// Enhanced async handler with error logging
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    console.error('Route handler error:', error);
    next(error);
  }
};

// Product routes
router.route('/')
  .get(asyncHandler(getProducts))
  .post(
    protect, 
    farmerOnly, 
    upload.array('images', 5),
    asyncHandler(uploadToCloudinary),
    asyncHandler(createProduct)
  );

router.route('/:id')
  .get(asyncHandler(getProductById))
  .put(
    protect, 
    farmerOnly,
    upload.array('images', 5),
    asyncHandler(uploadToCloudinary),
    asyncHandler(updateProduct)
  )
  .delete(protect, farmerOnly, asyncHandler(deleteProduct));

// Category and farmer-specific routes
router.get('/category/:category', asyncHandler(getProductsByCategory));
router.get('/farmer/:id', asyncHandler(getFarmerProducts));

export default router;