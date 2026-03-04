import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Razorpay from "razorpay";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { billShareId } = await request.json();

  const billShare = await prisma.billShare.findUnique({
    where: { id: billShareId },
  });

  if (!billShare) return NextResponse.json({ error: "Bill share not found" }, { status: 404 });
  if (billShare.isPaid) return NextResponse.json({ error: "Already paid" }, { status: 400 });

  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const order = await instance.orders.create({
    amount: Math.round(billShare.amount * 100),
    currency: "INR",
    receipt: billShareId,
  });

  const payment = await prisma.payment.create({
    data: {
      billShareId,
      userId: session.user.id!,
      amount: billShare.amount,
      razorpayOrderId: order.id,
      status: "pending",
    },
  });

  return NextResponse.json({ order, payment }, { status: 201 });
}
