import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BillTypeManager from "./BillTypeManager";

export default async function BillTypesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const billTypes = await prisma.billType.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Bill Types</h1>
      <BillTypeManager billTypes={JSON.parse(JSON.stringify(billTypes))} />
    </div>
  );
}
