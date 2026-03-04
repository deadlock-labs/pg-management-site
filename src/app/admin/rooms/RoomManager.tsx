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

  const removeOccupant = async (roomId: string, occupantId: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/occupants`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occupantId }),
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
        <p className="text-gray-500">{rooms.length} room(s)</p>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          + Add Room
        </button>
      </div>

      {/* Room Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRoom ? "Edit Room" : "Add Room"}
            </h2>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Room 101"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                  <input
                    type="number"
                    value={floor}
                    onChange={(e) => setFloor(parseInt(e.target.value))}
                    min={1}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value))}
                    min={1}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rent Amount (₹)</label>
                <input
                  type="number"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(parseFloat(e.target.value))}
                  min={0}
                  step="0.01"
                  required
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
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Manage Occupants — {managingOccupants.name}
            </h2>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Occupants</h3>
              {managingOccupants.occupants.length === 0 ? (
                <p className="text-sm text-gray-400">No occupants</p>
              ) : (
                <ul className="space-y-2">
                  {managingOccupants.occupants.map((occ) => (
                    <li key={occ.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm text-gray-700">
                        {occ.user.name || occ.user.email}
                      </span>
                      <button
                        onClick={() => removeOccupant(managingOccupants.id, occ.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
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
                <h3 className="text-sm font-medium text-gray-700 mb-2">Add Occupant</h3>
                <select
                  onChange={(e) => {
                    if (e.target.value) addOccupant(managingOccupants.id, e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                Floor {room.floor}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                Capacity: <span className="font-medium">{room.occupants.length}/{room.capacity}</span>
              </p>
              <p>
                Rent: <span className="font-medium">₹{room.rentAmount.toFixed(2)}</span>
              </p>
              {room.occupants.length > 0 && (
                <div>
                  <p className="font-medium text-gray-700 mb-1">Occupants:</p>
                  <ul className="space-y-1">
                    {room.occupants.map((occ) => (
                      <li key={occ.id} className="text-gray-500">
                        • {occ.user.name || occ.user.email}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setManagingOccupants(room)}
                className="flex-1 text-center px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
              >
                Occupants
              </button>
              <button
                onClick={() => openEdit(room)}
                className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(room.id)}
                className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">🏠</p>
          <p>No rooms yet. Add your first room to get started.</p>
        </div>
      )}
    </div>
  );
}
