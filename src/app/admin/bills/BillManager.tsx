"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface BillType {
  id: string;
  name: string;
  icon: string | null;
}

interface Occupant {
  id: string;
  userId: string;
  user: User;
}

interface Room {
  id: string;
  name: string;
  occupants: Occupant[];
}

interface BillShare {
  id: string;
  amount: number;
  isPaid: boolean;
  user: User;
  payment: { status: string } | null;
}

interface Bill {
  id: string;
  amount: number;
  description: string | null;
  dueDate: string | null;
  createdAt: string;
  billType: BillType;
  room: { id: string; name: string };
  billShares: BillShare[];
}

interface BillManagerProps {
  bills: Bill[];
  rooms: Room[];
  billTypes: BillType[];
  users: User[];
}

export default function BillManager({ bills, rooms, billTypes }: BillManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedBill, setExpandedBill] = useState<string | null>(null);

  // Form state
  const [billTypeId, setBillTypeId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const selectedRoom = rooms.find((r) => r.id === roomId);
  const splitAmount = selectedRoom && selectedRoom.occupants.length > 0
    ? amount / selectedRoom.occupants.length
    : 0;

  const resetForm = () => {
    setBillTypeId("");
    setRoomId("");
    setAmount(0);
    setDescription("");
    setDueDate("");
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billTypeId,
          roomId,
          amount,
          description: description || undefined,
          dueDate: dueDate || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create bill");
      }

      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (billId: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;

    try {
      const res = await fetch(`/api/bills/${billId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete bill");
      router.refresh();
    } catch {
      alert("Failed to delete bill");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-[13px] text-stripe-text-secondary">{bills.length} bill(s)</p>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-stripe-primary text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-stripe-primary-hover transition-colors shadow-sm"
        >
          + Create Bill
        </button>
      </div>

      {/* Bill Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stripe-card rounded-lg border border-stripe-border p-6 w-full max-w-md shadow-lg">
            <h2 className="text-[15px] font-semibold text-stripe-text mb-4">Create Bill</h2>
            {error && (
              <div className="bg-stripe-danger-light text-stripe-danger text-[13px] p-3 rounded-lg mb-4">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-stripe-text mb-1">Bill Type</label>
                <select
                  value={billTypeId}
                  onChange={(e) => setBillTypeId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-[14px] border border-stripe-border rounded-lg focus:ring-2 focus:ring-stripe-primary/20 focus:border-stripe-primary outline-none transition-colors bg-white"
                >
                  <option value="">Select bill type...</option>
                  {billTypes.map((bt) => (
                    <option key={bt.id} value={bt.id}>
                      {bt.icon || "📄"} {bt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-stripe-text mb-1">Room</label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-[14px] border border-stripe-border rounded-lg focus:ring-2 focus:ring-stripe-primary/20 focus:border-stripe-primary outline-none transition-colors bg-white"
                >
                  <option value="">Select room...</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.occupants.length} occupants)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-stripe-text mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  min={0}
                  step="0.01"
                  required
                  className="w-full px-3 py-2 text-[14px] border border-stripe-border rounded-lg focus:ring-2 focus:ring-stripe-primary/20 focus:border-stripe-primary outline-none transition-colors bg-white"
                />
              </div>

              {selectedRoom && selectedRoom.occupants.length > 0 && amount > 0 && (
                <div className="bg-stripe-primary-light p-3 rounded-lg border border-stripe-primary/10">
                  <p className="text-[13px] text-stripe-primary font-medium">Split Preview</p>
                  <p className="text-[13px] text-stripe-primary/80 mt-1">
                    ₹{amount.toFixed(2)} ÷ {selectedRoom.occupants.length} occupant(s) = ₹{splitAmount.toFixed(2)} each
                  </p>
                  <ul className="mt-2 space-y-1">
                    {selectedRoom.occupants.map((occ) => (
                      <li key={occ.id} className="text-[12px] text-stripe-primary/70">
                        • {occ.user.name || occ.user.email}: ₹{splitAmount.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-stripe-text mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-[14px] border border-stripe-border rounded-lg focus:ring-2 focus:ring-stripe-primary/20 focus:border-stripe-primary outline-none transition-colors bg-white"
                  placeholder="e.g. January electricity bill"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-stripe-text mb-1">Due Date (optional)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-[14px] border border-stripe-border rounded-lg focus:ring-2 focus:ring-stripe-primary/20 focus:border-stripe-primary outline-none transition-colors bg-white"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-[13px] font-medium text-stripe-text border border-stripe-border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-stripe-primary text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-stripe-primary-hover disabled:opacity-50 transition-colors shadow-sm"
                >
                  {loading ? "Creating..." : "Create Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bills List */}
      <div className="space-y-3">
        {bills.map((bill) => (
          <div key={bill.id} className="bg-stripe-card rounded-lg border border-stripe-border p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-stripe-primary-light flex items-center justify-center">
                  <svg className="w-4 h-4 text-stripe-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-stripe-text">
                    {bill.billType.name} — {bill.room.name}
                  </h3>
                  <p className="text-[13px] text-stripe-text-secondary">
                    ₹{bill.amount.toFixed(2)}
                    {bill.description && ` · ${bill.description}`}
                    {bill.dueDate && ` · Due: ${new Date(bill.dueDate).toLocaleDateString()}`}
                  </p>
                  <p className="text-[12px] text-stripe-text-secondary mt-0.5">
                    Created: {new Date(bill.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedBill(expandedBill === bill.id ? null : bill.id)}
                  className="px-3 py-1.5 text-[13px] font-medium text-stripe-primary hover:bg-stripe-primary-light rounded-lg transition-colors"
                >
                  {expandedBill === bill.id ? "Hide" : "Details"}
                </button>
                <button
                  onClick={() => handleDelete(bill.id)}
                  className="px-3 py-1.5 text-[13px] font-medium text-stripe-danger hover:bg-stripe-danger-light rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            {expandedBill === bill.id && (
              <div className="mt-4 border-t border-stripe-border pt-4">
                <h4 className="text-[13px] font-medium text-stripe-text mb-2">Bill Shares</h4>
                {bill.billShares.length === 0 ? (
                  <p className="text-[13px] text-stripe-text-secondary">No shares</p>
                ) : (
                  <div className="space-y-2">
                    {bill.billShares.map((share) => (
                      <div key={share.id} className="flex items-center justify-between bg-stripe-bg px-3 py-2 rounded-lg border border-stripe-border">
                        <span className="text-[14px] text-stripe-text">
                          {share.user.name || share.user.email}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[14px] font-medium text-stripe-text">
                            ₹{share.amount.toFixed(2)}
                          </span>
                          <span className={`text-[12px] px-2 py-0.5 rounded-full font-medium ${share.isPaid ? "bg-stripe-success-light text-stripe-success" : "bg-stripe-warning-light text-stripe-warning"}`}>
                            {share.isPaid ? "Paid" : "Pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {bills.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-10 h-10 text-stripe-text-secondary mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          <p className="text-[14px] text-stripe-text-secondary">No bills yet. Create your first bill to get started.</p>
        </div>
      )}
    </div>
  );
}
