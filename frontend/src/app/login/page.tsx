"use client";

import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirect") || "";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      // Securely fetch the session state created by NextAuth
      let session = await getSession();
      
      // If session is still null due to a race condition, wait a tiny bit
      if (!session) {
        await new Promise(resolve => setTimeout(resolve, 500));
        session = await getSession();
      }
      
      // Default fallback redirects based on user role
      let targetUrl = "/";
      if (session?.user && (session.user as any).role === "admin") {
        targetUrl = "/admin";
      }

      // If a callbackUrl or redirect parameter is present, resolve it safely
      if (callbackUrl) {
        try {
          const parsedUrl = new URL(callbackUrl, window.location.origin);
          // Prevent open redirect vulnerabilities by matching origins
          if (parsedUrl.origin === window.location.origin) {
            targetUrl = parsedUrl.pathname + parsedUrl.search;
          }
        } catch (e) {
          // If parsing failed (meaning it's relative path), check if it starts with "/"
          if (callbackUrl.startsWith("/")) {
            targetUrl = callbackUrl;
          }
        }
      }

      // Use window.location.href to force a hard reload. 
      // This bypasses Next.js aggressive client-side caching which often
      // remembers the old 'unauthenticated' state and bounces you back.
      window.location.href = targetUrl;
    }
  };

  return (
    <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-gray-100 p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-secondary">Welcome Back</h1>
        <p className="text-gray-500 mt-2">Sign in to your Bag Hub account</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-6 text-center animate-in fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-gray-400" />
            </div>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <Link href="/forgot-password" className="text-sm text-primary font-medium hover:underline">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-primary/30 disabled:opacity-70 mt-4"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-8">
        Don't have an account?{" "}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-gray-100 p-8 flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-gray-500 font-medium text-center">Loading sign-in...</div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
