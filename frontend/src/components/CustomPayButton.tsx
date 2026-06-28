"use client";
import Link from "next/link";

export function CustomPayButton({ requestId }: { requestId: string }) {
  return (
    <Link 
      href={`/checkout/custom-request/${requestId}`}
      className="w-full block text-center py-2 bg-secondary text-white text-xs font-bold rounded-lg hover:bg-secondary-dark transition-all mt-2 shadow-sm"
    >
      Pay Now with Stripe
    </Link>
  );
}
