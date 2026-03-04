import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const billTypes = await prisma.billType.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(billTypes);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, icon } = await request.json();

  const billType = await prisma.billType.create({
    data: { name, icon },
  });

  return NextResponse.json(billType, { status: 201 });
}
