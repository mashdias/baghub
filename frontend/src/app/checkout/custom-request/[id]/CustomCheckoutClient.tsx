"use client";

import { useState } from "react";
import Image from "next/image";

type CustomRequestData = {
  id: string;
  description: string;
  referenceImageUrl: string | null;
  quotedPrice: number | null;
};

export default function CustomCheckoutClient({ customRequest }: { customRequest: CustomRequestData }) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/create-custom-stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          requestId: customRequest.id,
          shippingData: formData
        }),
      });

      const session = await response.json();
      
      if (!response.ok) {
        throw new Error(session.error || "Failed to create checkout session");
      }

      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error("Stripe did not return a checkout URL.");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-5xl">
        <h1 className="text-3xl font-bold text-secondary mb-8">Checkout Custom Request</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-secondary mb-6">Shipping Details</h2>
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium">{error}</div>}
              
              <form id="custom-checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="John Doe" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input required type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="123 Main St" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input required type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Colombo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="0771234567" />
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-secondary mb-6">Request Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex gap-4">
                  <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                    {customRequest.referenceImageUrl ? (
                      <Image src={customRequest.referenceImageUrl} alt="Reference" fill className="object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">No Image</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-gray-900">Custom Bag Request</h4>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{customRequest.description}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">Rs. {customRequest.quotedPrice?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">Rs. {customRequest.quotedPrice?.toLocaleString() || '0'}</span>
                </div>
              </div>

              <button
                form="custom-checkout-form"
                type="submit"
                disabled={loading}
                className="w-full py-4 text-white text-center font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-dark shadow-secondary/20 disabled:opacity-70"
              >
                {loading ? "Redirecting to Stripe..." : "Pay Securely with Stripe"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
