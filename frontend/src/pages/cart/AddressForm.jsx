// pages/cart/AddressForm.jsx
import { motion } from 'framer-motion';

export default function AddressForm({ 
  address, 
  onAddressChange, 
  onSave, 
  onCancel 
}) {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
          <input
            type="tel"
            name="phone"
            value={address.phone}
            onChange={onAddressChange}
            className="w-full px-3 py-2 border rounded-md"
            required
            placeholder="e.g. 0712345678"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <select
            name="country"
            value={address.country}
            onChange={onAddressChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="Kenya">Kenya</option>
            <option value="Uganda">Uganda</option>
            <option value="Tanzania">Tanzania</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
          <input
            type="text"
            name="address"
            value={address.address}
            onChange={onAddressChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
          <input
            type="text"
            name="city"
            value={address.city}
            onChange={onAddressChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code*</label>
          <input
            type="text"
            name="postalCode"
            value={address.postalCode}
            onChange={onAddressChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
      </div>
      <div className="flex justify-end mt-4 space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Save Address
        </button>
      </div>
    </motion.div>
  );
}