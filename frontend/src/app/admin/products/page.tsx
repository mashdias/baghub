"use client";

import { useState, useEffect } from "react";
import AddProductForm from "@/components/AddProductForm";
import ProductsTable from "@/components/ProductsTable";
import { Tag, X, Plus, Trash2, Loader2 } from "lucide-react";

type Category = { id: string; name: string };

export default function ProductsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [catRefreshKey, setCatRefreshKey] = useState(0);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [catSaving, setCatSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [catError, setCatError] = useState("");

  useEffect(() => {
    if (showCategoryModal) fetchCategories();
  }, [showCategoryModal]);

  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      setCatError("Failed to load categories.");
    } finally {
      setCatLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setCatSaving(true);
    setCatError("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setCategories((prev) => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCatName("");
    } catch (err: any) {
      setCatError(err.message);
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Delete this category? Products using it won't be affected.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setCatError("Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleProductAdded = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Products Management</h1>
          <p className="text-gray-500 text-sm mt-1">Add and manage your store inventory.</p>
        </div>
        <button
          onClick={() => { setCatError(""); setShowCategoryModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white font-medium rounded-lg hover:bg-secondary/90 transition-all shadow-sm text-sm"
        >
          <Tag size={16} />
          Manage Categories
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <AddProductForm onSuccess={handleProductAdded} categoryRefreshKey={catRefreshKey} />
        <ProductsTable refreshKey={refreshKey} />
      </div>

      {/* ── Category Modal ─────────────────────────────────────────── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setShowCategoryModal(false); setCatRefreshKey(k => k + 1); }}
          />

          {/* Modal Panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <Tag size={16} />
                </div>
                <h2 className="font-bold text-secondary text-lg">Manage Categories</h2>
              </div>
              <button
                onClick={() => { setShowCategoryModal(false); setCatRefreshKey(k => k + 1); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Add New Category Input */}
            <div className="px-6 py-5 border-b border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add New Category</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  placeholder="e.g. Clutches, Duffel Bags..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={catSaving || !newCatName.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-all text-sm disabled:opacity-50 shrink-0"
                >
                  {catSaving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  Add
                </button>
              </div>
              {catError && (
                <p className="mt-2 text-xs text-red-600 font-medium">{catError}</p>
              )}
            </div>

            {/* Category List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Existing Categories ({categories.length})
              </p>

              {catLoading ? (
                <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
                  <Loader2 size={18} className="animate-spin" /> Loading...
                </div>
              ) : categories.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">
                  No categories yet. Add your first one above!
                </p>
              ) : (
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl group">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary/50" />
                        <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        disabled={deletingId === cat.id}
                        className="p-1.5 text-gray-300 group-hover:text-red-400 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                        title={`Delete "${cat.name}"`}
                      >
                        {deletingId === cat.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-full py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                onClick={() => { setShowCategoryModal(false); setCatRefreshKey(k => k + 1); }}> 
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
