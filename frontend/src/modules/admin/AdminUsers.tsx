import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: string;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ---------------- FETCH USERS ----------------
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ---------------- ACTIONS ----------------
  const suspendUser = async (email: string) => {
    if (!window.confirm("Suspend this user?")) return;
    await api.patch(`/admin/users/${email}`);
    fetchUsers();
    setSelectedUser(null);
  };

  const activateUser = async (email: string) => {
    await api.patch(`/admin/users/active/${email}`);
    fetchUsers();
    setSelectedUser(null);
  };

  // ---------------- FILTER ----------------
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return <p className="text-center mt-10">Loading users...</p>;

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">Manage Users</h1>

      {/* ================= SEARCH BAR ================= */}
      <input
        type="text"
        placeholder="Search by name or email..."
        className="px-4 py-2 border rounded-lg w-full md:w-1/3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= TABLE ================= */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium">
                      {user.name}
                    </td>

                    <td className="p-4">
                      {user.email}
                    </td>

                    <td className="p-4">
                      <Badge
                        className={
                          user.accountStatus === "suspended"
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-white"
                        }
                      >
                        {user.accountStatus}
                      </Badge>
                    </td>

                    <td className="p-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        View
                      </Button>

                      {user.accountStatus !== "suspended" && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            suspendUser(user.email)
                          }
                        >
                          Suspend
                        </Button>
                      )}

                      {user.accountStatus === "suspended" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            activateUser(user.email)
                          }
                        >
                          Activate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ================= MODAL POPUP ================= */}
      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">

            <h2 className="text-xl font-bold">
              User Details
            </h2>

            <div><strong>Name:</strong> {selectedUser.name}</div>
            <div><strong>Email:</strong> {selectedUser.email}</div>
            <div><strong>Role:</strong> {selectedUser.role}</div>
            <div><strong>Status:</strong> {selectedUser.accountStatus}</div>

            <div className="flex gap-3 pt-4">
              {selectedUser.accountStatus !== "suspended" && (
                <Button
                  variant="danger"
                  onClick={() =>
                    suspendUser(selectedUser.email)
                  }
                >
                  Suspend
                </Button>
              )}

              {selectedUser.accountStatus === "suspended" && (
                <Button
                  variant="primary"
                  onClick={() =>
                    activateUser(selectedUser.email)
                  }
                >
                  Activate
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
