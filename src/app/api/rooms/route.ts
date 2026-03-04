import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rooms = await prisma.room.findMany({
    include: {
      _count: {
        select: { occupants: { where: { isActive: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(rooms);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, floor, capacity, rentAmount } = await request.json();

  const room = await prisma.room.create({
    data: { name, floor, capacity, rentAmount },
  });

  return NextResponse.json(room, { status: 201 });
}
