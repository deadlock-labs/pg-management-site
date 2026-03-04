import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BillManager from "./BillManager";

export default async function BillsPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const [bills, rooms, billTypes, users] = await Promise.all([
    prisma.bill.findMany({
      include: {
        billType: true,
        room: true,
        billShares: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            payment: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.room.findMany({
      include: {
        occupants: {
          where: { isActive: true },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.billType.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Bill Management</h1>
      <BillManager
        bills={JSON.parse(JSON.stringify(bills))}
        rooms={JSON.parse(JSON.stringify(rooms))}
        billTypes={JSON.parse(JSON.stringify(billTypes))}
        users={JSON.parse(JSON.stringify(users))}
      />
    </div>
  );
}
