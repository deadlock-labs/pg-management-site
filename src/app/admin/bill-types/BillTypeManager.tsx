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
      <div className="bg-stripe-card rounded-lg border border-stripe-border p-5 mb-8">
        <h2 className="text-[15px] font-semibold text-stripe-text mb-4">Add Bill Type</h2>
        {error && (
          <div className="bg-stripe-danger-light text-stripe-danger text-[13px] p-3 rounded-lg mb-4">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[13px] font-medium text-stripe-text mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 text-[14px] border border-stripe-border rounded-lg focus:ring-2 focus:ring-stripe-primary/20 focus:border-stripe-primary outline-none transition-colors bg-white"
              placeholder="e.g. Electricity"
            />
          </div>
          <div className="w-24">
            <label className="block text-[13px] font-medium text-stripe-text mb-1">Icon</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2 text-[14px] border border-stripe-border rounded-lg focus:ring-2 focus:ring-stripe-primary/20 focus:border-stripe-primary outline-none transition-colors bg-white"
              placeholder="⚡"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-stripe-primary text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-stripe-primary-hover disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      {/* Bill Types List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {billTypes.map((bt) => (
          <div key={bt.id} className="bg-stripe-card rounded-lg border border-stripe-border p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-stripe-primary-light flex items-center justify-center text-[14px]">
                {bt.icon || "📄"}
              </div>
              <span className="text-[14px] font-medium text-stripe-text">{bt.name}</span>
            </div>
            <button
              onClick={() => handleDelete(bt.id)}
              className="text-[13px] font-medium text-stripe-danger hover:text-stripe-danger"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {billTypes.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-10 h-10 text-stripe-text-secondary mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
          <p className="text-[14px] text-stripe-text-secondary">No bill types yet. Add your first bill type above.</p>
        </div>
      )}
    </div>
  );
}
