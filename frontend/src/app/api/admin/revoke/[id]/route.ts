import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Safety check: prevent an admin from revoking their own access
    if ((session.user as any).id === id) {
      return NextResponse.json(
        { error: 'You cannot revoke your own admin privileges.' },
        { status: 403 }
      );
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.role !== 'admin') {
      return NextResponse.json({ error: 'Admin user not found.' }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: 'customer' },
    });

    return NextResponse.json({ success: true, user: updated }, { status: 200 });
  } catch (error) {
    console.error('Revoke admin error:', error);
    return NextResponse.json({ error: 'Failed to revoke admin privileges.' }, { status: 500 });
  }
}
