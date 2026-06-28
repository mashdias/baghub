import OrdersTable from "@/components/OrdersTable";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">Orders Management</h1>
        <p className="text-gray-500 text-sm mt-1">View and process customer orders.</p>
      </div>

      <div className="w-full">
        <OrdersTable />
      </div>
    </div>
  );
}
