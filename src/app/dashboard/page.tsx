import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DashboardBills from "./DashboardBills";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const isAdmin = session.user.role === "admin";

  if (isAdmin) {
    const [totalRooms, totalUsers, totalBills, pendingPayments] =
      await Promise.all([
        prisma.room.count(),
        prisma.user.count(),
        prisma.bill.count(),
        prisma.billShare.count({ where: { isPaid: false } }),
      ]);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Welcome back, {session.user.name || "Admin"} 👋
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Rooms", value: totalRooms, icon: "🏠", href: "/admin/rooms" },
            { label: "Total Users", value: totalUsers, icon: "👥", href: "/admin/users" },
            { label: "Total Bills", value: totalBills, icon: "📄", href: "/admin/bills" },
            { label: "Pending Payments", value: pendingPayments, icon: "⏳", href: "/admin/bills" },
          ].map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/admin/rooms" className="block w-full text-left px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-medium">
                🏠 Manage Rooms
              </Link>
              <Link href="/admin/bills" className="block w-full text-left px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-medium">
                📄 Manage Bills
              </Link>
              <Link href="/admin/users" className="block w-full text-left px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-medium">
                👥 Manage Users
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User dashboard
  const billShares = await prisma.billShare.findMany({
    where: { userId: session.user.id },
    include: {
      bill: {
        include: {
          billType: true,
          room: true,
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Welcome back, {session.user.name || "User"} 👋
      </h1>
      <DashboardBills
        billShares={JSON.parse(JSON.stringify(billShares))}
        userName={session.user.name || ""}
        userEmail={session.user.email || ""}
      />
    </div>
  );
}
