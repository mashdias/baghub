"use client";

import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Users, Clock } from "lucide-react";
import RecentOrdersTable from "@/components/RecentOrdersTable";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    pendingCustom: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard-stats');
        const data = await res.json();
        setStats({
          revenue: data.revenue || 0,
          totalOrders: data.totalOrders || 0,
          pendingCustom: data.pendingCustom || 0,
          totalCustomers: data.totalCustomers || 0
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-secondary">
              {loading ? (
                <span className="inline-block animate-pulse w-24 h-8 bg-gray-200 rounded"></span>
              ) : (
                `Rs. ${stats.revenue.toLocaleString()}`
              )}
            </h3>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-sm">
            <DollarSign size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
            <h3 className="text-2xl font-bold text-secondary">
              {loading ? (
                <span className="inline-block animate-pulse w-12 h-8 bg-gray-200 rounded"></span>
              ) : (
                stats.totalOrders.toLocaleString()
              )}
            </h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Pending Custom</p>
            <h3 className="text-2xl font-bold text-secondary">
              {loading ? (
                <span className="inline-block animate-pulse w-12 h-8 bg-gray-200 rounded"></span>
              ) : (
                stats.pendingCustom.toLocaleString()
              )}
            </h3>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shadow-sm">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Customers</p>
            <h3 className="text-2xl font-bold text-secondary">
              {loading ? (
                <span className="inline-block animate-pulse w-12 h-8 bg-gray-200 rounded"></span>
              ) : (
                stats.totalCustomers.toLocaleString()
              )}
            </h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shadow-sm">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <RecentOrdersTable />
    </div>
  );
}
