import { PrismaClient } from '@prisma/client';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function ProductPage({ params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
      },
      include: {
        variants: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } }
        }
      },
    });

    if (!product || !product.isActive) {
      return notFound();
    }

    // We can safely cast because the shape matches what the Client Component expects
    return <ProductDetailClient product={product as any} />;
  } catch (error) {
    console.error("Error fetching product:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500">Failed to load product details.</h1>
      </div>
    );
  }
}
