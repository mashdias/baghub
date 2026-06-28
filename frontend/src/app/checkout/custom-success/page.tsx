"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

function CustomSuccessContent() {
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const request_id = searchParams.get("request_id");
  
  const [status, setStatus] = useState("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const processed = useRef(false);

  useEffect(() => {
    if (!session_id || !request_id || processed.current) {
      if (!session_id) {
        setStatus("error");
        setErrorMessage("Invalid session ID.");
      }
      return;
    }

    const verifyPayment = async () => {
      processed.current = true;
      try {
        const res = await fetch("/api/verify-custom-stripe-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id, request_id }),
        });

        const data = await res.json();
        
        if (res.ok && data.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Failed to verify payment");
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage("Network error verifying payment.");
      }
    };

    verifyPayment();
  }, [session_id, request_id]);

  if (status === "verifying") {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 max-w-lg w-full text-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying your custom order payment...</h1>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 max-w-lg w-full text-center">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
        <p className="text-gray-500 mb-8">{errorMessage}</p>
        <Link href="/dashboard" className="block w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 max-w-lg w-full text-center animate-in zoom-in duration-500">
      <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={48} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
      <p className="text-gray-500 mb-8 text-lg">Your custom order payment was securely processed. Our admins will start working on your bag immediately!</p>
      <Link href="/dashboard" className="block w-full py-4 bg-secondary text-white text-center font-bold rounded-xl hover:bg-secondary-dark transition-all shadow-lg">
        Go to Dashboard
      </Link>
    </div>
  );
}

export default function CustomCheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading...</div>}>
        <CustomSuccessContent />
      </Suspense>
    </div>
  );
}
