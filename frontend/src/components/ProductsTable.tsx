"use client";

import { useEffect, useState, useRef } from "react";
import { Trash2, Edit2, Save, X } from "lucide-react";

type ProductVariant = {
  id: string;
  colorName: string;
  colorCode: string | null;
  imageUrl: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  variants: ProductVariant[];
  createdAt: string;
};

export default function ProductsTable({ refreshKey }: { refreshKey: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Edit State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [refreshKey]);

  const showMessage = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    setIsDeleting(id);
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setProducts(products.filter((p) => p.id !== id));
      showMessage("Product deleted!");
    } catch (error) {
      console.error("Delete failed", error);
      showMessage("Error: Could not delete product");
    } finally {
      setIsDeleting(null);
    }
  };

  const startEdit = (product: Product) => {
    setEditingProductId(product.id);
    setEditFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || "",
    });
    setEditImageFile(null);
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setEditImageFile(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEditImageFile(e.target.files[0]);
    } else {
      setEditImageFile(null);
    }
  };

  const saveEdit = async (id: string) => {
    setIsSaving(true);
    try {
      let finalImageUrl = editFormData.imageUrl;

      // 1. Upload new image to local /api/upload (or Supabase bucket if configured there)
      if (editImageFile) {
        const uploadData = new FormData();
        uploadData.append("file", editImageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");
        
        const uploadResult = await uploadRes.json();
        finalImageUrl = uploadResult.url;
      }

      // 2. Send PUT request
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: editFormData.name,
          price: editFormData.price,
          description: editFormData.description,
        }),
      });

      if (!response.ok) throw new Error("Failed to update product");

      const { product } = await response.json();

      // 3. Update UI state
      setProducts(products.map((p) => (p.id === id ? product : p)));
      showMessage("Product updated successfully!");
      cancelEdit();
    } catch (error: any) {
      console.error("Save failed", error);
      showMessage(`Error: ${error.message || "Could not update product"}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-pulse text-gray-500 font-medium">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
        <h2 className="text-lg font-semibold text-secondary">Inventory</h2>
        {statusMessage && (
          <span className={`text-sm font-medium px-3 py-1 rounded-full animate-in fade-in zoom-in duration-300 ${statusMessage.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {statusMessage}
          </span>
        )}
      </div>
      
      {products.length === 0 ? (
        <div className="flex-1 p-6 flex items-center justify-center min-h-[300px]">
          <p className="text-gray-400 font-medium">No products found. Add one to get started!</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm border-b border-gray-100">
              <tr className="text-gray-500 text-sm">
                <th className="px-4 py-3 font-medium w-24">Image</th>
                <th className="px-4 py-3 font-medium w-48">Product Name</th>
                <th className="px-4 py-3 font-medium w-24">Color</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium w-32">Price</th>
                <th className="px-4 py-3 font-medium text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {products.map((product) => {
                const isEditing = editingProductId === product.id;
                
                return (
                  <tr key={product.id} className={`border-b border-gray-50 transition-colors ${isDeleting === product.id ? 'opacity-50 bg-red-50/30' : isEditing ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}>
                    
                    {/* Image Column */}
                    <td className="px-4 py-4 align-top">
                      {isEditing ? (
                        <div className="text-[10px] text-gray-400 italic mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                          Variants locked during quick-edit.
                        </div>
                      ) : (
                        product.variants && product.variants.length > 0 && product.variants[0].imageUrl ? (
                          <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group">
                            <img src={product.variants[0].imageUrl} alt={product.name} className="object-cover w-full h-full" />
                            {product.variants.length > 1 && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                +{product.variants.length - 1} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-[10px] text-center p-1 shadow-sm">
                            No Img
                          </div>
                        )
                      )}
                    </td>

                    {/* Name Column */}
                    <td className="px-4 py-4 align-top font-medium text-secondary">
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-sm"
                        />
                      ) : (
                        product.name
                      )}
                    </td>

                    {/* Color Column */}
                    <td className="px-4 py-4 align-top text-gray-500 text-sm">
                      {isEditing ? (
                        <div className="text-xs text-gray-400 italic">Locked</div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {product.variants && product.variants.length > 0 ? (
                            product.variants.map((v, i) => (
                              <span key={i} className="inline-flex items-center gap-1.5">
                                {v.colorCode && (
                                  <span className="w-2.5 h-2.5 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: v.colorCode }}></span>
                                )}
                                <span>{v.colorName}</span>
                              </span>
                            ))
                          ) : (
                            <span>-</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Description Column */}
                    <td className="px-4 py-4 align-top text-gray-500 max-w-xs">
                      {isEditing ? (
                        <textarea
                          name="description"
                          rows={2}
                          value={editFormData.description}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none text-sm transition-all"
                        />
                      ) : (
                        <div className="truncate" title={product.description}>
                          {product.description || "-"}
                        </div>
                      )}
                    </td>

                    {/* Price Column */}
                    <td className="px-4 py-4 align-top font-medium text-primary whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          name="price"
                          step="0.01"
                          value={editFormData.price}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-sm"
                        />
                      ) : (
                        `Rs. ${product.price.toLocaleString()}`
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-4 align-top text-right whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => saveEdit(product.id)}
                            disabled={isSaving}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={isSaving}
                            className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(product)}
                            disabled={isDeleting === product.id}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                            title="Edit Product"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={isDeleting === product.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
