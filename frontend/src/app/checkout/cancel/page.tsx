import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 max-w-lg w-full text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={48} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
        <p className="text-gray-500 mb-8 text-lg">You cancelled the payment process. Your cart has been saved and your items are still waiting for you.</p>
        
        <div className="space-y-3">
          <Link href="/checkout" className="block w-full py-4 bg-primary text-white text-center font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg">
            Try Again
          </Link>
          <Link href="/cart" className="block w-full py-4 bg-gray-100 text-gray-700 text-center font-bold rounded-xl hover:bg-gray-200 transition-all">
            Return to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
