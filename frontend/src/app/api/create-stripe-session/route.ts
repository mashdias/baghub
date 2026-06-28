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

    // Guard: reject if store is closed
    const storeSettings = await prisma.storeSettings.findUnique({ where: { id: 'singleton' } });
    if (storeSettings && !storeSettings.isStoreOpen) {
      return NextResponse.json({ error: 'Store is currently closed and not accepting new orders.' }, { status: 503 });
    }

    const body = await req.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Use NEXTAUTH_URL or fallback to headers
    const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;

    const line_items = await Promise.all(items.map(async (item: any) => {
      // 🚨 Security Fix: Fetch product from DB to get the authentic price
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!product) {
        throw new Error(`Product not found: ${item.id}`);
      }

      let absoluteImageUrl = item.imageUrl;
      if (absoluteImageUrl && absoluteImageUrl.startsWith('/')) {
        absoluteImageUrl = `${baseUrl}${absoluteImageUrl}`;
      }

      return {
        price_data: {
          currency: 'lkr',
          product_data: {
            name: product.name, // Use name from DB
            images: absoluteImageUrl ? [absoluteImageUrl] : [],
          },
          unit_amount: Math.round(product.price * 100), // Use authentic price from DB!
        },
        quantity: item.quantity,
      };
    }));

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
    });

    return NextResponse.json({ id: stripeSession.id, url: stripeSession.url }, { status: 200 });
  } catch (error: any) {
    console.error('Stripe session creation failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
