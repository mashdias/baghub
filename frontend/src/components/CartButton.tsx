"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";

export default function CartButton() {
  const { itemCount, isMounted } = useCart();
  const pathname = usePathname();

  // Never show the cart button inside the Admin Panel
  if (pathname?.startsWith("/admin")) return null;

  // Prevent hydration error by rendering a matching circular skeleton first
  if (!isMounted) {
    return (
      <div className="relative p-2.5 bg-gray-100 text-gray-400 rounded-full cursor-wait flex items-center justify-center border border-gray-200">
        <ShoppingCart size={22} className="opacity-60" />
      </div>
    );
  }

  return (
    <Link 
      href="/cart" 
      className="relative p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-full transition-all duration-200 flex items-center justify-center border border-gray-200/80 shadow-sm"
      aria-label="View Shopping Cart"
    >
      <ShoppingCart size={22} />
      {itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-md shadow-primary/10 animate-in zoom-in duration-300">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
