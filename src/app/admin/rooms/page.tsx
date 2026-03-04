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
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-stripe-text">Room Management</h1>
        <p className="text-[13px] text-stripe-text-secondary mt-1">Create, edit, and manage rooms and occupants</p>
      </div>
      <RoomManager
        rooms={JSON.parse(JSON.stringify(rooms))}
        users={JSON.parse(JSON.stringify(users))}
      />
    </div>
  );
}
