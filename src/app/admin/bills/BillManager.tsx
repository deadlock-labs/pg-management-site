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
        <p className="text-gray-500">{bills.length} bill(s)</p>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          + Create Bill
        </button>
      </div>

      {/* Bill Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Bill</h2>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill Type</label>
                <select
                  value={billTypeId}
                  onChange={(e) => setBillTypeId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  min={0}
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              {selectedRoom && selectedRoom.occupants.length > 0 && amount > 0 && (
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-sm text-indigo-700 font-medium">Split Preview</p>
                  <p className="text-sm text-indigo-600 mt-1">
                    ₹{amount.toFixed(2)} ÷ {selectedRoom.occupants.length} occupant(s) = ₹{splitAmount.toFixed(2)} each
                  </p>
                  <ul className="mt-2 space-y-1">
                    {selectedRoom.occupants.map((occ) => (
                      <li key={occ.id} className="text-xs text-indigo-500">
                        • {occ.user.name || occ.user.email}: ₹{splitAmount.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="e.g. January electricity bill"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (optional)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {loading ? "Creating..." : "Create Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bills List */}
      <div className="space-y-4">
        {bills.map((bill) => (
          <div key={bill.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{bill.billType.icon || "📄"}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {bill.billType.name} — {bill.room.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ₹{bill.amount.toFixed(2)}
                    {bill.description && ` • ${bill.description}`}
                    {bill.dueDate && ` • Due: ${new Date(bill.dueDate).toLocaleDateString()}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created: {new Date(bill.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedBill(expandedBill === bill.id ? null : bill.id)}
                  className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                >
                  {expandedBill === bill.id ? "Hide" : "Details"}
                </button>
                <button
                  onClick={() => handleDelete(bill.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </div>

            {expandedBill === bill.id && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Bill Shares</h4>
                {bill.billShares.length === 0 ? (
                  <p className="text-sm text-gray-400">No shares</p>
                ) : (
                  <div className="space-y-2">
                    {bill.billShares.map((share) => (
                      <div key={share.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-sm text-gray-700">
                          {share.user.name || share.user.email}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900">
                            ₹{share.amount.toFixed(2)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${share.isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
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
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">📄</p>
          <p>No bills yet. Create your first bill to get started.</p>
        </div>
      )}
    </div>
  );
}
