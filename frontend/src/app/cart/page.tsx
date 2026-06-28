"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, cartTotal, isMounted } = useCart();

  if (!isMounted) return null; // Avoid hydration mismatch

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-3xl font-bold text-secondary mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 max-w-sm text-center">Looks like you haven't added any products to your cart yet.</p>
        <Link href="/products" className="px-8 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary-dark transition-all shadow-lg">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-3xl font-bold text-secondary mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                {/* Product Info Block */}
                <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">No Image</div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 line-clamp-2">{item.name}</h3>
                    <p className="text-primary font-bold mt-1 text-sm sm:text-base">Rs. {item.price.toLocaleString()}</p>
                  </div>
                </div>

                {/* Actions Block */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-gray-50">
                  <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-gray-500 hover:text-primary">
                      <Minus size={16} />
                    </button>
                    <span className="font-medium w-6 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-gray-500 hover:text-primary">
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="font-bold text-base sm:text-lg sm:w-32 text-right">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </div>

                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-secondary mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-8 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl text-primary">Rs. {cartTotal.toLocaleString()}</span>
              </div>

              <Link href="/checkout" className="block w-full py-4 bg-secondary text-white text-center font-bold rounded-xl hover:bg-secondary-dark transition-all shadow-lg shadow-secondary/20">
                Proceed to Checkout
              </Link>
              <Link href="/products" className="block w-full py-4 text-center font-medium text-gray-500 hover:text-gray-900 mt-2">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
