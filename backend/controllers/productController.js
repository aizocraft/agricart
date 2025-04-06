import Product from '../models/Product.js';
import mongoose from 'mongoose';

export const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      price, 
      unit, 
      description, 
      category, 
      subCategory, 
      stock, 
      organic,
      harvestDate 
    } = req.body;

    // Get image URLs from middleware
    const images = req.files?.map(file => file.url) || [];

    const farmer = await mongoose.model('User').findById(req.user.id);
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    const product = await Product.create({
      name,
      price: parseFloat(price),
      unit,
      description,
      category,
      subCategory,
      images,
      farmer: req.user.id,
      stock: parseInt(stock),
      location: farmer.location,
      organic: organic === 'true' || organic === true,
      harvestDate: harvestDate || undefined
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Product.find(JSON.parse(queryStr));

    if (req.query.search) {
      query = query.find({
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ]
      });
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const products = await query;
    const total = await Product.countDocuments(JSON.parse(queryStr));

    res.json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('farmer', 'name email');
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this product' 
      });
    }

    // Get new image URLs from middleware
    const newImages = req.files?.map(file => file.url) || [];
    const images = [...product.images, ...newImages];

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        images,
        price: parseFloat(req.body.price),
        stock: parseInt(req.body.stock),
        organic: req.body.organic === 'true' || req.body.organic === true
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    if (product.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this product' 
      });
    }

    // Delete images from Cloudinary
    const deletePromises = product.images.map(async (image) => {
      const publicId = image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`agriCart/products/${publicId}`);
    });
    await Promise.all(deletePromises);

    await product.remove();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ 
      category: req.params.category 
    }).populate('farmer', 'name');

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching products by category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getFarmerProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      farmer: req.params.id 
    });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching farmer products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};