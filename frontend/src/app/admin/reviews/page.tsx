"use client";

import { useEffect, useState } from "react";
import { Check, X, Trash2, Star } from "lucide-react";
import Image from "next/image";

type Review = {
  id: string;
  rating: number;
  comment: string;
  imageUrl: string | null;
  isApproved: boolean;
  createdAt: string;
  user: { name: string; email: string };
  product: { name: string; variants: any[] };
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });
      if (res.ok) {
        setReviews(reviews.map((r) => (r.id === id ? { ...r, isApproved: !currentStatus } : r)));
      }
    } catch (error) {
      console.error("Failed to update review", error);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews(reviews.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete review", error);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading reviews...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-secondary mb-6">Review Moderation</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Rating & Comment</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No reviews found.</td>
                </tr>
              ) : (
                reviews.map((review) => {
                  const productImg = review.product.variants?.[0]?.imageUrl || "";
                  return (
                    <tr key={review.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-3">
                          {productImg ? (
                            <Image src={productImg} alt="Product" width={40} height={40} className="rounded object-cover" unoptimized />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">No Img</div>
                          )}
                          <span className="font-medium text-gray-900">{review.product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <p className="font-medium text-gray-900">{review.user.name}</p>
                        <p className="text-gray-500 text-xs">{review.user.email}</p>
                      </td>
                      <td className="px-6 py-4 align-top max-w-md">
                        <div className="flex text-yellow-400 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                          ))}
                        </div>
                        <p className="text-gray-700 mt-1">{review.comment}</p>
                        {review.imageUrl && (
                          <div className="mt-2">
                            <a href={review.imageUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                              View Attached Image
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${review.isApproved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {review.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-right space-x-2">
                        <button
                          onClick={() => toggleApproval(review.id, review.isApproved)}
                          className={`p-1.5 rounded transition-colors ${review.isApproved ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                          title={review.isApproved ? "Unapprove" : "Approve"}
                        >
                          {review.isApproved ? <X size={18} /> : <Check size={18} />}
                        </button>
                        <button onClick={() => deleteReview(review.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
