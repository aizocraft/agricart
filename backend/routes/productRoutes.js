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
import upload from '../utils/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, farmerOnly, upload.array('images', 5), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, farmerOnly, upload.array('images', 5), updateProduct)
  .delete(protect, farmerOnly, deleteProduct);

router.get('/category/:category', getProductsByCategory);
router.get('/farmer/:id', getFarmerProducts);

export default router;