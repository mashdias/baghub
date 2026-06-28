"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2 } from "lucide-react";

export default function CustomOrderForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError("");

    try {
      let imageUrl = "";

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");
        
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, referenceImageUrl: imageUrl }),
      });

      if (!res.ok) throw new Error("Failed to submit request");

      setSuccess(true);
      setDescription("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12 animate-in zoom-in duration-300">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4 shadow-sm border border-green-200">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Request Submitted!</h3>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Our artisans will review your custom design and get back to you with a quote soon.</p>
        <button 
          onClick={() => { setSuccess(false); router.push("/"); router.refresh(); }}
          className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded-full transition-all shadow-lg"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium animate-in fade-in">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Design Description <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="I would like a dark brown leather tote bag with gold zippers, a thick shoulder strap, and an interior pocket for a 13-inch laptop..."
          className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reference Image <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${file ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept="image/*"
            className="hidden"
          />
          {file ? (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-2">
                <CheckCircle2 size={20} />
              </div>
              <div className="text-primary font-medium">{file.name}</div>
              <div className="text-xs text-gray-500 mt-1">Click to change file</div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <UploadCloud size={36} className="mb-3 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Click to upload a reference image</span>
              <span className="text-xs mt-1">PNG or JPG up to 5MB</span>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={uploading || !description}
        className="w-full bg-secondary hover:bg-secondary-dark text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-secondary/30 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
      >
        {uploading ? "Submitting Request..." : "Submit Custom Request"}
      </button>
    </form>
  );
}
