"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, X, Edit2 } from "lucide-react";

type CustomRequest = {
  id: string;
  description: string;
  referenceImageUrl: string | null;
  status: string;
  quotedPrice: number | null;
  adminNote: string | null;
  paymentStatus: string;
  createdAt: string;
  shippingName?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPhone?: string;
  user: {
    name: string;
    email: string;
  };
};

const statusOptions = ['Pending', 'In Progress', 'Approved', 'Completed'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-100';
    case 'Approved': return 'text-purple-600 bg-purple-50 border-purple-100';
    case 'Completed': return 'text-green-600 bg-green-50 border-green-100';
    default: return 'text-gray-600 bg-gray-50 border-gray-100';
  }
};

export default function AdminCustomRequestsPage() {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);

  const [editForm, setEditForm] = useState({
    status: '',
    quotedPrice: '',
    adminNote: '',
    paymentStatus: ''
  });

  useEffect(() => {
    fetch('/api/custom-requests')
      .then(res => res.json())
      .then(data => {
        setRequests(data.requests || []);
        setLoading(false);
      });
  }, []);

  const handleEditClick = (req: CustomRequest) => {
    setSelectedRequest(req);
    setEditForm({
      status: req.status,
      quotedPrice: req.quotedPrice?.toString() || '',
      adminNote: req.adminNote || '',
      paymentStatus: req.paymentStatus || 'Unpaid'
    });
  };

  const handleSave = async () => {
    if (!selectedRequest) return;
    try {
      const response = await fetch('/api/custom-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedRequest.id, ...editForm })
      });

      if (!response.ok) throw new Error('Failed to update status');

      const data = await response.json();

      setRequests(requests.map(req => 
        req.id === selectedRequest.id ? data.request : req
      ));
      
      setStatusMessage("Request updated successfully!");
      setSelectedRequest(null);
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      console.error("Update failed", error);
      setStatusMessage("Error: Could not update request");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const filteredRequests = requests.filter(req => {
    const requestIdStr = `REQ-${req.id.split('-')[0].toUpperCase()}`;
    const customerName = req.user?.name || "Unknown";
    const searchLower = searchQuery.toLowerCase();
    
    return requestIdStr.toLowerCase().includes(searchLower) || 
           customerName.toLowerCase().includes(searchLower);
  });

  if (loading) return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-gray-500 font-medium">Loading custom requests...</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Custom Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Review custom bag designs submitted by customers.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {statusMessage && (
            <span className={`text-sm font-medium px-4 py-2 rounded-full animate-in fade-in zoom-in duration-300 shadow-sm whitespace-nowrap ${statusMessage.includes('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
              {statusMessage}
            </span>
          )}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Request ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium text-gray-600 mb-1">No custom requests yet</p>
            <p className="text-sm">When customers submit custom designs, they will appear here.</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium text-gray-600 mb-1">No requests match your search "{searchQuery}"</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-gray-50 shadow-sm border-b border-gray-100">
                <tr className="text-gray-500 text-sm">
                  <th className="px-6 py-4 font-medium">Request ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Image</th>
                  <th className="px-6 py-4 font-medium w-1/4">Description</th>
                  <th className="px-6 py-4 font-medium">Note & Quote</th>
                  <th className="px-6 py-4 font-medium">Status & Date</th>
                  <th className="px-6 py-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-primary">
                      REQ-{req.id.split('-')[0].toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{req.user?.name}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{req.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {req.referenceImageUrl ? (
                        <a href={req.referenceImageUrl} target="_blank" rel="noreferrer" className="relative block w-14 h-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:opacity-80 transition-opacity">
                          <Image src={req.referenceImageUrl} alt="Reference" fill className="object-cover" />
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-xs bg-gray-100 px-3 py-1.5 rounded-md">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 leading-relaxed line-clamp-2" title={req.description}>{req.description}</p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-1.5">
                        {req.quotedPrice ? (
                          <span className="font-bold text-primary text-sm">Rs. {req.quotedPrice.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">No quote</span>
                        )}
                        {req.adminNote && (
                          <p className="text-xs text-gray-600 bg-gray-50 p-1.5 rounded-md border border-gray-100 line-clamp-1" title={req.adminNote}>{req.adminNote}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide inline-block mb-2 ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                      <div className="text-gray-500 text-xs">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-center">
                      <button 
                        onClick={() => handleEditClick(req)} 
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary text-white hover:bg-secondary-dark rounded-md transition-colors text-xs font-medium shadow-sm"
                      >
                        <Edit2 size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Quote Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold text-secondary">Review Custom Request</h3>
                <p className="text-sm text-gray-500 mt-1">
                  ID: REQ-{selectedRequest.id.split('-')[0].toUpperCase()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex flex-col md:flex-row gap-8">
              {/* Left Column: Request Info */}
              <div className="flex-1 space-y-6">
                <section>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b pb-2">Customer Details</h4>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Account Info</p>
                      <p className="font-medium text-gray-900">{selectedRequest.user?.name}</p>
                      <p className="text-gray-500 text-sm">{selectedRequest.user?.email}</p>
                    </div>
                    
                    {(selectedRequest.shippingName || selectedRequest.shippingPhone) && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-0.5">Shipping Details</p>
                        <p className="font-medium text-gray-900">{selectedRequest.shippingName}</p>
                        <p className="text-gray-600 text-sm">{selectedRequest.shippingPhone}</p>
                        <p className="text-gray-600 text-sm mt-0.5">{selectedRequest.shippingAddress}</p>
                        <p className="text-gray-600 text-sm">{selectedRequest.shippingCity}</p>
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b pb-2">Request Details</h4>
                  <div className="space-y-4">
                    {selectedRequest.referenceImageUrl && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Reference Image</p>
                        <a href={selectedRequest.referenceImageUrl} target="_blank" rel="noreferrer" className="relative block w-full h-48 rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:opacity-90 transition-opacity">
                          <Image src={selectedRequest.referenceImageUrl} alt="Reference" fill className="object-cover" />
                        </a>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Description</p>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedRequest.description}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Admin Actions */}
              <div className="w-full md:w-80 shrink-0">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm sticky top-0">
                  <h4 className="font-bold text-secondary mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">✍️</span>
                    Admin Actions
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Price Quote (Rs.)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 15000" 
                        value={editForm.quotedPrice} 
                        onChange={e => setEditForm({...editForm, quotedPrice: e.target.value})} 
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Note to Customer</label>
                      <textarea 
                        placeholder="Explain the quote, ask for details..." 
                        rows={3} 
                        value={editForm.adminNote} 
                        onChange={e => setEditForm({...editForm, adminNote: e.target.value})} 
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none transition-all" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                      <select 
                        value={editForm.status} 
                        onChange={e => setEditForm({...editForm, status: e.target.value})} 
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 outline-none cursor-pointer appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%20%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%234B5563%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:calc(100%-0.5rem)_center]"
                      >
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3">
                      <button 
                        onClick={() => setSelectedRequest(null)} 
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSave} 
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
