"use client";

import PaymentButton from "@/components/PaymentButton";

interface BillShare {
  id: string;
  amount: number;
  isPaid: boolean;
  paidAt: string | null;
  bill: {
    id: string;
    amount: number;
    description: string | null;
    dueDate: string | null;
    billType: { name: string; icon: string | null };
    room: { name: string };
  };
  payment: { status: string } | null;
}

interface DashboardBillsProps {
  billShares: BillShare[];
  userName: string;
  userEmail: string;
}

export default function DashboardBills({ billShares, userName, userEmail }: DashboardBillsProps) {
  const unpaid = billShares.filter((bs) => !bs.isPaid);
  const paid = billShares.filter((bs) => bs.isPaid);

  return (
    <div className="space-y-8">
      {/* Unpaid Bills */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pending Bills ({unpaid.length})
        </h2>
        {unpaid.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            🎉 No pending bills! You&apos;re all caught up.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpaid.map((bs) => (
              <div
                key={bs.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{bs.bill.billType.icon || "📄"}</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                    Unpaid
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">
                  {bs.bill.billType.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{bs.bill.room.name}</p>
                {bs.bill.description && (
                  <p className="text-sm text-gray-400 mt-1">{bs.bill.description}</p>
                )}
                {bs.bill.dueDate && (
                  <p className="text-xs text-gray-400 mt-1">
                    Due: {new Date(bs.bill.dueDate).toLocaleDateString()}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    ₹{bs.amount.toFixed(2)}
                  </span>
                  <PaymentButton
                    billShareId={bs.id}
                    amount={bs.amount}
                    userName={userName}
                    userEmail={userEmail}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paid Bills */}
      {paid.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Paid Bills ({paid.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paid.map((bs) => (
              <div
                key={bs.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 opacity-75"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{bs.bill.billType.icon || "📄"}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    Paid
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">
                  {bs.bill.billType.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{bs.bill.room.name}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    ₹{bs.amount.toFixed(2)}
                  </span>
                  {bs.paidAt && (
                    <span className="text-xs text-gray-400">
                      {new Date(bs.paidAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
