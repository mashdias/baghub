"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
  };
  items?: {
    quantity: number;
    product: {
      name: string;
    } | null;
  }[];
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Processing':
      return 'text-blue-600 bg-blue-50';
    case 'Shipped':
      return 'text-green-600 bg-green-50';
    case 'Delivered':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export default function RecentOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-secondary">Recent Orders</h2>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm font-medium">
            <div className="inline-block animate-pulse">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No recent orders found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Items</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-primary">
                    ORD-{order.id.split('-')[0].toUpperCase()}
                  </td>
                  <td className="px-6 py-4">{order.user?.name || "Unknown"}</td>
                  <td className="px-6 py-4">
                    {order.items && order.items.length > 0 ? (
                      <div className="text-gray-600 line-clamp-2 max-w-[200px]" title={order.items.map(i => `${i.quantity}x ${i.product?.name || 'Deleted Item'}`).join(', ')}>
                        {order.items.map(i => `${i.quantity}x ${i.product?.name || 'Deleted Item'}`).join(', ')}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Legacy Order</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium">Rs. {order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
