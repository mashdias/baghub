"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Custom Order", href: "/custom-order" },
  { label: "About Us", href: "/#about" },
];

export default function NavLinks() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [menuOpen, setMenuOpen] = useState(false);

  if (isAdmin) return null;

  return (
    <>
      {/* ── Desktop nav ───────────────────────── */}
      <nav className="hidden md:flex gap-8 font-medium">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-secondary hover:text-primary transition-colors">
            {l.label}
          </Link>
        ))}
      </nav>

      {/* ── Mobile hamburger button ───────────── */}
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="md:hidden p-2 rounded-lg text-secondary hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* ── Mobile dropdown menu ──────────────── */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden z-40">
          <nav className="flex flex-col py-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3 text-secondary hover:bg-gray-50 hover:text-primary font-medium transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
