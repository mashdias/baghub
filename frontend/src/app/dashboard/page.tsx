import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from '@prisma/client';
import Image from "next/image";
import { CustomPayButton } from "@/components/CustomPayButton";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-100';
    case 'Approved': return 'text-purple-600 bg-purple-50 border-purple-100';
    case 'Completed': return 'text-green-600 bg-green-50 border-green-100';
    case 'Processing': return 'text-blue-600 bg-blue-50 border-blue-100';
    case 'Shipped': return 'text-green-600 bg-green-50 border-green-100';
    case 'Delivered': return 'text-gray-600 bg-gray-100 border-gray-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-100';
  }
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  const [orders, customRequests] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    }),
    prisma.customRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-secondary">
            Hello, {session.user.name?.split(' ')[0]}! Welcome back to Bag Hub.
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Manage your orders and track your custom requests here.</p>
        </div>

        <div className="space-y-12">
          {/* Order History */}
          <section>
            <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">📦</span>
              Order History
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {orders.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p className="font-medium text-gray-600 mb-1">You haven't placed any orders yet.</p>
                  <p className="text-sm">When you buy a bag, it will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr className="text-gray-500 text-sm">
                        <th className="px-6 py-4 font-medium">Order ID</th>
                        <th className="px-6 py-4 font-medium">Items</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium">Total Amount</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-primary">ORD-{order.id.split('-')[0].toUpperCase()}</td>
                          <td className="px-6 py-4">
                            {(order as any).items && (order as any).items.length > 0 ? (
                              <div className="text-gray-700 line-clamp-1 max-w-xs" title={(order as any).items.map((i:any) => `${i.quantity}x ${i.product?.name || 'Deleted Item'}`).join(', ')}>
                                {(order as any).items.map((i:any) => `${i.quantity}x ${i.product?.name || 'Deleted Item'}`).join(', ')}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Legacy Order</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-medium">Rs. {order.total.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border tracking-wide uppercase ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* Custom Requests */}
          <section>
            <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-sm">✨</span>
              Custom Bag Requests
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {customRequests.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p className="font-medium text-gray-600 mb-1">You don't have any custom requests.</p>
                  <p className="text-sm">Go to 'Custom Order' to request a unique bag design.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr className="text-gray-500 text-sm">
                        <th className="px-6 py-4 font-medium">Request ID</th>
                        <th className="px-6 py-4 font-medium w-16">Image</th>
                        <th className="px-6 py-4 font-medium w-1/3">Description</th>
                        <th className="px-6 py-4 font-medium w-64">Note & Quote</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {customRequests.map((req) => (
                        <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-secondary">
                            REQ-{req.id.split('-')[0].toUpperCase()}
                          </td>
                          <td className="px-6 py-4">
                            {req.referenceImageUrl ? (
                              <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                <Image src={req.referenceImageUrl} alt="Reference" fill className="object-cover" />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400 italic">
                                None
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-700 leading-relaxed text-sm line-clamp-3" title={req.description}>{req.description}</p>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="flex flex-col gap-1.5 w-full">
                              {req.quotedPrice ? (
                                <span className="font-bold text-primary text-sm">Rs. {req.quotedPrice.toLocaleString()}</span>
                              ) : (
                                <span className="text-gray-400 text-xs italic">Awaiting quote...</span>
                              )}
                              
                              {req.adminNote && (
                                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100">{req.adminNote}</p>
                              )}
                              
                              {req.quotedPrice && req.paymentStatus === 'Unpaid' && (
                                <CustomPayButton requestId={req.id} />
                              )}
                              
                              {req.paymentStatus === 'Paid' && (
                                <span className="text-xs font-bold text-green-600 flex items-center gap-1 mt-1 bg-green-50 px-2 py-1 rounded-md w-fit border border-green-100">
                                  ✅ Paid via Stripe
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap align-top">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border tracking-wide uppercase ${getStatusColor(req.status)}`}>
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
