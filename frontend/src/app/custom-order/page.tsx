import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import CustomOrderForm from "@/components/CustomOrderForm";

export default async function CustomOrderPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login?callbackUrl=/custom-order");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10">
          <h1 className="text-3xl font-bold text-secondary mb-2">Request a Custom Bag</h1>
          <p className="text-gray-500 mb-8">Describe your dream bag in detail, upload a reference image, and our master artisans will handcraft it just for you.</p>
          
          <CustomOrderForm />
        </div>
      </div>
    </div>
  );
}
