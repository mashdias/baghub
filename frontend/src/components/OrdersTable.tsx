"use client";

import { useEffect, useState } from "react";
import { Eye, X, Search } from "lucide-react";

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  shippingName?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPhone?: string;
  user: {
    name: string;
    email?: string;
  };
  items?: {
    quantity: number;
    price: number;
    product: {
      name: string;
    } | null;
  }[];
};

const statusOptions = ['Processing', 'Shipped', 'Delivered'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Processing': return 'text-blue-600 bg-blue-50';
    case 'Shipped': return 'text-green-600 bg-green-50';
    case 'Delivered': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-50';
  }
};

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      setStatusMessage("Status updated successfully!");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      console.error("Update failed", error);
      setStatusMessage("Error: Could not update status");
      setTimeout(() => setStatusMessage(""), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const orderIdStr = `ORD-${order.id.split('-')[0].toUpperCase()}`;
    const customerName = order.user?.name || "Unknown";
    const searchLower = searchQuery.toLowerCase();
    
    return orderIdStr.toLowerCase().includes(searchLower) || 
           order.id.toLowerCase().includes(searchLower) ||
           customerName.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-500 font-medium">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header & Search */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-secondary">All Orders</h2>
          {statusMessage && (
            <span className={`text-sm font-medium px-3 py-1 rounded-full animate-in fade-in zoom-in duration-300 ${statusMessage.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {statusMessage}
            </span>
          )}
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Order ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50"
          />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No orders found.</div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No orders match your search "{searchQuery}".</div>
      ) : (
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm border-b border-gray-100">
              <tr className="text-gray-500 text-sm">
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Items</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary">
                    ORD-{order.id.split('-')[0].toUpperCase()}
                  </td>
                  <td className="px-6 py-4">{order.user?.name || "Unknown"}</td>
                  <td className="px-6 py-4">
                    {order.items && order.items.length > 0 ? (
                      <div className="text-gray-600 line-clamp-2 max-w-xs" title={order.items.map(i => `${i.quantity}x ${i.product?.name || 'Deleted Item'}`).join(', ')}>
                        {order.items.map(i => `${i.quantity}x ${i.product?.name || 'Deleted Item'}`).join(', ')}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Legacy Order</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium whitespace-nowrap">Rs. {order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border-0 cursor-pointer outline-none transition-colors shadow-sm disabled:opacity-50 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%20%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%234B5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:calc(100%-0.2rem)_center] pr-6 ${getStatusColor(order.status)} hover:opacity-80`}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status} className="bg-white text-gray-700 font-medium">
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors inline-flex items-center justify-center"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold text-secondary">Order Details</h3>
                <p className="text-sm text-gray-500 mt-1">
                  ID: ORD-{selectedOrder.id.split('-')[0].toUpperCase()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-8 overflow-y-auto">
              {/* Customer Details */}
              <section>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Customer Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium text-gray-900">{selectedOrder.shippingName || selectedOrder.user?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{selectedOrder.user?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Phone Number</p>
                    <p className="font-medium text-gray-900">{selectedOrder.shippingPhone || "N/A"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-gray-500 mb-1">Shipping Address</p>
                    <p className="font-medium text-gray-900 leading-relaxed">
                      {selectedOrder.shippingAddress || "N/A"}
                      {selectedOrder.shippingCity ? `, ${selectedOrder.shippingCity}` : ''}
                    </p>
                  </div>
                </div>
              </section>

              {/* Order Specifics */}
              <section>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Order Specifics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
                  <div>
                    <p className="text-gray-500 mb-1">Order Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedOrder.createdAt).toLocaleString(undefined, { 
                        year: 'numeric', month: 'short', day: 'numeric', 
                        hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Custom Notes / Gift Message</p>
                    <p className="font-medium text-gray-900 italic">None provided</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</p>
                  <ul className="space-y-3">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-200/60 pb-2 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">{item.quantity}x</span>
                            <span className="text-gray-800 font-medium">{item.product?.name || 'Deleted Product'}</span>
                          </div>
                          <span className="text-gray-600 font-medium">Rs. {item.price?.toLocaleString() || '0'}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 italic">No items data available.</li>
                    )}
                  </ul>
                </div>
              </section>

              {/* Financials */}
              <section>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Financials</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-gray-500 mb-2">Payment Status</p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      Paid
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-2">Payment Method</p>
                    <div className="font-medium text-gray-900 flex items-center gap-2 bg-white w-fit px-3 py-1 rounded-md border border-gray-200">
                      <svg className="w-8 h-8" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="25" rx="4" fill="#635BFF"/><path d="M19.16 16.5c-3.1 0-5.4-1.87-5.4-5.01 0-3.32 2.65-5.22 5.68-5.22 1.48 0 2.6.4 3.42.92l-.76 2.05c-.68-.4-1.63-.76-2.58-.76-1.57 0-2.85.87-2.85 2.58 0 1.25.96 1.93 2.15 2.37l1.1.41c1.9.72 2.87 1.7 2.87 3.25 0 2.21-1.78 3.55-4.13 3.55-1.55 0-3.16-.5-4.22-1.2l.96-2.22c.98.66 2.1 1.05 3.14 1.05 1.5 0 2.6-.74 2.6-1.99 0-1.28-.96-1.85-2.07-2.27l-1.07-.4c-2.14-.8-2.95-1.95-2.95-3.32 0-2.19 1.76-3.76 4.31-3.76 1.44 0 2.9.46 3.86 1.05l-1 2.2c-.8-.48-1.93-.85-2.93-.85-1.12 0-2.07.61-2.07 1.8 0 1.14.94 1.74 2.12 2.2l1.1.43c2.31.9 3.1 2.1 3.1 3.45.02 2.18-1.66 3.66-4.38 3.66z" fill="#fff"/></svg>
                      Stripe
                    </div>
                  </div>
                  <div className="sm:col-span-2 mt-2 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-gray-600 font-medium">Total Amount</p>
                    <p className="text-xl font-bold text-primary">Rs. {selectedOrder.total.toLocaleString()}</p>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-full hover:bg-gray-300 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
