import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    location: '',
    farmName: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear errors when corresponding fields change
    Object.keys(errors).forEach(key => {
      if (formData[key] && errors[key]) {
        setErrors(prev => ({ ...prev, [key]: '' }));
      }
    });
  }, [formData, errors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'phone' ? value.replace(/\D/g, '') : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.role === 'farmer') {
      if (!formData.farmName.trim()) newErrors.farmName = 'Farm name is required';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const userData = { 
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'farmer' && {
          farmName: formData.farmName,
          location: formData.location,
          phone: formData.phone
        })
      };

      const success = await registerUser(userData);
      if (success) {
        toast.success('Account created successfully!', {
          icon: '🎉',
          position: 'top-center',
          style: {
            background: '#10b981',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          },
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.', {
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20"
          whileHover={{ 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 py-8 px-8 text-center">
            <motion.div
              className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg mb-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: 'spring',
                stiffness: 200,
                damping: 10
              }}
              whileHover={{ rotate: 10 }}
            >
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </motion.div>
            <motion.h1 
              className="text-3xl font-bold text-white"
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Create Your Account
            </motion.h1>
            <motion.p 
              className="text-green-100 mt-2 text-opacity-90"
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Join as a buyer or farmer
            </motion.p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm`}
                      placeholder="John Doe"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p 
                        className="mt-2 text-sm text-red-600"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm`}
                      placeholder="your@email.com"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p 
                        className="mt-2 text-sm text-red-600"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm`}
                      placeholder="••••••••"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p 
                        className="mt-2 text-sm text-red-600"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Role Field */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm"
                    >
                      <option value="buyer">Buyer - Purchase products</option>
                      <option value="farmer">Farmer - Sell your products</option>
                    </select>
                  </motion.div>
                </div>

                {/* Farmer-specific fields */}
                {formData.role === 'farmer' && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5 overflow-hidden col-span-1 md:col-span-2"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Farm Name */}
                        <div>
                          <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 mb-2">
                            Farm Name
                          </label>
                          <motion.div whileHover={{ scale: 1.01 }}>
                            <input
                              id="farmName"
                              name="farmName"
                              type="text"
                              value={formData.farmName}
                              onChange={handleChange}
                              className={`w-full px-4 py-3 border ${errors.farmName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm`}
                              placeholder="Green Valley Farm"
                            />
                          </motion.div>
                          <AnimatePresence>
                            {errors.farmName && (
                              <motion.p 
                                className="mt-2 text-sm text-red-600"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                              >
                                {errors.farmName}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Location */}
                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                            Farm Location
                          </label>
                          <motion.div whileHover={{ scale: 1.01 }}>
                            <input
                              id="location"
                              name="location"
                              type="text"
                              value={formData.location}
                              onChange={handleChange}
                              className={`w-full px-4 py-3 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm`}
                              placeholder="City, Country"
                            />
                          </motion.div>
                          <AnimatePresence>
                            {errors.location && (
                              <motion.p 
                                className="mt-2 text-sm text-red-600"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                              >
                                {errors.location}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Phone */}
                        <div className="col-span-1 md:col-span-2">
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <motion.div whileHover={{ scale: 1.01 }}>
                            <input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm"
                              placeholder="+1234567890"
                            />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 disabled:opacity-70 relative overflow-hidden group mt-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300 transform group-hover:scale-110"></span>
                <span className="relative flex items-center">
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      Register
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}