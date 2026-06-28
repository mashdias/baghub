import { ShoppingBag, ArrowRight, ShieldCheck, Sparkles, HeartHandshake, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default async function Home() {
  // Fetch up to 4 real products from the database for the homepage
  let featuredProducts: any[] = [];
  try {
    featuredProducts = await prisma.product.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { 
        variants: true,
        reviews: { where: { isApproved: true }, select: { rating: true } }
      },
    });
  } catch (e) {
    console.error("Failed to fetch featured products:", e);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary-dark text-white py-24 lg:py-32">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1887&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary/80"></div>
        <div className="container relative mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-sm font-medium tracking-wide">
              Sri Lanka's Finest Craftsmanship
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold font-heading leading-tight">
              Crafting Quality Bags <span className="text-pink-300 italic">Just For You</span>
            </h1>
            <p className="text-lg text-gray-200 max-w-xl leading-relaxed">
              Discover handmade bags, backpacks, and custom accessories tailored to your unique style. Combining premium materials with local artisanal expertise.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/products" className="px-8 py-4 bg-white text-primary-dark font-bold rounded-full hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 flex items-center gap-2">
                Shop Collection <ArrowRight size={20} />
              </Link>
              <Link href="/custom-order" className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all">
                Customize Your Bag
              </Link>
            </div>
          </div>
          <div className="hidden lg:block relative h-[500px] animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-400 to-primary-light rounded-2xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=2030&auto=format&fit=crop" alt="Premium Bag" className="w-full h-full object-cover mix-blend-multiply opacity-90" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-primary-light/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <HeartHandshake size={32} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-secondary">Local Craftsmanship</h3>
              <p className="text-gray-600">Ethically made by skilled artisans in Sri Lanka, ensuring every stitch is perfect.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-primary-light/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-secondary">Custom Designs</h3>
              <p className="text-gray-600">Got an idea? We bring it to life. Personalize colors, materials, and styles.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-primary-light/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-secondary">Premium Quality</h3>
              <p className="text-gray-600">Durable materials built to last, providing luxury without the exorbitant price tag.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products — pulled from the real database */}
      <section id="products" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-sm">Our Collection</span>
              <h2 className="text-4xl font-bold font-heading text-secondary mt-2">Featured Products</h2>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors">
              View All <ArrowRight size={18} />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No products yet. Add products from the Admin Panel!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group block">
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    {product.variants && product.variants.length > 0 && product.variants[0].imageUrl ? (
                      <Image
                        src={product.variants[0].imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <ShoppingBag size={48} className="text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-primary cursor-pointer transition-colors">
                      <ShoppingBag size={20} />
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                    <h3 className="text-lg font-bold font-heading mb-2 text-secondary group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-xl text-primary">Rs. {product.price.toLocaleString()}</span>
                      <div className="flex items-center text-yellow-400 text-sm">
                        <Star size={16} fill="currentColor" />
                        <span className="ml-1 text-gray-600 font-medium">
                          {product.reviews && product.reviews.length > 0 
                            ? (product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length).toFixed(1) 
                            : "5.0"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">
            Have a Dream Bag in Mind?
          </h2>
          <p className="text-xl text-pink-100 mb-10 max-w-2xl mx-auto">
            Our artisans can create custom bags tailored specifically to your needs. Share your design and let us handle the rest.
          </p>
          <Link href="/custom-order" className="px-10 py-5 bg-white text-primary font-bold text-lg rounded-full shadow-xl hover:scale-105 hover:shadow-2xl transition-all inline-flex items-center gap-2">
            Start Custom Order <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
