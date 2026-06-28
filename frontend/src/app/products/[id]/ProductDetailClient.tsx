"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

type ProductVariant = {
  id: string;
  colorName: string;
  colorCode: string | null;
  imageUrl: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  variants: ProductVariant[];
  reviews?: { id: string; rating: number; comment: string; imageUrl: string | null; user: { name: string } }[];
};

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: selectedVariant?.imageUrl || "",
      color: selectedVariant?.colorName || "",
    });
    alert("Added to cart!");
  };
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewMessage("");
    try {
      let finalImageUrl = "";
      if (reviewImage) {
        const formData = new FormData();
        formData.append("file", reviewImage);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Image upload failed");
        const data = await res.json();
        finalImageUrl = data.url;
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, rating, comment, imageUrl: finalImageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      
      setReviewMessage("Review submitted and is pending admin approval.");
      setIsWritingReview(false);
      setComment("");
      setReviewImage(null);
    } catch (error: any) {
      setReviewMessage(error.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (!product) return <div>Product not found</div>;

  const averageRating = product.reviews && product.reviews.length > 0
    ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
    : "5.0";
  const totalReviews = product.reviews?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          
          {/* Main Image Gallery */}
          <div className="md:w-1/2 bg-gray-50 p-8 flex items-center justify-center relative min-h-[400px]">
            {selectedVariant && selectedVariant.imageUrl ? (
              <Image 
                src={selectedVariant.imageUrl} 
                alt={product.name} 
                fill 
                className="object-contain p-8 animate-in fade-in zoom-in duration-500" 
                key={selectedVariant.id} // Forces re-render for animation
              />
            ) : (
              <div className="text-gray-400">No Image Available</div>
            )}
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-gray-700 shadow-sm">
              {product.category}
            </div>
          </div>

          {/* Product Details */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < Math.round(Number(averageRating)) ? "fill-current" : "text-gray-300"}`} viewBox="0 0 20 20" fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} stroke="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-600 font-medium">{averageRating}</span>
              <span className="text-gray-400">({totalReviews} reviews)</span>
            </div>
            <div className="text-2xl font-bold text-primary mb-6">Rs. {product.price.toLocaleString()}</div>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description || "No description available for this product."}
            </p>

            {/* Color Swatches */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  Color: <span className="text-gray-500 normal-case font-normal ml-2">{selectedVariant?.colorName}</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        selectedVariant?.id === variant.id 
                          ? "ring-2 ring-primary ring-offset-2 scale-110" 
                          : "ring-1 ring-gray-200 hover:ring-gray-300 hover:scale-105"
                      }`}
                      style={{ backgroundColor: variant.colorCode || variant.colorName || '#f3f4f6' }}
                      title={variant.colorName}
                    >
                      {!variant.colorCode && !variant.colorName && (
                        <span className="text-[10px] font-medium text-gray-600 truncate px-1">{variant.colorName.substring(0,3)}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-8 border-t border-gray-100">
              <button 
                onClick={handleAddToCart}
                disabled={!selectedVariant}
                className="w-full py-4 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary-dark hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              {!selectedVariant && (
                <p className="text-red-500 text-sm mt-2 text-center">Please select a color option.</p>
              )}
            </div>
            
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
              <p className="text-gray-500 mt-1">Real experiences from verified buyers.</p>
            </div>
            <button
              onClick={() => setIsWritingReview(!isWritingReview)}
              className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              {isWritingReview ? "Cancel Review" : "Write a Review"}
            </button>
          </div>

          {reviewMessage && (
            <div className={`p-4 mb-6 rounded-xl ${reviewMessage.includes('pending') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {reviewMessage}
            </div>
          )}

          {isWritingReview && (
            <form onSubmit={submitReview} className="mb-12 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-lg mb-4">Share your experience</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-2 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                      <svg className={`w-8 h-8 ${star <= rating ? "fill-current" : "text-gray-300"}`} viewBox="0 0 20 20" fill={star <= rating ? "currentColor" : "none"} stroke="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                <textarea
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  rows={4}
                  placeholder="What did you like or dislike about this product?"
                ></textarea>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReviewImage(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
              </div>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}

          <div className="space-y-8">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <div key={review.id} className="pb-8 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 uppercase">
                        {review.user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          {review.user.name} 
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Verified
                          </span>
                        </div>
                        <div className="flex text-yellow-400 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-gray-300"}`} viewBox="0 0 20 20" fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-3">{review.comment}</p>
                  {review.imageUrl && (
                    <div className="mt-4">
                      <Image src={review.imageUrl} alt="Review attachment" width={100} height={100} className="rounded-xl object-cover" unoptimized />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center py-8">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
