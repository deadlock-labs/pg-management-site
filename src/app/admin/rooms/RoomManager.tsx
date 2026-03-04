"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Occupant {
  id: string;
  userId: string;
  user: User;
}

interface Room {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  rentAmount: number;
  occupants: Occupant[];
}

interface RoomManagerProps {
  rooms: Room[];
  users: User[];
}

export default function RoomManager({ rooms, users }: RoomManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [managingOccupants, setManagingOccupants] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [floor, setFloor] = useState(1);
  const [capacity, setCapacity] = useState(1);
  const [rentAmount, setRentAmount] = useState(0);

  const resetForm = () => {
    setName("");
    setFloor(1);
    setCapacity(1);
    setRentAmount(0);
    setShowForm(false);
    setEditingRoom(null);
    setError("");
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setName(room.name);
    setFloor(room.floor);
    setCapacity(room.capacity);
    setRentAmount(room.rentAmount);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : "/api/rooms";
      const method = editingRoom ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, floor, capacity, rentAmount }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save room");
      }

      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete room");
      router.refresh();
    } catch {
      alert("Failed to delete room");
    }
  };

  const addOccupant = async (roomId: string, userId: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/occupants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add occupant");
      }
      router.refresh();
      setManagingOccupants(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add occupant");
    }
  };

  const removeOccupant = async (roomId: string, userId: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/occupants`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to remove occupant");
      router.refresh();
      setManagingOccupants(null);
    } catch {
      alert("Failed to remove occupant");
    }
  };

  const occupantUserIds = managingOccupants?.occupants.map((o) => o.userId) || [];
  const availableUsers = users.filter((u) => !occupantUserIds.includes(u.id));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-[13px] text-stripe-text-secondary">{rooms.length} room(s)</p>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-stripe-primary text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-stripe-primary-hover transition-colors shadow-sm"
        >
          + Add Room
        </button>
      </div>

      {/* Room Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stripe-card rounded-lg border border-stripe-border p-6 w-full max-w-md shadow-lg">
            <h2 className="text-[15px] font-semibold text-stripe-text mb-4">
              {editingRoom ? "Edit Room" : "Add Room"}
            </h2>
            {error && (
              <div className="bg-stripe-danger-light text-stripe-danger text-[13px] p-3 rounded-lg mb-4">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-stripe-text mb-1">Room Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-[14px] border border-stripe-border rounded-lg focus:ring-2 focus:ring-stripe-primary/20 focus:border-stripe-primary outline-none transition-colors bg-white"
                  placeholder="Room 101"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-stripe-text mb-1">Floor</label>
                  <input
                    type="number"
                    value={floor}
                    onChange={(e) => setFloor(parseInt(e.target.value))}
                    min={1}
                    required
                    className="w-full px-3 py-2 text-[14px] border border-stripe-border rounded-lg focus:ring-2 focus:ring-stripe-primary/20 focus:border-stripe-primary outline-none transition-colors bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-stripe-text mb-1">Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value))}
                    min={1}
                    required
                    className="w-full px-3 py-2 text-[14px] border border-stripe-border rounded-lg focus:ring-2 focus:ring-stripe-primary/20 focus:border-stripe-primary outline-none transition-colors bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-stripe-text mb-1">Rent Amount (₹)</label>
                <input
                  type="number"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(parseFloat(e.target.value))}
                  min={0}
                  step="0.01"
                  required
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
                  {loading ? "Saving..." : editingRoom ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Occupant Management Modal */}
      {managingOccupants && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stripe-card rounded-lg border border-stripe-border p-6 w-full max-w-md shadow-lg">
            <h2 className="text-[15px] font-semibold text-stripe-text mb-4">
              Manage Occupants — {managingOccupants.name}
            </h2>

            <div className="mb-4">
              <h3 className="text-[13px] font-medium text-stripe-text mb-2">Current Occupants</h3>
              {managingOccupants.occupants.length === 0 ? (
                <p className="text-[13px] text-stripe-text-secondary">No occupants</p>
              ) : (
                <ul className="space-y-2">
                  {managingOccupants.occupants.map((occ) => (
                    <li key={occ.id} className="flex items-center justify-between bg-stripe-bg px-3 py-2 rounded-lg border border-stripe-border">
                      <span className="text-[14px] text-stripe-text">
                        {occ.user.name || occ.user.email}
                      </span>
                      <button
                        onClick={() => removeOccupant(managingOccupants.id, occ.userId)}
                        className="text-[13px] font-medium text-stripe-danger hover:text-stripe-danger"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {availableUsers.length > 0 && managingOccupants.occupants.length < managingOccupants.capacity && (
              <div className="mb-4">
                <h3 className="text-[13px] font-medium text-stripe-text mb-2">Add Occupant</h3>
                <select
                  onChange={(e) => {
                    if (e.target.value) addOccupant(managingOccupants.id, e.target.value);
                  }}
                  className="w-full px-3 py-2 text-[14px] border border-stripe-border rounded-lg focus:ring-2 focus:ring-stripe-primary/20 focus:border-stripe-primary outline-none transition-colors bg-white"
                  defaultValue=""
                >
                  <option value="" disabled>Select a user...</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setManagingOccupants(null)}
                className="px-4 py-2 text-[13px] font-medium text-stripe-text border border-stripe-border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div key={room.id} className="bg-stripe-card rounded-lg border border-stripe-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-stripe-text">{room.name}</h3>
              <span className="text-[12px] bg-stripe-primary-light text-stripe-primary px-2 py-0.5 rounded-full font-medium">
                Floor {room.floor}
              </span>
            </div>
            <div className="space-y-2 text-[14px] text-stripe-text-secondary">
              <p>
                Capacity: <span className="font-medium text-stripe-text">{room.occupants.length}/{room.capacity}</span>
              </p>
              <p>
                Rent: <span className="font-medium text-stripe-text">₹{room.rentAmount.toFixed(2)}</span>
              </p>
              {room.occupants.length > 0 && (
                <div>
                  <p className="font-medium text-stripe-text mb-1 text-[13px]">Occupants:</p>
                  <ul className="space-y-1">
                    {room.occupants.map((occ) => (
                      <li key={occ.id} className="text-[13px] text-stripe-text-secondary">
                        • {occ.user.name || occ.user.email}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-stripe-border flex gap-2">
              <button
                onClick={() => setManagingOccupants(room)}
                className="flex-1 text-center px-3 py-2 text-[13px] font-medium bg-stripe-primary-light text-stripe-primary rounded-lg hover:bg-stripe-primary/10 transition-colors"
              >
                Occupants
              </button>
              <button
                onClick={() => openEdit(room)}
                className="px-3 py-2 text-[13px] font-medium text-stripe-text border border-stripe-border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(room.id)}
                className="px-3 py-2 text-[13px] font-medium text-stripe-danger border border-stripe-danger/20 rounded-lg hover:bg-stripe-danger-light transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-10 h-10 text-stripe-text-secondary mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
          <p className="text-[14px] text-stripe-text-secondary">No rooms yet. Add your first room to get started.</p>
        </div>
      )}
    </div>
  );
}
