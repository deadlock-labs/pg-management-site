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

  const occupants = await prisma.roomOccupant.findMany({
    where: { roomId: id, isActive: true },
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
  });

  return NextResponse.json(occupants);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { userId } = await request.json();

  const occupant = await prisma.roomOccupant.create({
    data: { roomId: id, userId },
  });

  return NextResponse.json(occupant, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { userId } = await request.json();

  await prisma.roomOccupant.updateMany({
    where: { roomId: id, userId, isActive: true },
    data: { isActive: false, leftAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
