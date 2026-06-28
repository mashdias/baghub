"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Trash2, UploadCloud, Loader2, Copy, Check, ImageOff } from "lucide-react";

type MediaFile = {
  name: string;
  url: string;
  size: number;
  createdAt: string;
};

type Toast = {
  id: number;
  message: string;
  type: "success" | "error";
};

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error("Error fetching media", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFiles((prev) => [data.file, ...prev]);
      showToast("Image uploaded successfully!");
    } catch {
      showToast("Error uploading file", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCopyUrl = async (file: MediaFile) => {
    const absoluteUrl = `${window.location.origin}${file.url}`;
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopiedName(file.name);
      showToast("URL copied to clipboard!");
      setTimeout(() => setCopiedName(null), 2000);
    } catch {
      showToast("Failed to copy URL", "error");
    }
  };

  const handleDelete = async (filename: string) => {
    if (!window.confirm("Are you sure you want to delete this image? If it is used by a product, it will break the image link!")) {
      return;
    }
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setFiles((prev) => prev.filter((f) => f.name !== filename));
      showToast("Image deleted successfully!");
    } catch {
      showToast("Error deleting image", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white flex items-center gap-2 ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.type === "success" && <Check size={15} />}
            {toast.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Media Library</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage all uploaded product and request images.{" "}
            <span className="font-medium text-gray-700">{files.length} file{files.length !== 1 ? "s" : ""}</span>
          </p>
        </div>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
          >
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
            Upload Image
          </button>
        </div>
      </div>

      {/* Grid / States */}
      {loading ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-gray-500 font-medium">Loading media...</span>
          </div>
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageOff className="text-gray-400" size={32} />
          </div>
          <p className="text-lg font-medium text-gray-600 mb-1">No images found</p>
          <p className="text-sm text-gray-500">Upload your first image to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {files.map((file) => (
            <div
              key={file.name}
              className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="aspect-square relative bg-gray-100">
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />

                {/* Dark Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2.5 p-2">
                  {/* Copy URL Button */}
                  <button
                    onClick={() => handleCopyUrl(file)}
                    className="w-full flex items-center justify-center gap-1.5 px-2 py-2 bg-white text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm transform translate-y-3 group-hover:translate-y-0"
                    title="Copy image URL"
                  >
                    {copiedName === file.name ? (
                      <Check size={13} className="text-green-600 shrink-0" />
                    ) : (
                      <Copy size={13} className="shrink-0" />
                    )}
                    {copiedName === file.name ? "Copied!" : "Copy URL"}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(file.name)}
                    className="w-full flex items-center justify-center gap-1.5 px-2 py-2 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-all duration-200 shadow-sm transform translate-y-3 group-hover:translate-y-0 delay-75"
                    title="Delete image"
                  >
                    <Trash2 size={13} className="shrink-0" />
                    Delete
                  </button>
                </div>
              </div>

              {/* File Info */}
              <div className="p-3">
                <p className="text-xs font-semibold text-gray-700 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium uppercase tracking-wider">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
