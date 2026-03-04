import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const bill = await prisma.bill.findUnique({
    where: { id },
    include: {
      billType: true,
      billShares: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!bill) return NextResponse.json({ error: "Bill not found" }, { status: 404 });

  if (session.user.role !== "admin") {
    const hasShare = bill.billShares.some((s: { userId: string }) => s.userId === session.user.id);
    if (!hasShare) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(bill);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  await prisma.bill.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
