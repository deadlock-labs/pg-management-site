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

  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      occupants: {
        where: { isActive: true },
        include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      },
    },
  });

  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  return NextResponse.json(room);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.floor !== undefined) data.floor = body.floor;
  if (body.capacity !== undefined) data.capacity = body.capacity;
  if (body.rentAmount !== undefined) data.rentAmount = body.rentAmount;

  const room = await prisma.room.update({
    where: { id },
    data,
  });

  return NextResponse.json(room);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  await prisma.room.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
