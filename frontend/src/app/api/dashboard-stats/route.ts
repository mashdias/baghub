import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const [totalRevenueResult, totalOrders, pendingCustom, totalCustomers] = await Promise.all([
      prisma.order.aggregate({
        _sum: {
          total: true
        }
      }),
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: 'Pending Custom'
        }
      }),
      prisma.user.count({
        where: {
          role: 'customer'
        }
      })
    ]);

    return NextResponse.json({
      revenue: totalRevenueResult._sum.total || 0,
      totalOrders,
      pendingCustom,
      totalCustomers
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
