"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const { items, cartTotal, clearCart } = useCart();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const processed = useRef(false);

  useEffect(() => {
    // We only verify once, and we require session_id and items.
    if (!session_id || processed.current || items.length === 0) {
      if (!session_id) {
        setStatus("error");
        setErrorMessage("Invalid session ID.");
      }
      return;
    }

    const verifyPayment = async () => {
      processed.current = true;
      try {
        const savedShipping = localStorage.getItem("baghub_shipping");
        const shippingData = savedShipping ? JSON.parse(savedShipping) : {};

        const res = await fetch("/api/verify-stripe-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id,
            items,
            total: cartTotal,
            shippingData
          }),
        });

        const data = await res.json();
        
        if (res.ok && data.success) {
          setStatus("success");
          clearCart();
          localStorage.removeItem("baghub_shipping");
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Failed to verify payment");
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage("Network error verifying payment. Please contact support.");
      }
    };

    verifyPayment();
  }, [session_id, items, cartTotal, clearCart]);

  if (status === "verifying") {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 max-w-lg w-full text-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying your payment...</h1>
        <p className="text-gray-500">Please do not close this window.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 max-w-lg w-full text-center">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
        <p className="text-gray-500 mb-8">{errorMessage}</p>
        <Link href="/cart" className="block w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all">
          Return to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 max-w-lg w-full text-center animate-in zoom-in duration-500">
      <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={48} />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank you for your order!</h1>
      <p className="text-gray-500 mb-8 text-lg">Your payment was securely processed and your order has been saved. We'll send you an email with the tracking details.</p>
      
      <div className="space-y-3">
        <Link href="/dashboard" className="block w-full py-4 bg-secondary text-white text-center font-bold rounded-xl hover:bg-secondary-dark transition-all shadow-lg">
          Track My Order
        </Link>
        <Link href="/products" className="block w-full py-4 bg-gray-100 text-gray-700 text-center font-bold rounded-xl hover:bg-gray-200 transition-all">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
