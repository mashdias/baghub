import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CartProvider } from "@/context/CartContext";
import CartButton from "@/components/CartButton";
import NavLinks from "@/components/NavLinks";
import Providers from "@/components/Providers";
import Chatbot from "@/components/Chatbot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "BagHub | Crafting Quality Bags Just For You",
  description: "Handmade bags and custom items made in Sri Lanka. High-quality craftsmanship and premium materials.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans min-h-screen flex flex-col`}>
        <Providers>
          <CartProvider>
          <header className="sticky top-0 z-50 glass border-b border-gray-200 relative">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image src="/baghublogo.jpeg" alt="BagHub Logo" width={48} height={48} className="object-contain" />
              <span className="font-heading font-bold text-xl md:text-3xl text-primary-dark tracking-tight">BAG HUB</span>
            </div>
            <NavLinks />
            <div className="flex gap-4 items-center">
              {session ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 hidden md:block">
                    Hi, {session.user?.name?.split(' ')[0]}
                  </span>
                  {(session.user as any)?.role === "admin" ? (
                    <Link href="/admin" className="px-4 py-2 bg-secondary text-white font-medium hover:bg-secondary-dark rounded-full transition-colors text-sm">
                      Admin Panel
                    </Link>
                  ) : (
                    <Link href="/dashboard" className="px-4 py-2 bg-secondary text-white font-medium hover:bg-secondary-dark rounded-full transition-colors text-sm">
                      Dashboard
                    </Link>
                  )}
                  <Link href="/api/auth/signout" className="hidden sm:block px-4 py-2 text-primary font-medium hover:bg-primary/5 rounded-full transition-colors text-sm">
                    Log Out
                  </Link>
                </div>
              ) : (
                <Link href="/login" className="px-4 py-2 text-primary font-medium hover:bg-primary/5 rounded-full transition-colors">
                  Log In
                </Link>
              )}
              {(!session || (session.user as any)?.role !== "admin") && <CartButton />}
            </div>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="bg-secondary-light text-white py-16">
          <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-heading font-bold text-2xl mb-4 text-primary-light">BAG HUB</h3>
              <p className="text-gray-300">Crafting quality bags just for you. Handmade with passion in Sri Lanka.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">All Bags</a></li>
                <li><a href="#" className="hover:text-white">Backpacks</a></li>
                <li><a href="#" className="hover:text-white">Handbags</a></li>
                <li><a href="#" className="hover:text-white">Custom Designs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Help</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Shipping & Returns</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Newsletter</h4>
              <p className="text-gray-300 mb-4">Subscribe to get special offers and updates.</p>
              <div className="flex">
                <input type="email" placeholder="Your email" className="px-4 py-2 rounded-l-md w-full text-secondary" />
                <button className="bg-primary px-4 py-2 rounded-r-md font-medium">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-6 mt-12 pt-8 border-t border-gray-600 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} BagHub. All rights reserved.
          </div>
        </footer>
        <Chatbot />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
