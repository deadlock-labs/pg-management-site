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

    const stats = [
      {
        label: "Total Rooms", value: totalRooms, href: "/admin/rooms",
        icon: <svg className="w-5 h-5 text-stripe-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
      },
      {
        label: "Total Users", value: totalUsers, href: "/admin/users",
        icon: <svg className="w-5 h-5 text-stripe-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
      },
      {
        label: "Total Bills", value: totalBills, href: "/admin/bills",
        icon: <svg className="w-5 h-5 text-stripe-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
      },
      {
        label: "Pending Payments", value: pendingPayments, href: "/admin/bills",
        icon: <svg className="w-5 h-5 text-stripe-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      },
    ];

    const quickActions = [
      {
        label: "Manage Rooms", href: "/admin/rooms",
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
      },
      {
        label: "Manage Bills", href: "/admin/bills",
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
      },
      {
        label: "Manage Users", href: "/admin/users",
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
      },
    ];

    return (
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-[22px] font-semibold text-stripe-text">Welcome back, {session.user.name || "Admin"}</h1>
          <p className="text-[13px] text-stripe-text-secondary mt-1">Here&apos;s an overview of your property</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-stripe-card rounded-lg border border-stripe-border p-5 hover:border-stripe-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-stripe-text-secondary">{stat.label}</p>
                  <p className="text-[22px] font-semibold text-stripe-text mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-stripe-primary-light flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-stripe-card rounded-lg border border-stripe-border p-5">
            <h2 className="text-[15px] font-semibold text-stripe-text mb-4">Quick Actions</h2>
            <div className="space-y-1">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-stripe-text rounded-lg hover:bg-stripe-bg transition-colors"
                >
                  <span className="text-stripe-text-secondary">{action.icon}</span>
                  {action.label}
                </Link>
              ))}
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
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-stripe-text">Welcome back, {session.user.name || "User"}</h1>
        <p className="text-[13px] text-stripe-text-secondary mt-1">View and manage your bills</p>
      </div>
      <DashboardBills
        billShares={JSON.parse(JSON.stringify(billShares))}
        userName={session.user.name || ""}
        userEmail={session.user.email || ""}
      />
    </div>
  );
}
