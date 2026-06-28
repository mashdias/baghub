"use client";

import { useState, useRef, useEffect } from "react";

type Category = { id: string; name: string };

interface AddProductFormProps {
  onSuccess?: () => void;
  categoryRefreshKey?: number;
}

export default function AddProductForm({ onSuccess, categoryRefreshKey }: AddProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
  });
  const [variants, setVariants] = useState<{ colorName: string; colorCode: string; imageFile: File | null }[]>([
    { colorName: "", colorCode: "", imageFile: null },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, [categoryRefreshKey]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      console.error("Failed to fetch categories");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const uploadedVariants = await Promise.all(
        variants.map(async (v) => {
          let imageUrl = "";
          if (v.imageFile) {
            const uploadData = new FormData();
            uploadData.append("file", v.imageFile);

            const uploadRes = await fetch("/api/upload", {
              method: "POST",
              body: uploadData,
            });

            if (!uploadRes.ok) throw new Error("Failed to upload an image.");

            const uploadResult = await uploadRes.json();
            imageUrl = uploadResult.url;
          }
          return {
            colorName: v.colorName,
            colorCode: v.colorCode,
            imageUrl,
          };
        })
      );

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          price: parseFloat(formData.price),
          variants: uploadedVariants 
        }),
      });

      if (!response.ok) throw new Error("Failed to add product to database.");

      setMessage("Product added successfully!");
      setFormData({ name: "", price: "", description: "", category: "" });
      setVariants([{ colorName: "", colorCode: "", imageFile: null }]);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setMessage(`Error: ${error.message || "Could not complete request"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;
    setVariants(newVariants);
  };

  const handleAddVariant = () => {
    setVariants([...variants, { colorName: "", colorCode: "", imageFile: null }]);
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full">
      <h2 className="text-xl font-semibold mb-6 text-secondary">Add New Product</h2>

      {message && (
        <div className={`p-4 mb-6 rounded-md text-sm font-medium ${message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input type="text" name="name" required value={formData.name} onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            placeholder="e.g. Handmade Leather Tote" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
          <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            placeholder="e.g. 5000" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select name="category" value={formData.category} onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors bg-white">
            <option value="">— Select a category —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
            {categories.length === 0 && <option disabled>No categories yet. Add one above!</option>}
          </select>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium text-gray-800">Product Variants (Colors)</h3>
            <button type="button" onClick={handleAddVariant} className="text-sm text-primary hover:text-primary-dark font-medium">
              + Add Color Option
            </button>
          </div>

          {variants.map((variant, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 relative border border-gray-200">
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove variant"
                >
                  &times;
                </button>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Color Name</label>
                  <input
                    type="text"
                    required
                    value={variant.colorName}
                    onChange={(e) => handleVariantChange(index, "colorName", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="e.g. Red, Midnight Black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Color Code (Hex)</label>
                  <input
                    type="text"
                    value={variant.colorCode}
                    onChange={(e) => handleVariantChange(index, "colorCode", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="e.g. #FF0000"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Variant Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleVariantChange(index, "imageFile", e.target.files?.[0] || null)}
                    className="w-full text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer transition-colors"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" rows={4} value={formData.description} onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none"
            placeholder="Enter product description..." />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-md shadow-primary/20 disabled:opacity-50 mt-4">
          {loading ? "Uploading & Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}
