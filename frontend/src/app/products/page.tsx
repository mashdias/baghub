"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";

type ProductVariant = {
  id: string;
  colorName: string;
  colorCode: string | null;
  imageUrl: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  variants: ProductVariant[];
  reviews?: { rating: number }[];
};


function ProductsContent() {
  const { addToCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [categoriesList, setCategoriesList] = useState<string[]>(["All"]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        if (data.categories) {
          const names = data.categories.map((c: { name: string }) => c.name);
          // Always keep "All" as the first option
          setCategoriesList(["All", ...names]);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const activeSearch = searchParams.get("search") || "";
      const activeCategory = searchParams.get("category") || "All";
      const activeMin = searchParams.get("minPrice") || "";
      const activeMax = searchParams.get("maxPrice") || "";

      const params = new URLSearchParams();
      if (activeSearch) params.append("search", activeSearch);
      if (activeCategory && activeCategory !== "All") params.append("category", activeCategory);
      if (activeMin) params.append("minPrice", activeMin);
      if (activeMax) params.append("maxPrice", activeMax);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category && category !== "All") params.append("category", category);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    
    router.push(`/products?${params.toString()}`);
    if (showFilters) setShowFilters(false);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setMinPrice("");
    setMaxPrice("");
    router.push("/products");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Our Collection</h1>
            <p className="text-gray-500 mt-1">Find the perfect handcrafted bag for your style.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value === "") {
                    const params = new URLSearchParams();
                    if (category && category !== "All") params.append("category", category);
                    if (minPrice) params.append("minPrice", minPrice);
                    if (maxPrice) params.append("maxPrice", maxPrice);
                    router.push(`/products?${params.toString()}`);
                  }
                }}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden p-3 bg-white border border-gray-200 rounded-full text-gray-600 shadow-sm"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className={`w-full md:w-64 shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg text-secondary">Filters</h2>
                {showFilters && (
                  <button onClick={() => setShowFilters(false)} className="md:hidden text-gray-400">
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className="space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Category</h3>
                  <div className="space-y-3">
                    {categoriesList.map(cat => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={category === cat}
                          onChange={() => setCategory(cat)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className={`text-sm ${category === cat ? 'font-medium text-primary' : 'text-gray-600 group-hover:text-gray-900 transition-colors'}`}>
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Price Range</h3>
                  <div className="flex flex-col gap-3">
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs.</span>
                      <input
                        type="number"
                        placeholder="Min Price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full pl-8 pr-2 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs.</span>
                      <input
                        type="number"
                        placeholder="Max Price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full pl-8 pr-2 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Apply Filters */}
                <button
                  onClick={applyFilters}
                  className="w-full py-2.5 text-sm font-bold text-white bg-secondary hover:bg-secondary-dark rounded-lg transition-colors shadow-md"
                >
                  Apply Filters
                </button>

                {/* Clear Filters */}
                {(search || category !== "All" || minPrice || maxPrice || searchParams.toString()) && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search size={24} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found matching your search</h3>
                <p className="text-gray-500 max-w-sm">We couldn't find any products matching your criteria. Try adjusting your filters or search term.</p>
                <button
                  onClick={clearFilters}
                  className="mt-6 px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => {
                  const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
                  return (
                  <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col relative">
                    <Link href={`/products/${product.id}`} className="absolute inset-0 z-0"></Link>
                    <div className="relative w-full aspect-square bg-gray-50 pointer-events-none">
                      {defaultVariant && defaultVariant.imageUrl ? (
                        <Image src={defaultVariant.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Image</div>
                      )}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
                        {product.category}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1 relative z-10 pointer-events-none">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-lg text-gray-900 truncate" title={product.name}>{product.name}</h3>
                      </div>
                      
                      {/* Color dots for grid */}
                      {product.variants && product.variants.length > 0 && (
                        <div className="flex gap-1 mb-2">
                          {product.variants.map(variant => (
                            <div 
                              key={variant.id} 
                              className="w-3 h-3 rounded-full border border-gray-200" 
                              style={{ backgroundColor: variant.colorCode || variant.colorName || '#ddd' }} 
                              title={variant.colorName}
                            />
                          ))}
                        </div>
                      )}

                      <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{product.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <span className="font-bold text-xl text-primary block">Rs. {product.price.toLocaleString()}</span>
                          <div className="flex items-center text-yellow-400 text-xs mt-1">
                            <Star size={12} fill="currentColor" />
                            <span className="ml-1 text-gray-500 font-medium">
                              {product.reviews && product.reviews.length > 0 
                                ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1) 
                                : "5.0"}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart({ 
                              id: product.id, 
                              name: product.name, 
                              price: product.price, 
                              imageUrl: defaultVariant?.imageUrl || "",
                              color: defaultVariant?.colorName || ""
                            });
                          }}
                          className="px-4 py-2 bg-secondary text-white text-sm font-medium rounded-full hover:bg-secondary-dark transition-colors shadow-sm pointer-events-auto"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
