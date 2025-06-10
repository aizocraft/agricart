import { useState } from 'react';
import { toast } from 'react-hot-toast';
import StarRating from '../../components/StarRating';
import logo from '../../assets/logo.png';

export default function ReviewsTab({ order, reviews, handleReviewChange, submitReview }) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Rate Your Products</h3>
      <div className="space-y-8">
        {order.orderItems?.map((item) => (
          <div key={item._id || item.product?._id} className="border-b pb-6 last:border-b-0 last:pb-0">
            <div className="flex">
              <img
                src={item.image || logo}
                alt={item.name || 'Product image'}
                className="w-16 h-16 object-cover rounded-lg mr-4"
                onError={(e) => {
                  e.target.src = logo;
                }}
              />
              <div className="flex-grow">
                <h4 className="font-medium text-gray-800">{item.name || 'Unnamed Product'}</h4>
                {!reviews[item.product?._id]?.submitted ? (
                  <div className="mt-3">
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Rating</p>
                      <StarRating
                        rating={reviews[item.product?._id]?.rating || 0}
                        editable={true}
                        onRatingChange={(rating) => handleReviewChange(item.product._id, 'rating', rating)}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor={`comment-${item.product?._id}`} className="block text-sm text-gray-600 mb-1">
                        Review
                      </label>
                      <textarea
                        id={`comment-${item.product?._id}`}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        value={reviews[item.product?._id]?.comment || ''}
                        onChange={(e) => handleReviewChange(item.product._id, 'comment', e.target.value)}
                        placeholder="Share your experience with this product..."
                      />
                    </div>
                    <button
                      onClick={() => submitReview(item.product._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Submit Review
                    </button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <StarRating rating={reviews[item.product._id].rating} />
                    {reviews[item.product._id].comment && (
                      <p className="mt-2 text-gray-600">{reviews[item.product._id].comment}</p>
                    )}
                    <p className="text-sm text-green-600 mt-2">Thank you for your review!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}