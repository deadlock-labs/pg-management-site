"use client";

import { useRouter } from "next/navigation";

interface RoomOccupant {
  room: { name: string };
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  roomOccupants: RoomOccupant[];
}

interface UserManagerProps {
  users: User[];
}

export default function UserManager({ users }: UserManagerProps) {
  const router = useRouter();

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!confirm(`Change this user's role to ${newRole}?`)) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error("Failed to update role");
      router.refresh();
    } catch {
      alert("Failed to update user role");
    }
  };

  return (
    <div>
      <p className="text-[13px] text-stripe-text-secondary mb-6">{users.length} user(s)</p>

      <div className="bg-stripe-card rounded-lg border border-stripe-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stripe-border">
                <th className="text-left px-5 py-3 text-[12px] font-medium text-stripe-text-secondary uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-stripe-text-secondary uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-stripe-text-secondary uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-stripe-text-secondary uppercase tracking-wider">
                  Room
                </th>
                <th className="text-right px-5 py-3 text-[12px] font-medium text-stripe-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stripe-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-stripe-bg transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-[14px] font-medium text-stripe-text">
                      {user.name || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-[14px] text-stripe-text-secondary">{user.email}</span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium ${user.role === "admin" ? "bg-stripe-primary-light text-stripe-primary" : "bg-stripe-bg text-stripe-text-secondary border border-stripe-border"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-[14px] text-stripe-text-secondary">
                      {user.roomOccupants.length > 0
                        ? user.roomOccupants.map((ro) => ro.room.name).join(", ")
                        : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-right">
                    <button
                      onClick={() => toggleRole(user.id, user.role)}
                      className="text-[13px] text-stripe-primary hover:text-stripe-primary-hover font-medium transition-colors"
                    >
                      {user.role === "admin" ? "Make User" : "Make Admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-10 h-10 text-stripe-text-secondary mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
          <p className="text-[14px] text-stripe-text-secondary">No users found.</p>
        </div>
      )}
    </div>
  );
}
