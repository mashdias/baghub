import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper: get or create the singleton settings row
async function getOrCreateSettings() {
  return prisma.storeSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton', isStoreOpen: true, storeName: 'Bag Hub', contactEmail: '' },
  });
}

export async function GET() {
  try {
    const settings = await getOrCreateSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { isStoreOpen, storeName, contactEmail } = body;

    const updated = await prisma.storeSettings.upsert({
      where: { id: 'singleton' },
      update: {
        ...(isStoreOpen !== undefined && { isStoreOpen }),
        ...(storeName !== undefined && { storeName }),
        ...(contactEmail !== undefined && { contactEmail }),
      },
      create: {
        id: 'singleton',
        isStoreOpen: isStoreOpen ?? true,
        storeName: storeName ?? 'Bag Hub',
        contactEmail: contactEmail ?? '',
      },
    });

    return NextResponse.json({ settings: updated });
  } catch (error) {
    console.error('Settings PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
