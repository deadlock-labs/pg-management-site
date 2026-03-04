import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendBillNotification } from "@/lib/email";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roomId = request.nextUrl.searchParams.get("roomId");

  if (session.user.role === "admin") {
    const bills = await prisma.bill.findMany({
      where: roomId ? { roomId } : undefined,
      include: { billType: true, room: true, billShares: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bills);
  }

  const bills = await prisma.bill.findMany({
    where: {
      ...(roomId ? { roomId } : {}),
      billShares: { some: { userId: session.user.id } },
    },
    include: {
      billType: true,
      room: true,
      billShares: { where: { userId: session.user.id } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bills);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { billTypeId, roomId, amount, description, dueDate } = await request.json();

  const [occupants, billType, room] = await Promise.all([
    prisma.roomOccupant.findMany({
      where: { roomId, isActive: true },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.billType.findUnique({ where: { id: billTypeId } }),
    prisma.room.findUnique({ where: { id: roomId } }),
  ]);

  if (!billType) return NextResponse.json({ error: "Bill type not found" }, { status: 404 });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (occupants.length === 0) return NextResponse.json({ error: "No active occupants in room" }, { status: 400 });

  const shareAmount = amount / occupants.length;

  const bill = await prisma.bill.create({
    data: {
      billTypeId,
      roomId,
      amount,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: session.user.id!,
      billShares: {
        create: occupants.map((o: { userId: string }) => ({
          userId: o.userId,
          amount: shareAmount,
        })),
      },
    },
    include: { billType: true, room: true, billShares: true },
  });

  // Send email notifications
  for (const occupant of occupants) {
    await sendBillNotification(
      occupant.user.email,
      occupant.user.name || "Resident",
      billType.name,
      shareAmount,
      room.name,
      description
    );
  }

  return NextResponse.json(bill, { status: 201 });
}
