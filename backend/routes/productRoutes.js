import express from 'express';
import { 
  createProduct, 
  getProducts, 
  getProductById,  // ✅ Added this
  searchProducts,   // ✅ Added this
  getFarmerProducts,
  deleteProduct 
} from '../controllers/productController.js';
import { protect, farmerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, farmerOnly, createProduct);

router.route('/:id')
  .get(getProductById);

router.get('/search', searchProducts);
router.get('/myproducts', protect, farmerOnly, getFarmerProducts);
router.delete('/:id', protect, farmerOnly, deleteProduct);

export default router;
