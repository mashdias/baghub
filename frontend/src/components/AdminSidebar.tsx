"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Users, Settings,
  PenTool, Image as ImageIcon, FileText, X, Menu, MessageSquare
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: ShoppingBag },
  { name: "Orders", href: "/admin/orders", icon: FileText },
  { name: "Custom Requests", href: "/admin/custom-requests", icon: PenTool },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Media Library", href: "/admin/media", icon: ImageIcon },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const NavContent = () => (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 shrink-0">
        <span className="font-heading font-bold text-xl text-primary">BagHub Admin</span>
        {/* Close button — mobile only */}
        <button onClick={onClose} className="md:hidden p-1.5 text-gray-500 hover:text-gray-800 rounded-lg">
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-50 hover:text-primary"
              }`}
            >
              <Icon size={20} /> {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar (always visible ≥ md) ────────────────── */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col shrink-0">
        <NavContent />
      </aside>

      {/* ── Mobile off-canvas drawer ──────────────────────────────── */}
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}
      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
}
