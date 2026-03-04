import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (
    expectedSignature.length !== razorpay_signature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    )
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({
    where: { razorpayOrderId: razorpay_order_id },
  });

  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  if (payment.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "completed",
        razorpayPaymentId: razorpay_payment_id,
      },
    }),
    prisma.billShare.update({
      where: { id: payment.billShareId },
      data: { isPaid: true, paidAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true });
}
