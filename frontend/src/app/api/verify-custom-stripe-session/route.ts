import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id, request_id } = await req.json();

    if (!session_id || !request_id) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const updatedReq = await prisma.customRequest.update({
      where: { id: request_id },
      data: {
        paymentStatus: 'Paid',
        status: 'In Progress'
      }
    });

    return NextResponse.json({ success: true, request: updatedReq }, { status: 200 });
  } catch (error: any) {
    console.error('Custom Order verification failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
