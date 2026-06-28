"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ShieldCheck, ShieldOff, User, Mail, Lock, Plus,
  CheckCircle, AlertCircle, Loader2, Shield, Store, ToggleLeft, ToggleRight,
} from "lucide-react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export default function AdminSettingsPage() {
  // ── Add Admin form state ─────────────────────────────────────────
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ── Current Admins list state ─────────────────────────────────────
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeStatus, setRevokeStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ── Store Status state ────────────────────────────────────────────
  const [isStoreOpen, setIsStoreOpen] = useState<boolean | null>(null);
  const [storeStatusSaving, setStoreStatusSaving] = useState(false);
  const [storeStatusMsg, setStoreStatusMsg] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;

  useEffect(() => {
    fetchAdmins();
    fetchStoreStatus();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/customers?role=admin");
      const data = await res.json();
      setAdmins(data.customers || []);
    } catch {
      console.error("Failed to fetch admins");
    } finally {
      setAdminsLoading(false);
    }
  };

  const fetchStoreStatus = async () => {
    try {
      const res = await fetch("/api/admin/settings/global");
      const data = await res.json();
      setIsStoreOpen(data.settings?.isStoreOpen ?? true);
    } catch {
      console.error("Failed to fetch store settings");
    }
  };

  const toggleStoreStatus = async () => {
    const newValue = !isStoreOpen;
    setIsStoreOpen(newValue);
    setStoreStatusSaving(true);
    setStoreStatusMsg(null);
    try {
      const res = await fetch("/api/admin/settings/global", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStoreOpen: newValue }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setStoreStatusMsg({ type: "success", message: `Store is now ${newValue ? "Open" : "Closed"}.` });
    } catch {
      setIsStoreOpen(!newValue); // Revert on failure
      setStoreStatusMsg({ type: "error", message: "Failed to update store status." });
    } finally {
      setStoreStatusSaving(false);
      setTimeout(() => setStoreStatusMsg(null), 4000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }
    if (formData.password.length < 8) {
      setStatus({ type: "error", message: "Password must be at least 8 characters." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create admin account.");

      setStatus({ type: "success", message: `✓ Admin account created for ${formData.name} (${formData.email}).` });
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      fetchAdmins(); // Refresh the list
    } catch (err: any) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (admin: AdminUser) => {
    if (!window.confirm(`Are you sure you want to revoke admin access for ${admin.name}? They will become a regular customer.`)) {
      return;
    }

    setRevokingId(admin.id);
    setRevokeStatus(null);
    try {
      const res = await fetch(`/api/admin/revoke/${admin.id}`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to revoke admin.");

      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      setRevokeStatus({ type: "success", message: `Admin access revoked for ${admin.name}.` });
    } catch (err: any) {
      setRevokeStatus({ type: "error", message: err.message });
    } finally {
      setRevokingId(null);
      setTimeout(() => setRevokeStatus(null), 4000);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage administrative access and system configuration.</p>
      </div>

      {/* ── Store Status Toggle ──────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-gray-50/60">
          <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <Store size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-secondary text-base">Store Status</h2>
            <p className="text-gray-500 text-xs mt-0.5">Toggle to open or close the store for new orders.</p>
          </div>
        </div>

        <div className="p-6">
          {storeStatusMsg && (
            <div className={`flex items-center gap-2.5 p-4 rounded-xl text-sm font-medium mb-5 border animate-in fade-in duration-300 ${
              storeStatusMsg.type === "success" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-600 border-red-100"
            }`}>
              {storeStatusMsg.type === "success" ? <CheckCircle size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
              {storeStatusMsg.message}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              {isStoreOpen === null ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 size={16} className="animate-spin" /> Loading status...</div>
              ) : (
                <>
                  <div className={`text-lg font-bold ${isStoreOpen ? "text-emerald-600" : "text-red-500"}`}>
                    {isStoreOpen ? "🟢 Store is Open" : "🔴 Store is Closed"}
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {isStoreOpen
                      ? "Customers can browse products and place orders normally."
                      : "Checkout is disabled. Customers will see a maintenance message."}
                  </p>
                </>
              )}
            </div>

            <button
              onClick={toggleStoreStatus}
              disabled={storeStatusSaving || isStoreOpen === null}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-50 ${
                isStoreOpen ? "bg-emerald-500" : "bg-red-400"
              }`}
              aria-label="Toggle store status"
            >
              {storeStatusSaving && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={14} className="animate-spin text-white" />
                </span>
              )}
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                  isStoreOpen ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Add New Admin ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-gray-50/60">
          <div className="w-9 h-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-secondary text-base">Add New Admin</h2>
            <p className="text-gray-500 text-xs mt-0.5">Create a new admin account. Admins have full access to this panel.</p>
          </div>
        </div>

        <div className="p-6">
          {status && (
            <div className={`flex items-center gap-2.5 p-4 rounded-xl text-sm font-medium mb-6 border animate-in fade-in zoom-in duration-300 ${
              status.type === "success" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-600 border-red-100"
            }`}>
              {status.type === "success" ? <CheckCircle size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User size={16} className="text-gray-400" /></div>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Admin Full Name"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={16} className="text-gray-400" /></div>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="admin@example.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={16} className="text-gray-400" /></div>
                  <input type="password" name="password" required minLength={8} value={formData.password} onChange={handleChange} placeholder="Min. 8 characters"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={16} className="text-gray-400" /></div>
                  <input type="password" name="confirmPassword" required minLength={8} value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" />
                </div>
              </div>
            </div>
            <div className="pt-1">
              <button type="submit" disabled={loading} id="create-admin-btn"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-60 text-sm">
                <Plus size={16} />
                {loading ? "Creating Admin..." : "Create Admin Account"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Current Admins ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-gray-50/60">
          <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-secondary text-base">Current Admins</h2>
            <p className="text-gray-500 text-xs mt-0.5">Manage existing admin accounts. You cannot revoke your own access.</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {revokeStatus && (
            <div className={`flex items-center gap-2.5 p-4 rounded-xl text-sm font-medium border animate-in fade-in duration-300 ${
              revokeStatus.type === "success" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-600 border-red-100"
            }`}>
              {revokeStatus.type === "success" ? <CheckCircle size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
              {revokeStatus.message}
            </div>
          )}

          {adminsLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-500 gap-2">
              <Loader2 size={18} className="animate-spin" /> Loading admins...
            </div>
          ) : admins.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No admin accounts found.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {admins.map((admin) => {
                const isSelf = admin.id === currentUserId;
                return (
                  <div key={admin.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          {admin.name}
                          {isSelf && (
                            <span className="text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">You</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{admin.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevoke(admin)}
                      disabled={isSelf || revokingId === admin.id}
                      title={isSelf ? "You cannot revoke your own admin access" : `Revoke admin access for ${admin.name}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {revokingId === admin.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <ShieldOff size={13} />
                      )}
                      {isSelf ? "Protected" : "Revoke Admin"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
