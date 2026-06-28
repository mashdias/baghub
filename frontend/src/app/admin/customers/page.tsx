"use client";

import { useEffect, useState } from "react";
import { Trash2, Search } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  _count: {
    orders: number;
    customRequests: number;
  };
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/customers?search=${encodeURIComponent(debouncedSearch)}`)
      .then(res => res.json())
      .then(data => {
        setCustomers(data.customers || []);
        setLoading(false);
      });
  }, [debouncedSearch]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? All their data (orders, requests) will be removed permanently.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete customer');

      setCustomers(customers.filter(c => c.id !== id));
      setStatusMessage("Customer deleted successfully!");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      console.error("Delete failed", error);
      setStatusMessage("Error: Could not delete customer");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  if (loading) return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-gray-500 font-medium">Loading customers...</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage user accounts and view their activity.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {statusMessage && (
            <span className={`text-sm font-medium px-4 py-2 rounded-full animate-in fade-in zoom-in duration-300 shadow-sm ${statusMessage.includes('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
              {statusMessage}
            </span>
          )}
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium text-gray-600 mb-1">No customers yet</p>
            <p className="text-sm">When users register, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-gray-50 shadow-sm border-b border-gray-100">
                <tr className="text-gray-500 text-sm">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Phone</th>
                  <th className="px-6 py-4 font-medium text-center">Total Orders</th>
                  <th className="px-6 py-4 font-medium text-center">Custom Requests</th>
                  <th className="px-6 py-4 font-medium">Joined Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.email}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.phone || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold text-xs border border-blue-100">
                        {customer._count.orders}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-bold text-xs border border-purple-100">
                        {customer._count.customRequests}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(customer.id, customer.name)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors inline-flex items-center gap-1 border border-transparent hover:border-red-100"
                        title="Delete Customer"
                      >
                        <Trash2 size={16} />
                        <span className="text-xs font-medium">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
