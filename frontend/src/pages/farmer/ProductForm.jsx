/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { productAPI } from '../../services/api';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import LoadingSpinner from '../../components/LoadingSpinner';

// Constants
const PRODUCT_CATEGORIES = [
  'Fruits', 'Vegetables', 'Dairy', 'Grains', 
  'Meat', 'Poultry', 'Seafood', 'Herbs', 'Spices', 'Other'
];

const PRODUCT_UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'litre', label: 'Litre (L)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'piece', label: 'Piece' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'packet', label: 'Packet' }
];

const SUBCATEGORIES = {
  Fruits: ['Tropical', 'Citrus', 'Berries', 'Stone', 'Melons', 'Other'],
  Vegetables: ['Leafy Greens', 'Root', 'Bulb', 'Stem', 'Podded', 'Other'],
  Dairy: ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Other']
};

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DESCRIPTION_LENGTH = 1000;

const INITIAL_FORM_STATE = {
  name: '',
  description: '',
  price: '',
  unit: 'kg',
  category: 'Vegetables',
  subCategory: '',
  stock: '',
  organic: false,
  harvestDate: '',
  images: []
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  // Set document metadata
  useDocumentMetadata({
    title: isEditing ? 'Edit Product' : 'Add Product',
    description: isEditing ? 'Edit your farm product' : 'Add new farm product'
  });

  // Load product data for editing
  useEffect(() => {
    if (!isEditing) return;

    const loadProductData = async () => {
      try {
        setLoading(true);
        const { data } = await productAPI.getProductById(id);
        initializeFormData(data.product);
      } catch (error) {
        toast.error('Failed to load product details');
        navigate('/farmer/dashboard', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing, navigate]);

  // Initialize form data
  const initializeFormData = useCallback((productData) => {
    const formattedData = {
      name: productData.name || '',
      description: productData.description || '',
      price: productData.price?.toString() || '',
      unit: productData.unit || 'kg',
      category: productData.category || 'Vegetables',
      subCategory: productData.subCategory || '',
      stock: productData.stock?.toString() || '',
      organic: Boolean(productData.organic),
      harvestDate: productData.harvestDate 
        ? new Date(productData.harvestDate).toISOString().split('T')[0] 
        : '',
      images: productData.images || []
    };

    setFormData(formattedData);
    setImagePreviews(productData.images || []);
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error if field is being edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle image uploads
  const handleImageChange = (e) => {
    const files = e.target.files || e.dataTransfer.files;
    if (!files.length) return;
    
    // Validate number of images
    if (imagePreviews.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    // Process files
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.match('image.*')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 5MB size limit`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  };

  // Remove an image
  const removeImage = (index) => {
    // Clean up object URLs
    if (typeof formData.images[index] !== 'string') {
      URL.revokeObjectURL(imagePreviews[index]);
    }

    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageChange(e);
  };

  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = 'Valid price is required';
    }
    if (!formData.stock || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      errors.stock = 'Valid stock quantity is required';
    }
    if (!formData.category) errors.category = 'Category is required';
    if (formData.images.length === 0) errors.images = 'At least one image is required';
    
    // Subcategory validation for certain categories
    if (['Fruits', 'Vegetables', 'Dairy'].includes(formData.category) && !formData.subCategory) {
      errors.subCategory = 'Subcategory is required for this category';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        unit: formData.unit,
        category: formData.category,
        subCategory: formData.subCategory || undefined,
        stock: parseInt(formData.stock),
        organic: formData.organic,
        harvestDate: formData.harvestDate || undefined,
        images: formData.images
      };

      if (isEditing) {
        await productAPI.updateProduct(id, productData);
        toast.success('Product updated successfully!');
      } else {
        await productAPI.createProduct(productData);
        toast.success('Product created successfully!');
      }
      
      navigate('/farmer/dashboard');
    } catch (error) {
      console.error('Product submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current subcategories based on selected category
  const getCurrentSubcategories = useCallback(() => {
    return SUBCATEGORIES[formData.category] || [];
  }, [formData.category]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEditing ? 'Update your product details' : 'Add a new product to your inventory'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Product Name */}
            <div className="col-span-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                required
                aria-invalid={!!formErrors.name}
                aria-describedby={formErrors.name ? 'name-error' : undefined}
              />
              {formErrors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600">
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="col-span-1">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price (KSh) *
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 sm:text-sm">KSh</span>
                </div>
                <input
                  id="price"
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                    formErrors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'
                  }`}
                  placeholder="0.00"
                  required
                  aria-invalid={!!formErrors.price}
                  aria-describedby={formErrors.price ? 'price-error' : undefined}
                />
                {formErrors.price && (
                  <p id="price-error" className="mt-1 text-sm text-red-600">
                    {formErrors.price}
                  </p>
                )}
              </div>
            </div>

            {/* Unit */}
            <div className="col-span-1">
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit *
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                required
              >
                {PRODUCT_UNITS.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="col-span-1">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                  formErrors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:ring-green-500`}
                required
                aria-invalid={!!formErrors.category}
                aria-describedby={formErrors.category ? 'category-error' : undefined}
              >
                {PRODUCT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {formErrors.category && (
                <p id="category-error" className="mt-1 text-sm text-red-600">
                  {formErrors.category}
                </p>
              )}
            </div>

            {/* Subcategory */}
            {getCurrentSubcategories().length > 0 && (
              <div className="col-span-1">
                <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subcategory {['Fruits', 'Vegetables', 'Dairy'].includes(formData.category) && '*'}
                </label>
                <select
                  id="subCategory"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                    formErrors.subCategory ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:ring-green-500`}
                  required={['Fruits', 'Vegetables', 'Dairy'].includes(formData.category)}
                  aria-invalid={!!formErrors.subCategory}
                  aria-describedby={formErrors.subCategory ? 'subcategory-error' : undefined}
                >
                  <option value="">Select a subcategory</option>
                  {getCurrentSubcategories().map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
                {formErrors.subCategory && (
                  <p id="subcategory-error" className="mt-1 text-sm text-red-600">
                    {formErrors.subCategory}
                  </p>
                )}
              </div>
            )}

            {/* Stock */}
            <div className="col-span-1">
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock Quantity *
              </label>
              <input
                id="stock"
                type="number"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                  formErrors.stock ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:ring-green-500`}
                required
                aria-invalid={!!formErrors.stock}
                aria-describedby={formErrors.stock ? 'stock-error' : undefined}
              />
              {formErrors.stock && (
                <p id="stock-error" className="mt-1 text-sm text-red-600">
                  {formErrors.stock}
                </p>
              )}
            </div>

            {/* Harvest Date */}
            <div className="col-span-1">
              <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Harvest Date
              </label>
              <input
                id="harvestDate"
                type="date"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Organic */}
            <div className="col-span-1 flex items-center">
              <input
                id="organic"
                type="checkbox"
                name="organic"
                checked={formData.organic}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="organic" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Certified Organic
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              maxLength={MAX_DESCRIPTION_LENGTH}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              placeholder={`Describe your product (max ${MAX_DESCRIPTION_LENGTH} characters)...`}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
            </p>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Images * (Max {MAX_IMAGES})
            </label>
            <div 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                formErrors.images ? 'border-red-500' : 
                isDragging ? 'border-green-500 bg-green-50 dark:bg-green-900 bg-opacity-50' : 
                'border-gray-300 dark:border-gray-600'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                  >
                    <span>Upload images</span>
                    <input
                      id="file-upload"
                      name="images"
                      type="file"
                      className="sr-only"
                      multiple
                      onChange={handleImageChange}
                      accept="image/jpeg, image/png, image/webp"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, WEBP up to 5MB each
                </p>
                {formErrors.images && (
                  <p className="mt-2 text-sm text-red-600">
                    {formErrors.images}
                  </p>
                )}
              </div>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''} selected
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-32 w-full object-cover rounded-md"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/farmer/dashboard')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </span>
              ) : isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}