import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, comment, imageUrl } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get user id from session email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user has purchased this product AND the order is delivered.
    // Check both legacy Order.productId and OrderItem.productId
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
        status: "Delivered",
        OR: [
          { productId: productId },
          { items: { some: { productId: productId } } }
        ]
      }
    });

    if (orders.length === 0) {
      return NextResponse.json(
        { error: "You can only review products you have purchased and received." },
        { status: 403 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment,
        imageUrl,
        userId: user.id,
        productId,
        isApproved: false // Admin must approve
      }
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
