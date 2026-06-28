import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { description, referenceImageUrl } = await req.json();

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const newRequest = await prisma.customRequest.create({
      data: {
        userId: (session.user as any).id,
        description,
        referenceImageUrl: referenceImageUrl || null,
      }
    });

    return NextResponse.json({ request: newRequest }, { status: 201 });
  } catch (error) {
    console.error('Error creating custom request:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await prisma.customRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error('Error fetching custom requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, quotedPrice, adminNote, paymentStatus } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Request ID and status are required' }, { status: 400 });
    }

    const updatedRequest = await prisma.customRequest.update({
      where: { id },
      data: { 
        status,
        ...(quotedPrice !== undefined && { quotedPrice: quotedPrice === "" ? null : parseFloat(quotedPrice) }),
        ...(adminNote !== undefined && { adminNote }),
        ...(paymentStatus !== undefined && { paymentStatus })
      }
    });

    return NextResponse.json({ request: updatedRequest }, { status: 200 });
  } catch (error) {
    console.error('Error updating custom request status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
