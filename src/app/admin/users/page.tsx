"use client";

import { useEffect, useState } from "react";
import { Search, UserPlus, Star, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [search, userType, page]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(userType && { userType }),
        page: page.toString(),
      });

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (userId: string, action: string) => {
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const getUserTypeBadge = (type: string) => {
    const colors = {
      CUSTOMER: "bg-blue-100 text-blue-800",
      FIXER: "bg-orange-100 text-orange-800",
      ADMIN: "bg-purple-100 text-purple-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Users</h1>
        <Link href="/admin/users/new">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors">
            <UserPlus size={20} />
            Create User
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            {["All", "CUSTOMER", "FIXER", "ADMIN"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setUserType(type === "All" ? "" : type);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  (type === "All" && !userType) || userType === type
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type === "All" ? "All" : type.charAt(0) + type.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        {user.fixerProfile && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {user.fixerProfile.averageRating.toFixed(1)} • {user.fixerProfile.totalJobs} jobs
                            {user.fixerProfile.verifiedBadge && <span className="flex items-center gap-0.5"> • <Check className="w-3.5 h-3.5 text-green-600" /> Verified</span>}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getUserTypeBadge(user.userType)}`}>
                      {user.userType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.isBanned ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                    }`}>
                      {user.isBanned ? "Banned" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {user.fixerProfile && !user.fixerProfile.kvkVerified && (
                        <button
                          onClick={() => handleAction(user.id, "verify")}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(user.id, user.isBanned ? "unban" : "ban")}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        {user.isBanned ? "Unban" : "Ban"}
                      </button>
                      {user.userType !== "ADMIN" && (
                        <button
                          onClick={() => handleAction(user.id, "makeAdmin")}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Make Admin
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
