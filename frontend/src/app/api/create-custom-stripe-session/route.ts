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

    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is missing' }, { status: 400 });
    }

    const customRequest = await prisma.customRequest.findUnique({
      where: { id: requestId }
    });

    if (!customRequest || customRequest.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (!customRequest.quotedPrice || customRequest.paymentStatus === 'Paid') {
      return NextResponse.json({ error: 'Invalid request state for payment' }, { status: 400 });
    }

    let absoluteImageUrl = customRequest.referenceImageUrl;
    const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;
    
    if (absoluteImageUrl && absoluteImageUrl.startsWith('/')) {
      absoluteImageUrl = `${baseUrl}${absoluteImageUrl}`;
    }

    const line_items = [{
      price_data: {
        currency: 'lkr',
        product_data: {
          name: `Custom Bag Request: ${customRequest.id.substring(0, 8)}`,
          description: customRequest.description.substring(0, 200),
          images: absoluteImageUrl ? [absoluteImageUrl] : [],
        },
        unit_amount: Math.round(customRequest.quotedPrice * 100),
      },
      quantity: 1,
    }];

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${baseUrl}/checkout/custom-success?session_id={CHECKOUT_SESSION_ID}&request_id=${requestId}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
    });

    return NextResponse.json({ id: stripeSession.id, url: stripeSession.url }, { status: 200 });
  } catch (error: any) {
    console.error('Stripe custom session failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
