import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import StarRating from './StarRating';
import { productAPI } from '../services/api'; // Updated import

const ReviewForm = ({ productId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment) {
      toast.error('Please provide both rating and comment');
      return;
    }

    try {
      setLoading(true);
      await productAPI.createReview(productId, { rating, comment }); // Updated API call
      toast.success('Review submitted successfully!');
      setRating(0);
      setComment('');
      onReviewAdded();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <h4 className="text-lg font-medium mb-2">Write a Review</h4>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              {star <= rating ? (
                <span className="text-yellow-400 text-2xl">★</span>
              ) : (
                <span className="text-gray-300 text-2xl">★</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
          Comment
        </label>
        <textarea
          id="comment"
          rows="3"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;