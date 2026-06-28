import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
import { redirect } from "next/navigation";
import CustomCheckoutClient from "./CustomCheckoutClient";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function CustomRequestCheckoutPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const requestId = params.id;

  const customRequest = await prisma.customRequest.findUnique({
    where: { id: requestId }
  });

  if (!customRequest || customRequest.userId !== userId) {
    redirect("/dashboard");
  }

  if (customRequest.paymentStatus === 'Paid' || !customRequest.quotedPrice) {
    redirect("/dashboard");
  }

  return <CustomCheckoutClient customRequest={customRequest} />;
}
