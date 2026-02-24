import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ✅ Fetch users safely
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/api/admin/users");

      console.log("Users API response:", res.data);

      // 🔥 Safe extraction
      const usersData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setUsers(usersData);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Failed to load users");
      setUsers([]); // safety fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Block / Unblock
  const toggleBlockUser = async (email: string) => {
    try {
      await axios.patch(`/api/admin/users/${email}`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user status", err);
    }
  };

  // ✅ Safe filtering (users always array)
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === ""
        ? true
        : statusFilter === "blocked"
        ? user.isBlocked
        : !user.isBlocked;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <p className="text-center mt-10">Loading users...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Users</h1>

      {/* 🔍 Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="px-4 py-2 border rounded-lg w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-4 py-2 border rounded-lg w-full md:w-1/4"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Users</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-t">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <Badge>{user.role}</Badge>
                    </td>
                    <td className="p-4">
                      {user.isBlocked ? (
                        <Badge className="bg-red-500 text-white">
                          Blocked
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500 text-white">
                          Active
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant={user.isBlocked ? "primary" : "danger"}
                        onClick={() => toggleBlockUser(user.email)}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
