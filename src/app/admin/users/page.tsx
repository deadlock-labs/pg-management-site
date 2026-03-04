import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UserManager from "./UserManager";

export default async function UsersPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const users = await prisma.user.findMany({
    include: {
      roomOccupants: {
        where: { isActive: true },
        include: { room: { select: { name: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-stripe-text">User Management</h1>
        <p className="text-[13px] text-stripe-text-secondary mt-1">Manage user accounts and roles</p>
      </div>
      <UserManager users={JSON.parse(JSON.stringify(users))} />
    </div>
  );
}
