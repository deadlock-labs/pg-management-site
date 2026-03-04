import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RoomManager from "./RoomManager";

export default async function RoomsPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const [rooms, users] = await Promise.all([
    prisma.room.findMany({
      include: {
        occupants: {
          where: { isActive: true },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Room Management</h1>
      <RoomManager
        rooms={JSON.parse(JSON.stringify(rooms))}
        users={JSON.parse(JSON.stringify(users))}
      />
    </div>
  );
}
