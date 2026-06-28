import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
import { sendOrderConfirmationEmail } from '@/lib/sendEmail';

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

    const body = await req.json();
    const { session_id, items, total, shippingData } = body;

    if (!session_id || !items) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // Verify the payment session with Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Save order in database
    const newOrder = await prisma.order.create({
      data: {
        userId: (session.user as any).id,
        total,
        status: 'Processing',
        shippingName: shippingData?.name || 'Unknown',
        shippingAddress: shippingData?.address || 'Unknown',
        shippingCity: shippingData?.city || 'Unknown',
        shippingPhone: shippingData?.phone || 'Unknown',
        items: {
          create: items.map((item: any) => ({
            productId: item.id || item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    // Send the professional Order Confirmation email asynchronously
    const customerEmail = (session.user as any).email || shippingData?.email;
    if (customerEmail) {
      sendOrderConfirmationEmail(customerEmail, newOrder.id, newOrder.total);
    }

    return NextResponse.json({ success: true, order: newOrder }, { status: 200 });
  } catch (error: any) {
    console.error('Order verification failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
