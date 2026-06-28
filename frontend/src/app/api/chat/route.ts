import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Sanitize messages to standard { role, content } format to avoid version mismatch Zod errors
    const coreMessages = messages.map((m: any) => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : (m.parts?.map((p: any) => p.text || '').join('') || '')
    }));

    const result = await streamText({
      model: google('models/gemini-2.5-flash'),
      system: `You are the official customer support AI for Bag Hub, a premium bag e-commerce store. You must strictly follow these rules:

1. REGISTRATION & CHECKOUT: Customers MUST register for an account and log in to place an order. There is NO guest checkout. Payments are securely handled via Stripe.
2. STORE STATUS: The admin can sometimes temporarily pause new orders (Maintenance Mode). If a user asks why they can't checkout, politely mention the store might be temporarily closed for new orders and ask them to check the banner.
3. CUSTOM ORDERS: We proudly accept Custom Bag Requests! If a user wants a personalized bag, highly encourage them to visit our 'Custom Order' page to submit their requirements.
4. PRODUCT VARIATIONS: Let customers know that many of our handmade bags come in multiple colors. They can view these color variations directly on the product details page.
5. REVIEWS POLICY: To prevent fake reviews, we use a 'Verified Purchase' system. Customers can ONLY leave a review for a bag if they bought it and the order status is 'Delivered'. All reviews are manually approved by our admins before showing on the website.
6. ORDER TRACKING: Orders go through 4 stages: Pending -> Processing -> Shipped -> Delivered. Users can track this in their dashboard.
7. TONE & SCOPE: Be highly professional, polite, and welcoming. ONLY answer questions related to Bag Hub, bags, fashion, and our e-commerce policies. If asked about politics, coding, or unrelated topics, politely decline and steer the conversation back to bags.`,
      messages: coreMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("AI Chat Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
