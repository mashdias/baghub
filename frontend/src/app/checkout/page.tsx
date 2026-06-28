"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function CheckoutPage() {
  const { items, cartTotal, isMounted } = useCart();
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isStoreOpen, setIsStoreOpen] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/global")
      .then((r) => r.json())
      .then((d) => setIsStoreOpen(d.settings?.isStoreOpen ?? true))
      .catch(() => setIsStoreOpen(true)); // Fail open so checkout isn't broken by a network error
  }, []);

  if (!isMounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-secondary mb-4">Your cart is empty</h1>
        <Link href="/products" className="px-6 py-2 bg-primary text-white rounded-full">Return to Shop</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Temporarily store shipping data locally so success page can read it
      localStorage.setItem("baghub_shipping", JSON.stringify(formData));

      const response = await fetch("/api/create-stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const session = await response.json();
      
      if (!response.ok) {
        throw new Error(session.error || "Failed to create checkout session");
      }

      // Securely redirect user to Stripe's Hosted Checkout Page
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
        <h1 className="text-3xl font-bold text-secondary mb-8">Checkout Securely</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-secondary mb-6">Shipping Details</h2>
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium">{error}</div>}
              
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
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
              <h2 className="text-xl font-bold text-secondary mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                      {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</h4>
                      <p className="text-gray-500 text-xs mt-1">Qty: {item.quantity}</p>
                      <p className="text-primary font-bold text-sm mt-1">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">Rs. {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Store Closed Banner */}
              {isStoreOpen === false && (
                <div className="flex items-start gap-3 p-4 mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-500" />
                  <div>
                    <p className="font-semibold">We are currently not accepting new orders.</p>
                    <p className="text-amber-700 mt-0.5">Please check back later!</p>
                  </div>
                </div>
              )}

              <button
                form="checkout-form"
                type="submit"
                disabled={loading || isStoreOpen === false}
                className={`w-full py-4 text-white text-center font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isStoreOpen === false
                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                    : "bg-secondary hover:bg-secondary-dark shadow-secondary/20 disabled:opacity-70"
                }`}
              >
                {loading ? "Redirecting to Stripe..." : isStoreOpen === false ? "Orders Temporarily Unavailable" : "Pay Securely with Stripe"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
