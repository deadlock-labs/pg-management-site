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
        <h2 className="text-[15px] font-semibold text-stripe-text mb-4">
          Pending Bills ({unpaid.length})
        </h2>
        {unpaid.length === 0 ? (
          <div className="bg-stripe-card rounded-lg border border-stripe-border p-8 text-center">
            <svg className="w-8 h-8 text-stripe-success mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-[14px] text-stripe-text-secondary">No pending bills! You&apos;re all caught up.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpaid.map((bs) => (
              <div
                key={bs.id}
                className="bg-stripe-card rounded-lg border border-stripe-border p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-stripe-warning-light flex items-center justify-center">
                    <svg className="w-4 h-4 text-stripe-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                  </div>
                  <span className="text-[12px] bg-stripe-warning-light text-stripe-warning px-2 py-0.5 rounded-full font-medium">
                    Unpaid
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold text-stripe-text">
                  {bs.bill.billType.name}
                </h3>
                <p className="text-[13px] text-stripe-text-secondary mt-1">{bs.bill.room.name}</p>
                {bs.bill.description && (
                  <p className="text-[13px] text-stripe-text-secondary mt-1">{bs.bill.description}</p>
                )}
                {bs.bill.dueDate && (
                  <p className="text-[12px] text-stripe-text-secondary mt-1">
                    Due: {new Date(bs.bill.dueDate).toLocaleDateString()}
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-stripe-border flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-stripe-text">
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
          <h2 className="text-[15px] font-semibold text-stripe-text mb-4">
            Paid Bills ({paid.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paid.map((bs) => (
              <div
                key={bs.id}
                className="bg-stripe-card rounded-lg border border-stripe-border p-5 opacity-80"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-stripe-success-light flex items-center justify-center">
                    <svg className="w-4 h-4 text-stripe-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-[12px] bg-stripe-success-light text-stripe-success px-2 py-0.5 rounded-full font-medium">
                    Paid
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold text-stripe-text">
                  {bs.bill.billType.name}
                </h3>
                <p className="text-[13px] text-stripe-text-secondary mt-1">{bs.bill.room.name}</p>
                <div className="mt-4 pt-4 border-t border-stripe-border flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-stripe-text">
                    ₹{bs.amount.toFixed(2)}
                  </span>
                  {bs.paidAt && (
                    <span className="text-[12px] text-stripe-text-secondary">
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
