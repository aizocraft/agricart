import Product from '../models/Product.js';

// Create Product
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;
    const product = await Product.create({
      name,
      price,
      description,
      stock,
      farmer: req.user.id
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('farmer', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('farmer', 'name email');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Search & Filter Products
export const searchProducts = async (req, res) => {
  try {
    const { keyword, minPrice, maxPrice, farmer } = req.query;
    
    const filter = {};
    if (keyword) {
      filter.name = { $regex: keyword, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (farmer) {
      filter.farmer = farmer;
    }

    const products = await Product.find(filter).populate('farmer', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get Farmer's Products
export const getFarmerProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user.id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.farmer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await product.remove();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};