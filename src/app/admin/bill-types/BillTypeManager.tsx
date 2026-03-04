"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface BillType {
  id: string;
  name: string;
  icon: string | null;
}

interface BillTypeManagerProps {
  billTypes: BillType[];
}

export default function BillTypeManager({ billTypes }: BillTypeManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bill-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon: icon || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create bill type");
      }

      setName("");
      setIcon("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bill type?")) return;

    try {
      const res = await fetch(`/api/bill-types?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete bill type");
      router.refresh();
    } catch {
      alert("Failed to delete bill type");
    }
  };

  return (
    <div>
      {/* Add Bill Type Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Bill Type</h2>
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="e.g. Electricity"
            />
          </div>
          <div className="w-24">
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="⚡"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      {/* Bill Types List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {billTypes.map((bt) => (
          <div key={bt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{bt.icon || "📄"}</span>
              <span className="font-medium text-gray-900">{bt.name}</span>
            </div>
            <button
              onClick={() => handleDelete(bt.id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {billTypes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">📋</p>
          <p>No bill types yet. Add your first bill type above.</p>
        </div>
      )}
    </div>
  );
}
