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
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-stripe-text">Bill Types</h1>
        <p className="text-[13px] text-stripe-text-secondary mt-1">Define categories for your bills</p>
      </div>
      <BillTypeManager billTypes={JSON.parse(JSON.stringify(billTypes))} />
    </div>
  );
}
